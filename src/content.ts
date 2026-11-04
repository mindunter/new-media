/**
 * All site copy and data lives here.
 *
 * Launch figures come from the launches @newmediahq reposted on X and are
 * correct as of `asOf`. They keep growing, so refresh them before publishing.
 *
 * PLACEHOLDER: the booking endpoint, contact email and the LinkedIn, YouTube and
 * Instagram links are not real yet. The network map and launch simulator are illustrations.
 */

export const asOf = '4 Nov 2026'

export const brand = {
  name: 'New Media',
  email: 'hello@newmedia.example',
  /**
   * URL of the deployed Google Apps Script (see integrations/booking-apps-script.gs). When set, the
   * calendar creates a Google Calendar event with a Meet link. Until then, it opens a prefilled email.
   */
  bookingEndpoint: '',
  /** PLACEHOLDER: the Calendly booking page, e.g. https://calendly.com/<name>/30min. Until set, the booking card opens an email. */
  calendly: '',
  /**
   * PLACEHOLDER: where "Continue with X" sends people. X sign-in needs an X developer app and a small
   * server for the OAuth token exchange (it cannot run on GitHub Pages). Until set, the button is disabled.
   */
  xAuthUrl: '',
  socials: [
    { label: 'X', href: 'https://x.com/newmediahq' },
    { label: 'LinkedIn', href: '#' },
    { label: 'YouTube', href: '#' },
    { label: 'Instagram', href: '#' },
  ],
}

/** The one call to action used across the site. */
export const cta = {
  label: 'Book a call',
  href: '/contact',
}

export const nav = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'How it works', href: '/how-it-works' },
]

export const hero = {
  eyebrow: 'Launch amplification on X for AI companies',
  lines: ['We make launches', 'impossible to', 'scroll past.'],
  sub: 'Your buyers skip ads, but they read the people they follow. We brief those founders, engineers and creators so your launch fills their feeds in the same hour.',
  secondary: 'See the launches',
  proof: '26.4M+ views across 16 launches for 10 AI companies since May 2025',
}

export const stats = [
  { value: 26.4, suffix: 'M+', label: 'Views across 16 launch posts', decimals: 1 },
  { value: 144.5, prefix: '$', suffix: 'M+', label: 'In funding announced through those launches', decimals: 1 },
  { value: 10, suffix: '', label: 'AI companies launched since May 2025' },
  { value: 45, suffix: '+', label: 'Creators who have run campaigns with us' },
]

export const clients = [
  { name: 'Reactor', tag: '3 launches' },
  { name: 'Interact AI', tag: 'Product launch' },
  { name: 'Sazabi', tag: '3 launches' },
  { name: 'Runlayer', tag: '$30M raise' },
  { name: 'Beacon', tag: '$5.5M seed' },
  { name: 'BackOps', tag: '$42M Series B' },
  { name: 'Falconer', tag: 'Launch' },
  { name: 'Charming', tag: 'Launch' },
  { name: 'Mem0', tag: '2 launches' },
  { name: 'Entelligence AI', tag: 'Launch' },
  { name: 'webcmd', tag: 'Launch' },
]

/**
 * The flowing logo row. PLACEHOLDER: Artesia is left out until Abhay confirms which company it is and sends
 * the logo; add the file to src/assets/logos and ClientLogo.
 */
export const logoRow = [...clients.map((c) => c.name), 'Composio']

/** Partnership note, from the Interact AI relationship. */
export const partner = {
  name: 'Interact AI',
  line: 'Integrated with Interact AI, so creators on Interact can join our campaigns.',
}

/**
 * Investors behind the companies we launched. They back those companies, not New Media.
 * Each entry was checked against the company's own post or press coverage on the date in `asOf`.
 * Interact AI, Charming, Capital Truist and webcmd are left out because no investors could be
 * confirmed. Falconer is left out because BoxGroup appears in only one source.
 */
