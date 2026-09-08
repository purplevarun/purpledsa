// GFG doesn't have stable predictable problem-page slugs, so we link to a
// search query instead of guessing an exact (possibly wrong) URL.
export function gfgSearchUrl(problemName: string): string {
  return `https://www.geeksforgeeks.org/?s=${encodeURIComponent(problemName)}`;
}
