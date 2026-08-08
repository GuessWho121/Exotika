export const getCountryCode = (countryName: string): string => {
  const map: { [key: string]: string } = {
    "india": "IN",
    "united states": "US",
    "united kingdom": "GB",
    "canada": "CA",
    "australia": "AU",
    "germany": "DE",
    "france": "FR",
    "japan": "JP",
    "singapore": "SG",
    "united arab emirates": "AE"
  }
  return map[countryName.toLowerCase()] || ""
}

export const cleanQueryForGooglePlaces = (query: string): string => {
  let cleaned = query
  // 1. Remove leading room/flat numbers with hyphen/slashes, e.g., "1111 - Block B, SKA..." -> "Block B, SKA..."
  cleaned = cleaned.replace(/^\d+[-/]\d+\s*[-/]?\s*/i, "")
  cleaned = cleaned.replace(/^\d+\s*[-/]\s*/i, "")
  // 2. Remove flat/apartment prefixes, e.g., "Flat 101", "Flat No 101", "Apt 2B", "Apt-2B"
  cleaned = cleaned.replace(/\b(flat|apt|apartment|room|house|villa|no|num|number)\.?\s*\d+[a-zA-Z]?\b\s*[-/,\s]*/i, "")
  // 3. Remove typical unit patterns like "A-101", "F-302", "Block B"
  cleaned = cleaned.replace(/\b[a-zA-Z]-\d+\b\s*[-/,\s]*/i, "")
  cleaned = cleaned.replace(/\b(block|wing|tower)\s*[a-zA-Z0-9]\b\s*[-/,\s]*/i, "")
  // 4. Clean leading commas/spaces
  cleaned = cleaned.replace(/^[,.\-\s]+/, "")
  return cleaned.trim()
}
