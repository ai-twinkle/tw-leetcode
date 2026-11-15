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

/**
 * Removes the n-th node from the end of a singly-linked list in a single pass.
 * @param head - The head of the linked list.
 * @param n - The position from the end (1-indexed) of the node to remove.
 * @returns The head of the modified linked list.
 */
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  let leadingNode = head!;

  // Move the leading pointer n nodes ahead so the gap between the pointers is n
  for (let step = 0; step < n; step++) {
    leadingNode = leadingNode.next!;
  }

  // If the leading pointer ran off the end, the node to remove is the head itself
  if (leadingNode === null) {
    return head!.next;
  }

  let trailingNode = head!;

  // Advance both pointers until the leading pointer reaches the last node
  while (leadingNode.next !== null) {
    leadingNode = leadingNode.next;
    trailingNode = trailingNode.next!;
  }

  // The trailing pointer now sits just before the target node, so skip over it
  trailingNode.next = trailingNode.next!.next;

  return head;
}
