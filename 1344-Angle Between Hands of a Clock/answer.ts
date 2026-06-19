function angleClock(hour: number, minutes: number): number {
  // Fold both hand positions into one signed difference to skip an intermediate value.
  const signedDifference = (hour % 12) * 30 - minutes * 5.5;

  // Math.abs is cheaper than a branch and handles the sign in one step.
  const rawAngle = Math.abs(signedDifference);

  // The clock wraps at 360, so the smaller of the two arcs is the answer.
  return rawAngle > 180 ? 360 - rawAngle : rawAngle;
}
