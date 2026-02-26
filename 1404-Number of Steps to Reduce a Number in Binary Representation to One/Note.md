# 1404. Number of Steps to Reduce a Number in Binary Representation to One

Given the binary representation of an integer as a string `s`, 
return the number of steps to reduce it to `1` under the following rules:

- If the current number is even, you have to divide it by `2`.
- If the current number is odd, you have to add `1` to it.

It is guaranteed that you can always reach one for all test cases.

**Constraints:**

- `1 <= s.length <= 500`
- `s` consists of characters `'0'` or `'1'`
- `s[0] == '1'`

## 基礎思路

本題給定一個二進位字串，代表一個可能非常大的正整數（長度可達 500），要求依照規則把數值化簡到 `1`，並回傳所需步數。由於數值可能遠超一般整數範圍，必須以「位元層級的模擬」取代直接轉成數字計算。

核心觀察如下：

* **規則只取決於奇偶**：二進位下的奇偶僅由最低位決定；若最低位為 `0` 表示偶數，做一次除以 2；若最低位為 `1` 表示奇數，需要先加 1 變偶數，再除以 2，因此等價於兩步操作。
* **加一會產生進位連鎖**：當遇到奇數做 `+1` 時，可能讓連續的尾端 `1` 變成 `0`，並把進位往更高位推送；此效應可用單一「進位狀態」持續傳遞即可。
* **可從最低位往高位處理**：每處理完一個位元，就等同完成一次「除以 2」後把最低位丟棄，因此可以自右向左掃描位元，累加步數並維護進位。
* **最高位的特殊收尾**：處理到接近最左側時，若仍存在進位，代表最前面的 `1` 變成 `10`，還需要再做一次除以 2 才能回到 `1`。

因此策略為：自最低位往左掃描到接近最高位，透過進位狀態判定當前實際位元的奇偶，並依奇偶規則累加步數；最後若進位仍存在，再補上最後一次除以 2。

## 解題步驟

### Step 1：處理已經是 `1` 的最小輸入

若字串長度為 1，代表數值就是二進位的 `1`，不需要任何操作，直接回傳 0。

```typescript
const length = s.length;

// 單一位元的 "1" 已經化簡完成。
if (length === 1) {
  return 0;
}
```

### Step 2：初始化步數與進位狀態

使用 `steps` 累積總操作次數；使用 `carry` 表示前一輪「加一」所造成並持續向高位傳遞的進位狀態。

```typescript
let steps = 0;
let carry = 0;
```

### Step 3：自最低位往左掃描並計算每一位對步數的貢獻

從最低位開始逐位往左處理（但不處理最左側那個領頭 `1`），每次先取得當前位元，再結合進位狀態得到「此位在進位影響下的實際奇偶」，並依規則累加步數：

* 若為偶數：只需一次 `/2` → `+1` 步
* 若為奇數：需 `+1` 再 `/2` → `+2` 步，且進位會被固定為 1 並持續往左

```typescript
// 從最低有效位元處理到索引 1（在領頭的 '1' 之前停止）。
for (let index = length - 1; index >= 1; index--) {
  // 將當前位元轉成 0/1，避免 parseInt 的額外開銷。
  const bit = s.charCodeAt(index) & 1;
  const value = bit ^ carry;

  // 關鍵步驟：奇數 -> "+1" 再 "/2"（2 次操作），偶數 -> "/2"（1 次操作）
  if (value === 0) {
    steps += 1;
  } else {
    steps += 2;
    carry = 1;
  }
}
```

### Step 4：處理最高位的收尾情況並回傳答案

掃描完成後，若仍存在進位，代表最高位的 `1` 在加一後形成 `10`，還需要再做一次 `/2` 才能回到 `1`，因此步數需再加 1，最後回傳累積結果。

```typescript
// 若進位仍存在，代表領頭的 '1' 變成 '10'，需要最後一次 "/2"。
if (carry !== 0) {
  steps += 1;
}

return steps;
```

## 時間複雜度

- 由最低位往左掃描一次，處理的位元數為 `n = s.length`；
- 每個位元僅做常數次運算與判斷。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的額外狀態（步數與進位）；
- 不額外建立與輸入長度成比例的結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
