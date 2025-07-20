function deleteDuplicateFolder(paths: string[][]): string[][] {
  // 1. Build the folder tree as a trie using Map for child folders
  interface Node {
    children: Map<string, Node>;
    subtreeId: number; // Unique ID for subtree structure
  }
  const root: Node = { children: new Map(), subtreeId: 0 };

  for (const path of paths) {
    let node = root;
    for (const name of path) {
      if (!node.children.has(name)) {
        node.children.set(name, { children: new Map(), subtreeId: 0 });
      }
      node = node.children.get(name)!;
    }
  }

  // 2. Assign a unique ID to each subtree structure and count its frequency
  const signatureToId = new Map<string, number>();
  const idFrequency = new Map<number, number>();
  let nextId = 1;

  function assignSubtreeId(node: Node): number {
    // If node is a leaf, return 0 (leaves can't be duplicated)
    if (node.children.size === 0) {
      return 0;
    }

    // Create a sorted list describing this node's children and their subtrees
    const childParts: string[] = [];
    for (const [name, child] of node.children) {
      const childId = assignSubtreeId(child);
      childParts.push(name + "#" + childId);
    }
    if (childParts.length > 1) {
      childParts.sort();
    }

    // Use the sorted description as a unique signature for this subtree
    const signature = childParts.join(",");

    // Assign a unique integer ID for each distinct signature
    let id = signatureToId.get(signature);
    if (id === undefined) {
      id = nextId;
      signatureToId.set(signature, id);
      nextId += 1;
      idFrequency.set(id, 0);
    }

    // Count the frequency of this subtree structure
    idFrequency.set(id, idFrequency.get(id)! + 1);
    node.subtreeId = id;

    return id;
  }
  assignSubtreeId(root);

  // 3. Collect all paths, skipping any non-leaf node whose subtree structure is duplicated
  const result: string[][] = [];
  const stack: string[] = [];

  function collectPaths(node: Node): void {
    for (const [name, child] of node.children) {
      const hasChildren = child.children.size > 0;
      let isDuplicate = false;
      if (hasChildren) {
        // If this subtree structure appears more than once, skip it (and its descendants)
        if (idFrequency.get(child.subtreeId)! > 1) {
          isDuplicate = true;
        }
      }
      if (!isDuplicate) {
        stack.push(name);
        result.push([...stack]);
        collectPaths(child);
        stack.pop();
      }
    }
  }
  collectPaths(root);

  return result;
}
