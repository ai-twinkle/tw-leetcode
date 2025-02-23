# 889. Construct Binary Tree from Preorder and Postorder Traversal

Given two integer arrays, `preorder` and `postorder` 
where preorder is the `preorder` traversal of a binary tree of distinct values and 
`postorder` is the postorder traversal of the same tree, reconstruct and return the binary tree.

If there exist multiple answers, you can return any of them.

## 基礎思路

我們可以利用兩個全局指標：
- 一個指向前序遍歷數組，用於依序創建節點。
- 另一個指向後序遍歷數組，用於判斷當前子樹何時結束。

我們每次從前序數組中取出一個節點作為當前子樹的根，然後檢查該節點的值是否與後序指標指向的值相同。
- 如果不相同，則意味著該節點還有左子樹，進而遞歸構造。
- 當值相等時，則說明該子樹已完成，此時移動後序指標並遞歸構造右子樹。

這樣在一次深度優先遍歷中就能準確地重建出整棵樹。

### 事例分析

- **preorder 指針 (preIndex):** 指向 0（值 1）
- **postorder 指針 (postIndex):** 指向 0（值 4）

```
Preorder:  [(1),  2,  4,  5,  3,  6,  7 ]
             ↑ preIndex=0

Postorder: [(4),  5,  2,  6,  7,  3,  1 ]
             ↑ postIndex=0
```

---

**步驟 1：建立根節點 1**

- 從 `preorder[0]` 取出 1，建立節點 1。

```
     1
```

- **指標更新：**
    - preIndex 從 0 更新為 1，指向值 2
    - postIndex 仍為 0（值 4）  
      由於節點 1 的值（1）≠ postorder[0]（4），說明節點 1 還有子樹。

```
Preorder:  [ 1, (2), 4,  5,  3,  6,  7 ]
                 ↑ preIndex=1

Postorder: [(4), 5,  2,  6,  7,  3,  1 ]
             ↑ postIndex=0
```

---

**步驟 2：構造節點 1 的左子樹**

- 進入左子樹構造過程，從 `preorder[1]` 取出 2，建立節點 2，並連接到節點 1 的左側。

```
     1
   /
  2
```

- **指標更新：**
    - preIndex 從 1 更新為 2（指向值 4）
    - postIndex 依然為 0（值 4）  
      由於節點 2 的值（2）≠ postorder[0]（4），節點 2 還有子樹。

```
Preorder:  [ 1,  2, (4), 5,  3,  6,  7 ]
                     ↑ preIndex=2

Postorder: [(4), 5,  2, 6,  7,  3,  1 ]
             ↑ postIndex=0
```

---

**步驟 3：構造節點 2 的左子樹**

- 從 `preorder[2]` 取出 4，建立節點 4，並連接到節點 2 的左側。

```
     1
   /
  2
 /
4
```

- **指標更新：**
    - preIndex 從 2 更新為 3（指向值 5）
    - 接著，檢查節點 4 的值與 postorder[postIndex]：
        - 4（節點 4）與 4（postorder[0]）匹配，表示節點 4為葉節點。
    - 更新 postIndex 從 0 更新為 1。

```
Preorder:  [ 1,  2,  4, (5), 3,  6,  7 ]
                         ↑ preIndex=3

Postorder: [ 4, (5), 2, 6,  7,  3,  1 ]
                 ↑ postIndex=1
```

---

**步驟 4：構造節點 2 的右子樹**

- 返回節點 2，從 `preorder[3]` 取出 5，建立節點 5，並連接到節點 2 的右側。

```
     1
   /
  2
 / \
4   5
```

- **指標更新：**
    - preIndex 從 3 更新為 4（指向值 3）
    - 檢查節點 5 的值與 postorder[postIndex]：
        - 5（節點 5）與 5（postorder[1]）匹配，表示節點 5為葉節點。
    - 更新 postIndex 從 1 更新為 2。
