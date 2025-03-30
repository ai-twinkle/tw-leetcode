function partitionLabels(s: string): number[] {
  const n = s.length;
  // Use a typed array for the 26 lowercase letters.
  const last = new Int32Array(26);

  // Compute the last occurrence for each letter.
  for (let i = 0; i < n; i++) {
    last[s.charCodeAt(i) - 97] = i;
  }

  const result: number[] = [];
  let start = 0;
  let end = 0;

  // Process the string and form partitions.
  for (let i = 0; i < n; i++) {
    // Cache the index of the character.
    const idx = s.charCodeAt(i) - 97;
    const lastOccurrence = last[idx];

    // Update 'end' without calling Math.max.
    if (lastOccurrence > end) {
      end = lastOccurrence;
    }

    // If we reached the end of a partition, record its size.
    if (i === end) {
      result.push(end - start + 1);
      start = i + 1;
    }
  }

  return result;
}