export const backing = [
  {
    client: 'Reactor',
    raise: '$59M Seed and Series A',
    amount: 59,
    firms: ['Lightspeed', 'Amplify Partners', 'WndrCo', 'Sky9 Capital', 'FPV Ventures'],
    source: 'https://x.com/reactorworld/status/2060015607928819876',
  },
  {
    client: 'BackOps',
    raise: '$42M Series B',
    amount: 42,
    firms: ['Insight Partners', 'Theory Ventures', 'Construct Capital', 'Gradient Ventures', '10VC'],
    source: 'https://vcnewsdaily.com/backops.ai/venture-capital-funding/dtcfqrwkzz',
  },
  {
    client: 'Runlayer',
    raise: '$30M Series A',
    amount: 30,
    firms: ['Felicis', 'Khosla Ventures'],
    source: 'https://x.com/berman66/status/2069787264654156194',
  },
  {
    client: 'Sazabi',
    raise: '$8M Seed',
    amount: 8,
    firms: ['J2 Ventures', 'Village Global', 'Y Combinator'],
    source: 'https://www.sazabi.com/blog/seed-round',
  },
  {
    client: 'Beacon',
    raise: '$5.5M Seed',
    amount: 5.5,
    firms: ['Tower Research Ventures', 'Lytical Ventures', '1984 Ventures', 'South Park Commons'],
    source: 'https://thenextweb.com/news/asymptote-labs-5-5m-seed-ai-agent-security',
  },
]

export const firmCount = new Set(backing.flatMap((b) => b.firms)).size
export const fundingTotal = backing.reduce((n, b) => n + b.amount, 0)

export type Post = {
  id: string
  brand: string
  /** What the launch was, in a few words. */
  title: string
  name: string
  handle: string
  verified: boolean
  date: string
  text: string
  views: number
  likes: number
  reposts: number
  replies: number
  bookmarks: number
  video: boolean
  /** False when the post has no picture or video to show. */
  poster?: boolean
  /** False when we have no saved profile picture. */
  avatar?: boolean
}

