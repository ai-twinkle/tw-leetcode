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

function modifiedList(nums: number[], head: ListNode | null): ListNode | null {
  // Fast path: empty list
  if (head === null) {
    return null;
  }

  // Problem constraint upper bound for node/nums values
  const MAX_VALUE = 100000;

  // Create typed presence array. Index i = 0...MAX_VALUE; value 1 means present in nums.
  const presenceArray = new Uint8Array(MAX_VALUE + 1);

  // Mark presence for each number in nums (use classic for loop to avoid iterator overhead)
  for (let index = 0; index < nums.length; index++) {
    const value = nums[index];
    // Under the problem constraints value is guaranteed to be in [1, MAX_VALUE],
    // so we skip extra bounds-checks here for speed.
    presenceArray[value] = 1;
  }

  // Dummy node simplifies head removals
  const dummyNode = new ListNode(0, head);

  // Local aliases to reduce repeated property lookups in the hot loop
  let previousNode: ListNode = dummyNode;
  let currentNode: ListNode | null = head;

  // Traverse the list, removing nodes whose values are present
  while (currentNode !== null) {
    // Cache next pointer once for this iteration to avoid repeated .next property access
    const nextNode = currentNode.next as ListNode | null;
    const valueToCheck = currentNode.val;

    if (presenceArray[valueToCheck] === 1) {
      // Node should be removed: bypass currentNode by linking previousNode to nextNode
      previousNode.next = nextNode;
      // currentNode becomes nextNode (previousNode stays unchanged)
      currentNode = nextNode;
    } else {
      // Node should be kept: advance previousNode and currentNode
      previousNode = currentNode;
      currentNode = nextNode;
    }
  }

  // Return the possibly new head
  return dummyNode.next;
}
