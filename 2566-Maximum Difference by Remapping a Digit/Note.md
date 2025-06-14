# 2566. Maximum Difference by Remapping a Digit

You are given an integer `num`. 
You know that Bob will sneakily remap one of the `10` possible digits (`0` to `9`) to another digit.

Return the difference between the maximum and minimum values Bob can make by remapping exactly one digit in `num`.

Notes:

- When Bob remaps a digit d1 to another digit d2, Bob replaces all occurrences of `d1` in `num` with `d2`.
- Bob can remap a digit to itself, in which case `num` does not change.
- Bob can remap different digits for obtaining minimum and maximum values respectively.
- The resulting number after remapping can contain leading zeroes.

**Constraints:**

- `1 <= num <= 10^8`

## 基礎思路

題目要求我們透過一次數字替換，分別得到數字可能的最大與最小值，並計算其差值。
由於每次操作能替換一個數字所有的出現位置，因此我們可以考慮以下兩種情況：

- **取得最大值**：從左往右，找到第一個非 9 的數字，並將該數字所有出現位置替換為 9。
- **取得最小值**：從左往右，找到第一個非 0 的數字，並將該數字所有出現位置替換為 0。

接著計算這兩個新數字的差值即為答案。

## 解題步驟

### Step 1：找出要替換成最大值與最小值的數字

先將數字轉成字串，方便逐位處理：

```typescript
const s = num.toString();
const length = s.length;

// 找出用於最大化和最小化替換的數字，初始值為-1表示尚未找到
let maxFrom = -1;
let minFrom = -1;

// 逐一尋找第一個可替換為最大或最小的數字
for (let i = 0; i < length; i++) {
  const d = s.charCodeAt(i) - 48;

  // 找到第一個非9的數字來做最大化
  if (maxFrom < 0 && d !== 9) {
    maxFrom = d;
  }

  // 找到第一個非0的數字來做最小化
  if (minFrom < 0 && d !== 0) {
    minFrom = d;
  }

  // 當兩個都找到後即停止迴圈
  if (maxFrom >= 0 && minFrom >= 0) {
    break;
  }
}
```

### Step 2：分別建立最大與最小數值並計算差值

再次遍歷字串，逐位構造最大和最小的數值：

```typescript
let maxValue = 0;
let minValue = 0;

for (let i = 0; i < length; i++) {
  const d = s.charCodeAt(i) - 48;

  // 建立最大值
  maxValue = maxValue * 10 + (d === maxFrom ? 9 : d);

  // 建立最小值
  minValue = minValue * 10 + (d === minFrom ? 0 : d);
}
```

### Step 3：計算並回傳差值

```typescript
// 計算並回傳兩者差值
return maxValue - minValue;
```

## 時間複雜度

- 兩次線性掃描，數字位數為 $n$，每次掃描皆為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定數量的輔助變數，未額外使用空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
