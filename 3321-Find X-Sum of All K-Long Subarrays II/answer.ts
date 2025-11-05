/**
 * Heap membership states (stored in Int8Array).
 */
const enum Membership {
  None = 0,        // Not in any heap
  Selected = 1,    // In selectedHeap (maintains top-x elements)
  Candidate = 2,   // In candidateHeap (maintains remaining elements)
}

/**
 * Integer-id heap with in-place key updates.
 * Each element in the heap is represented by an integer ID.
 * The comparator determines priority using external arrays (frequency and value).
 */
class IdHeap {
  private readonly heapStorage: Int32Array;   // Stores the IDs representing elements
  private heapSize: number;                   // Current number of elements in the heap
  private readonly positionById: Int32Array;  // Maps ID → index in heapStorage (or -1 if not in heap)
  private readonly isHigherPriority: (aId: number, bId: number) => boolean; // Comparator function

  /**
   * @param capacity Maximum elements the heap can hold
   * @param positionById Shared position array (mutated by the heap)
   * @param isHigherPriority Returns true if element A should be higher in the heap than B
   */
  constructor(
    capacity: number,
    positionById: Int32Array,
    isHigherPriority: (aId: number, bId: number) => boolean
  ) {
    this.heapStorage = new Int32Array(capacity);
    this.heapSize = 0;
    this.positionById = positionById;
    this.isHigherPriority = isHigherPriority;
  }

  /**
   * Get the current size of the heap.
   * @returns Number of elements in the heap
   */
  size(): number {
    return this.heapSize;
  }

  /**
   * Get the top ID without removing it.
   * @returns Top ID or -1 if the heap is empty
   */
  top(): number {
    if (this.heapSize === 0) {
      return -1;
    }
    return this.heapStorage[0];
  }

  /**
   * Insert a new ID into the heap.
   * @param id The element ID to insert
   */
  push(id: number) {
    const index = this.heapSize;
    this.heapStorage[index] = id;
    this.positionById[id] = index;
    this.heapSize += 1;
    this.siftUp(index);
  }

  /**
   * Remove and return the top ID from the heap.
   * @returns The removed top ID, or -1 if the heap is empty
   */
  pop(): number {
    if (this.heapSize === 0) {
      return -1;
    }

    const topId = this.heapStorage[0];
    const lastIndex = this.heapSize - 1;
    const lastId = this.heapStorage[lastIndex];
    this.heapSize = lastIndex;

    if (lastIndex > 0) {
      this.heapStorage[0] = lastId;
      this.positionById[lastId] = 0;
      this.siftDown(0);
    }

    this.positionById[topId] = -1;
    return topId;
  }

  /**
   * Remove a specific ID from the heap if it exists.
   * @param id The element ID to remove
   */
  remove(id: number) {
    const index = this.positionById[id];
    if (index < 0) {
      return;
    }

    const lastIndex = this.heapSize - 1;
    const lastId = this.heapStorage[lastIndex];
    this.heapSize = lastIndex;
    this.positionById[id] = -1;

    if (index !== lastIndex) {
      this.heapStorage[index] = lastId;
      this.positionById[lastId] = index;
      this.siftUp(index);
      this.siftDown(index);
    }
  }

  /**
   * Update the heap order after an element's priority changes.
   * @param id The element ID whose priority has changed
   */
  update(id: number) {
    const index = this.positionById[id];
    if (index < 0) {
      return;
    }
    this.siftUp(index);
    this.siftDown(index);
  }

  /**
   * Move an element upward until the heap property is satisfied.
   * @param index The starting index of the element
   * @private
   */
  private siftUp(index: number) {
    let child = index;
    while (child > 0) {
      const parent = (child - 1) >> 1;
      const childId = this.heapStorage[child];
      const parentId = this.heapStorage[parent];

      if (!this.isHigherPriority(childId, parentId)) {
        break;
      }
      this.swap(child, parent);
      child = parent;
    }
  }

  /**
   * Move an element downward until the heap property is satisfied.
   * @param index The starting index of the element
   * @private
   */
  private siftDown(index: number) {
    let parent = index;
    const total = this.heapSize;

    while (true) {
      let best = parent;
      const leftChild = (parent << 1) + 1;
      const rightChild = leftChild + 1;

      if (leftChild < total) {
        const leftId = this.heapStorage[leftChild];
        const bestId = this.heapStorage[best];
        if (this.isHigherPriority(leftId, bestId)) {
          best = leftChild;
        }
      }

      if (rightChild < total) {
        const rightId = this.heapStorage[rightChild];
        const bestId = this.heapStorage[best];
        if (this.isHigherPriority(rightId, bestId)) {
          best = rightChild;
        }
      }

      if (best === parent) {
        break;
      }

      this.swap(parent, best);
      parent = best;
    }
  }

