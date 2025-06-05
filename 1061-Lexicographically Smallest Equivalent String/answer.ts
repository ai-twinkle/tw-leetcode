class UnionFind {
  private readonly parent: Uint8Array;

  constructor() {
    // Initialize parent[i] = i for i in [0..25]
    this.parent = new Uint8Array(26);
    for (let index = 0; index < 26; index++) {
      this.parent[index] = index;
    }
  }

  /**
   * Find with path compression.
   * @param {number} elementIndex number in [0..25]
   * @returns {number} the root index
   */
   public find(elementIndex: number): number {
    if (this.parent[elementIndex] !== elementIndex) {
      this.parent[elementIndex] = this.find(this.parent[elementIndex]);
    }
    return this.parent[elementIndex];
  }

  /**
   * Union two indices [0..25], always attaching the larger root under the smaller.
   * @param {number} elementIndex1 number in [0..25]
   * @param {number} elementIndex2 number in [0..25]
   */
  public union(elementIndex1: number, elementIndex2: number): void {
    const rootIndex1 = this.find(elementIndex1);
    const rootIndex2 = this.find(elementIndex2);
    if (rootIndex1 === rootIndex2) {
      return;
    }
    // Always keep the smaller-valued root as the parent
    if (rootIndex1 < rootIndex2) {
      this.parent[rootIndex2] = rootIndex1;
    } else {
      this.parent[rootIndex1] = rootIndex2;
    }
  }
}

function smallestEquivalentString(
  s1: string,
  s2: string,
  baseStr: string
): string {
  const unionFinder = new UnionFind();

  for (let i = 0; i < s1.length; i++) {
    const letterIndex1 = s1.charCodeAt(i) - 97;
    const letterIndex2 = s2.charCodeAt(i) - 97;
    unionFinder.union(letterIndex1, letterIndex2);
  }

  let result = '';
  for (const char of baseStr) {
    const originalIndex = char.charCodeAt(0) - 97;
    const rootIndex = unionFinder.find(originalIndex);
    result += String.fromCharCode(rootIndex + 97);
  }

  return result;
}
