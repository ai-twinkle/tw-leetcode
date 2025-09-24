function fractionToDecimal(numerator: number, denominator: number): string {
  // Fast path: Zero numerator returns "0"
  if (numerator === 0) {
    return "0";
  }

  // Determine sign once for output construction
  const isNegative = (numerator > 0) !== (denominator > 0);
  const signPrefix = isNegative ? "-" : "";

  // Work with absolute values to simplify division and modulo
  const numeratorAbs = Math.abs(numerator);
  const denominatorAbs = Math.abs(denominator);

  // Compute integral part via integer division
  const integralPart = Math.floor(numeratorAbs / denominatorAbs);

  // Compute initial remainder (fractional part trigger)
  let remainder = numeratorAbs % denominatorAbs;

  // If no fractional part, return early (best-case runtime)
  if (remainder === 0) {
    return signPrefix + integralPart.toString();
  }

  // Prepare output with head "sign + integral + '.'"
  const head = signPrefix + integralPart.toString() + ".";
  const outputSegments: string[] = [head];

  // Track index of first appearance for each remainder to detect cycles
  const firstIndexByRemainder = new Map<number, number>();

  // Maintain current built length to position '(' correctly upon repetition
  let currentLength = head.length;

  // Long division: one digit per loop; no inner while (zeros come naturally)
  while (remainder !== 0) {
    // Cycle check: if we have seen this remainder, insert parentheses
    const seenAt = firstIndexByRemainder.get(remainder);
    if (seenAt !== undefined) {
      const built = outputSegments.join("");
      return built.slice(0, seenAt) + "(" + built.slice(seenAt) + ")";
    }

    // Mark the first index where this remainder contributes a digit
    firstIndexByRemainder.set(remainder, currentLength);

    // Scale to get the next digit
    remainder = remainder * 10;

    // Compute next digit using integer division
    const digit = Math.floor(remainder / denominatorAbs);

    // Append the next digit as a single character (48 is the char code of '0')
    outputSegments.push(String.fromCharCode(48 + digit));
    currentLength += 1;

    // Update the remainder for the next iteration
    remainder = remainder % denominatorAbs;
  }

  // If we exit the loop, the fractional part is finite; join once for minimal allocations
  return outputSegments.join("");
}