/** Real launch posts @newmediahq ran, oldest first. Exact numbers read from X on the date in `asOf`. */
export const posts: Post[] = [
  { id: '1922315139057070154', brand: 'Mem0', title: 'OpenMemory MCP', name: 'Taranjeet', handle: 'taranjeetio', verified: true, date: '2025-05-13', text: 'We’re excited to launch OpenMemory MCP, a private memory for MCP-compatible clients powered by @mem0ai', views: 472594, likes: 1650, reposts: 346, replies: 210, bookmarks: 1908, video: true, poster: false },
  { id: '1937537163270451494', brand: 'Mem0', title: 'OpenMemory Chrome extension', name: 'Taranjeet', handle: 'taranjeetio', verified: true, date: '2025-06-24', text: 'Introducing the OpenMemory Chrome Extension!\n\nShared memory you can carry across ChatGPT, Claude, Perplexity, Grok, Gemini & more.', views: 185184, likes: 999, reposts: 159, replies: 210, bookmarks: 979, video: true },
  { id: '1955284660822606013', brand: 'Entelligence AI', title: 'Engineering leaderboard', name: 'Aiswarya Sankar', handle: 'Aiswarya_Sankar', verified: true, date: '2025-08-12', text: 'Introducing @EntelligenceAI Leaderboard: World’s first engineering leaderboard\n\nWe built a real time scoreboard for engineers & teams on actual PR performance: code quality, security and impact.', views: 233791, likes: 931, reposts: 64, replies: 41, bookmarks: 150, video: true },
  { id: '2051662847130869780', brand: 'Interact AI', title: 'Product launch', name: 'Interact AI', handle: 'interact_ai', verified: false, date: '2026-05-05', text: 'Introducing Interact AI: a new interface for the web.\n\nAdd it to your website, and it talks to every visitor, answers questions, and shows your product.', views: 2234945, likes: 3304, reposts: 520, replies: 282, bookmarks: 4215, video: true },
  { id: '2060015607928819876', brand: 'Reactor', title: 'Out of stealth with $59M', name: 'reactor', handle: 'reactorworld', verified: true, date: '2026-05-28', text: 'Today Reactor is coming out of stealth. We’ve raised $59M in Seed and Series A funding, led by @lightspeedvp, with participation from @AmplifyPartners, @wndrco, @Sky9Capital, and @FPVventures.', views: 12739762, likes: 2340, reposts: 318, replies: 193, bookmarks: 625, video: true },
  { id: '2069787264654156194', brand: 'Runlayer', title: '$30M Series A', name: 'Andy Berman', handle: 'berman66', verified: true, date: '2026-06-24', text: 'Today, we’re announcing Runlayer has raised $30M from Felicis and Khosla Ventures to help companies go all in on AI.\n\nRunlayer is the golden path for AI: enablement, security, and control in one platform.', views: 813793, likes: 820, reposts: 202, replies: 157, bookmarks: 647, video: false },
  { id: '2070151536257503519', brand: 'Sazabi', title: '$8M seed', name: 'Sherwood', handle: 'shcallaway', verified: true, date: '2026-06-25', text: 'We raised $8m to build self-healing software.\n\nIn 2026, software moves fast.\n\nBut monitoring and observability are still manual and slow.', views: 1325718, likes: 1090, reposts: 226, replies: 228, bookmarks: 445, video: true },
  { id: '2074935025771143626', brand: 'Reactor', title: 'Lingbot-World-2', name: 'reactor', handle: 'reactorworld', verified: true, date: '2026-07-08', text: 'Introducing Lingbot-World-2, our newest real-time world model.\n\nRicher interactivity, sharper visuals, and advanced camera controls that make exploring what you create feel truly alive.', views: 3803343, likes: 855, reposts: 187, replies: 118, bookmarks: 502, video: true },
  { id: '2079250546624802918', brand: 'Reactor', title: 'Happy Oyster', name: 'reactor', handle: 'reactorworld', verified: true, date: '2026-07-20', text: 'Introducing Happy Oyster, the groundbreaking real-time world model from @HappyOysterAI, live today on Reactor!\n\nExplore any world you can imagine, or take the director’s chair and shape the story as it happens.', views: 768756, likes: 332, reposts: 142, replies: 78, bookmarks: 142, video: true },
  { id: '2100220712317329826', brand: 'BackOps', title: '$42M Series B', name: 'Sean McCarthy', handle: 'seanmcccarthy', verified: true, date: '2026-09-16', text: 'As AI models get better, cheaper and more widely available, we believe one of the biggest moats will be the proprietary data created by actually doing the work.\n\nToday, we’re announcing a $42M Series B led by @insightpartners for @backopsai.', views: 610029, likes: 235, reposts: 88, replies: 57, bookmarks: 111, video: true },
  { id: '2107848513967260107', brand: 'Charming', title: 'Launch', name: 'Michael Magán', handle: 'mrmagan_', verified: true, date: '2026-10-07', text: 'Everyone in AI is building for everyone else in AI.\n\nWe’re building for your group chat.\n\nIntroducing Charming. Personal apps for us normies.', views: 522917, likes: 397, reposts: 163, replies: 132, bookmarks: 220, video: true, avatar: false },
  { id: '2110038490859855990', brand: 'Sazabi', title: 'Sazabi 1.0', name: 'Sherwood', handle: 'shcallaway', verified: true, date: '2026-10-13', text: 'Today, we’re launching Sazabi version 1.0.\n\nThe reality of shipping software as a team in the age of AI is actually crazy.\n\nAgents merging their own PRs. Hundreds of deployments per day.', views: 645538, likes: 499, reposts: 158, replies: 124, bookmarks: 202, video: true },
  { id: '2112552451547001218', brand: 'Beacon', title: '$5.5M seed', name: "Justin D'Souza", handle: 'jqdsouza', verified: true, date: '2026-10-20', text: 'We’re betting our $5.5M seed round that the next leap in AI coding won’t come from OpenAI or Anthropic.\n\nIntroducing Beacon: open-source, self-improving memory for coding agents.', views: 631064, likes: 1565, reposts: 307, replies: 327, bookmarks: 2155, video: true },
  { id: '2112915259317186974', brand: 'Falconer', title: 'Launch', name: 'Dave Nunez', handle: 'capitaltruist', verified: true, date: '2026-10-21', text: 'Trillions are pouring into the race to build the first general superintelligence, but leveraging your own specialized know-it-all is now possible as of today.', views: 360150, likes: 336, reposts: 206, replies: 96, bookmarks: 172, video: true },
  { id: '2113312773228929511', brand: 'Sazabi', title: 'cve.now', name: 'Sherwood', handle: 'shcallaway', verified: true, date: '2026-10-22', text: 'Today we’re launching cve.now\n\ncve.now aggregates 4 vulnerability sources into one free feed and uses AI to explain each one in plain English. No login.', views: 586426, likes: 1861, reposts: 354, replies: 128, bookmarks: 2037, video: false, poster: false },
  { id: '2117285537836908696', brand: 'Beacon', title: '#1 on Product Hunt', name: "Justin D'Souza", handle: 'jqdsouza', verified: true, date: '2026-11-02', text: 'Our open-source devtool is trending #1 on Product Hunt!\n\nBeacon is self-improving memory for coding agents.', views: 526163, likes: 291, reposts: 101, replies: 111, bookmarks: 342, video: true },
]

