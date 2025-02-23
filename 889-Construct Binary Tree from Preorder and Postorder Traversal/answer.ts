function constructFromPrePost(preorder: number[], postorder: number[]): TreeNode | null {
  // Global indices for traversing preorder and postorder arrays
  let preIndex = 0;
  let postIndex = 0;

  /**
   * Recursively constructs the binary tree using a single DFS traversal.
   * The function uses the current global indices to decide when a subtree is complete.
   *
   * @returns The root node of the constructed subtree.
   */
  function buildTree(): TreeNode | null {
    // If we've processed all nodes in preorder, return null.
    if (preIndex >= preorder.length) {
      return null;
    }

    // Create a new node with the current value in the preorder array.
    const node = new TreeNode(preorder[preIndex++]);

    // If the current node's value does not match the postorder value at postIndex,
    // it indicates that there are nodes in the left subtree that have not been processed.
    if (node.val !== postorder[postIndex]) {
      node.left = buildTree();
    }

    // After processing the left subtree, if the current node's value still
    // does not match the postorder value, then a right subtree exists.
    if (node.val !== postorder[postIndex]) {
      node.right = buildTree();
    }

    // Increment the postorder index after finishing both subtrees,
    // indicating that the current node's subtree is fully constructed.
    postIndex++;

    // Return the constructed node.
    return node;
  }

  // Initiate the recursive construction starting from the global indices.
  return buildTree();
}
