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

function rotateRight(head: ListNode | null, k: number): ListNode | null {
  // Early exit for empty list, single node, or zero rotation
  if (head === null || head.next === null || k === 0) {
    return head;
  }

  // First pass: find tail and count length simultaneously
  let tail = head;
  let length = 1;
  while (tail.next !== null) {
    tail = tail.next;
    length++;
  }

  // Reduce k to effective rotation count, avoid modulo if k is already small
  let effectiveRotation = k;
  if (effectiveRotation >= length) {
    effectiveRotation = effectiveRotation % length;
  }

  // No rotation needed when effective count is zero
  if (effectiveRotation === 0) {
    return head;
  }

  // Connect tail to head forming a temporary circular list
  tail.next = head;

  // Walk to the node that will become the new tail
  const stepsToNewTail = length - effectiveRotation - 1;
  let newTail = head;
  for (let stepIndex = 0; stepIndex < stepsToNewTail; stepIndex++) {
    newTail = newTail.next!;
  }

  // Break the circular link and capture the new head
  const newHead = newTail.next!;
  newTail.next = null;

  return newHead;
}
