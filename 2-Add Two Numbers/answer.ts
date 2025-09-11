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

function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  // Handle edge cases when one of the lists is empty
  if (l1 === null) {
    return l2;
  }
  if (l2 === null) {
    return l1;
  }

  // Use a dummy head to simplify list construction,
  // and maintain a tail pointer for appending new nodes
  const dummyHeadNode = new ListNode(0);
  let resultTailNode = dummyHeadNode;

  // Initialize traversal pointers and carry for digit overflow
  let list1Pointer: ListNode | null = l1;
  let list2Pointer: ListNode | null = l2;
  let carryOver = 0;

  // Traverse both lists until all digits are processed
  while (list1Pointer !== null || list2Pointer !== null) {
    // Get current digit values (0 if one list is shorter)
    const digitFromList1 = list1Pointer ? list1Pointer.val : 0;
    const digitFromList2 = list2Pointer ? list2Pointer.val : 0;

    // Compute sum of digits plus carry from previous step
    const sumOfDigits = digitFromList1 + digitFromList2 + carryOver;

    // Create a new node for the current digit,
    // and update the carry accordingly
    if (sumOfDigits >= 10) {
      resultTailNode.next = new ListNode(sumOfDigits - 10);
      carryOver = 1;
    } else {
      resultTailNode.next = new ListNode(sumOfDigits);
      carryOver = 0;
    }

    // Advance the tail pointer and move forward in input lists
    resultTailNode = resultTailNode.next!;
    if (list1Pointer !== null) {
      list1Pointer = list1Pointer.next;
    }
    if (list2Pointer !== null) {
      list2Pointer = list2Pointer.next;
    }
  }

  // If a carry remains after processing both lists, append it
  if (carryOver !== 0) {
    resultTailNode.next = new ListNode(carryOver);
  }

  // Return the actual head of the result list (skip dummy node)
  return dummyHeadNode.next;
}
