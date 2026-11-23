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

function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  // If either list is empty, return the other list as it is
  if (list1 === null) {
    return list2;
  }
  if (list2 === null) {
    return list1;
  }

  // Choose the smaller head directly so no dummy node is needed
  let mergedHead: ListNode;
  if (list1.val <= list2.val) {
    mergedHead = list1;
    list1 = list1.next;
  } else {
    mergedHead = list2;
    list2 = list2.next;
  }

  let mergedTail = mergedHead;

  // Attach the smaller front node while both lists still have nodes
  while (list1 !== null && list2 !== null) {
    if (list1.val <= list2.val) {
      mergedTail.next = list1;
      mergedTail = list1;
      list1 = list1.next;
    } else {
      mergedTail.next = list2;
      mergedTail = list2;
      list2 = list2.next;
    }
  }

  // The leftover part is already sorted, so link it on in one step
  mergedTail.next = list1 !== null ? list1 : list2;

  return mergedHead;
}
