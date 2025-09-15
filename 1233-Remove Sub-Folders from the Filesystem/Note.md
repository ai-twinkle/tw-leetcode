# 1233. Remove Sub-Folders from the Filesystem

Given a list of folders `folder`, return the folders after removing all sub-folders in those folders. 
You may return the answer in any order.

If a `folder[i]` is located within another `folder[j]`, it is called a sub-folder of it. 
A sub-folder of `folder[j]` must start with `folder[j]`, followed by a `"/"`. 
For example, `"/a/b"` is a sub-folder of `"/a"`, but `"/b"` is not a sub-folder of `"/a/b/c"`.

The format of a path is one or more concatenated strings of the form: `'/'` followed by one or more lowercase English letters.

For example, `"/leetcode"` and `"/leetcode/problems"` are valid paths while an empty string and `"/"` are not.

**Constraints:**

- `1 <= folder.length <= 4 * 10^4`
- `2 <= folder[i].length <= 100`
- `folder[i]` contains only lowercase letters and `'/'`.
- `folder[i]` always starts with the character `'/'`.
- Each folder name is unique.

## 基礎思路

本題目希望從給定的一堆路徑中，刪除所有位於其他路徑之下的子路徑，並回傳剩餘的父路徑。

因此，我們可以透過以下步驟來解決此問題：

1. **排序**
   首先透過將所有路徑以字典序排序，以確保每個父目錄必定會出現在子目錄之前。
   例如：排序後的結果可能如下：

   ```
   /a
   /a/b
   /a/b/c
   /b
   ```
2. **檢查前綴**
   當我們遍歷排序後的目錄清單時，每遇到新的路徑，就透過比較該路徑是否以目前已保留的最新父路徑作為前綴（且須確保後方接著斜線「/」）。

  - 若**不是前綴**，代表它是一個新的父路徑，應保留。
  - 若**是前綴**，代表它是前一個父路徑的子目錄，應捨棄。

透過此方法，可有效篩選並保留最上層的目錄，去除所有子目錄。

## 解題步驟

### Step 1：排序並初始化相關變數

一開始，我們需要將目錄清單 `folder` 按照字典序排序，以確保父路徑永遠在子路徑之前：

```typescript
folder.sort(); // 字典序排序，父目錄必定在子目錄前面

const filteredFolderList: string[] = []; // 存放最終結果的陣列
let lastKeptFolderPath = "";             // 最近保留的父路徑
let lastKeptFolderPathWithSlash = "";    // 最近保留的父路徑 (後面加上斜線「/」以便快速比對)
```

### Step 2：遍歷目錄並篩選子路徑

接著，我們逐一檢查排序後的每個目錄路徑：

- 若目前的路徑 `currentFolderPath` 沒有以最近保留的父路徑（加上斜線）作為前綴，表示這是一個新的父路徑，將它加入結果。
- 否則代表這是子目錄，應忽略。

```typescript
for (const currentFolderPath of folder) {
  // 如果這是第一個路徑，或目前的路徑非前一個父路徑的子路徑
  if (
    !lastKeptFolderPath ||
    !currentFolderPath.startsWith(lastKeptFolderPathWithSlash)
  ) {
    filteredFolderList.push(currentFolderPath); // 保留此路徑

    // 更新最近保留的父路徑 (後方加上「/」以利之後快速檢查子路徑)
    lastKeptFolderPath = currentFolderPath;
    lastKeptFolderPathWithSlash = currentFolderPath + "/";
  }
  // 否則表示此路徑為子路徑，忽略不處理
}
```

### Step 3：回傳結果

最後回傳篩選後的父路徑清單：

```typescript
return filteredFolderList;
```

## 時間複雜度

- 一開始對路徑進行排序，需花費 $O(n \log n)$ 時間，其中 $n$ 為路徑數量。
- 遍歷每個路徑時，每次的字串比對（startsWith）操作最差情況下需 $O(L)$，$L$ 為每個路徑最長長度。整體遍歷共花費 $O(nL)$。
- 總時間複雜度為 $O(n\log n + nL)$，在實務上可簡化成 $O(n\log n)$。

> $O(n\log n)$

## 空間複雜度

- 使用一個額外陣列存放篩選後的路徑，最多需存放所有原本的路徑，因此最壞情況需額外空間 $O(n)$。
- 其他額外變數僅佔用固定的空間 $O(1)$，可忽略。
- 總空間複雜度為 $O(n)$。

> $O(n)$
