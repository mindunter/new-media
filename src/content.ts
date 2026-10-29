/**
 * All site copy and data lives here.
 *
 * Launch figures come from the launches @newmediahq reposted on X and are
 * correct as of `asOf`. They keep growing, so refresh them before publishing.
 *
 * PLACEHOLDER: the contact email and the LinkedIn, YouTube and Instagram links
 * are not real yet. The network map and launch simulator are illustrations.
 */

export const asOf = '29 Oct 2026'

export const brand = {
  name: 'New Media',
  email: 'hello@newmedia.example',
  bookUrl: '/contact',
  socials: [
    { label: 'X', href: 'https://x.com/newmediahq' },
    { label: 'LinkedIn', href: '#' },
    { label: 'YouTube', href: '#' },
    { label: 'Instagram', href: '#' },
  ],
}

export const nav = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Contact', href: '/contact' },
]

export const hero = {
  eyebrow: 'Creator distribution for AI and tech companies',
  lines: ['We make launches', 'impossible to', 'scroll past.'],
  sub: 'Your buyers skip ads, but they read the people they follow. We brief those founders, engineers and creators so your launch shows up across their feeds in the same hour.',
  primary: 'Plan your launch',
  secondary: 'See our launches',
  proof: '24.3M+ views and $144.5M+ in funding announced across launches for 10 brands since May 2026',
}

export const stats = [
  { value: 24.3, suffix: 'M+', label: 'Views across our launches with public numbers', decimals: 1 },
  { value: 144.5, prefix: '$', suffix: 'M+', label: 'In funding announced through those launches', decimals: 1 },
  { value: 10, suffix: '', label: 'Brands launched since May 2026' },
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
  { name: 'Capital Truist', tag: 'Launch' },
  { name: 'webcmd', tag: 'Launch' },
]

/** Partnership note, from the Interact AI relationship. */
export const partner = {
  name: 'Interact AI',
  line: 'Integrated with Interact AI, so creators on Interact can join our campaigns.',
}

/** Investors behind the companies we launched. They back those companies, not New Media. */
export const backers = ['Lightspeed', 'Khosla Ventures', 'Felicis', 'Insight Partners', 'Amplify Partners']

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
  { brand: 'Reactor', title: 'Out of stealth with a $59M Seed and Series A, led by Lightspeed', views: 12_700_000, likes: 2343, hue: 262 },
  { brand: 'Reactor', title: 'Lingbot-World-2 world model', views: 3_800_000, likes: 856, bookmarks: 503, hue: 262 },
  { brand: 'Interact AI', title: 'Product launch', views: 2_200_000, likes: 3311, bookmarks: 4223, hue: 210 },
  { brand: 'Sazabi', title: '$8M raise for self-healing software', views: 1_300_000, likes: 1090, hue: 160 },
  { brand: 'Runlayer', title: '$30M raise with Felicis and Khosla', views: 814_000, likes: 821, bookmarks: 648, hue: 20 },
  { brand: 'Reactor', title: 'Happy Oyster world model', views: 769_000, likes: 333, hue: 262 },
  { brand: 'Sazabi', title: 'v1.0 launch', views: 645_000, likes: 499, hue: 160 },
  { brand: 'Beacon', title: '$5.5M seed for open-source memory for coding agents', views: 627_000, likes: 1567, bookmarks: 2158, hue: 300 },
  { brand: 'BackOps', title: '$42M Series B, led by Insight Partners', views: 610_000, likes: 238, hue: 45 },
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
      { k: 'Likes', v: '3,311' },
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

/** Positioning card. Strings are plain text; `chips` render as highlighted phrases. */
export const thesis = {
  lead: "We're New Media, a launch-first distribution company.",
  rows: [
    { text: 'Built for', chips: ['AI founders', 'technical teams'] },
    { text: 'We put your story into', chips: ['launch threads', 'founder posts', 'podcast clips', 'creator breakdowns'] },
  ],
  close: 'for the feeds your buyers already read.',
}

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
    a: 'AI and technology companies from seed through late stage, and the venture firms behind them. If you have something shipping soon, get in touch.',
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
