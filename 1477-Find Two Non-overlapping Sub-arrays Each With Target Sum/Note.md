# 1477. Find Two Non-overlapping Sub-arrays Each With Target Sum

You are given an array of integers `arr` and an integer `target`.

You have to find two non-overlapping sub-arrays of `arr` each with a sum equal `target`. 
There can be multiple answers so you have to find an answer 
where the sum of the lengths of the two sub-arrays is minimum.

Return the minimum sum of the lengths of the two required sub-arrays, 
or return `-1` if you cannot find such two sub-arrays.

**Constraints:**

- `1 <= arr.length <= 10^5`
- `1 <= arr[i] <= 1000`
- `1 <= target <= 10^8`

## 基礎思路

本題要求在同一個陣列中找出兩段互不重疊、且各自總和等於目標值的子陣列，並使兩段長度總和最小。由於陣列長度可達 $10^5$，若枚舉所有子陣列配對再檢查是否重疊，計算量將無法負荷，因此必須找到只需線性掃描的策略。

在思考解法時，可掌握以下核心觀察：

- **元素皆為正整數，使區間和具有單調性**：
  當右端固定時，往右延伸只會讓總和變大，往左收縮只會讓總和變小。此單調性讓「總和恰為目標」的區間能以滑動視窗在線性時間內逐一找出，不需任何回溯。

- **同一右端至多對應一段合法區間**：
  正整數保證了區間和嚴格遞增，因此對每個右端而言，符合目標值的起點至多只有一個，合法區間的總數不會超過陣列長度。

- **「互不重疊」可轉化為分界點問題**：
  兩段區間互不重疊，等價於其中一段完全落在另一段起點之前。因此只要在掃描到某段合法區間時，能立即取得「結束位置嚴格早於此段起點」的最短合法區間長度，即可完成配對。

- **前綴最佳解可隨掃描同步累積**：
  「到某個位置為止的最短合法區間長度」具有前綴遞推性質，可在同一次掃描中順帶維護，無須額外掃描。

依據以上特性，可以採用以下策略：

- **以滑動視窗線性掃描，逐一找出總和恰為目標的區間**。
- **同步維護前綴最短合法區間表**，使每個位置都能 $O(1)$ 查得其左側的最佳解。
- **每找到一段合法區間，立刻與其左側的最佳區間配對並更新答案**，最後若答案仍為不可能達成的哨兵值，則代表無解。

此策略只需一次線性掃描即可同時完成搜尋與配對，兼顧正確性與效率。

## 解題步驟

### Step 1：取得陣列長度並設定不可達哨兵值

先取得輸入長度，並定義一個「必定無法達成」的長度值作為初始哨兵；由於兩段互不重疊的區間長度總和永遠不會超過整個陣列長度，任何大於長度的值都可視為尚未找到。

```typescript
const length = arr.length;
// 任何大於陣列長度的值皆代表「尚未找到」；兩段互不重疊的視窗長度總和永遠不會超過陣列長度
const unreachable = length + 1;
```

### Step 2：建立前綴最短合法區間表

配置一個與輸入等長的陣列，用以記錄「完全落在開頭到某索引之間的最短合法區間長度」，供後續配對時 $O(1)$ 查詢。

```typescript
// shortestUpTo[index] = 完全落在 arr[0..index] 範圍內的最短合法子陣列長度
const shortestUpTo = new Int32Array(length);
```

### Step 3：初始化掃描過程所需的狀態變數

準備目前為止的最短合法區間長度、最終答案、視窗左端位置與視窗總和，其中前兩者皆以哨兵值起始。

```typescript
let runningShortest = unreachable;
let answer = unreachable;
let left = 0;
let windowSum = 0;
```

### Step 4：右端逐步擴張並收縮左端使視窗和不超過目標

以右端由左至右掃描整個陣列：每次先把新元素併入視窗總和；由於所有元素皆為正數，一旦總和超過目標，唯一能降低總和的方式就是從左端移除元素，故持續收縮直到總和不再超標。

```typescript
for (let right = 0; right < length; right++) {
  windowSum += arr[right];

  // 所有元素皆為正數，因此從左端收縮是唯一能降低總和的方式
  while (windowSum > target) {
    windowSum -= arr[left];
    left++;
  }

  // ...
}
```

### Step 5：找到合法視窗時與其左側的最佳視窗配對

當視窗總和恰好等於目標時，先算出此視窗的長度；若其起點不在陣列開頭，便可查詢「結束位置嚴格早於此起點」的最短合法區間，兩者相加即為一組可行解，若優於目前答案則更新。

```typescript
for (let right = 0; right < length; right++) {
  // Step 4：擴張右端並收縮左端使視窗和不超過目標

  if (windowSum === target) {
    const windowLength = right - left + 1;

    // 將此視窗與結束位置嚴格早於其起點的最佳視窗配對
    if (left > 0) {
      const candidate = windowLength + shortestUpTo[left - 1];
      if (candidate < answer) {
        answer = candidate;
      }
    }

    // ...
  }

  // ...
}
```

### Step 6：更新目前為止的最短合法視窗長度

完成配對後，此視窗本身也可能成為未來配對的左側最佳解，因此若其長度更短則更新紀錄。

```typescript
for (let right = 0; right < length; right++) {
  // Step 4：擴張右端並收縮左端使視窗和不超過目標

  if (windowSum === target) {
    // Step 5：與左側最佳視窗配對並更新答案

    if (windowLength < runningShortest) {
      runningShortest = windowLength;
    }
  }

  // ...
}
```

### Step 7：將目前最短長度寫入前綴表

無論本輪是否找到合法視窗，都要把目前為止的最短長度寫入對應位置，使前綴表在每個索引上都保持正確，後續查詢才能直接取用。

```typescript
for (let right = 0; right < length; right++) {
  // Step 4：擴張右端並收縮左端使視窗和不超過目標

  if (windowSum === target) {
    // Step 5：與左側最佳視窗配對並更新答案

    // Step 6：更新目前為止的最短視窗長度
  }

  shortestUpTo[right] = runningShortest;
}
```

### Step 8：依哨兵值判定有無解並回傳

掃描結束後，若答案仍大於陣列長度，代表始終未能湊出兩段互不重疊的合法區間，回傳 `-1`；否則回傳所得的最小長度總和。

```typescript
return answer > length ? -1 : answer;
```

## 時間複雜度

- 右端指標由左至右掃描一次，為 $O(n)$；
- 左端指標僅單向前進且永不回退，整體收縮次數攤還後亦為 $O(n)$；
- 每個位置的配對查詢與前綴表寫入皆為常數時間；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 前綴最短長度表需與輸入等長，為 $O(n)$；
- 其餘僅使用固定數量的純量變數；
- 總空間複雜度為 $O(n)$。

> $O(n)$
