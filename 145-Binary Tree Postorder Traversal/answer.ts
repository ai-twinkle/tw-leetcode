function postorderTraversal(root: TreeNode | null): number[] {
  return root ? [...postorderTraversal(root.left), ...postorderTraversal(root.right), root.val] : []
}
