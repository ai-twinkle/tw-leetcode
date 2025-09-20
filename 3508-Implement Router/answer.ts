class Router {
  /**
   * Maximum packets allowed in memory
   */
  private readonly memoryLimit: number;

  /**
   * Ring buffer storage (preallocated typed arrays for low overhead)
   */
  private readonly sourceBuf: Uint32Array;
  private readonly destinationBuf: Uint32Array;
  private readonly timestampBuf: Uint32Array;

  /**
   * Ring buffer pointers and count
   */
  private headIndex: number = 0;
  private tailIndex: number = 0;
  private currentSize: number = 0;

  /**
   * Duplicate detector: pack (source, destination, timestamp) into a BigInt.
   * Bits: [source:18][destination:18][timestamp:30] --> total 66 bits.
   */
  private readonly tripletSet: Set<bigint> = new Set();

  /**
   * Per-destination multiset of timestamps, kept in increasing order (append-only),
   * with deletions only from the front. We store {arr, head} to avoid O(n) shifts.
   */
  private readonly perDestination: Map<number, { arr: number[]; head: number }> = new Map();

  /**
   * @param memoryLimit Maximum number of packets the router can store.
   */
  constructor(memoryLimit: number) {
    this.memoryLimit = memoryLimit;
    this.sourceBuf = new Uint32Array(memoryLimit);
    this.destinationBuf = new Uint32Array(memoryLimit);
    this.timestampBuf = new Uint32Array(memoryLimit);
  }

  /**
   * Creates a compact 66-bit BigInt key for (source, destination, timestamp).
   *
   * @param source Source id (<= 2e5)
   * @param destination Destination id (<= 2e5)
   * @param timestamp Timestamp (<= 1e9)
   * @returns BigInt key
   */
  private static makeKey(source: number, destination: number, timestamp: number): bigint {
    const S = BigInt(source);
    const D = BigInt(destination);
    const T = BigInt(timestamp);
    // Shift layout: source << 48 | destination << 30 | timestamp
    return (S << 48n) | (D << 30n) | T;
  }

  /**
   * Enqueue into the ring buffer. Assumes capacity is available.
   */
  private enqueue(source: number, destination: number, timestamp: number): void {
    this.sourceBuf[this.tailIndex] = source >>> 0;
    this.destinationBuf[this.tailIndex] = destination >>> 0;
    this.timestampBuf[this.tailIndex] = timestamp >>> 0;

    this.tailIndex += 1;
    if (this.tailIndex === this.memoryLimit) {
      this.tailIndex = 0;
    }
    this.currentSize += 1;
  }

  /**
   * Dequeue from the ring buffer. Assumes size > 0.
   *
   * @returns tuple [source, destination, timestamp]
   */
  private dequeue(): [number, number, number] {
    const source = this.sourceBuf[this.headIndex] | 0;
    const destination = this.destinationBuf[this.headIndex] | 0;
    const timestamp = this.timestampBuf[this.headIndex] | 0;

    this.headIndex += 1;
    if (this.headIndex === this.memoryLimit) {
      this.headIndex = 0;
    }
    this.currentSize -= 1;

    return [source, destination, timestamp];
  }

  /**
   * Push a timestamp into per-destination list.
   *
   * @param destination Destination id
   * @param timestamp Timestamp (monotone non-decreasing per problem)
   */
  private addToDestination(destination: number, timestamp: number): void {
    let bucket = this.perDestination.get(destination);
    if (bucket === undefined) {
      bucket = { arr: [], head: 0 };
      this.perDestination.set(destination, bucket);
    }
    // Append; arrival timestamps are non-decreasing, so arr stays sorted.
    bucket.arr.push(timestamp);
  }

  /**
   * Pop a timestamp from the front of the per-destination list.
   * This is used when the FIFO removes a packet of this destination.
   *
   * @param destination Destination id
   * @param timestamp Expected timestamp to pop (defensive check for consistency)
   */
  private removeFromDestination(destination: number, timestamp: number): void {
    const bucket = this.perDestination.get(destination);
    if (bucket === undefined) {
      return;
    }
    // Advance head by one if it matches; data consistency relies on FIFO.
    const { arr } = bucket;
    const h = bucket.head;
    if (h < arr.length && arr[h] === timestamp) {
      bucket.head = h + 1;

      // Compact occasionally to control memory growth without per-op cost
      if (bucket.head > 1024 && bucket.head * 2 > arr.length) {
        bucket.arr = arr.slice(bucket.head);
        bucket.head = 0;
      }
    } else {
      // In well-formed usage, this should not happen; skip heavy work for speed.
      // If needed, a fallback linear scan would be here, but we avoid it by design.
    }
    // Optionally remove empty buckets to save memory
    if (bucket.head >= bucket.arr.length) {
      this.perDestination.delete(destination);
    }
  }

  /**
   * Binary search: first index i in [start, arr.length) with arr[i] >= target.
   */
  private static lowerBound(arr: number[], start: number, target: number): number {
    let left = start;
    let right = arr.length;
    while (left < right) {
      const mid = left + ((right - left) >> 1);
      if (arr[mid] < target) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }

  /**
   * Binary search: first index i in [start, arr.length) with arr[i] > target.
   */
  private static upperBound(arr: number[], start: number, target: number): number {
    let left = start;
    let right = arr.length;
    while (left < right) {
      const mid = left + ((right - left) >> 1);
      if (arr[mid] <= target) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }

  /**
   * Adds a packet if not duplicate. Evicts oldest when at capacity.
   *
   * @param source Source id
   * @param destination Destination id
   * @param timestamp Arrival timestamp (non-decreasing over calls)
   * @returns true if inserted; false if duplicate
   */
  addPacket(source: number, destination: number, timestamp: number): boolean {
    const key = Router.makeKey(source, destination, timestamp);
    if (this.tripletSet.has(key)) {
      return false;
    }

    // Evict oldest if at capacity, maintaining all indexes and maps
    if (this.currentSize === this.memoryLimit) {
      const [oldSource, oldDestination, oldTimestamp] = this.dequeue();
      const oldKey = Router.makeKey(oldSource, oldDestination, oldTimestamp);
      this.tripletSet.delete(oldKey);
      this.removeFromDestination(oldDestination, oldTimestamp);
    }

    // Insert new packet
    this.enqueue(source, destination, timestamp);
    this.tripletSet.add(key);
    this.addToDestination(destination, timestamp);

    return true;
  }

  /**
   * Forwards the next packet in FIFO order.
   * Removes it from storage and returns [source, destination, timestamp].
   *
   * @returns number[] empty when no packets are available
   */
  forwardPacket(): number[] {
    if (this.currentSize === 0) {
      return [];
    }
    const [source, destination, timestamp] = this.dequeue();
    const key = Router.makeKey(source, destination, timestamp);
    this.tripletSet.delete(key);
    this.removeFromDestination(destination, timestamp);
    return [source, destination, timestamp];
  }

  /**
   * Counts packets currently stored for a destination with timestamp in [startTime, endTime].
   * Uses binary search over the valid window [head .. arr.length) of a monotone array.
   *
   * @param destination Destination id
   * @param startTime Inclusive start timestamp
   * @param endTime Inclusive end timestamp
   * @returns number of matching packets
   */
  getCount(destination: number, startTime: number, endTime: number): number {
    const bucket = this.perDestination.get(destination);
    if (bucket === undefined) {
      return 0;
    }
    if (startTime > endTime) {
      return 0;
    }
    const { arr, head } = bucket;
    if (head >= arr.length) {
      return 0;
    }

    // Skip anything strictly before startTime
    const left = Router.lowerBound(arr, head, startTime);
    if (left >= arr.length) {
      return 0;
    }

    // Count up to endTime (inclusive)
    const right = Router.upperBound(arr, head, endTime);
    if (right <= left) {
      return 0;
    }

    return right - left;
  }
}

/**
 * Your Router object will be instantiated and called as such:
 * var obj = new Router(memoryLimit)
 * var param_1 = obj.addPacket(source,destination,timestamp)
 * var param_2 = obj.forwardPacket()
 * var param_3 = obj.getCount(destination,startTime,endTime)
 */
