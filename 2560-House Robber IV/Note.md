# 2559. Count Vowel Strings in Ranges

There are several consecutive houses along a street, each of which has some money inside. 
There is also a robber, who wants to steal money from the homes, but he refuses to steal from adjacent homes.

The capability of the robber is the maximum amount of money he steals from one house of all the houses he robbed.

You are given an integer array `nums` representing how much money is stashed in each house. 
More formally, the $i_{th}$ house from the left has `nums[i]` dollars.

You are also given an integer `k`, representing the minimum number of houses the robber will steal from. 
It is always possible to steal at least `k` houses.

Return the minimum capability of the robber out of all the possible ways to steal at least `k` houses.

## 基礎思路

本題的核心在於尋找一個最小的「偷竊能力」（capacity），使得竊賊能夠在不偷竊相鄰房屋的前提下，至少偷到指定的 k 間房屋。
因此，我們需要建立一個輔助函式（Helper Function），用來快速判斷在給定的偷竊能力下，是否能夠成功偷到至少 k 間房子。

- 我們可以從第一間房子開始，依序遍歷每一個房屋，當房屋內的金額小於或等於當前設定的 capacity，就選擇偷這間房子，然後跳過下一間房子，持續進行直到統計完所有可偷竊的房屋數量。

為了找出最佳的 capacity，我們在所有房屋金額的最小值與最大值之間，進行二分搜尋。
每次搜尋時，透過上述的輔助函式判斷在當前能力下是否能滿足偷竊至少 k 間房屋的條件。

- 如果可行，我們便嘗試以更低的能力繼續搜尋；
- 反之則提高能力，再繼續搜尋，直到確定能滿足條件的最低能力為止。

最終回傳找到的、能確保偷竊至少 k 間房屋的最小能力（capacity）作為解答。

## 解題步驟

### Step 1: 建構 Helper Function

首先，我們需要建立一個輔助函式，用來判斷在給定的偷竊能力下，是否能夠成功偷到至少 k 間房子。

```typescript
const canRobWithCapability = (capability: number): boolean => {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] <= capability) {
      count++;
      i++; // 跳過相鄰房屋

      if (count >= k) {
        // 一旦偷到 k 間房屋，就可以提前結束
        return true;
      }
    }
  }
  return false;
};
```

### Step 2: 二分搜尋

接著，我們在所有房屋金額的最小值與最大值之間，進行二分搜尋。

```typescript
// 我們先找出所有房屋金額的最小值與最大值，做為二分搜尋的範圍
let lower = Math.min(...nums);
let higher = Math.max(...nums);

while (lower < higher) {
  const middleNumber =(lower + higher) >> 1; // 等效於 Math.floor((lower + higher) / 2)
  if (canRobWithCapability(middleNumber)) {
    // 當找到一個有效的能力時，我們嘗試降低能力
    higher = middleNumber;
  } else {
    // 當能力不足時，我們提高能力，再繼續搜尋
    lower = middleNumber + 1;
  }
}
```


## 時間複雜度

- 預處理階段：找出所有房屋金額的最小值與最大值，時間複雜度為 $O(n)$。
- 二分搜尋階段：
  - 搜索範圍設定在 $[min, max]$，故迭代次數大約為 $O(log(max - min))$。
  - 每一次二分搜尋迭代中，都會調用一次 canRobWithCapability（檢查函數），該函數在最壞情況下需要遍歷整個陣列，耗時 $O(n)$。
  - 因此，二分搜尋的時間複雜度為 $O(n \cdot log(max - min))$。
- 總時間複雜度為 $O(n \cdot log(max - min))$。

> $O(n \cdot log(max - min))$

## 空間複雜度

- 僅使用常數額外空間，故空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
