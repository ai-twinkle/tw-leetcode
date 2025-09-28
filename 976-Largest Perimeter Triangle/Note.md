# 976. Largest Perimeter Triangle

Given an integer array `nums`, return the largest perimeter of a triangle with a non-zero area, formed from three of these lengths. 
If it is impossible to form any triangle of a non-zero area, return `0`.

**Constraints:**

- `3 <= nums.length <= 10^4`
- `1 <= nums[i] <= 10^6`

## 基礎思路

本題要求我們從整數陣列 `nums` 中挑選任意三個邊長，判斷是否可以組成**面積非零**的三角形，並回傳所有可行三角形中的**最大周長**；若無任何三組邊能組成合法三角形，則回傳 `0`。

在思考解法時，我們需要特別注意幾個關鍵點：

- **三角不等式條件**：若三邊長為 $a \leq b \leq c$，則必須滿足 $a + b > c$，才能形成合法（非退化）三角形。
- **周長最大原則**：為了讓周長最大，我們希望選擇最大的三邊。因此將所有邊長排序後，從大往小檢查是合理策略。
- **貪婪檢查策略**：只要找到第一組滿足 $a + b > c$ 的三元組，即可保證該組周長為全局最大，因為往後三邊會越來越小。
- **早停最佳性**：在排序後，自尾端向前掃描相鄰三個邊，是最快找到最大周長的方法，一旦找到即可提前返回。

為了解決這個問題，我們可以採用以下策略：

- **使用 TypedArray 儲存並排序**：為提升數值排序效能，我們可將輸入資料複製到 `Uint32Array` 中進行排序。
- **排序後由大至小掃描三邊**：排序後從最長邊往前依序檢查每個相鄰三元組是否能構成合法三角形。
- **優先返回最大周長**：一旦找到合法三角形，立即回傳其周長；若掃描完都無解則回傳 `0`。

## 解題步驟

### Step 1：不足三邊，提前返回

若邊長數不足三個，直接回傳 `0`。

```typescript
// 邊長數量不足 3，無法構成三角形，直接回傳
const totalLengthCount = nums.length;
if (totalLengthCount < 3) {
  return 0;
}
```

### Step 2：複製輸入到 TypedArray

將邊長資料複製到 `Uint32Array`，利於排序與效能。

```typescript
// 將輸入邊長複製到 TypedArray 中（方便排序與一致數值處理）
const sides = new Uint32Array(totalLengthCount);
for (let i = 0; i < totalLengthCount; i++) {
  sides[i] = nums[i] >>> 0; // 確保為無號 32 位元整數
}
```

### Step 3：將邊長排序（遞增）

使用原生排序，將邊長排序為遞增順序。

```typescript
// 使用原生排序將邊長從小到大排序
sides.sort();
```

### Step 4：從大邊往回掃描，尋找第一組合法三角形

由尾端開始掃描每個連續三元組 $(a, b, c)$，只要 $a + b > c$ 即可構成合法三角形。

```typescript
// 由最大邊向前掃描，找第一組滿足三角不等式的三邊
for (let i = totalLengthCount - 1; i >= 2; i--) {
  const lengthC = sides[i];       // 最大邊
  const lengthB = sides[i - 1];   // 次大邊
  const lengthA = sides[i - 2];   // 第三大邊

  // 檢查三角不等式條件
  if (lengthA + lengthB > lengthC) {
    // 成功組成合法三角形，回傳其周長
    return lengthA + lengthB + lengthC;
  }
}
```

### Step 5：未找到合法三角形，回傳 0

若沒有任何三邊組合滿足條件，回傳 `0`。

```typescript
// 若無任何合法三角形可組成，回傳 0
return 0;
```

## 時間複雜度

- 複製輸入：$O(n)$
- 排序邊長：$O(n \log n)$
- 掃描三邊：$O(n)$
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 額外使用一個長度為 $n$ 的 TypedArray：$O(n)$
- 其餘變數為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
