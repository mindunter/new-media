/**
 * New Media booking endpoint. Free, runs inside the Google account that owns the calendar.
 * It creates a calendar event with a Google Meet link and emails the invite to the visitor.
 *
 * Setup, about 5 minutes, signed in as the account that should host the calls:
 *  1. Go to https://script.google.com and create a New project. Paste this file in.
 *  2. Left sidebar: Services (+), add "Google Calendar API", keep the identifier "Calendar".
 *  3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Deploy and approve.
 *  4. Copy the Web app URL into brand.bookingEndpoint in src/content.ts, then rebuild the site.
 */
const CALENDAR_ID = 'primary'

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON)
}

function doPost(e) {
  try {
    const { email, start, minutes } = JSON.parse(e.postData.contents)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return reply({ ok: false, reason: 'email' })

    const from = new Date(start)
    const to = new Date(from.getTime() + (Number(minutes) || 30) * 60000)
    if (isNaN(from) || from < new Date()) return reply({ ok: false, reason: 'time' })

    // One booking at a time, so two visitors cannot take the same slot.
    const lock = LockService.getScriptLock()
    lock.waitLock(10000)
    try {
      const busy = Calendar.Freebusy.query({
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        items: [{ id: CALENDAR_ID }],
      }).calendars[CALENDAR_ID].busy
      if (busy.length) return reply({ ok: false, reason: 'taken' })

      const event = Calendar.Events.insert(
        {
          summary: 'Call with New Media',
          description: 'Booked from the New Media website.',
          start: { dateTime: from.toISOString() },
          end: { dateTime: to.toISOString() },
          attendees: [{ email }],
          conferenceData: {
            createRequest: { requestId: Utilities.getUuid(), conferenceSolutionKey: { type: 'hangoutsMeet' } },
          },
        },
        CALENDAR_ID,
        { conferenceDataVersion: 1, sendUpdates: 'all' },
      )
      return reply({ ok: true, meet: event.hangoutLink })
    } finally {
      lock.releaseLock()
    }
  } catch (err) {
    console.error(err)
    return reply({ ok: false, reason: 'server' })
  }
}
