# 761. Special Binary String

Special binary strings are binary strings with the following two properties:

- The number of `0`'s is equal to the number of `1`'s.
- Every prefix of the binary string has at least as many `1`'s as `0`'s.

You are given a special binary string `s`.

A move consists of choosing two consecutive, non-empty, special substrings of `s`, and swapping them. 
Two strings are consecutive if the last character of the first string is exactly one index before the first character of the second string.

Return the lexicographically largest resulting string possible after applying the mentioned operations on the string.

**Constraints:**

- `1 <= s.length <= 50`
- `s[i]` is either `'0'` or `'1'`.
- `s` is a special binary string.

## 基礎思路

本題的「特殊二元字串」具備兩個關鍵性質：整體 `1` 與 `0` 數量相等，且任一前綴中 `1` 的數量至少與 `0` 一樣多。
這使得字串能以「外層包覆內層」的方式遞迴分解，並且在同一層級上，允許透過交換相鄰的特殊子字串來重排區塊順序。

解題核心策略如下：

* **最外層可分解成多段原始特殊區塊**
  由左到右掃描並追蹤平衡狀態，當平衡回到起點時，就形成一段最外層原始區塊；這些區塊在同一層級上可視為可交換的單位。

* **每個原始區塊的內部仍是特殊字串，可遞迴最大化**
  原始區塊可視為「外殼包住內部」，先對內部求出可達到的最大字典序結果，再包回外殼即可得到該區塊在最佳狀態下的表示。

* **同層級區塊排序遞減即可得到該層級的字典序最大結果**
  因為操作允許相鄰交換，等價於能將同層級區塊做任意排列；因此只要把已最大化的區塊按字典序由大到小排序後再串接，就能得到全域字典序最大的答案。

整體流程為：分解最外層原始區塊 → 遞迴最大化每個區塊的內部 → 將同層級區塊排序遞減並串接 → 回傳結果。

## 解題步驟

### Step 1：建立遞迴輔助函數並初始化分段狀態

此題需要對任意子區間求字典序最大的特殊字串，因此建立遞迴輔助函數來處理區間，並初始化收集區塊的容器、平衡追蹤值與當前區塊起點。

```typescript
/**
 * 建立 s[left:right) 的字典序最大特殊字串。
 * @param s 原始二元字串。
 * @param left 左邊界（包含）。
 * @param right 右邊界（不包含）。
 * @return 該區間的最佳（最大）特殊字串。
 */
function buildLargestSpecialSegment(s: string, left: number, right: number): string {
  const segments: string[] = [];
  let balance = 0;
  let segmentStart = left;

  // ...
}
```

### Step 2：掃描區間並以平衡歸零切分原始區塊，同時遞迴最大化其內部

利用平衡追蹤切分出每個最外層原始區塊；當一段區塊完成時，對其內部遞迴求最大結果，再包回外殼後加入同層級集合，作為後續可排序交換的單位。

```typescript
/**
 * 建立 s[left:right) 的字典序最大特殊字串。
 * @param s 原始二元字串。
 * @param left 左邊界（包含）。
 * @param right 右邊界（不包含）。
 * @return 該區間的最佳（最大）特殊字串。
 */
function buildLargestSpecialSegment(s: string, left: number, right: number): string {
  // Step 1：初始化分段狀態

  // 透過追蹤平衡值（1 => +1，0 => -1）切分出原始特殊子字串。
  for (let index = left; index < right; index++) {
    if (s.charCodeAt(index) === 49) {
      balance++;
    } else {
      balance--;
    }

    if (balance === 0) {
      const innerLargest = buildLargestSpecialSegment(s, segmentStart + 1, index);
      segments.push("1" + innerLargest + "0");
      segmentStart = index + 1;
    }
  }

  // ...
}
```

### Step 3：處理區塊數量不足以交換的情況並直接回傳

若此層級沒有任何區塊，結果為空字串；若只有一個區塊，代表同層級無法透過交換改善字典序，直接回傳即可，避免額外排序成本。

```typescript
/**
 * 建立 s[left:right) 的字典序最大特殊字串。
 * @param s 原始二元字串。
 * @param left 左邊界（包含）。
 * @param right 右邊界（不包含）。
 * @return 該區間的最佳（最大）特殊字串。
 */
function buildLargestSpecialSegment(s: string, left: number, right: number): string {
  // Step 1：初始化分段狀態

  // Step 2：切分原始區塊並遞迴最大化內部

  if (segments.length <= 1) {
    return segments.length === 0 ? "" : segments[0];
  }

  // ...
}
```

### Step 4：將同層級區塊依字典序由大到小排序

同層級的區塊可透過相鄰交換達到任意排列，因此將所有已最大化的區塊做遞減排序，能確保串接後得到字典序最大結果。

```typescript
/**
 * 建立 s[left:right) 的字典序最大特殊字串。
 * @param s 原始二元字串。
 * @param left 左邊界（包含）。
 * @param right 右邊界（不包含）。
 * @return 該區間的最佳（最大）特殊字串。
 */
function buildLargestSpecialSegment(s: string, left: number, right: number): string {
  // Step 1：初始化分段狀態

  // Step 2：切分原始區塊並遞迴最大化內部

  // Step 3：處理區塊數量不足的直接回傳

  // 以遞減排序區塊，使串接後得到字典序最大字串。
  segments.sort((first, second) => {
    if (first > second) {
      return -1;
    }
    if (first < second) {
      return 1;
    }
    return 0;
  });

  // ...
}
```

### Step 5：串接排序後區塊作為區間答案，並在外層呼叫整段區間取得最終結果

排序完成後直接串接所有區塊即可得到該區間的最佳結果；外層以整段字串作為初始區間呼叫遞迴輔助函數，即為題目所求答案。

```typescript
/**
 * 建立 s[left:right) 的字典序最大特殊字串。
 * @param s 原始二元字串。
 * @param left 左邊界（包含）。
 * @param right 右邊界（不包含）。
 * @return 該區間的最佳（最大）特殊字串。
 */
function buildLargestSpecialSegment(s: string, left: number, right: number): string {
  // Step 1：初始化分段狀態

  // Step 2：切分原始區塊並遞迴最大化內部

  // Step 3：處理區塊數量不足的直接回傳

  // Step 4：遞減排序同層級區塊

  return segments.join("");
}

return buildLargestSpecialSegment(s, 0, s.length);
```

## 時間複雜度

- 設字串長度為 $n$。
- 遞迴過程在各層級會掃描區間以切分區塊，掃描成本在最壞情況下累積為 $O(n^2)$。
- 每個層級需對區塊排序，排序比較涉及字串比較，綜合各層級最壞上界為 $O(n^2 \log n)$。
- 總時間複雜度為 $O(n^2 \log n)$。

> $O(n^2 \log n)$

## 空間複雜度

- 設字串長度為 $n$。
- 遞迴深度最壞可達 $O(n)$，且各層需暫存區塊與組合結果字串。
- 在字串組合與暫存下，額外空間最壞上界為 $O(n^2)$。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