/** All views on the posts above. */
export const totalViews = posts.reduce((n, p) => n + p.views, 0)

export const postUrl = (p: Post) => `https://x.com/${p.handle}/status/${p.id}`

/** The card shown when someone clicks a client's bird in the hero. */
export function clientCard(name: string) {
  const own = posts.filter((p) => p.brand === name)
  const top = [...own].sort((a, b) => b.views - a.views)[0]
  const wall = portfolio.find((p) => p.name === name)
  const sum = (k: 'likes' | 'bookmarks' | 'reposts') => own.reduce((n, p) => n + p[k], 0)
  return {
    name,
    stat: wall?.stat ?? '',
    detail: wall?.detail ?? 'Launch',
    likes: sum('likes'),
    bookmarks: sum('bookmarks'),
    reposts: sum('reposts'),
    url: top ? postUrl(top) : '',
    backing: backing.find((b) => b.client === name),
  }
}

/** Memes for the collage, hosted by GIPHY. Captions are ours. */
export const memes = [
  { id: 'YnkMcHgNIMW4Yfmjxr', caption: 'Views, hour one' },
  { id: 'QMHoU66sBXqqLqYvGO', caption: 'Your ad budget' },
  { id: 'DfLwM9kttDFEQ', caption: 'Founders at 1M views' },
  { id: '13GIgrGdslD9oQ', caption: 'Creators at hour zero' },
  { id: 'COYGe9rZvfiaQ', caption: 'Banner ads' },
  { id: 'b85mPT4Usz7fq', caption: 'Launch day' },
  { id: '6nWhy3ulBL7GSCvKw6', caption: 'Competitors, seeing your launch' },
  { id: 'yAYZnhvY3fflS', caption: 'Your buyers, after the demo' },
  { id: 'MuOGhW5GtDazUSJcL3', caption: 'Your buyer, all day' },
  { id: '4wycNsucv3ofC', caption: 'The group chat' },
  { id: '8VrtCswiLDNnO', caption: 'The creator brief' },
  { id: 'CbyTM5aSzx1rSOv9GI', caption: 'The clip machine' },
  { id: 'lXu72d4iKwqek', caption: 'Reading the launch report' },
  { id: '1n4iuWZFnTeN6qvdpD', caption: 'Launching without distribution' },
  { id: 'uoMmC0OnDUVwc', caption: 'CMO, reading the replies' },
  { id: 'eImrJKnOmuBDmqXNUj', caption: 'Breaking: you are trending' },
  { id: '30cLIgqIQQI5c8TUZ4', caption: 'The goal' },
  { id: 'Y2zKC4qJfg1JFaql8G', caption: 'Bookmarks going up' },
  { id: 'xCgeEazpis53cUqoZY', caption: 'A clean launch' },
  { id: 'X39p7olayZuPfvBXQo', caption: 'Still scrolling' },
]

/** The finished Unsealed edit. Put the file in public/video and set `file` to show the section. */
export const unsealed = {
  file: '',
  poster: '',
  title: 'Unsealed',
  line: 'The final video edit we made for the Unsealed platform.',
}

export type Launch = {
  brand: string
  title: string
  views: number
  likes?: number
  bookmarks?: number
  hue: number
}

