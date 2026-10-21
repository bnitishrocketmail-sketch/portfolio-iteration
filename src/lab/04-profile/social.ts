import { faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { siLottiefiles } from 'simple-icons';
import { LINKS } from '../../lib/data';

/* his address, as his Framer site's "Let's connect" and "Let's talk!" link it */
export const MAIL = 'mailto:bnitish@rocketmail.com';

/* the links: the brands' own marks (Nitish, 13 Oct) — LinkedIn and Instagram from Font Awesome's brand set, LottieFiles
   from Simple Icons (which no longer carries LinkedIn); the email one is an envelope glyph. Shared by the intro's notch
   and the case study's contact card. */
export const SOCIAL: { label: string; href: string; path: string; box: string }[] = [
  { label: 'LinkedIn', href: LINKS.linkedin, path: String(faLinkedinIn.icon[4]), box: `0 0 ${faLinkedinIn.icon[0]} ${faLinkedinIn.icon[1]}` },
  { label: 'Instagram', href: LINKS.instagram, path: String(faInstagram.icon[4]), box: `0 0 ${faInstagram.icon[0]} ${faInstagram.icon[1]}` },
  { label: 'LottieFiles', href: LINKS.lottiefiles, path: siLottiefiles.path, box: '0 0 24 24' },
  { label: 'Email', href: MAIL, path: 'M2 5h20v14H2zm1 1v1.2l9 6 9-6V6zm18 2.4-9 6-9-6V18h18z', box: '0 0 24 24' },
];
