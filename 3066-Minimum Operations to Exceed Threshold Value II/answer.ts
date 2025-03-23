function minOperations(nums: number[], k: number): number {
  const priorityQueue = new PriorityQueue<number>((a, b) => a - b);

  // Enqueue all elements.
  for (let num of nums) {
    priorityQueue.enqueue(num);
  }

  let operations = 0;

  while (priorityQueue.front()! < k) {
    // If fewer than 2 elements remain, it's impossible to proceed.
    if (priorityQueue.size() < 2) return -1;

    // Dequeue the 2 smallest elements.
    const x = priorityQueue.dequeue()!;
    const y = priorityQueue.dequeue()!;

    // Put the sum back into the priority queue.
    // Note: That's x is always greater than y.
    // So `min(x, y) * 2 + max(x, y)` is always equal to `x * 2 + y`.
    priorityQueue.enqueue(x * 2 + y);
    operations++;
  }

  return operations;
}
