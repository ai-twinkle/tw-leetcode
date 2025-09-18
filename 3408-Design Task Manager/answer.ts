/**
 * Max-heap specialized for (priority, taskId) with typed arrays and dynamic growth.
 * Comparison order: higher priority first, then higher taskId as tie-breaker.
 */
class TaskPairMaxHeap {
  private priorityBuffer: Int32Array;
  private taskIdBuffer: Int32Array;
  private heapSize: number;

  /**
   * Construct a TaskPairMaxHeap.
   *
   * @param initialCapacity - Initial capacity of the heap
   */
  constructor(initialCapacity: number = 1024) {
    const initialArrayCapacity = initialCapacity < 2 ? 2 : initialCapacity;
    this.priorityBuffer = new Int32Array(initialArrayCapacity);
    this.taskIdBuffer = new Int32Array(initialArrayCapacity);
    this.heapSize = 0;
  }

  /**
   * Get the number of elements currently in the heap.
   *
   * @returns Current heap size
   */
  get size(): number {
    return this.heapSize;
  }

  /**
   * Ensure that the internal arrays can fit at least the required capacity.
   *
   * @param requiredCapacity - Minimum number of slots needed
   */
  private ensureCapacity(requiredCapacity: number): void {
    if (requiredCapacity <= this.priorityBuffer.length) {
      return;
    }

    let newCapacity = this.priorityBuffer.length << 1;
    while (newCapacity < requiredCapacity) {
      newCapacity <<= 1;
    }

    // Allocate new buffers and copy existing elements
    const newPriorityBuffer = new Int32Array(newCapacity);
    const newTaskIdBuffer = new Int32Array(newCapacity);
    newPriorityBuffer.set(this.priorityBuffer.subarray(0, this.heapSize));
    newTaskIdBuffer.set(this.taskIdBuffer.subarray(0, this.heapSize));
    this.priorityBuffer = newPriorityBuffer;
    this.taskIdBuffer = newTaskIdBuffer;
  }

  /**
   * Check if element at firstIndex is greater than element at secondIndex.
   * Comparison is by priority first, then by taskId if priorities are equal.
   *
   * @param firstIndex - Index of first element
   * @param secondIndex - Index of second element
   * @returns True if first element is greater
   */
  private isGreater(firstIndex: number, secondIndex: number): boolean {
    const priorityFirst = this.priorityBuffer[firstIndex];
    const prioritySecond = this.priorityBuffer[secondIndex];
    if (priorityFirst !== prioritySecond) {
      return priorityFirst > prioritySecond;
    }
    return this.taskIdBuffer[firstIndex] > this.taskIdBuffer[secondIndex];
  }

  /**
   * Swap two elements in the buffers.
   *
   * @param firstIndex - First index
   * @param secondIndex - Second index
   */
  private swap(firstIndex: number, secondIndex: number): void {
    const tempPriority = this.priorityBuffer[firstIndex];
    const tempTaskId = this.taskIdBuffer[firstIndex];
    this.priorityBuffer[firstIndex] = this.priorityBuffer[secondIndex];
    this.taskIdBuffer[firstIndex] = this.taskIdBuffer[secondIndex];
    this.priorityBuffer[secondIndex] = tempPriority;
    this.taskIdBuffer[secondIndex] = tempTaskId;
  }

  /**
   * Sift an element upward to restore heap property.
   *
   * @param index - Index of element to sift
   */
  private siftUp(index: number): void {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = (currentIndex - 1) >> 1;
      if (!this.isGreater(currentIndex, parentIndex)) {
        break;
      }
      this.swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
    }
  }

  /**
   * Sift an element downward to restore heap property.
   *
   * @param index - Index of element to sift
   */
  private siftDown(index: number): void {
    let currentIndex = index;
    const heapLength = this.heapSize;

    while (true) {
      const leftChildIndex = (currentIndex << 1) + 1;
      if (leftChildIndex >= heapLength) {
        break;
      }

      const rightChildIndex = leftChildIndex + 1;
      let largerChildIndex = leftChildIndex;

      if (rightChildIndex < heapLength && this.isGreater(rightChildIndex, leftChildIndex)) {
        largerChildIndex = rightChildIndex;
      }

      if (!this.isGreater(largerChildIndex, currentIndex)) {
        break;
      }

      this.swap(currentIndex, largerChildIndex);
      currentIndex = largerChildIndex;
    }
  }

  /**
   * Insert a new (priority, taskId) pair into the heap.
   *
   * @param priority - Task priority
   * @param taskId - Task identifier
   */
  push(priority: number, taskId: number): void {
    const insertIndex = this.heapSize;
    this.ensureCapacity(insertIndex + 1);
    this.priorityBuffer[insertIndex] = priority | 0;
    this.taskIdBuffer[insertIndex] = taskId | 0;
    this.heapSize = insertIndex + 1;
    this.siftUp(insertIndex);
  }

  /**
   * Peek the priority of the maximum element without removing it.
   *
   * @returns Maximum priority, or -1 if heap is empty
   */
  peekPriority(): number {
    if (this.heapSize > 0) {
      return this.priorityBuffer[0];
    }
    return -1;
  }

  /**
   * Peek the taskId of the maximum element without removing it.
   *
   * @returns TaskId of maximum element, or -1 if heap is empty
   */
  peekTaskId(): number {
    if (this.heapSize > 0) {
      return this.taskIdBuffer[0];
    }
    return -1;
  }

  /**
   * Remove the maximum element from the heap.
   */
  pop(): void {
    const heapLength = this.heapSize;
    if (heapLength === 0) {
      return;
    }

    const lastIndex = heapLength - 1;
    this.priorityBuffer[0] = this.priorityBuffer[lastIndex];
    this.taskIdBuffer[0] = this.taskIdBuffer[lastIndex];
    this.heapSize = lastIndex;

    if (lastIndex > 0) {
      this.siftDown(0);
    }
  }
}

