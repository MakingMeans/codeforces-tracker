/** What Codeforces accepts as a handle: 3 to 24 letters, digits, `_`, `.` or `-`. */
export const HANDLE_PATTERN = /^[A-Za-z0-9_.-]{3,24}$/

/** The handle in what was typed: trims spaces and a leading @, and accepts a pasted profile link. */
export function cleanHandle(input: string) {
  const text = input.trim()
  const fromLink = text.match(/codeforces\.com\/profile\/([^/?#\s]+)/i)
  return (fromLink ? decodeURIComponent(fromLink[1]) : text).replace(/^@/, '')
}

/** Why the input cannot be a handle, or null when it can. */
export function handleProblem(input: string): string | null {
  const handle = cleanHandle(input)
  if (!handle) return 'Type a Codeforces handle.'
  if (handle.length < 3) return 'Handles are at least 3 characters long.'
  if (handle.length > 24) return 'Handles are at most 24 characters long.'
  if (!HANDLE_PATTERN.test(handle)) return 'Handles only use letters, digits, _ . and -.'
  return null
}
