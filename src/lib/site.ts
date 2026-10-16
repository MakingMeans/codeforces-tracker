export const site = {
  name: 'CF/TRACKER',
  repo: 'https://github.com/MakingMeans/codeforces-tracker',
  codeforces: 'https://codeforces.com',
  api: 'https://codeforces.com/apiHelp',
}

/** A file from public/, resolved against the GitHub Pages sub-path. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`
