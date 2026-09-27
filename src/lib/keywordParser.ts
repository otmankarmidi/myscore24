/**
 * Utility for parsing and sanitizing SEO keyword input in MyScore24 CMS.
 * Supports bulk-paste, multi-format separators, quote/backtick cleanup,
 * whitespace collapsing, and case-insensitive deduplication while preserving
 * readable capitalization.
 */

// Supported separators: comma (,), semicolon (;), Arabic comma (،), Arabic semicolon (؛), and newlines
export const KEYWORD_SEPARATORS_REGEX = /[,;،؛\r\n]+/

// Quotes and backticks to strip from the edges of a keyword token
const SURROUNDING_QUOTES_REGEX = /^[`'"“”‘’‚‛«»]+|[`'"“”‘’‚‛«»]+$/gu

/**
 * Cleans a single keyword phrase:
 * - Trims leading/trailing whitespace
 * - Removes surrounding quotes and backticks (single, double, backtick, smart quotes)
 * - Collapses repeated internal whitespace into a single space (without splitting normal spaces)
 */
export function cleanKeywordPhrase(raw: string): string {
  if (!raw) return ''
  let cleaned = raw.trim()

  // Repeatedly strip surrounding quotes/backticks in case of nested quotes like "`keyword`"
  while (SURROUNDING_QUOTES_REGEX.test(cleaned)) {
    cleaned = cleaned.replace(SURROUNDING_QUOTES_REGEX, '').trim()
  }

  // Collapse repeated spaces (never split normal spaces)
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned
}

/**
 * Parses a bulk input string into an array of clean, unique keywords.
 * - Splits by supported separators: , ; ، ؛ and newlines
 * - Cleans each phrase
 * - Ignores empty phrases
 * - Deduplicates case-insensitively while preserving original capitalization
 * - Optionally checks against an existing list of keywords
 */
export function parseKeywordsInput(
  input: string,
  existingKeywords: string[] = []
): { newKeywords: string[]; allKeywords: string[] } {
  if (!input || !input.trim()) {
    return { newKeywords: [], allKeywords: [...existingKeywords] }
  }

  const parts = input.split(KEYWORD_SEPARATORS_REGEX)
  const result: string[] = [...existingKeywords]
  const newlyAdded: string[] = []

  for (const rawPart of parts) {
    const cleaned = cleanKeywordPhrase(rawPart)
    if (!cleaned) continue

    const alreadyExists = result.some(
      (existing) => existing.toLowerCase() === cleaned.toLowerCase()
    )

    if (!alreadyExists) {
      result.push(cleaned)
      newlyAdded.push(cleaned)
    }
  }

  return { newKeywords: newlyAdded, allKeywords: result }
}
