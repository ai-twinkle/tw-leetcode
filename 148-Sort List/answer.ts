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

function sortList(head: ListNode | null): ListNode | null {
  // Trivial or single-node list
  if (head === null || head.next === null) {
    return head;
  }

  // 1. Single scan to find min/max
  let minimumValue = head.val;
  let maximumValue = head.val;
  let currentNode: ListNode | null = head;
  while (currentNode !== null) {
    const value = currentNode.val;
    if (value < minimumValue) {
      minimumValue = value;
    } else if (value > maximumValue) {
      maximumValue = value;
    }
    currentNode = currentNode.next;
  }

  // 2. Prepare counts
  const valueOffset = -minimumValue;
  const bucketCount = maximumValue - minimumValue + 1;
  const frequencyCounts = new Uint32Array(bucketCount);

  // 3. Second scan to tally frequencies
  currentNode = head;
  while (currentNode !== null) {
    frequencyCounts[currentNode.val + valueOffset]++;
    currentNode = currentNode.next;
  }

  // 4. Third pass: write back in order
  let writePointer = head;
  for (let bucketIndex = 0; bucketIndex < bucketCount; ++bucketIndex) {
    let occurrences = frequencyCounts[bucketIndex];
    if (occurrences === 0) {
      continue;
    }

    const sortedValue = bucketIndex - valueOffset;
    while (occurrences-- > 0) {
      writePointer.val = sortedValue;
      writePointer = writePointer.next!;  // Safe: total counts == node count
    }
  }

  return head;
}
