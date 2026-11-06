function countServers(n: number, logs: number[][], x: number, queries: number[]): number[] {
  const logCount = logs.length;
  const queryCount = queries.length;

  // 2^17 > 10^5, so (time * SHIFT + id) fits exactly in a double and sorts by time first
  const SHIFT = 131072;

  // Pack each log as time * SHIFT + serverId so one numeric typed-array sort orders by time
  const packedLogs = new Float64Array(logCount);
  for (let logIndex = 0; logIndex < logCount; logIndex++) {
    const log = logs[logIndex];
    packedLogs[logIndex] = log[1] * SHIFT + log[0];
  }
  packedLogs.sort();

  // Unpack into flat typed arrays for cache-friendly sweeping
  const logTimes = new Int32Array(logCount);
  const logServers = new Int32Array(logCount);
  for (let logIndex = 0; logIndex < logCount; logIndex++) {
    const packedValue = packedLogs[logIndex];
    const time = Math.floor(packedValue / SHIFT);
    logTimes[logIndex] = time;
    logServers[logIndex] = packedValue - time * SHIFT;
  }

  // Pack each query as value * SHIFT + originalIndex to sort while remembering position
  const packedQueries = new Float64Array(queryCount);
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    packedQueries[queryIndex] = queries[queryIndex] * SHIFT + queryIndex;
  }
  packedQueries.sort();

  const serverRequestCount = new Int32Array(n + 1);
  const result: number[] = new Array(queryCount);
  let activeServerCount = 0;
  let leftPointer = 0;
  let rightPointer = 0;

  for (let sortedIndex = 0; sortedIndex < queryCount; sortedIndex++) {
    const packedValue = packedQueries[sortedIndex];
    const queryTime = Math.floor(packedValue / SHIFT);
    const originalIndex = packedValue - queryTime * SHIFT;
    const windowStart = queryTime - x;

    // Extend the window to include every log with time <= queryTime
    while (rightPointer < logCount && logTimes[rightPointer] <= queryTime) {
      const serverId = logServers[rightPointer];
      if (serverRequestCount[serverId] === 0) {
        activeServerCount++;
      }
      serverRequestCount[serverId]++;
      rightPointer++;
    }

    // Shrink the window to drop logs with time < windowStart
    while (leftPointer < rightPointer && logTimes[leftPointer] < windowStart) {
      const serverId = logServers[leftPointer];
      serverRequestCount[serverId]--;
      if (serverRequestCount[serverId] === 0) {
        activeServerCount--;
      }
      leftPointer++;
    }

    result[originalIndex] = n - activeServerCount;
  }

  return result;
}
