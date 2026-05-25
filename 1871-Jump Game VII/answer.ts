function canReach(s: string, minJump: number, maxJump: number): boolean {
  const length = s.length;
  const lastIndex = length - 1;
  const zeroCharCode = 48;

  // Early rejection: the destination must itself be a '0'
  if (s.charCodeAt(lastIndex) !== zeroCharCode) {
    return false;
  }

  // Reachability flags packed into a Uint8Array for cache-friendly access
  const reachable = new Uint8Array(length);
  reachable[0] = 1;

  // Running count of reachable indices within the sliding window [i - maxJump, i - minJump]
  let windowReachableCount = 0;

  for (let i = 1; i < length; i++) {
    // Slide the window's right edge in: index (i - minJump) just became eligible
    const enteringIndex = i - minJump;
    if (enteringIndex >= 0 && reachable[enteringIndex] === 1) {
      windowReachableCount++;
    }

    // Slide the window's left edge out: index (i - maxJump - 1) just left the window
    const leavingIndex = i - maxJump - 1;
    if (leavingIndex >= 0 && reachable[leavingIndex] === 1) {
      windowReachableCount--;
    }

    // Mark index i reachable when it is a '0' and at least one predecessor is reachable
    if (windowReachableCount > 0 && s.charCodeAt(i) === zeroCharCode) {
      reachable[i] = 1;

      // Short-circuit the moment the destination becomes reachable
      if (i === lastIndex) {
        return true;
      }
    }
  }

  return false;
}
