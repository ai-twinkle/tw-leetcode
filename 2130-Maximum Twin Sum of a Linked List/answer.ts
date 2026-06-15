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

function pairSum(head: ListNode | null): number {
  // First pass: count nodes so the typed array can be sized exactly once.
  let length = 0;
  let node = head;
  while (node !== null) {
    length++;
    node = node.next;
  }

  // Copy values into a typed array for compact, cache-friendly index access.
  const values = new Int32Array(length);
  node = head;
  let index = 0;
  while (node !== null) {
    values[index] = node.val;
    index++;
    node = node.next;
  }

  // Two-pointer scan from both ends evaluates every twin sum with no pointer chasing.
  let maxTwinSum = 0;
  let left = 0;
  let right = length - 1;
  while (left < right) {
    const twinSum = values[left] + values[right];
    // Manual comparison avoids the call overhead of Math.max in a hot loop.
    if (twinSum > maxTwinSum) {
      maxTwinSum = twinSum;
    }
    left++;
    right--;
  }

  return maxTwinSum;
}
