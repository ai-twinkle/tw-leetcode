function addBinary(a: string, b: string): string {
  let leftIndex = a.length - 1;
  let rightIndex = b.length - 1;

  let carry = 0;
  let result = "";

  while (leftIndex >= 0 || rightIndex >= 0 || carry !== 0) {
    // Sum current bits plus carry from the previous position.
    let sum = carry;

    if (leftIndex >= 0) {
      sum += a.charCodeAt(leftIndex) - 48;
      leftIndex -= 1;
    }

    if (rightIndex >= 0) {
      sum += b.charCodeAt(rightIndex) - 48;
      rightIndex -= 1;
    }

    // Append the computed bit to the front of the result.
    result = ((sum & 1) === 0 ? "0" : "1") + result;

    // Carry is 1 only when sum is 2 or 3.
    carry = sum >>> 1;
  }

  return result;
}
