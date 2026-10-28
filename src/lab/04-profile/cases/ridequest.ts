import type { Case, Media } from './types';

const A = '/cases/ridequest'; /* public/cases/ridequest: his recording of the prototype (thumb.mp4, the Lab card's), cut into its six moments and cropped to the screen (446 × 892), each with its first frame as its poster (28 Oct) */
/* 28 Oct (Nitish: "cramped up from the top… the UI is all the way on the sides… adjust the phone ratio"): each clip extended
   to 460 × 986 — the status bar's room above (60), the home indicator's below (34), 7 at the sides — the extension carried
   on from the screen's own edges and softened (scratchpad rqtools/ios.py), and the phone draws its own marks there (ios) */
const scr = (id: string, label: string, cap: string): Media => ({ k: 'media', shape: 'phone', ratio: '460 / 986', label, cap, src: `${A}/${id}-ios.mp4`, poster: `${A}/${id}-ios-poster.webp`, ios: true });

/* RideQuest (Nitish, 28 Oct: "create one page for it, and the screens on the right side, content on the left side. However
   you want to manage the containers and segregation and categorization"). His concept, in his own categorisation (Aug): the
   five parts — the route as a 3D street-view world, the garage, riders nearby, route chat rooms, live ads from real
   locations — and his five process blocks. Every line is a decision he stated while building it (memory: the concept and
   its build log); the screens are his recording, one moment per part. The garage is the one part the recording doesn't
   visit, so it sits with the rest of the concept in words (a clip of it to come) */
