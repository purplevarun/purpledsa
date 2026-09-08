// GFG doesn't have stable predictable problem-page slugs, so we link to a
// search query instead of guessing an exact (possibly wrong) URL.
export function gfgSearchUrl(problemName: string): string {
  return `https://www.geeksforgeeks.org/?s=${encodeURIComponent(problemName)}`;
}

// LLD/machine-coding problems have no canonical problem page, so link to a
// real GitHub code search instead of guessing a specific repo.
export function githubSearchUrl(query: string): string {
  return `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`;
}
