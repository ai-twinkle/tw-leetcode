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

function getDecimalValue(head: ListNode | null): number {
  let accumulatedValue = 0;
  let currentNode = head;
  while (currentNode !== null) {
    // Shift previous bits left by 1 and add the current bit
    accumulatedValue = (accumulatedValue << 1) | currentNode.val;
    currentNode = currentNode.next;
  }
  return accumulatedValue;
}
