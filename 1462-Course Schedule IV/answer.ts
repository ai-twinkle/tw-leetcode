function checkIfPrerequisite(numCourses: number, prerequisites: number[][], queries: number[][]): boolean[] {
  // 1. Allocate reachabilityMatrix[i][j]: 1 if the course i is a (direct/indirect) prerequisite of course j, else 0.
  const reachabilityMatrix: Uint8Array[] = new Array(numCourses);
  for (let i = 0; i < numCourses; i++) {
    reachabilityMatrix[i] = new Uint8Array(numCourses);
  }

  // 2. Mark direct prerequisite edges in the reachability matrix.
  for (let p = 0; p < prerequisites.length; p++) {
    const prerequisiteCourse = prerequisites[p][0];
    const targetCourse = prerequisites[p][1];
    reachabilityMatrix[prerequisiteCourse][targetCourse] = 1;
  }

  // 3. Compute transitive closure using the Floyd–Warshall algorithm:
  //    If the course i can reach k, and k can reach j, then i can reach j.
  for (let k = 0; k < numCourses; k++) {
    const rowK = reachabilityMatrix[k];
    for (let i = 0; i < numCourses; i++) {
      if (reachabilityMatrix[i][k] === 1) {
        const rowI = reachabilityMatrix[i];
        for (let j = 0; j < numCourses; j++) {
          if (rowK[j] === 1) {
            rowI[j] = 1;
          }
        }
      }
    }
  }

  // 4. Answer queries in O(1) per query using the computed matrix.
  const result: boolean[] = new Array(queries.length);
  for (let index = 0; index < queries.length; index++) {
    const fromCourse = queries[index][0];
    const toCourse = queries[index][1];
    result[index] = reachabilityMatrix[fromCourse][toCourse] === 1;
  }

  return result;
}