- **回溯：**  
  返回到節點 2後，檢查節點 2 的值與 postorder[postIndex]：
    - 2 與 postorder[2]（值 2）匹配，表示節點 2的左右子樹已構造完畢。
    - 更新 postIndex 從 2 更新為 3。

```
Preorder:  [ 1,  2,  4,  5, (3), 6,  7 ]
                             ↑ preIndex=4

Postorder: [ 4,  5,  2, (6), 7, 3,  1 ]
                         ↑ postIndex=3
```

---

**步驟 5：構造節點 1 的右子樹**

- 返回到根節點 1，從 `preorder[4]` 取出 3，建立節點 3，並連接到節點 1 的右側。

```
     1
   /   \
  2     3
 / \
4   5
```

- **指標更新：**
    - preIndex 從 4 更新為 5（指向值 6）
    - 檢查節點 3 的值與 postorder[postIndex]：
        - 3 與 postorder[3]（值 6）不匹配，說明節點 3還有子樹，進入左子樹構造。

```
Preorder:  [ 1,  2,  4,  5,  3, (6),  7 ]
                                 ↑ preIndex=5

Postorder: [ 4,  5,  2, (6), 7,  3,  1 ]
                         ↑ postIndex=3
```

---

**步驟 6：構造節點 3 的左子樹**

- 從 `preorder[5]` 取出 6，建立節點 6，並連接到節點 3 的左側。

```
     1
   /   \
  2     3
 / \   /
4   5 6
```

- **指標更新：**
    - preIndex 從 5 更新為 6（指向值 7）
    - 檢查節點 6 的值與 postorder[postIndex]：
        - 6 與 postorder[3]（值 6）匹配，表示節點 6 為葉節點。
    - 更新 postIndex 從 3 更新為 4。

```
Preorder:  [ 1,  2,  4,  5,  3,  6, (7) ]
                                     ↑ preIndex=6

Postorder: [ 4,  5,  2,  6, (7), 3,  1 ]
                             ↑ postIndex=4
```

---

**步驟 7：構造節點 3 的右子樹**

- 返回到節點 3，從 `preorder[6]` 取出 7，建立節點 7，並連接到節點 3 的右側。

```
     1
   /   \
  2     3
 / \   / \
4   5 6   7
```

- **指標更新：**
    - preIndex 從 6 更新為 7（超出範圍，構造結束）
    - 檢查節點 7 的值與 postorder[postIndex]：
        - 7 與 postorder[4]（值 7）匹配，表示節點 7 為葉節點。
    - 更新 postIndex 從 4 更新為 5。
- **回溯：**  
  返回到節點 3，檢查節點 3 的值與 postorder[postIndex]：
    - 3 與 postorder[5]（值 3）匹配，表示節點 3的左右子樹構造完成。
    - 更新 postIndex 從 5 更新為 6。

```
Preorder:  [ 1,  2,  4,  5,  3,  6,  7 ]
                                          ↑ preIndex=7

Postorder: [ 4,  5,  2,  6,  7, (3),  1 ]
                                 ↑ postIndex=6
```

---

**步驟 8：完成整棵樹的構造**

- 返回到根節點 1，檢查節點 1 的值與 postorder[postIndex]：
  - 1 與 postorder[6]（值 1）匹配，表示整棵樹構造完成。
  - 更新 postIndex 從 6 更新為 7。

```
Preorder:  [ (1), 2,  4,  5,  3,  6,  7 ]
              ↑ preIndex=7

Postorder: [ 4,  5,  2,  6,  7,  3, (1) ]
                                     ↑ postIndex=7
```

**最終樹形：**

```
     1
   /   \
  2     3
 / \   / \
4   5 6   7
```

- 結果: `[1,2,3,4,5,6,7]`

## 解題步驟

### Step 1: 

## 時間複雜度

- 每個節點只會被訪問一次，因此時間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 最壞情況下最大遞迴深度為 $O(n)$。對於平衡二叉樹，遞迴深度為 $O(\log n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
