# 3660. Jump Game IX

You are given an integer array `nums`.

From any index `i`, you can jump to another index `j` under the following rules:

- Jump to index `j` where `j > i` is allowed only if `nums[j] < nums[i]`.
- Jump to index `j` where `j < i` is allowed only if `nums[j] > nums[i]`.

For each index `i`, find the maximum value in `nums` that can be reached by following any sequence of valid jumps starting at `i`.

Return an array `ans` where `ans[i]` is the maximum value reachable starting from index `i`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`

## 基礎思路

本題要求從每個起始位置出發，沿著合法跳躍規則（向右只能跳到更小的值、向左只能跳到更大的值）找出可達的最大值。由於跳躍方向與大小關係交織在一起，若對每個位置直接模擬搜尋，複雜度將難以接受。

在思考解法時，可掌握以下核心觀察：

- **跳躍的本質是連通性**：
  兩個位置若可以互相到達（直接或間接），它們就屬於同一個連通區塊；區塊內任意位置的答案皆為該區塊的最大值。

- **跨區塊跳躍的判斷條件**：
  從位置 `i` 向右跳到位置 `j`（`j > i`）需要 `nums[j] < nums[i]`；從位置 `j` 向左跳回需要 `nums[i] > nums[j]`，兩者等價。因此，若某個切割點左側存在比右側任意元素更大的值，就能跨越此切割點，代表兩側屬於同一個連通區塊。

- **以前綴最大值與後綴最小值判斷切割點**：
  對於切割點 `i | i+1`，若左側最大值嚴格大於右側最小值，則必然存在一對元素可互相到達，兩側連通；反之，若左側最大值不超過右側最小值，則無法跨越，形成區塊邊界。

- **區塊的最大值即為前綴最大值**：
  一個區塊的右端點確定後，該區塊所有元素都可經由合法跳躍到達區塊內的最大值，而該值恰好等於右端點的前綴最大值。

依據以上特性，可以採用以下策略：

- **預先計算前綴最大值陣列與後綴最小值陣列**，為判斷區塊邊界做準備。
- **從左到右一次線性掃描**，在發現切割點時將整個區塊填入相同的最大值。
- **利用前綴最大值直接取得區塊最大值**，無須額外搜尋。

此策略能確保整個問題在線性時間內完成，簡潔且高效。

## 解題步驟

### Step 1：處理只有一個元素的特殊情況

若陣列長度為 1，唯一的元素既是起點也是終點，直接回傳包含該元素的陣列即可。

```typescript
// 單一元素的特殊情況
if (arrayLength === 1) {
  return [nums[0]];
}
```

### Step 2：建立前綴最大值陣列

從左到右掃描，逐位記錄到目前位置為止出現過的最大值，供後續判斷區塊邊界時使用。

```typescript
// 前綴最大值：prefixMaximum[i] = max(nums[0..i])
const prefixMaximum = new Int32Array(arrayLength);
prefixMaximum[0] = nums[0];
for (let i = 1; i < arrayLength; i++) {
  const previousMaximum = prefixMaximum[i - 1];
  const currentValue = nums[i];
  prefixMaximum[i] = previousMaximum > currentValue ? previousMaximum : currentValue;
}
```

### Step 3：建立後綴最小值陣列

從右到左掃描，逐位記錄從目前位置到末尾出現過的最小值，與前綴最大值共同用於判斷切割點是否存在。

```typescript
// 後綴最小值：suffixMinimum[i] = min(nums[i..n-1])
const suffixMinimum = new Int32Array(arrayLength);
suffixMinimum[arrayLength - 1] = nums[arrayLength - 1];
for (let i = arrayLength - 2; i >= 0; i--) {
  const nextMinimum = suffixMinimum[i + 1];
  const currentValue = nums[i];
  suffixMinimum[i] = nextMinimum < currentValue ? nextMinimum : currentValue;
}
```

### Step 4：初始化答案陣列與區塊起始位置

建立儲存答案的陣列，並記錄當前連通區塊的起始索引，準備進行線性掃描。

```typescript
// 從左到右掃描，當偵測到區塊右端點時立即關閉該區塊
const answer = new Array<number>(arrayLength);
let componentStart = 0;
```

### Step 5：偵測區塊右端點並判斷是否為邊界

逐一檢查每個位置是否為某個連通區塊的右端點：若已到達陣列最後一個位置，或左側前綴最大值不超過右側後綴最小值，則當前位置即為區塊邊界。

```typescript
for (let i = 0; i < arrayLength; i++) {
  // 當 i 與 i+1 之間的切割無法被跨越時，位置 i 即為一個區塊的右端點
  const isLastIndex = i === arrayLength - 1;
  const isComponentEnd = isLastIndex || prefixMaximum[i] <= suffixMinimum[i + 1];
  if (isComponentEnd) {
    // ...
  }
}
```

### Step 6：將區塊內所有位置填入相同的最大值，並更新起始位置

一旦確認當前位置為區塊右端點，取該位置的前綴最大值作為整個區塊的答案，批次填入區塊內所有索引，並將起始指標移至下一個區塊。

```typescript
for (let i = 0; i < arrayLength; i++) {
  // Step 5：偵測區塊右端點

  if (isComponentEnd) {
    // 區塊的最大值即為其右端點的前綴最大值
    const componentMaximum = prefixMaximum[i];
    for (let fillIndex = componentStart; fillIndex <= i; fillIndex++) {
      answer[fillIndex] = componentMaximum;
    }
    componentStart = i + 1;
  }
}
```

### Step 7：回傳完整答案陣列

所有區塊皆已填入對應最大值，直接回傳答案陣列。

```typescript
return answer;
```

## 時間複雜度

- 建立前綴最大值陣列需 $O(n)$；
- 建立後綴最小值陣列需 $O(n)$；
- 線性掃描偵測區塊邊界並填入答案，整體填入次數合計為 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 前綴最大值陣列與後綴最小值陣列各佔 $O(n)$；
- 答案陣列佔 $O(n)$；
- 總空間複雜度為 $O(n)$。

> $O(n)$
