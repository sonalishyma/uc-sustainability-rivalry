/* UC Sustainability Rivalry — campus badge icons
   Original, simplified mascot-style marks drawn for this project (not
   reproductions of any campus's official logo/wordmark artwork), rendered
   in the site's own navy/gold palette so every badge reads as one family. */

const LOGOS = {
  /* UC San Diego — Triton trident */
  UCSD: `<path d="M24 6 L24 30 M24 6 L17 16 M24 6 L31 16" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 34c3-4 6-6 9-6s6 2 9 6" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>`,

  /* UCLA — bruin bear head */
  UCLA: `<circle cx="24" cy="26" r="11" fill="currentColor"/><circle cx="15" cy="15" r="5" fill="currentColor"/><circle cx="33" cy="15" r="5" fill="currentColor"/><circle cx="20" cy="25" r="1.6" fill="var(--page)"/><circle cx="28" cy="25" r="1.6" fill="var(--page)"/><ellipse cx="24" cy="31" rx="3.4" ry="2.4" fill="var(--page)"/>`,

  /* UC Berkeley — block C */
  UCB: `<path d="M32.4,16.9 A11,11 0 1,0 32.4,31.1" fill="none" stroke="currentColor" stroke-width="5.6" stroke-linecap="round"/>`,

  /* UC Merced — bobcat ears / M monogram */
  UCM: `<path d="M11 32 L17 12 L24 26 L31 12 L37 32" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"/>`,

  /* UC Davis — wheat / aggie stalk */
  UCD: `<path d="M24 8v28" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M24 14c-5-3-9-2-11 2 4 2 8 1 11-2Z" fill="currentColor"/><path d="M24 14c5-3 9-2 11 2-4 2-8 1-11-2Z" fill="currentColor"/><path d="M24 22c-5-3-9-2-11 2 4 2 8 1 11-2Z" fill="currentColor"/><path d="M24 22c5-3 9-2 11 2-4 2-8 1-11-2Z" fill="currentColor"/><path d="M18 36c2-3 4-4 6-4s4 1 6 4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,

  /* UC Santa Barbara — gaucho sombrero */
  UCSB: `<ellipse cx="24" cy="28" rx="17" ry="4.6" fill="currentColor"/><path d="M15 27c0-8 4-14 9-14s9 6 9 14" fill="none" stroke="currentColor" stroke-width="3.4"/><rect x="20" y="11" width="8" height="5" rx="1.5" fill="currentColor"/>`,

  /* UC Santa Cruz — banana slug */
  UCSC: `<path d="M9 30c0-7 6-13 16-13 8 0 14 4 14 9 0 4-4 7-10 7-9 0-14-3-20-3Z" fill="currentColor"/><path d="M15 17c0-3 2-5 3-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M21 17c0-4 1-6 2-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="27" r="1.6" fill="var(--page)"/>`,

  /* UC Irvine — anteater snout */
  UCI: `<path d="M8 26c0-2 2-3 4-3 10 0 16-9 24-9 3 0 5 2 5 4s-2 3-4 3c-3 6-8 9-13 9-8 0-12-2-16-4Z" fill="currentColor"/><circle cx="16" cy="21" r="1.7" fill="var(--page)"/>`,

  /* UC Riverside — highlander cap */
  UCR: `<path d="M11 30c0-9 6-16 13-16s13 7 13 16Z" fill="currentColor"/><rect x="9" y="29" width="30" height="4" rx="2" fill="currentColor"/><circle cx="24" cy="11" r="3.4" fill="currentColor"/>`,
};

function badgeHTML(key, size) {
  const cls = size ? `logo-badge logo-${size}` : "logo-badge";
  const glyph = LOGOS[key] || "";
  return `<span class="${cls}" aria-hidden="true"><svg viewBox="0 0 48 48">${glyph}</svg></span>`;
}