export const ridequest: Case = {
  id: 'ridequest',
  title: 'RideQuest',
  sub: 'Your ride, as a world: riders around you, games, and the city on your route.',
  chips: ['Concept', 'Prototype', 'Gamification'],
  facts: [
    { k: 'Role', v: 'Interaction & prototype' },
    { k: 'Project type', v: 'Concept · playable prototype' },
    { k: 'Focus', v: 'Gamification, 3D world, in-ride ads' },
  ],
  hero: { k: 'phones', of: [
    scr('entry', 'The ride screen with its invite, then the flight into the world', 'The invite'),
    scr('riders', 'Riders nearby: a wave to Chai-9 and its reply', 'Riders nearby'),
    scr('chat', 'The Cyber Hub room and the NH-48 corridor thread', 'Route chat'),
  ] },
  sections: [
    {
      id: 'idea', title: 'Pass the ride inside the ride',
      blocks: [
        { k: 'p', t: ['RideQuest is a concept for a gamified experience inside the Uber app, for passengers to pass the time during a ride. The live ride map turns into a ', { b: 'game version of the same route' }, ', with a car the rider makes their own. ', { b: 'Other riders nearby' }, ' show up on it to wave at, challenge and chat with, and ', { b: 'the shops and brands along the route' }, ' become the world’s signs and billboards.'] },
      ],
    },
    {
      id: 'entry', title: 'Your ride has a world',
      blocks: [
        { k: 'shot', p: [
          ['It starts from the ride screen the rider already has. A ', { b: 'banner, not just a button' }, ', invites them in: riders around you, games, drops on this route. One tap and the camera ', { b: 'flies from the wide top view of the trip down to a street-level view behind the car' }, '; the game’s bottom nav slides up and the rest fades in. The × at the top right flies back out the same way.'],
        ], ul: [
          ['The trip view stays ', { b: 'minimal' }, ' — no trees, hoardings or signals, the map washed light — so it still reads as the usual ride screen'],
          ['The city’s dressing comes back halfway through the flight'],
          ['The car sits about a third of the way up the screen in both views, so it holds its place through the move'],
        ], m: scr('entry', 'The ride screen with its invite, then the flight into the world', 'Entering from the ride screen') },
      ],
    },
    {
      id: 'world', title: 'Your route as a 3D street-view world',
      blocks: [
        { k: 'shot', p: [
          ['The ride’s route becomes a 3D street view: the path as a blue line ahead of the car, buildings, trees, traffic lights, and the brands on the way. The light follows the time of day — ', { b: 'subtle by day, neon at night' }, '.'],
        ], ul: [
          ['A heads-up camera that turns with the car'],
          ['The car ', { b: 'leans into turns, drifts' }, ', and gets a boost when a light turns green'],
          ['Not every signal stops you: the first one after entering always does, to show the boost; the rest are left to chance'],
          ['Other cars keep their lane and their distance — never through each other, or you'],
          ['The route line is drawn only ahead of the car'],
        ], m: scr('world', 'Driving the route: hoardings, a signal and a store on the stretch', 'On the route') },
      ],
    },
    {
      id: 'riders', title: 'Riders nearby: wave, challenge, play',
      blocks: [
        { k: 'shot', p: [
          ['Riders around you appear with ', { b: 'a handle and their car, nothing more' }, ' — no real name, photo or destination. Tap one to wave or to challenge them. A wave plays above both cars and their name chip becomes the greeting; a challenge turns the map into a game arena for the two of you.'],
        ], ul: [
          ['Two circles: a ', { b: 'wide one to see' }, ' riders, and your route’s ', { b: 'corridor to interact' }],
          [{ b: 'Theirs loud, mine quiet' }, ': what others send stands out, your own stays calm'],
          ['A game lasts to the end of the ride — arenas aren’t real streets, so routes that part can’t break it'],
          ['When few riders are around, clearly labelled AI riders fill in'],
          ['Block, report and instant mute everywhere, and a ghost mode'],
        ], m: scr('riders', 'Riders nearby: a wave to Chai-9 and its reply', 'A wave, and the reply') },
      ],
    },
    {
      id: 'chat', title: 'Route chat rooms',
      blocks: [
        { k: 'shot', p: [
          ['Riders headed the same way share a room: one for the ', { b: 'destination' }, ', and a thread for ', { b: 'the road they’re on right now' }, '. It carries travel updates and picks nearby — sales, cafés, discounts — with the brands on the route posting in the same format as everyone else, marked as sponsored.'],
        ], ul: [
          ['Rooms by destination and corridor: Cyber Hub, the NH-48 corridor'],
          ['Preset prompts, emotes and templates, plus filtered free text'],
          ['Direct messages unlock only when both riders accept a friend request'],
          ['Friends chat across rides, see when the other is riding, and can challenge from anywhere'],
        ], m: scr('chat', 'The Cyber Hub room and the NH-48 corridor thread', 'Destination room and corridor') },
      ],
    },
    {
      id: 'ads', title: 'Live ads from real locations',
      blocks: [
        { k: 'shot', h: 'Signs and hoardings you can act on', p: [
          ['Brands sit where they would in the city: ', { b: 'hanging signs and rooftop boards' }, ' on their own stores, ', { b: 'roadside hoardings' }, ', gantries over the road for launches, and banners on tall buildings. A tap opens a card with a coupon to claim and the brand’s own next step: order now, book a table, check prices, get a subscription.'],
        ], ul: [
          ['Chips show the offer in a word or two, not a brand name with an AD tag'],
          ['A new store glows, with a “just opened” pill'],
          ['Rewards are coupons and coins; coins buy looks for the car and real-world perks'],
        ], m: scr('ad', 'A hoarding’s card: Apple TV+, its subscription and coupon', 'A hoarding’s card') },
        { k: 'shot', h: 'From a sign to your order', p: [
          ['A store on the route goes from its sign, to a ', { b: 'sponsored strip in the nav' }, ' — Starbucks just off this road — to an offer made for you: an ice americano for Nitish, ready at the window as you pass. The order is ', { b: 'timed to the route' }, '.'],
        ], ulh: 'Guardrails', ul: [
          ['Three or four placements a ride, at most'],
          ['Every ad can be dismissed'],
          ['No ads in a game arena, unless a tournament is sponsored'],
          ['Only brands on the route, or relevant to where you’re going'],
        ], m: scr('store', 'Starbucks: the sign, the nav strip, the card and the order', 'Sign, strip, order') },
      ],
    },
    {
      id: 'more', title: 'Also in the concept',
      blocks: [
        { k: 'cols', of: [
          { h: 'The garage', p: ['Choose a car and make it yours — ', { b: 'paint, trails, decals and wraps, plates, horns, wheels and underglow' }, ' — then show it off to the riders around you. Six cars, coloured from Uber’s palette with a gold accent.'] },
          { h: 'Add-ons', p: ['Quests and streaks, leaderboards, riding in a convoy, spectating a game, holding territory, and music in sync.'] },
        ] },
      ],
    },
    {
      id: 'built', title: 'How it was built',
      blocks: [
        { k: 'p', t: ['Decisions first, ', { b: 'one phase at a time' }, ' — the gamified map, chat, ads, add-ons, UI, then the car and map logic — each closed before the next. Then the whole prototype with every function in, before any polish. It stands on five blocks:'] },
        { k: 'ol', items: [
          { lead: 'The map and its logic.', t: ['A stand-in city with day and night, traffic signals and car physics.'] },
          { lead: 'An ads system.', t: ['Assets for every type of promotion, some placed by real locations on the map.'] },
          { lead: 'Sourced and made assets.', t: ['Cars, a building pack, hoardings, traffic signals and custom stores.'] },
          { lead: 'A design system.', t: ['The UI’s system, with motion and interaction as tokens.'] },
          { lead: 'Visual and motion assets.', t: ['Lotties and brand banners.'] },
        ] },
      ],
    },
  ],
};
