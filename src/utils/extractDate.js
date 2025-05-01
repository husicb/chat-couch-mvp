export function extractDatePrefixed(text) {
  const match = text.match(/^@(\d{4}-\d{2}-\d{2})\s+(.*)/);
  if (match) {
    return {
      date: match[1],
      cleaned: match[2]
    };
  } else {
    return {
      date: new Date().toISOString().slice(0, 10),
      cleaned: text.trim()
    };
  }
}
