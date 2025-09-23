# 165. Compare Version Numbers

Given two version strings, `version1` and `version2`, compare them. 
A version string consists of revisions separated by dots `'.'`. 
The value of the revision is its integer conversion ignoring leading zeros.

To compare version strings, compare their revision values in left-to-right order. 
If one of the version strings has fewer revisions, treat the missing revision values as `0`.

Return the following:

- If `version1` < `version2`, return -1.
- If `version1` > `version2`, return 1.
- Otherwise, return 0.

**Constraints:**

- `1 <= version1.length, version2.length <= 500`
- `version1` and `version2` only contain digits and '.'.
- `version1` and `version2` are valid version numbers.
- All the given revisions in `version1` and `version2` can be stored in a 32-bit integer.

## 基礎思路

本題要我們比較兩個版本號字串，並判斷哪一個版本號較大、較小或是否相等。
在思考解法時，我們需要特別注意幾個重點：

- 每個版本號是由多個「修訂段（revision）」組成，並以 `'.'` 分隔；
- 每段的比較是以整數進行，**前導零應被忽略**（例如 `"01"` 等同於 `1`）；
- 若某個版本有較少的段數，**缺少的段數視為 0**（例如 `"1.0"` 等同於 `"1"` 或 `"1.0.0"`）。

為了解決這個問題，我們可以採用以下策略：

- **分割與轉換**：先將版本字串用 `'.'` 分割，並將每段轉為整數，以方便後續比較；
- **對齊長度**：找出兩個版本的最大段數，缺少的部分視為 `0` 補齊；
- **逐段比較**：從左到右逐一比較對應的段數，一旦某段不同即可決定結果；
- **全部相等處理**：若所有段數皆相等，代表兩個版本號完全相同，回傳 `0` 即可。

## 解題步驟

### Step 1：將版本字串拆解為整數修訂序列

先把兩個版本依點號切開，並轉成整數陣列（自動忽略前導零）。

```typescript
// 將版本字串分割為修訂數值陣列
const revisionsOfVersion1 = version1.split('.').map(Number);
const revisionsOfVersion2 = version2.split('.').map(Number);
```

### Step 2：確定需要比較的最大段數

取兩者修訂段數的最大值，確保能補齊較短的一方（以 0 視之）。

```typescript
// 決定需要比較的最大修訂段數
const maximumLength = Math.max(revisionsOfVersion1.length, revisionsOfVersion2.length);
```

### Step 3：逐段由左到右比較修訂值

依序取出對應段的數值；若某一方沒有該段，直接以 0 代替。發現差異即可回傳結果。

```typescript
// 逐段比較每個修訂值
for (let index = 0; index < maximumLength; index++) {
  const revisionValue1 = index < revisionsOfVersion1.length ? revisionsOfVersion1[index] : 0;
  const revisionValue2 = index < revisionsOfVersion2.length ? revisionsOfVersion2[index] : 0;

  if (revisionValue1 > revisionValue2) {
    return 1;
  }

  if (revisionValue1 < revisionValue2) {
    return -1;
  }
}
```

### Step 4：若所有段都相同，回傳相等

當整個比較流程未提早返回，代表所有段值皆相等。

```typescript
// 所有修訂值皆相等
return 0;
```

## 時間複雜度

- 分割字串與映射為整數為線性；逐段比較亦為線性，整體與修訂段數成正比。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 額外使用兩個修訂陣列，其長度與輸入段數成正比。
- 總空間複雜度為 $O(n)$。

> $O(n)$
