// Starter articles. These show on the Journal until the Sanity CMS is connected (SANITY_PROJECT_ID set
// in Vercel). Once Sanity has posts, the site uses those instead. Body uses the same block format as Sanity.
const p = (text) => ({ _type: 'block', style: 'normal', children: [{ _type: 'span', text }] });
const h2 = (text) => ({ _type: 'block', style: 'h2', children: [{ _type: 'span', text }] });
const li = (text) => ({ _type: 'block', style: 'normal', listItem: 'bullet', children: [{ _type: 'span', text }] });

module.exports = [
  {
    slug: 'living-beside-chandigarh-airport-pr7-aerocity',
    title: 'Living beside Chandigarh International Airport: a guide to PR-7 and GMADA Aerocity',
    excerpt: 'Why the airport road is becoming one of the Tricity\'s most watched addresses, and what is being built around it.',
    category: 'Location & market', publishedAt: '2026-11-10', readMins: 5,
    image: '/assets/img/dkg/balcony.webp', imageAlt: 'A woman on a high balcony at sunset as a plane passes overhead',
    cta: 'aveda',
    body: [
      p('For most of the last decade, PR-7, the airport road through GMADA Aerocity, was defined by what it lacked. The airport\'s new terminal opened in 2015, but the short routes from Chandigarh, Panchkula and Zirakpur closed with the old domestic terminal, and getting to the airport became a detour.'),
      p('That is now changing, and quickly. Here is what is happening along the corridor, and why it matters if you are thinking about a home here.'),
      h2('The road itself'),
      p('PR-7 widening has moved into construction, and in 2025 the state approved a shorter airport link that cuts the Zirakpur route from 13.7 km to 9.6 km. NHAI has also awarded the Zirakpur–Panchkula bypass. Together, these turn the airport from an awkward drive into a near neighbour.'),
      h2('Work, study and care nearby'),
      li('Mohali IT City, with more than 300 IT companies, is about a kilometre away, and Infosys broke ground on a new campus in 2026.'),
      li('The Indian School of Business is roughly 6.7 km away, with IISER Mohali about 12 km.'),
      li('Apollo is building a 736-bed hospital in Aerocity, targeting 2027, with Kapoor Hospital about 2 km and Fortis Mohali about 11 km.'),
      li('R Rudra International School sits within Aerocity, about 600 m away.'),
      h2('A planned township, not a patchwork'),
      p('Aerocity is a GMADA master-planned township, so roads, plots and green areas were laid out before building began. The Aerotropolis expansion and Expo City are at the land-acquisition stage, which signals how the government sees the corridor\'s future.'),
      h2('What this means for buyers'),
      p('Locations rarely improve all at once. They improve in steps: access first, then jobs, then everyday services. PR-7 is moving through all three in the same few years. Aveda Arenium, DKG Landcorp\'s flagship, sits directly on PR-7 in Pocket 1, E-Block, about five minutes from the airport.'),
      p('Distances are approximate and drawn from public sources; timelines for public projects can change.')
    ]
  },
  {
    slug: 'why-an-infrastructure-builder-builds-better-homes',
    title: 'Why an infrastructure builder builds better homes',
    excerpt: 'Twenty-five years of highways, bridges and flyovers teach a particular discipline. Here is how it carries into a residential tower.',
    category: 'Company news', publishedAt: '2026-11-03', readMins: 4,
    image: '/assets/img/dkg/bridge-road.webp', imageAlt: 'A long highway bridge curving over open water',
    cta: 'general',
    body: [
      p('Before DKG Landcorp built homes, its parent company built roads. Over more than 25 years, DMR Builders delivered tunnels, bridges, highways and flyovers across Punjab, working with the Punjab Government, the National Highways Authority of India and district corporations.'),
      p('That history is not a footnote. It shapes how DKG approaches every residential project.'),
      h2('Public works leave no room for shortcuts'),
      p('An elevated highway or a rail overbridge is inspected, load-tested and used by thousands of people every day from the moment it opens. The group\'s record includes a six-lane elevated structure at Rayya, a four-lane rail overbridge on NH-503 at Nangal, judicial complexes at Zira and Gurdaspur, the four-laning of NH-07 at Bathinda, and the flyover and Medicity Junction at Mullanpur.'),
      h2('Planning before pouring'),
      p('Infrastructure is planned in detail before any concrete is poured: structure, services, drainage and schedules are settled up front. DKG applies the same sequence to housing, which is why plans, typologies and services at Aveda Arenium were resolved with the architects, Studio Symbiosis, early in design.'),
      h2('Hands-on leadership'),
      p('The leadership team, led by Managing Director Sanket Garg with directors Anil Garg and Sumit Garg, stays close to the site. Their work ethos is simple to state and hard to keep: a hands-on approach, meticulous planning and uncompromising quality.'),
      p('Homes are where people spend most of their lives. They deserve at least the care that goes into the roads that lead to them.')
    ]
  },
  {
    slug: 'choosing-your-home-at-aveda-arenium',
    title: '3+1, 4+1, 4+2 or 5+2? Choosing your home at Aveda Arenium',
    excerpt: 'A plain guide to the four typologies, from 3,080 to 7,000 sq ft, and who each one suits.',
    category: 'Home-buying guides', publishedAt: '2026-10-27', readMins: 5,
    image: '/img/plan-41a.webp', imageAlt: 'Floor plan of a 4 + 1 residence',
    cta: 'aveda',
    body: [
      p('Aveda Arenium offers four typologies across six towers. Every home includes an en-suite for each bedroom, a separate family lounge and staff quarters. The "+1" or "+2" in each name is the number of staff rooms. Sizes below are tentative and subject to change.'),
      h2('3 + 1 · from 3,080 sq ft'),
      p('Two layouts: Type I at about 3,080 sq ft in Towers 2 to 5, and Type II at about 3,570 sq ft in Towers 3 to 5, with a walk-in wardrobe and pooja room. A good fit for families who want generous rooms without excess space to maintain.'),
      h2('4 + 1 · from 4,070 sq ft'),
      p('In Tower 1, at about 4,070 and 4,600 sq ft, both with a plunge pool. The extra bedroom suits a growing family or a dedicated study, and the larger living and dining areas are built for hosting.'),
      h2('4 + 2 · about 5,600 sq ft'),
      p('Four bedrooms with two staff quarters, for households with live-in help or elderly parents who need support close by.'),
      h2('5 + 2 · 6,500 to 7,000 sq ft'),
      p('The largest homes, in Tower 6, with separate dry and wet kitchens, a 36-foot family lounge and two staff quarters. Designed for large joint families or those who entertain often.'),
      h2('How to decide'),
      li('Count bedrooms by how you will live in five years, not today.'),
      li('Decide whether live-in help is part of your plans; it changes which typology fits.'),
      li('Visit at different times of day to see light and views from each tower.'),
      p('The detailed floor plans and current prices are available on request from our team.')
    ]
  }
];
