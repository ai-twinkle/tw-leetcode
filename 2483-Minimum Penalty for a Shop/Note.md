# 2483. Minimum Penalty for a Shop

You are given the customer visit log of a shop represented by a 0-indexed string `customers` consisting only of characters `'N'` and `'Y'`:

- if the $i^{th}$ character is `'Y'`, it means that customers come at the $i^{th}$ hour
- whereas `'N'` indicates that no customers come at the $i^{th}$ hour.

If the shop closes at the $j^{th}$ hour (`0 <= j <= n`), the penalty is calculated as follows:

- For every hour when the shop is open and no customers come, the penalty increases by `1`.
- For every hour when the shop is closed and customers come, the penalty increases by `1`.

Return the earliest hour at which the shop must be closed to incur a minimum penalty.

Note that if a shop closes at the $j^{th}$ hour, it means the shop is closed at the hour `j`.

**Constraints:**

`1 <= customers.length <= 10^5`
- `customers` consists only of characters `'Y'` and `'N'`.

## 基礎思路

本題要決定一個最早的關店時間，使得總懲罰最小。
懲罰的來源有兩種：

* 店還開著但沒有客人來；
* 店已關門但仍有客人來。

若將「是否延後關店」視為一個決策，可以發現：

* 在某小時有客人來，延後關店能避免未來的關門懲罰，屬於有利情況；
* 在某小時沒有客人來，延後關店只會增加空轉成本，屬於不利情況。

因此可將每個小時轉換成一個分數變化，並從左到右累積這個分數。
當累積分數達到最大時，代表「延後到這個時間關店」能得到最小總懲罰。
由於題目要求最早時間，只需在分數嚴格變大時更新答案即可。

## 解題步驟

### Step 1：初始化變數

準備掃描所需的變數，包括：

* 營業小時總數；
* 用來判斷 `'Y'` 的字元碼；
* 目前累積分數、歷史最佳分數，以及對應的最早關店時間。

```typescript
const hourCount = customers.length;
const customerYesCode = 89; // 'Y'

let runningScore = 0;
let bestScore = 0;
let bestClosingHour = 0;
```

### Step 2：逐小時掃描並更新累積分數

從左到右掃描每一個小時，依是否有客人來更新累積分數：

* 若為 `'Y'`，分數加一；
* 若為 `'N'`，分數減一。

```typescript
for (let hour = 0; hour < hourCount; hour++) {
  // 更新前綴分數：遇到 'Y' 加一，遇到 'N' 減一
  if (customers.charCodeAt(hour) === customerYesCode) {
    runningScore++;
  } else {
    runningScore--;
  }

  // ...
}
```

### Step 3：在同一掃描中紀錄最佳（最早）關店時間

在同一個最外層迴圈中，當累積分數嚴格大於目前最佳分數時，
代表在此時之後關店能得到更小的總懲罰。
由於題目要求回傳最早的時間，因此只在「嚴格變大」時更新。

```typescript
for (let hour = 0; hour < hourCount; hour++) {
  // Step 2：逐小時掃描並更新累積分數

  // 紀錄前綴分數達到最大值時對應的最早關店時間
  if (runningScore > bestScore) {
    bestScore = runningScore;
    bestClosingHour = hour + 1;
  }
}
```

### Step 4：回傳結果

完成整個掃描後，`bestClosingHour` 即為最小懲罰下的最早關店時間。

```typescript
return bestClosingHour;
```

## 時間複雜度

- 僅進行一次長度為 `n` 的線性掃描；
- 每次迭代只包含常數次運算。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數；
- 不隨輸入長度增加。
- 總空間複雜度為 $O(1)$。

> $O(1)$