/** Every launch so far, highest views first. */
export const launches: Launch[] = [
  { brand: 'Reactor', title: 'Out of stealth with a $59M Seed and Series A, led by Lightspeed', views: 12_700_000, likes: 2343, bookmarks: 627, hue: 262 },
  { brand: 'Reactor', title: 'Lingbot-World-2 world model', views: 3_800_000, likes: 856, bookmarks: 503, hue: 262 },
  { brand: 'Interact AI', title: 'Product launch', views: 2_200_000, likes: 3310, bookmarks: 4223, hue: 210 },
  { brand: 'Sazabi', title: '$8M raise for self-healing software', views: 1_300_000, likes: 1089, hue: 160 },
  { brand: 'Runlayer', title: '$30M raise with Felicis and Khosla', views: 814_000, likes: 820, bookmarks: 648, hue: 20 },
  { brand: 'Reactor', title: 'Happy Oyster world model', views: 769_000, likes: 333, hue: 262 },
  { brand: 'Sazabi', title: 'v1.0 launch', views: 645_000, likes: 499, hue: 160 },
  { brand: 'Beacon', title: '$5.5M seed for open-source memory for coding agents', views: 629_000, likes: 1565, bookmarks: 2157, hue: 300 },
  { brand: 'BackOps', title: '$42M Series B, led by Insight Partners', views: 610_000, likes: 237, hue: 45 },
  { brand: 'Sazabi', title: 'cve.now launch', views: 384_000, hue: 160 },
  { brand: 'Falconer', title: 'Launch', views: 354_000, hue: 120 },
]

export const engine = [
  {
    n: '01',
    title: 'Brief',
    body: 'One call to find the story in your product: the hook, the proof, and the line people will repeat. Each creator gets a brief written for their own audience.',
    meta: 'Day -14',
  },
  {
    n: '02',
    title: 'Seed',
    body: 'Early access goes to the people your buyers trust. They try the product, form their own opinion and write about it in their own words.',
    meta: 'Day -7',
  },
  {
    n: '03',
    title: 'Ignite',
    body: 'Your post goes live and the network responds inside the same hour with quotes, reactions, breakdowns and clips, so the platforms pick it up as a trending moment.',
    meta: 'Hour 0',
  },
  {
    n: '04',
    title: 'Sustain',
    body: 'Clips, podcast cuts and follow-up threads keep you in the feed for weeks after launch day. You get a report on every view.',
    meta: 'Day +30',
  },
]

/** Network map. Share is the fraction of nodes; reach is average followers per node. */
export const network = {
  title: 'Our network',
  groups: [
    { id: 'founders', label: 'Founders', share: 0.22, reach: 48_000 },
    { id: 'engineers', label: 'Engineers', share: 0.26, reach: 31_000 },
    { id: 'researchers', label: 'Researchers', share: 0.14, reach: 62_000 },
    { id: 'investors', label: 'Investors', share: 0.12, reach: 54_000 },
    { id: 'creators', label: 'Creators', share: 0.26, reach: 120_000 },
  ],
}

export const services = [
  {
    id: 'launch',
    title: 'Launch Virality',
    short: 'Product launches and raise announcements pushed to millions on X and LinkedIn.',
    points: ['Creator briefs and seeding', 'Coordinated launch hour', 'Live war-room reporting'],
  },
  {
    id: 'clipping',
    title: 'Clipping',
    short: 'Thousands of short clips cut from your long-form and distributed on IG, YouTube, TikTok and X.',
    points: ['Pay-per-view bounties', 'Editor network at scale', 'Weekly performance cuts'],
  },
  {
    id: 'podcast',
    title: 'Founder Podcasts',
    short: 'Full production from guest research to edit to distribution. One hour of your week.',
    points: ['Guest booking and research', 'Studio or remote capture', 'Episode, clips, and articles'],
  },
  {
    id: 'ugc',
    title: 'Creator UGC',
    short: 'Native video from creators who actually use your product. Built for paid and organic.',
    points: ['Vetted creator roster', 'Hooks tested in batches', 'Full usage rights'],
  },
]

