# 1948. Delete Duplicate Folders in System

Due to a bug, there are many duplicate folders in a file system. 
You are given a 2D array paths, where `paths[i]` is an array representing an absolute path to the $i^{th}$ folder in the file system.

- For example, `["one", "two", "three"]` represents the path `"/one/two/three"`.

Two folders (not necessarily on the same level) are identical if they contain the same non-empty set of identical subfolders and underlying subfolder structure. 
The folders do not need to be at the root level to be identical. 
If two or more folders are identical, then mark the folders as well as all their subfolders.

- For example, folders `"/a"` and `"/b"` in the file structure below are identical. 
  They (as well as their subfolders) should all be marked:
  - `/a`
  - `/a/x`
  - `/a/x/y`
  - `/a/z`
  - `/b`
  - `/b/x`
  - `/b/x/y`
  - `/b/z`

- However, if the file structure also included the path `"/b/w"`, then the folders `"/a"` and `"/b"` would not be identical. 
  Note that `"/a/x"` and `"/b/x"` would still be considered identical even with the added folder.

Once all the identical folders and their subfolders have been marked, the file system will delete all of them. 
The file system only runs the deletion once, so any folders that become identical after the initial deletion are not deleted.

Return the 2D array `ans` containing the paths of the remaining folders after deleting all the marked folders. The paths may be returned in any order.

**Constraints:**

- `1 <= paths.length <= 2 * 10^4`
- `1 <= paths[i].length <= 500`
- `1 <= paths[i][j].length <= 10`
- `1 <= sum(paths[i][j].length) <= 2 * 10^5`
- `path[i][j]` consists of lowercase English letters.
- No two paths lead to the same folder.
- For any folder not at the root level, its parent folder will also be in the input.

## 基礎思路

本題的核心目標是要從檔案系統中刪除所有「結構完全相同」的資料夾。
所謂結構相同，代表資料夾內所有子資料夾名稱與層次結構必須完全一致（且至少包含一個子資料夾）。

因此我們可透過以下策略來解決：

1. **將檔案系統表示為一棵樹（Trie）**：

   - 每個節點代表一個資料夾，節點之間透過子節點表示其子資料夾。

2. **利用遞迴序列化子樹結構，標記重複的子樹**：

   - 針對每個非葉節點，以其子節點名稱與子樹標記（ID）組成獨特簽名 (signature)。
   - 透過簽名來判斷該結構是否曾經出現過，若有，則紀錄此結構重複的次數。

3. **透過DFS搜尋，排除所有結構重複的子樹**：

   - 搜尋過程若發現子樹結構重複，則直接忽略該節點與其所有子孫節點。
   - 最終回傳所有未被標記為重複的節點路徑。

如此操作後，即可達成題目要求之目的。

## 解題步驟

### Step 1：建構資料夾樹 (Trie)

首先要將給定的所有路徑建構成一個以Map實現的樹結構（Trie）：

```typescript
interface Node {
  children: Map<string, Node>;  // 儲存子節點
  subtreeId: number;            // 子樹結構的唯一標記ID
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
```

### Step 2：透過子樹序列化辨識重複結構

接下來我們透過遞迴方式，以簽名形式序列化每個子樹，判斷哪些子樹結構重複：

```typescript
const signatureToId = new Map<string, number>();
const idFrequency = new Map<number, number>();
let nextId = 1;

function assignSubtreeId(node: Node): number {
  // 葉節點的子樹標記為0 (無法重複)
  if (node.children.size === 0) {
    return 0;
  }

  const childParts: string[] = [];

  // 遞迴取得每個子節點的子樹ID，並組成signature
  for (const [name, child] of node.children) {
    const childId = assignSubtreeId(child);
    childParts.push(name + "#" + childId);
  }

  // 排序以確保不同順序相同結構亦能識別
  if (childParts.length > 1) {
    childParts.sort();
  }

  const signature = childParts.join(",");

  // 為不同簽名分配唯一ID並統計出現頻率
  let id = signatureToId.get(signature);
  if (id === undefined) {
    id = nextId++;
    signatureToId.set(signature, id);
    idFrequency.set(id, 0);
  }

  idFrequency.set(id, idFrequency.get(id)! + 1);
  node.subtreeId = id;

  return id;
}

assignSubtreeId(root);
```

### Step 3：收集並回傳未重複資料夾路徑

最後我們透過DFS，收集並回傳所有未被標記為重複的資料夾路徑：

```typescript
const result: string[][] = [];
const stack: string[] = [];

function collectPaths(node: Node): void {
  for (const [name, child] of node.children) {
    const hasChildren = child.children.size > 0;
    let isDuplicate = false;

    // 若此子樹結構出現超過1次則視為重複
    if (hasChildren && idFrequency.get(child.subtreeId)! > 1) {
      isDuplicate = true;
    }

    if (!isDuplicate) {
      stack.push(name);             // 加入目前節點名稱至路徑
      result.push([...stack]);      // 將當前有效路徑加入答案
      collectPaths(child);          // 繼續遞迴探索子節點
      stack.pop();                  // 回溯，探索其他分支
    }
  }
}

collectPaths(root);

return result;
```

## 時間複雜度

- 建構樹 (Trie)：需遍歷所有路徑，總時間為所有路徑長度總和，約為 $O(P)$。
- 子樹序列化與標記：
  - 每個節點最多需要排序一次子節點，最壞情況為 $O(n \log D)$，其中$N$為節點數，$D$為最大子節點數。
- 收集未重複節點：遍歷所有未重複節點，約為 $O(n)$。
- 總時間複雜度為 $O(P + N \log D)$。

> $O(P + n \log D)$

## 空間複雜度

- 建構 Trie 與節點資料所需空間：$O(n)$
- 儲存簽名與頻率 (Map 結構)：$O(n)$
- DFS遞迴棧空間及收集路徑陣列：最差情況約為 $O(n)$
- 總空間複雜度為 $O(n)$。

> $O(n)$
