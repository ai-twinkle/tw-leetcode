function maxDepthAfterSplit(seq: string): number[] {
  const sequenceLength = seq.length;
  const groupAssignment: number[] = new Array(sequenceLength);

  // Depth before position i always has parity (i & 1) because a VPS shifts depth by exactly 1 per char.
  // '(' (code 40) is scored at depth + 1, ')' (code 41) at depth, and charCode & 1 encodes exactly that offset.
  for (let position = 0; position < sequenceLength; position++) {
    groupAssignment[position] = (position ^ seq.charCodeAt(position) ^ 1) & 1;
  }

  return groupAssignment;
}
