function findAllPeople(n: number, meetings: number[][], firstPerson: number): number[] {
  const meetingCount = meetings.length;
  const MAX_TIME = 100000;

  // Time-bucket linked list head: headByTime[t] gives the first meeting index at time t
  // This avoids Array.sort() overhead and gives linear-time grouping by time
  const headByTime = new Int32Array(MAX_TIME + 1);
  headByTime.fill(-1);

  // Linked-list "next" pointer for meetings in the same time bucket
  const nextMeetingIndex = new Int32Array(meetingCount);

  let minimumTime = MAX_TIME;
  let maximumTime = 0;

  // Build time buckets using a counting-sort style approach
  for (let meetingIndex = 0; meetingIndex < meetingCount; meetingIndex++) {
    const meeting = meetings[meetingIndex];
    const time = meeting[2];

    nextMeetingIndex[meetingIndex] = headByTime[time];
    headByTime[time] = meetingIndex;

    if (time < minimumTime) {
      minimumTime = time;
    }
    if (time > maximumTime) {
      maximumTime = time;
    }
  }

  // Union-Find parent and size arrays (typed arrays for speed and memory locality)
  const parent = new Int32Array(n);
  const componentSize = new Int32Array(n);

  // Initialize DSU: each person starts in their own component
  for (let person = 0; person < n; person++) {
    parent[person] = person;
    componentSize[person] = 1;
  }

  /**
   * Finds the root of a node with path compression.
   * Path compression is critical to keep DSU operations nearly O(1).
   * @param node The node to find.
   * @returns The root representative.
   */
  function findRoot(node: number): number {
    while (parent[node] !== node) {
      parent[node] = parent[parent[node]];
      node = parent[node];
    }
    return node;
  }

  /**
   * Unions two sets using union-by-size.
   * This minimizes tree height and improves cache behavior.
   * @param first The first node.
   * @param second The second node.
   * @returns The root representative after union.
   */
  function unionSets(first: number, second: number): number {
    let firstRoot = findRoot(first);
    let secondRoot = findRoot(second);

    if (firstRoot === secondRoot) {
      return firstRoot;
    }

    if (componentSize[firstRoot] < componentSize[secondRoot]) {
      const temp = firstRoot;
      firstRoot = secondRoot;
      secondRoot = temp;
    }

    parent[secondRoot] = firstRoot;
    componentSize[firstRoot] += componentSize[secondRoot];
    return firstRoot;
  }

  // Initial secret propagation at time 0
  // Person 0 and firstPerson must be in the same component before meetings begin
  unionSets(0, firstPerson);

  // Timestamp array to mark participants involved at the current time
  // This avoids clearing arrays every iteration
  const lastSeenStamp = new Int32Array(n);
  const uniqueParticipants = new Int32Array(n);
  let stamp = 0;

  // Process meetings strictly in increasing time order
  for (let time = minimumTime; time <= maximumTime; time++) {
    const firstMeetingAtTime = headByTime[time];
    if (firstMeetingAtTime === -1) {
      continue;
    }

    stamp++;
    let uniqueCount = 0;

    // Union all participants meeting at the same time
    // This models instantaneous sharing within the same time frame
    let meetingIndex = firstMeetingAtTime;
    while (meetingIndex !== -1) {
      const meeting = meetings[meetingIndex];
      const firstPersonInMeeting = meeting[0];
      const secondPersonInMeeting = meeting[1];

      unionSets(firstPersonInMeeting, secondPersonInMeeting);

      // Collect unique participants touched at this time
      if (lastSeenStamp[firstPersonInMeeting] !== stamp) {
        lastSeenStamp[firstPersonInMeeting] = stamp;
        uniqueParticipants[uniqueCount] = firstPersonInMeeting;
        uniqueCount++;
      }

      if (lastSeenStamp[secondPersonInMeeting] !== stamp) {
        lastSeenStamp[secondPersonInMeeting] = stamp;
        uniqueParticipants[uniqueCount] = secondPersonInMeeting;
        uniqueCount++;
      }

      meetingIndex = nextMeetingIndex[meetingIndex];
    }

    // Rollback components that are NOT connected to person 0
    // Only components that connect to the secret holder are allowed to persist
    const secretRoot = findRoot(0);
    for (let index = 0; index < uniqueCount; index++) {
      const participant = uniqueParticipants[index];
      if (findRoot(participant) !== secretRoot) {
        parent[participant] = participant;
        componentSize[participant] = 1;
      }
    }
  }

  // Final scan: anyone in the same component as person 0 knows the secret
  const result: number[] = [];
  const finalSecretRoot = findRoot(0);

  for (let person = 0; person < n; person++) {
    if (findRoot(person) === finalSecretRoot) {
      result.push(person);
    }
  }

  return result;
}