  /**
   * Swap two elements in the heap and update their positions.
   * @param i Index of the first element
   * @param j Index of the second element
   * @private
   */
  private swap(i: number, j: number) {
    const aId = this.heapStorage[i];
    const bId = this.heapStorage[j];
    this.heapStorage[i] = bId;
    this.heapStorage[j] = aId;
    this.positionById[aId] = j;
    this.positionById[bId] = i;
  }
}

/**
 * Compute the x-sum for each sliding window using efficient typed arrays and heaps.
 * @param nums Input array of numbers
 * @param k Window size
 * @param x Number of top distinct values by (frequency desc, value desc)
 * @returns Array of x-sums for each sliding window
 */
function findXSum(nums: number[], k: number, x: number): number[] {
  const totalNumbers = nums.length;
  if (totalNumbers === 0 || k === 0) {
    return [];
  }

  // Maximum number of distinct values within any window
  const capacity = k;

  // Typed arrays to store per-ID state for efficiency
  const frequencyById = new Int32Array(capacity);       // Frequency count of each ID
  const membershipById = new Int8Array(capacity);       // Membership type (Selected/Candidate/None)
  const positionInSelected = new Int32Array(capacity);  // Index of each ID in selected heap
  const positionInCandidate = new Int32Array(capacity); // Index of each ID in candidate heap
  positionInSelected.fill(-1);
  positionInCandidate.fill(-1);

  // Mapping between actual numbers and compact IDs
  const idByValue = new Map<number, number>();          // Map actual number -> compact ID
  const valueById: number[] = new Array(capacity);      // Reverse map ID -> actual number

  // Stack to recycle freed IDs
  const freeIds: number[] = new Array(capacity);
  for (let i = 0; i < capacity; i += 1) {
    freeIds[i] = capacity - 1 - i; // Pre-fill with descending order for quick pop()
  }

  // Comparator for candidate heap (max-heap: higher frequency and higher value first)
  const candidateIsHigher = (aId: number, bId: number): boolean => {
    const freqA = frequencyById[aId];
    const freqB = frequencyById[bId];
    if (freqA !== freqB) {
      return freqA > freqB;
    }
    return valueById[aId] > valueById[bId];
  };

  // Comparator for selected heap (min-heap: lower frequency and lower value first)
  const selectedIsHigher = (aId: number, bId: number): boolean => {
    const freqA = frequencyById[aId];
    const freqB = frequencyById[bId];
    if (freqA !== freqB) {
      return freqA < freqB;
    }
    return valueById[aId] < valueById[bId];
  };

  // Initialize both heaps
  const candidateHeap = new IdHeap(capacity, positionInCandidate, candidateIsHigher);
  const selectedHeap = new IdHeap(capacity, positionInSelected, selectedIsHigher);

  // Sliding window tracking variables
  let distinctValueCount = 0;          // Number of distinct elements in the current window
  let selectedElementCount = 0;        // Number of elements in the selected heap
  let currentSelectedWeightedSum = 0;  // Running sum of value * frequency for selected elements

  /**
   * Get an existing compact ID for the value or create a new one.
   * @param value Actual number to map
   * @returns The compact ID for this number
   */
  function getOrCreateId(value: number): number {
    const existingId = idByValue.get(value);
    if (existingId !== undefined) {
      return existingId;
    }

    const id = freeIds.pop() as number;
    valueById[id] = value;
    frequencyById[id] = 0;
    membershipById[id] = Membership.None;
    idByValue.set(value, id);
    return id;
  }

  /**
   * Add one occurrence of a value to the current window.
   * @param value The value being added
   */
  function addValue(value: number) {
    const id = getOrCreateId(value);
    const previousFrequency = frequencyById[id];
    frequencyById[id] = previousFrequency + 1;

    if (previousFrequency === 0) {
      // New distinct element enters as a candidate
      distinctValueCount += 1;
      membershipById[id] = Membership.Candidate;
      candidateHeap.push(id);
    } else {
      const currentMembership = membershipById[id];
      if (currentMembership === Membership.Selected) {
        // Update running sum immediately
        currentSelectedWeightedSum += valueById[id];
        selectedHeap.update(id);
      } else {
        candidateHeap.update(id);
      }
    }
  }

  /**
   * Remove one occurrence of a value from the current window.
   * @param value The value being removed
   */
  function removeValue(value: number) {
    const id = idByValue.get(value);
    if (id === undefined) {
      return;
    }

    const previousFrequency = frequencyById[id];
    if (previousFrequency === 0) {
      return;
    }

    const newFrequency = previousFrequency - 1;
    const currentMembership = membershipById[id];

    if (currentMembership === Membership.Selected) {
      // Reduce sum when selected element is removed
      currentSelectedWeightedSum -= valueById[id];
    }

    if (newFrequency === 0) {
      // Element completely leaves the window
      frequencyById[id] = 0;

      if (currentMembership === Membership.Selected) {
        selectedHeap.remove(id);
        selectedElementCount -= 1;
      } else if (currentMembership === Membership.Candidate) {
        candidateHeap.remove(id);
      }

      membershipById[id] = Membership.None;
      distinctValueCount -= 1;

      // Recycle the freed ID
      idByValue.delete(value);
      freeIds.push(id);
    } else {
      // Element still present; update frequency and re-heapify
      frequencyById[id] = newFrequency;

      if (currentMembership === Membership.Selected) {
        selectedHeap.update(id);
      } else {
        candidateHeap.update(id);
      }
    }
  }

  /**
   * Ensure heaps maintain the top-x invariant and correct ordering.
   * Promotes or demotes elements between heaps as needed.
   */
  function rebalance() {
    const targetSelectedCount = Math.min(x, distinctValueCount);

    // Promote the best candidates until selected heap has target size
    while (selectedElementCount < targetSelectedCount) {
      const candidateTopId = candidateHeap.top();
      if (candidateTopId < 0) {
        break;
      }
      candidateHeap.pop();

      membershipById[candidateTopId] = Membership.Selected;
      selectedHeap.push(candidateTopId);
      selectedElementCount += 1;

      currentSelectedWeightedSum += valueById[candidateTopId] * frequencyById[candidateTopId];
    }

    // Demote the weakest selected elements if too many
    while (selectedElementCount > targetSelectedCount) {
      const selectedTopId = selectedHeap.top();
      if (selectedTopId < 0) {
        break;
      }
      selectedHeap.pop();

      membershipById[selectedTopId] = Membership.Candidate;
      candidateHeap.push(selectedTopId);
      selectedElementCount -= 1;

      currentSelectedWeightedSum -= valueById[selectedTopId] * frequencyById[selectedTopId];
    }

    // Swap boundary elements if order between heaps is violated
    while (candidateHeap.size() > 0 && selectedHeap.size() > 0) {
      const candidateTopId = candidateHeap.top();
      const selectedTopId = selectedHeap.top();
      if (candidateTopId < 0 || selectedTopId < 0) {
        break;
      }

      const candidateFreq = frequencyById[candidateTopId];
      const selectedFreq = frequencyById[selectedTopId];
      const candidateVal = valueById[candidateTopId];
      const selectedVal = valueById[selectedTopId];

      // Swap if candidate is more frequent or has a higher value in tie
      if (candidateFreq > selectedFreq || (candidateFreq === selectedFreq && candidateVal > selectedVal)) {
        candidateHeap.pop();
        selectedHeap.pop();

        membershipById[candidateTopId] = Membership.Selected;
        selectedHeap.push(candidateTopId);

        membershipById[selectedTopId] = Membership.Candidate;
        candidateHeap.push(selectedTopId);

        // Update the running sum after swap
        currentSelectedWeightedSum += candidateVal * candidateFreq;
        currentSelectedWeightedSum -= selectedVal * selectedFreq;
      } else {
        break;
      }
    }
  }

  // Initialize the first window
  for (let index = 0; index < k; index += 1) {
    addValue(nums[index]);
  }
  rebalance();

  // Output array for all x-sums
  const resultLength = totalNumbers - k + 1;
  const resultArray: number[] = new Array(resultLength);
  resultArray[0] = currentSelectedWeightedSum;

  // Slide the window across the array
  for (let left = 0, right = k; right < totalNumbers; left += 1, right += 1) {
    removeValue(nums[left]);   // Remove outgoing element
    addValue(nums[right]);     // Add incoming element
    rebalance();               // Restore heap invariants
    resultArray[left + 1] = currentSelectedWeightedSum;
  }

  return resultArray;
}
