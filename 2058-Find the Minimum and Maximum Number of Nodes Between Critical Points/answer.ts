/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

function nodesBetweenCriticalPoints(head: ListNode | null): number[] {
  // A critical point needs both neighbours, so lists shorter than three nodes are rejected immediately
  if (head === null || head.next === null || head.next.next === null) {
    return [-1, -1];
  }

  let previousValue = head.val;
  let currentNode = head.next;
  let currentValue = currentNode.val;
  let currentIndex = 1;

  let firstCriticalIndex = -1;
  let lastCriticalIndex = -1;
  let minimumDistance = 0x7fffffff;

  // Walk the list once, keeping the previous value in a register instead of dereferencing backwards
  while (currentNode.next !== null) {
    const nextNode = currentNode.next;
    const nextValue = nextNode.val;

    // Both differences share the same strict sign exactly when the node is a local maxima or minima
    const leftDifference = currentValue - previousValue;
    const rightDifference = currentValue - nextValue;

    if (leftDifference !== 0 && rightDifference !== 0 && (leftDifference ^ rightDifference) >= 0) {
      if (lastCriticalIndex < 0) {
        // The first critical point only fixes the left end of the maximum span
        firstCriticalIndex = currentIndex;
      } else {
        // The closest pair is always a pair of consecutive critical points
        const neighbourDistance = currentIndex - lastCriticalIndex;

        if (neighbourDistance < minimumDistance) {
          minimumDistance = neighbourDistance;
        }
      }

      lastCriticalIndex = currentIndex;
    }

    previousValue = currentValue;
    currentValue = nextValue;
    currentNode = nextNode;
    currentIndex++;
  }

  // Zero or one critical point leaves both indices equal
  if (firstCriticalIndex === lastCriticalIndex) {
    return [-1, -1];
  }

  return [minimumDistance, lastCriticalIndex - firstCriticalIndex];
}
