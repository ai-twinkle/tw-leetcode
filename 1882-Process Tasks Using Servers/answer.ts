function assignTasks(servers: number[], tasks: number[]): number[] {
  const serverCount = servers.length;
  const taskCount = tasks.length;

  // Free heap stores a single packed key: weight * serverCount + index (max ~4e10, exact in float64)
  const freeHeap = new Float64Array(serverCount);
  for (let serverIndex = 0; serverIndex < serverCount; serverIndex++) {
    freeHeap[serverIndex] = servers[serverIndex] * serverCount + serverIndex;
  }

  // A sorted array is already a valid min-heap, so a native numeric sort replaces heapify
  freeHeap.sort();
  let freeSize = serverCount;

  // Busy heap is ordered only by finish time; ties are resolved later by the free heap
  const busyTime = new Float64Array(serverCount);
  const busyServer = new Int32Array(serverCount);
  let busySize = 0;

  const result: number[] = new Array(taskCount);
  let currentTime = 0;

  for (let taskIndex = 0; taskIndex < taskCount; taskIndex++) {
    // Task j arrives at second j, but the clock never moves backwards
    if (currentTime < taskIndex) {
      currentTime = taskIndex;
    }

    // With no free server, jump directly to the earliest finish time
    if (freeSize === 0 && busyTime[0] > currentTime) {
      currentTime = busyTime[0];
    }

    // Release every server that has finished by the current time
    while (busySize > 0 && busyTime[0] <= currentTime) {
      const releasedServer = busyServer[0];

      // Pop the busy heap top and sift the last element down
      busySize--;
      const lastTime = busyTime[busySize];
      const lastServer = busyServer[busySize];
      let position = 0;
      while (true) {
        let child = 2 * position + 1;
        if (child >= busySize) {
          break;
        }
        if (child + 1 < busySize && busyTime[child + 1] < busyTime[child]) {
          child++;
        }
        if (busyTime[child] >= lastTime) {
          break;
        }
        busyTime[position] = busyTime[child];
        busyServer[position] = busyServer[child];
        position = child;
      }
      busyTime[position] = lastTime;
      busyServer[position] = lastServer;

      // Push the released server into the free heap and sift it up
      const releasedKey = servers[releasedServer] * serverCount + releasedServer;
      position = freeSize++;
      while (position > 0) {
        const parent = (position - 1) >> 1;
        if (freeHeap[parent] <= releasedKey) {
          break;
        }
        freeHeap[position] = freeHeap[parent];
        position = parent;
      }
      freeHeap[position] = releasedKey;
    }

    // Take the free server with the smallest weight, then the smallest index
    const assignedServer = freeHeap[0] % serverCount;
    freeSize--;
    const lastKey = freeHeap[freeSize];
    let position = 0;
    while (true) {
      let child = 2 * position + 1;
      if (child >= freeSize) {
        break;
      }
      if (child + 1 < freeSize && freeHeap[child + 1] < freeHeap[child]) {
        child++;
      }
      if (freeHeap[child] >= lastKey) {
        break;
      }
      freeHeap[position] = freeHeap[child];
      position = child;
    }
    freeHeap[position] = lastKey;

    result[taskIndex] = assignedServer;

    // Push the assigned server into the busy heap with its finish time
    const finishTime = currentTime + tasks[taskIndex];
    position = busySize++;
    while (position > 0) {
      const parent = (position - 1) >> 1;
      if (busyTime[parent] <= finishTime) {
        break;
      }
      busyTime[position] = busyTime[parent];
      busyServer[position] = busyServer[parent];
      position = parent;
    }
    busyTime[position] = finishTime;
    busyServer[position] = assignedServer;
  }

  return result;
}
