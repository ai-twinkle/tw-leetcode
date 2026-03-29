function canBeEqual(s1: string, s2: string): boolean {
  // Extract character codes once to avoid repeated property lookups
  const s1Code0 = s1.charCodeAt(0);
  const s1Code1 = s1.charCodeAt(1);
  const s1Code2 = s1.charCodeAt(2);
  const s1Code3 = s1.charCodeAt(3);

  const s2Code0 = s2.charCodeAt(0);
  const s2Code1 = s2.charCodeAt(1);
  const s2Code2 = s2.charCodeAt(2);
  const s2Code3 = s2.charCodeAt(3);

  // Even-indexed positions (0, 2) can be freely swapped with each other
  // Check if the even group matches either in original or swapped order
  const evenGroupMatches =
    (s1Code0 === s2Code0 && s1Code2 === s2Code2) ||
    (s1Code0 === s2Code2 && s1Code2 === s2Code0);

  // Odd-indexed positions (1, 3) can be freely swapped with each other
  // Check if the odd group matches either in original or swapped order
  const oddGroupMatches =
    (s1Code1 === s2Code1 && s1Code3 === s2Code3) ||
    (s1Code1 === s2Code3 && s1Code3 === s2Code1);

  return evenGroupMatches && oddGroupMatches;
}