/**
 * Task management system with support for add, edit, remove, and execute-top operations.
 * Uses typed arrays and a global max-heap for efficiency.
 */
class TaskManager {
  private static readonly MaxTaskId = 100_000;
  private static readonly NotPresent = -1;

  private readonly userByTaskId: Int32Array;
  private readonly priorityByTaskId: Int32Array;
  private readonly globalHeap: TaskPairMaxHeap;

  /**
   * Construct a TaskManager with an initial list of tasks.
   *
   * @param tasks - Array of [userId, taskId, priority] triples
   */
  constructor(tasks: number[][]) {
    const taskArraySize = TaskManager.MaxTaskId + 1;
    this.userByTaskId = new Int32Array(taskArraySize);
    this.priorityByTaskId = new Int32Array(taskArraySize);

    this.userByTaskId.fill(TaskManager.NotPresent);
    this.priorityByTaskId.fill(TaskManager.NotPresent);

    const initialHeapCapacity = Math.max(1024, (tasks?.length ?? 0) * 2);
    this.globalHeap = new TaskPairMaxHeap(initialHeapCapacity);

    for (let index = 0; index < tasks.length; index++) {
      const userId = tasks[index][0] | 0;
      const taskId = tasks[index][1] | 0;
      const priority = tasks[index][2] | 0;

      // Record task information
      this.userByTaskId[taskId] = userId;
      this.priorityByTaskId[taskId] = priority;

      // Insert into heap
      this.globalHeap.push(priority, taskId);
    }
  }

  /**
   * Add a new task.
   *
   * @param userId - User who owns the task
   * @param taskId - Task identifier
   * @param priority - Task priority
   */
  add(userId: number, taskId: number, priority: number): void {
    this.userByTaskId[taskId] = userId | 0;
    this.priorityByTaskId[taskId] = priority | 0;
    this.globalHeap.push(priority | 0, taskId | 0);
  }

  /**
   * Edit the priority of an existing task.
   *
   * @param taskId - Task identifier
   * @param newPriority - New priority value
   */
  edit(taskId: number, newPriority: number): void {
    this.priorityByTaskId[taskId] = newPriority | 0;

    // Insert new value into heap; old value becomes stale
    this.globalHeap.push(newPriority | 0, taskId | 0);
  }

  /**
   * Remove a task by marking it as not present.
   *
   * @param taskId - Task identifier
   */
  rmv(taskId: number): void {
    this.userByTaskId[taskId] = TaskManager.NotPresent;
    this.priorityByTaskId[taskId] = TaskManager.NotPresent;
  }

  /**
   * Execute and remove the task with the highest priority.
   * If priorities tie, the task with larger taskId is chosen.
   *
   * @returns UserId of executed task, or -1 if no tasks remain
   */
  execTop(): number {
    while (this.globalHeap.size > 0) {
      const topPriority = this.globalHeap.peekPriority();
      const topTaskId = this.globalHeap.peekTaskId();
      const currentUser = this.userByTaskId[topTaskId];
      const currentPriority = this.priorityByTaskId[topTaskId];

      // Skip stale or removed entries
      if (currentUser === TaskManager.NotPresent || currentPriority !== topPriority) {
        this.globalHeap.pop();
        continue;
      }

      // Valid top task: remove and return user
      this.globalHeap.pop();
      this.userByTaskId[topTaskId] = TaskManager.NotPresent;
      this.priorityByTaskId[topTaskId] = TaskManager.NotPresent;
      return currentUser;
    }

    return -1;
  }
}

/**
 * Your TaskManager object will be instantiated and called as such:
 * var obj = new TaskManager(tasks)
 * obj.add(userId,taskId,priority)
 * obj.edit(taskId,newPriority)
 * obj.rmv(taskId)
 * var param_4 = obj.execTop()
 */
