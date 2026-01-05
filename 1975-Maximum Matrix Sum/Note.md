# 1975. Maximum Matrix Sum

You are given an `n x n` integer `matrix`. 
You can do the following operation any number of times:

- Choose any two adjacent elements of `matrix` and multiply each of them by `-1`.

Two elements are considered adjacent if and only if they share a border.

Your goal is to maximize the summation of the matrix's elements. 
Return the maximum sum of the matrix's elements using the operation mentioned above.

**Constraints:**

- `n == matrix.length == matrix[i].length`
- `2 <= n <= 250`
- `-10^5 <= matrix[i][j] <= 10^5`

## 基礎思路

本題允許我們反覆選擇任兩個相鄰元素，並同時把它們乘以 `-1`。這個操作的關鍵影響是：
每次操作會讓**兩個元素的正負號一起翻轉**，因此「負數的個數」在每次操作後會改變 **±2 或 0**，也就是說**負數個數的奇偶性保持不變**。

為了最大化矩陣總和，我們希望：

* 盡可能讓每個元素都變成非負，因為把負數變正數會增加總和。
* 但由於「負數個數奇偶性不變」，若初始負數個數是 **偶數**，就可以透過操作把所有元素都調整成非負，總和即為所有元素的絕對值總和。
* 若初始負數個數是 **奇數**，則無論如何操作，最終一定會剩下**奇數個負數**，至少會有**一個**元素無法變成非負。為了讓損失最小，應該讓「留下的那個負數」的**絕對值最小**。
* 若矩陣中存在 **0**，則可以藉由讓 0 參與翻轉來調整配置，使得不必承受「必留一負」的損失，最終可達到與全非負同樣的最大總和。

因此，最大總和可以由三個資訊決定：

1. 全部元素的絕對值總和
2. 負數個數的奇偶性
3. 全部元素中最小的絕對值（在必須留負時用來最小化代價）

## 解題步驟

### Step 1：初始化統計變數

準備用來統計：矩陣列數、絕對值總和、負數數量、最小絕對值、以及是否存在 0。

```typescript
const rowCount = matrix.length;

let totalAbsoluteSum = 0;
let negativeCount = 0;
let minAbsoluteValue = Number.POSITIVE_INFINITY;
let hasZero = false;
```

### Step 2：遍歷每一列（建立外層迴圈骨架）

逐列取出 row，並取得該列的欄數，準備進入內層掃描每個元素。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const row = matrix[rowIndex];
  const columnCount = row.length;

  // ...
}
```

### Step 3：遍歷列內每個元素並更新統計（核心累計）

在同一個外層迴圈中，掃描每個元素：

* 計算負數個數與是否出現 0
* 累加絕對值總和
* 更新最小絕對值

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 2：遍歷每一列（建立外層迴圈骨架）

  const row = matrix[rowIndex];
  const columnCount = row.length;

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    const value = row[columnIndex];

    if (value < 0) {
      negativeCount++;
    } else if (value === 0) {
      hasZero = true;
    }

    // 重要步驟：累加絕對值總和並追蹤最小絕對值（只需一次掃描）
    const absoluteValue = value < 0 ? -value : value;
    totalAbsoluteSum += absoluteValue;

    if (absoluteValue < minAbsoluteValue) {
      minAbsoluteValue = absoluteValue;
    }
  }
}
```

### Step 4：若存在 0，直接回傳絕對值總和

只要矩陣中有 0，就能避免「必留一負」造成的損失，因此最大總和就是全部元素絕對值之和。

```typescript
// 若存在 0，則一定能達到全非負配置以取得最大總和
if (hasZero) {
  return totalAbsoluteSum;
}
```

### Step 5：若負數個數為偶數，回傳絕對值總和

負數個數為偶數時，可以透過操作把所有元素都變成非負，因此答案同樣是絕對值總和。

```typescript
// 若負數個數為偶數，則可翻轉使所有元素皆為非負
if ((negativeCount & 1) === 0) {
  return totalAbsoluteSum;
}
```

### Step 6：負數個數為奇數且無 0，扣掉最小絕對值的兩倍

在「負數個數為奇數且沒有 0」時，最終一定要留下恰好一個負數。
為了讓總和最大，應讓留下的負數絕對值最小，等價於從絕對值總和中扣掉 `2 * minAbsoluteValue`。

```typescript
// 若負數個數為奇數且不存在 0，最終必須留下恰好一個負數：
// 選擇絕對值最小者作為負數，以最小化損失
return totalAbsoluteSum - (minAbsoluteValue * 2);
```

## 時間複雜度

- 共有 `n` 列、每列 `n` 個元素，完整掃描一次矩陣需處理 **恰好 `n^2` 個元素**；
- 掃描後只做常數次判斷與計算。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 使用固定數量的變數做累計與標記；
- 不依賴 `n` 配置任何額外陣列或資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
