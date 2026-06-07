/**
 * Definition for a binary tree node.
 * class TreeNode {
 *     val: number
 *     left: TreeNode | null
 *     right: TreeNode | null
 *     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.left = (left===undefined ? null : left)
 *         this.right = (right===undefined ? null : right)
 *     }
 * }
 */

function createBinaryTree(descriptions: number[][]): TreeNode | null {
  const nodeMap = new Map<number, TreeNode>();
  // Value range is bounded by 10^5 per the constraints, so a flat Uint8Array
  // gives O(1) membership checks with the smallest possible memory footprint.
  const hasParent = new Uint8Array(100001);
  const length = descriptions.length;

  // Single pass: materialize nodes lazily and wire up parent-child links.
  for (let i = 0; i < length; i++) {
    const description = descriptions[i];
    const parentValue = description[0];
    const childValue = description[1];
    const isLeft = description[2];

    // Get or create the parent node
    let parentNode = nodeMap.get(parentValue);
    if (parentNode === undefined) {
      parentNode = new TreeNode(parentValue);
      nodeMap.set(parentValue, parentNode);
    }

    // Get or create the child node
    let childNode = nodeMap.get(childValue);
    if (childNode === undefined) {
      childNode = new TreeNode(childValue);
      nodeMap.set(childValue, childNode);
    }

    // Attach the child on the correct side of the parent
    if (isLeft === 1) {
      parentNode.left = childNode;
    } else {
      parentNode.right = childNode;
    }

    // Mark this value as having a parent so it can be excluded as root
    hasParent[childValue] = 1;
  }

  // The root is the only parent value that never appears as a child.
  for (let i = 0; i < length; i++) {
    const parentValue = descriptions[i][0];
    if (hasParent[parentValue] === 0) {
      return nodeMap.get(parentValue) ?? null;
    }
  }

  return null;
}
