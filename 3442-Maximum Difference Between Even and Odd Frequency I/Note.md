# 3442. Maximum Difference Between Even and Odd Frequency I

You are given a string `s` consisting of lowercase English letters.

Your task is to find the maximum difference $\text{diff} = a_1 - a_2$ between the frequency of characters $a_1$ and $a_2$ in the string such that:

- $a_1$ has an odd frequency in the string.
- $a_2$ has an even frequency in the string.

Return this maximum difference.

**Constraints:**

- `3 <= s.length <= 100`
- `s` consists only of lowercase English letters.
- `s` contains at least one character with an odd frequency and one with an even frequency.

## 基礎思路

本題要求從字串中挑出兩個字元 $a_1$ 與 $a_2$，計算它們頻率之間的最大差值，其中：

- $a_1$ 的頻率必須為奇數。
- $a_2$ 的頻率必須為偶數。

要達到這個目標，我們先整體統計所有字母的出現次數，接著挑出符合上述條件的最大奇數頻率以及最小偶數頻率，兩者相減即得所求最大差值。

具體步驟如下：

- 計算每個字母的出現次數。
- 從這些次數中找到：

  - **出現次數為奇數的字母**中，頻率最大的。
  - **出現次數為偶數的字母**中，頻率最小的。
- 回傳這兩者的差值即可。

## 解題步驟

### Step 1：初始化頻率陣列並歸零

建立一個長度為 26 的整數陣列（因為英文字母僅有 26 個）來儲存每個字母的出現次數，並將所有值初始化為零：

```typescript
// 預先配置一次，避免每次呼叫時重複配置
const characterFrequency = new Uint16Array(26);

// 快速將頻率歸零
characterFrequency.fill(0);
```

### Step 2：計算每個字母的出現次數

遍歷整個字串，計算每個字母的出現頻率：

```typescript
const lengthOfString = s.length;
// 計算每個字母的出現頻率
for (let position = 0; position < lengthOfString; position++) {
  // 存取字母的 charCode 值效率較佳
  const letterCode = s.charCodeAt(position) - 97;
  characterFrequency[letterCode]++;
}
```

### Step 3：找出最大奇數頻率與最小偶數頻率

掃描頻率陣列，並透過位元運算區分奇偶，分別找出：

- 頻率為奇數的字母中最大的頻率。
- 頻率為偶數的字母中最小的頻率。

```typescript
// 紀錄最大的奇數頻率與最小的偶數頻率
let highestOddFrequency = -Infinity;
let lowestEvenFrequency = Infinity;

// 掃描全部26個字母
for (let i = 0; i < 26; i++) {
  const count = characterFrequency[i];
  if (count === 0) {
    continue;
  }

  // 使用位元運算檢查奇偶（效率較佳）
  if ((count & 1) === 0) {
    if (count < lowestEvenFrequency) {
      lowestEvenFrequency = count;
    }
  } else {
    if (count > highestOddFrequency) {
      highestOddFrequency = count;
    }
  }
}
```

### Step 4：計算最終答案並回傳

將最大奇數頻率與最小偶數頻率相減後回傳，即為所求的答案：

```typescript
return highestOddFrequency - lowestEvenFrequency;
```

## 時間複雜度

- 需完整遍歷一次長度為 $n$ 的字串以統計頻率：$O(n)$
- 接著掃描固定大小（26個）的頻率陣列以找出最大與最小值：$O(1)$
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定大小的 26 個元素的陣列，空間使用為常數級：$O(1)$
- 總空間複雜度為 $O(1)$。

> $O(1)$
