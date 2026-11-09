/**
 * Find the busiest server(s) using a hierarchical bitset for free servers and a typed-array min-heap for busy ones.
 * @param k - Number of servers
 * @param arrival - Strictly increasing arrival times
 * @param load - Processing time of each request
 * @returns IDs of the busiest servers
 */
function busiestServers(k: number, arrival: number[], load: number[]): number[] {
  const requestCount = arrival.length;

  // Build hierarchical bitset levels until a single top word remains
  const levels: Int32Array[] = [];
  let bitCount = k;
  while (true) {
    const wordCount = (bitCount + 31) >>> 5;
    const words = new Int32Array(wordCount);
    for (let wordIndex = 0; wordIndex < wordCount; wordIndex++) {
      const remaining = bitCount - (wordIndex << 5);
      words[wordIndex] = remaining >= 32 ? -1 : (1 << remaining) - 1;
    }
    levels.push(words);
    if (wordCount === 1) {
      break;
    }
    bitCount = wordCount;
  }
  const levelCount = levels.length;
  const topLevel = levels[levelCount - 1];

  /**
   * Find the smallest free server index >= position.
   * @param position - Starting server index
   * @returns Free server index, or -1 if none exists
   */
  const findNextFree = (position: number): number => {
    let level = 0;
    while (level < levelCount) {
      const words = levels[level];
      const wordIndex = position >>> 5;
      if (wordIndex >= words.length) {
        return -1;
      }
      const bits = words[wordIndex] & (-1 << (position & 31));
      if (bits !== 0) {
        position = (wordIndex << 5) + (31 - Math.clz32(bits & -bits));
        break;
      }
      position = wordIndex + 1;
      level++;
    }
    if (level === levelCount) {
      return -1;
    }
    // Descend through lower levels taking the lowest set bit
    while (level > 0) {
      level--;
      const bits = levels[level][position];
      position = (position << 5) + (31 - Math.clz32(bits & -bits));
    }
    return position;
  };

  /**
   * Mark a server as free.
   * @param server - Server index
   */
  const markFree = (server: number): void => {
    let position = server;
    for (let level = 0; level < levelCount; level++) {
      const words = levels[level];
      const wordIndex = position >>> 5;
      const previous = words[wordIndex];
      words[wordIndex] = previous | (1 << (position & 31));
      if (previous !== 0) {
        break;
      }
      position = wordIndex;
    }
  };

  /**
   * Mark a server as busy.
   * @param server - Server index
   */
  const markBusy = (server: number): void => {
    let position = server;
    for (let level = 0; level < levelCount; level++) {
      const words = levels[level];
      const wordIndex = position >>> 5;
      const updated = words[wordIndex] & ~(1 << (position & 31));
      words[wordIndex] = updated;
      if (updated !== 0) {
        break;
      }
      position = wordIndex;
    }
  };

  // Min-heap of busy servers keyed by finish time (max 2e9 fits Uint32)
  const heapCapacity = Math.min(k, requestCount) + 1;
  const heapEnd = new Uint32Array(heapCapacity);
  const heapServer = new Int32Array(heapCapacity);
  let heapSize = 0;

  const handledCount = new Int32Array(k);

  for (let requestIndex = 0; requestIndex < requestCount; requestIndex++) {
    const currentTime = arrival[requestIndex];

    // Release every server whose job finished by now
    while (heapSize > 0 && heapEnd[0] <= currentTime) {
      markFree(heapServer[0]);
      heapSize--;
      if (heapSize === 0) {
        break;
      }
      const lastEnd = heapEnd[heapSize];
      const lastServer = heapServer[heapSize];
      let index = 0;
      while (true) {
        let child = (index << 1) + 1;
        if (child >= heapSize) {
          break;
        }
        if (child + 1 < heapSize && heapEnd[child + 1] < heapEnd[child]) {
          child++;
        }
        if (heapEnd[child] >= lastEnd) {
          break;
        }
        heapEnd[index] = heapEnd[child];
        heapServer[index] = heapServer[child];
        index = child;
      }
      heapEnd[index] = lastEnd;
      heapServer[index] = lastServer;
    }

    // All servers busy: drop the request
    if (topLevel[0] === 0) {
      continue;
    }

    let server = findNextFree(requestIndex % k);
    if (server === -1) {
      server = findNextFree(0);
    }
    markBusy(server);
    handledCount[server]++;

    // Push the new finish time into the heap
    const finishTime = currentTime + load[requestIndex];
    let index = heapSize++;
    while (index > 0) {
      const parent = (index - 1) >>> 1;
      if (heapEnd[parent] <= finishTime) {
        break;
      }
      heapEnd[index] = heapEnd[parent];
      heapServer[index] = heapServer[parent];
      index = parent;
    }
    heapEnd[index] = finishTime;
    heapServer[index] = server;
  }

  // Collect the servers with maximum handled count
  let maximum = 0;
  for (let server = 0; server < k; server++) {
    if (handledCount[server] > maximum) {
      maximum = handledCount[server];
    }
  }
  const result: number[] = [];
  for (let server = 0; server < k; server++) {
    if (handledCount[server] === maximum) {
      result.push(server);
    }
  }
  return result;
}
