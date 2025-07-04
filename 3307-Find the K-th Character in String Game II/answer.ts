function kthCharacter(k: number, operations: number[]): string {
  let shiftCount = 0;

  // Trace back from position k to the original character
  while (k !== 1) {
    // Find the operation index that generated this segment
    let operationIndex = Math.floor(Math.log2(k));

    // Adjust if k is exactly a power of two
    if (Number(1n << BigInt(operationIndex)) === k) {
      operationIndex--;
    }

    // Move to the corresponding position in the previous state
    k -= Number(1n << BigInt(operationIndex));

    // If the operation is type 1, increment the shift count
    if (operations[operationIndex]) {
      shiftCount++;
    }
  }

  // Calculate the final character after all shifts
  return String.fromCharCode(
    'a'.charCodeAt(0) + (shiftCount % 26)
  );
}