export const cases = [
  {
    client: 'Reactor',
    tag: 'Repeat client, 3 launches',
    title: 'Out of stealth with a $59M round',
    body: 'Reactor came out of stealth announcing a $59M Seed and Series A led by Lightspeed. It then came back to us for two model launches, Lingbot-World-2 and Happy Oyster.',
    metrics: [
      { k: 'Views on the stealth launch', v: '12.7M' },
      { k: 'Likes', v: '2,343' },
      { k: 'Views across all 3 launches', v: '17.3M' },
    ],
  },
  {
    client: 'Interact AI',
    tag: 'Product launch',
    title: 'A launch people saved for later',
    body: 'Interact AI’s product launch passed 2.2M views and was bookmarked more often than it was liked, which means people kept it to come back to.',
    metrics: [
      { k: 'Views', v: '2.2M' },
      { k: 'Bookmarks', v: '4,223' },
      { k: 'Likes', v: '3,310' },
    ],
  },
  {
    client: 'Sazabi',
    tag: 'Repeat client, 3 launches',
    title: 'An $8M raise, then v1.0 and cve.now',
    body: 'Sazabi announced its $8M raise for self-healing software with us, then came back for its v1.0 launch and for cve.now, one of its products.',
    metrics: [
      { k: 'Views across all 3 launches', v: '2.3M' },
      { k: 'Raise announcement', v: '1.3M' },
      { k: 'v1.0 launch', v: '645K' },
    ],
  },
]

/** Portfolio wall on Home. Views are from public launch posts; `detail` says what the launch was. */
export const portfolio = [
  { name: 'Reactor', stat: '17.3M', detail: 'views across 3 launches' },
  { name: 'Sazabi', stat: '2.3M', detail: 'views across 3 launches' },
  { name: 'Interact AI', stat: '2.2M', detail: 'views on product launch' },
  { name: 'Runlayer', stat: '814K', detail: 'views on $30M raise' },
  { name: 'Beacon', stat: '629K', detail: 'views on $5.5M seed' },
  { name: 'BackOps', stat: '610K', detail: 'views on $42M Series B' },
  { name: 'Falconer', stat: '354K', detail: 'views on launch' },
  { name: 'Charming', stat: '', detail: 'Launch' },
  { name: 'Capital Truist', stat: '', detail: 'Launch' },
  { name: 'webcmd', stat: '', detail: 'Launch' },
]

/** Why clients pick us: the four brand words. */
export const reasons = [
  {
    title: 'Trusted',
    body: 'Teams backed by Lightspeed, Khosla, Insight Partners and Y Combinator have launched with us. Every number here links back to a public post.',
  },
  {
    title: 'Reliable',
    body: 'Reactor and Sazabi each came back for three launches. We plan the whole month, not only launch day.',
  },
  {
    title: 'Affordable',
    body: 'Built for startup budgets. Tell us what you have to spend and we scope the launch to fit it.',
  },
  {
    title: 'Clean',
    body: 'A clear plan, a clear timeline, and a report on every view. One team runs all of it.',
  },
]

export const faqs = [
  {
    q: 'How far ahead do we need to start?',
    a: 'Two weeks is ideal for a full launch. That gives us time to brief, seed early access, and line up the network. We have run launches in five days when the moment called for it.',
  },
  {
    q: 'Which platforms do you cover?',
    a: 'X and LinkedIn for launches. Instagram, YouTube Shorts, TikTok and X for clipping. Apple Podcasts, Spotify and YouTube for podcasts. We adjust format and timing for each one.',
  },
  {
    q: 'Are the creator posts paid?',
    a: 'Creators are compensated and every post is disclosed in line with platform rules and FTC guidance. We only brief people who would use the product themselves.',
  },
  {
    q: 'How do you report results?',
    a: 'A live dashboard during launch week, then a full report: views, engagement, sentiment, traffic and signups, broken down by creator and platform.',
  },
  {
    q: 'Who do you work with?',
    a: 'AI and technology companies from seed through late stage, and the venture firms behind them. If you have something shipping soon, book a call.',
  },
]

/** Illustrative model for the launch simulator. Not a quote. */
export const simulator = {
  types: [
    { id: 'product', label: 'Product', mult: 1 },
    { id: 'raise', label: 'Fundraise', mult: 0.7 },
    { id: 'feature', label: 'Feature', mult: 0.5 },
  ],
  windows: [
    { id: '24h', label: '24 hours', days: 1, mult: 0.55 },
    { id: '72h', label: '72 hours', days: 3, mult: 1 },
    { id: '7d', label: '7 days', days: 7, mult: 1.4 },
  ],
  viewsPerCreator: 38_000,
}
