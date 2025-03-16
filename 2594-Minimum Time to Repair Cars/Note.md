# 2594. Minimum Time to Repair Cars

You are given an integer array `ranks` representing the ranks of some mechanics. 
$\text{ranks}_i$ is the rank of the $i_\text{th}$ mechanic. 
A mechanic with a rank `r` can repair n cars in $r * n^2$ minutes.

You are also given an integer `cars` representing the total number of cars waiting in the garage to be repaired.

Return the minimum time taken to repair all the cars.

Note: All the mechanics can repair the cars simultaneously.

## 基礎思路

本題的核心在於尋找一個最小的「修車所需時間」（time），使得所有技師在該時間內能共同修理完指定數量（cars）的汽車。

這與 [2559. Count Vowel Strings in Ranges](https://leetcode.com/problems/house-robber-iv/description/) 有些相似，但不同的是，本題的時間是一個連續的數值，而不是一個離散的範圍。

因此，我們只需要調整下輔助函式（Helper Function），用來快速判斷在給定的修車時間下，所有技師是否能成功修完目標數量的汽車，就能解決這個問題。

- 我們從第一個技師開始，依序遍歷每位技師，計算每個技師在當前設定的時間內最多能修理的汽車數量。
- 每位技師能修理的汽車數量可透過公式計算：  
  $$
  \text{汽車數量} = \left\lfloor\sqrt{\frac{\text{time}}{\text{rank}}}\right\rfloor
  $$

- 在計算過程中，一旦所有技師能修理的汽車數量總和已達到或超過目標值（cars），即可提前中斷判斷（early exit）。

為了找出最短所需的時間，我們使用二分搜尋（Binary Search）在合理的時間範圍內尋找最小可行的時間值：

- 搜尋的下界設為 0，上界則可設定為所有技師中效率最差（rank 最大）的技師單獨修理全部汽車的最壞情況所需時間，即：  
  $$
  \text{上界時間} = \text{最大 rank} \times cars^2
  $$

每次搜尋時，透過上述的輔助函式判斷當前所設定的時間是否足夠所有技師修完指定的汽車數量：

- 如果可行，便嘗試以更短的時間繼續搜尋；
- 如果不可行，則延長時間，再繼續搜尋；

重複此過程，直到找到剛好能滿足條件的最短時間為止。最終回傳所找到的最小可行時間（time）作為解答。

## 解題步驟

### Step 1: 建構 Helper Function

首先，我們需要建立一個輔助函式，用來判斷在給定的修車時間下，所有技師是否能成功修完目標數量的汽車。

```typescript
const canRepairCars = (time: number): boolean => {
  let count = 0;
  for (let i = 0, len = ranks.length; i < len; i++) {
    // 公式：汽車數量 = floor(sqrt(time / rank))
    count += Math.floor(Math.sqrt(time / ranks[i]));
    if (count >= cars) {
      // 一旦修完目標汽車數量，就可以提前結束
      return true;
    }
  }
  return false;
};
```

### Step 2: 二分搜尋

接著，我們在合理的時間範圍內，進行二分搜尋。

```typescript
const maxRank = Math.max(...ranks);
let lower = 0;
let higher = maxRank * cars * cars;

// Binary search to determine the minimum time required.
while (lower < higher) {
  const middleNumber = lower + Math.floor((higher - lower) / 2);
  if (canRepairCars(middleNumber)) {
    higher = middleNumber;
  } else {
    lower = middleNumber + 1;
  }
}
return lower;
```


## 時間複雜度

- **預處理階段：**
  - 遍歷技師等級（ranks）陣列以找出最大值，時間複雜度為 $O(n)$。

- **二分搜尋階段：**
  - 搜索範圍設定在 $[0, \text{maxRank} \times \text{cars}^2]$，因此二分搜尋的迭代次數約為 $O(\log(\text{maxRank} \times \text{cars}^2))$。
  - 每一次二分搜尋迭代中，都會調用一次 `canRepairCars` 檢查函式。該函式在最壞情況下需遍歷整個 `ranks` 陣列，耗時 $O(n)$。
  - 因此，二分搜尋階段的時間複雜度為 $O(n \cdot \log(\text{maxRank} \times \text{cars}^2))$。

- **總時間複雜度：**
  - 預處理與二分搜尋階段合併後，總時間複雜度為  
    $$
    O(n) + O(n \cdot \log(\text{maxRank} \times \text{cars}^2)) = O(n \cdot \log(\text{maxRank} \times \text{cars}^2))
    $$

> $O(n \cdot \log(\text{maxRank} \times \text{cars}^2))$

## 空間複雜度

- 僅使用常數額外空間（例如變數 `low`、`high`、`mid` 等），不隨輸入大小成長，故空間複雜度為 $O(1)$。
- **總空間複雜度：** $O(1)$

> $O(1)$
