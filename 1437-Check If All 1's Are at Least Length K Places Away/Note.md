# 1437. Check If All 1's Are at Least Length K Places Away

Given an binary array `nums` and an integer `k`, return `true` if all `1`'s are at least `k` places away from each other, otherwise return `false`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `0 <= k <= nums.length`
- `nums[i]` is `0` or `1`

## 基礎思路

本題要判斷陣列中的所有 `1` 是否彼此至少相距 `k` 個位置。
由於每個 `1` 都會對相對位置產生限制，因此我們只需 **找到所有出現 `1` 的索引，並確認相鄰兩個 `1` 的距離是否 ≥ k+1**。

在思考此問題時，我們可以注意：

- 整個陣列只需要單次線性掃描。
- 遇到 `1` 時，只需檢查它與前一次出現 `1` 的距離。
- 若距離不足，立即返回 `false`。
- 若掃描完成均未違規，即可返回 `true`。
- 因為只需要記錄上一個 `1` 的位置，因此空間為 $O(1)$。

此策略使用簡單線性邏輯，效率穩定，能處理上限為 10⁵ 的陣列。

## 解題步驟

### Step 1：初始化必要變數

記錄陣列長度以避免重複存取，並用變數儲存上一個 `1` 的出現位置；
初始值設定為足夠遠，使第一個 `1` 一定通過距離檢查。

```typescript
// 快取長度以避免迴圈中反覆存取屬性
const length = nums.length;

// 紀錄上一個 '1' 的索引；初始化為足夠遠，使第一個 '1' 自然通過檢查
let previousOneIndex = -k - 1;
```

### Step 2：遍歷陣列，尋找所有 `1` 並檢查距離

逐一掃描陣列：

* 若不是 `1` 則略過
* 若是 `1`，則與上一個 `1` 比較距離
* 距離不足則立即返回 `false`
* 若距離足夠，更新上一個 `1` 的位置

```typescript
for (let index = 0; index < length; index++) {
  // 讀取元素以避免重複索引開銷
  const value = nums[index];

  // 只有遇到 '1' 時才需處理
  if (value === 1) {
    // 若距離上一個 '1' 過近則立即返回 false
    if (index - previousOneIndex <= k) {
      return false;
    }

    // 更新上一個 '1' 的位置
    previousOneIndex = index;
  }
}
```

### Step 3：若掃描完整個陣列均無違規則返回成功

若迴圈未提前結束，代表所有 `1` 的間距皆符合要求。

```typescript
// 若未出現違規距離，表示所有 '1' 均合法
return true;
```

## 時間複雜度

- 只進行一次長度為 n 的迴圈。
- 每次迭代皆為常數操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用常數額外變數 `previousOneIndex`。
- 總空間複雜度為 $O(1)$。

> $O(1)$
