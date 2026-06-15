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

function deleteMiddle(head: ListNode | null): ListNode | null {
  // A list with zero or one node leaves nothing once its only/middle node is gone.
  if (head === null || head.next === null) {
    return null
  }

  // Slow advances one node per step; fast advances two and begins two nodes ahead.
  let slowPointer: ListNode = head
  let fastPointer: ListNode | null = head.next.next

  // When fast runs out of room, slow sits on the predecessor of the middle node.
  while (fastPointer !== null && fastPointer.next !== null) {
    slowPointer = slowPointer.next as ListNode
    fastPointer = fastPointer.next.next
  }

  // Unlink the middle node by skipping over it in O(1).
  slowPointer.next = (slowPointer.next as ListNode).next

  return head
}
