# 2409. Count Days Spent Together

Alice and Bob are traveling to Rome for separate business meetings.

You are given 4 strings `arriveAlice`, `leaveAlice`, `arriveBob`, and `leaveBob`. 
Alice will be in the city from the dates `arriveAlice` to `leaveAlice` (inclusive), 
while Bob will be in the city from the dates `arriveBob` to `leaveBob` (inclusive). 
Each will be a 5-character string in the format `"MM-DD"`, corresponding to the month and day of the date.

Return the total number of days that Alice and Bob are in Rome together.

You can assume that all dates occur in the same calendar year, which is not a leap year. 
Note that the number of days per month can be represented as: `[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]`.

**Constraints:**

- All dates are provided in the format `"MM-DD"`.
- Alice and Bob's arrival dates are earlier than or equal to their leaving dates.
- The given dates are valid dates of a non-leap year.

## 基礎思路

本題要求計算兩人各自停留在羅馬的日期區間（皆含首尾兩端）的重疊天數。日期以 `"MM-DD"` 字串表示，且全部位於同一個非閏年中。

在思考解法時，可掌握以下核心觀察：

- **日期字串無法直接相減**：
  以「月-日」表示的日期跨月時天數不連續，需先轉換為單一連續的刻度，才能進行區間運算。

- **一年中的第幾天是理想的統一刻度**：
  只要預先知道每個月之前累積的天數，任何日期都能以「該月之前的天數加上當月日數」轉換為 1 到 365 之間的整數。

- **兩個閉區間的交集由端點決定**：
  重疊區間的起點必為兩者較晚的抵達日，終點必為兩者較早的離開日。

- **交集可能不存在**：
  若起點晚於終點，表示兩段停留完全沒有交會，此時重疊天數為 0。

依據以上特性，可以採用以下策略：

- **預先建立每月前累積天數的對照表**，讓日期轉換只需一次查表與一次加法。
- **直接讀取字元編碼解析月與日**，避免字串切割與數值轉換的額外開銷。
- **取較晚抵達日與較早離開日形成交集區間**，以閉區間長度公式計算天數，若結果非正則回傳 0。

此策略將日期問題轉化為簡單的整數區間交集問題，以常數時間即可完成。

## 解題步驟

### Step 1：預先建立每月之前的累積天數對照表

以月份（從 1 開始）作為索引，記錄非閏年中該月之前已經過的總天數，供後續日期轉換時直接查表使用。

```typescript
// 非閏年中每個月之前的累積天數；索引為從 1 開始的月份編號。
const DAYS_BEFORE_MONTH = new Int16Array([
  0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
]);
```

### Step 2：實作將日期字串轉為年中第幾天的輔助函數

直接讀取字串中四個數字字元的編碼值，分別組出月份與日期，省去子字串切割與 `parseInt` 的開銷；再以查表所得的累積天數加上當月日數，得到該日期在一年中的序號。

```typescript
/**
 * 將 "MM-DD" 格式的日期字串轉換為從 1 開始的年中第幾天。
 *
 * @param date - "MM-DD" 格式的 5 字元日期字串。
 * @returns 該日期在一年中的序號，範圍為 1（1 月 1 日）至 365（12 月 31 日）。
 */
function toDayOfYear(date: string): number {
  // 直接以字元編碼讀取四個數字，省去 substring / parseInt 的開銷。
  const month = (date.charCodeAt(0) - 48) * 10 + (date.charCodeAt(1) - 48);
  const day = (date.charCodeAt(3) - 48) * 10 + (date.charCodeAt(4) - 48);

  return DAYS_BEFORE_MONTH[month] + day;
}
```

### Step 3：轉換兩人的抵達日並決定重疊區間的起點

將兩人的抵達日轉換為年中序號。重疊區間必須在兩人都已抵達之後才開始，因此取兩者中較晚的抵達日作為起點。

```typescript
const aliceStart = toDayOfYear(arriveAlice);
const bobStart = toDayOfYear(arriveBob);

// 共同區間從較晚的抵達日開始，至較早的離開日結束。
const overlapStart = aliceStart > bobStart ? aliceStart : bobStart;
```

### Step 4：轉換兩人的離開日並決定重疊區間的終點

同樣將兩人的離開日轉換為年中序號。只要任一人離開，重疊即告結束，因此取兩者中較早的離開日作為終點。

```typescript
const aliceEnd = toDayOfYear(leaveAlice);
const bobEnd = toDayOfYear(leaveBob);
const overlapEnd = aliceEnd < bobEnd ? aliceEnd : bobEnd;
```

### Step 5：計算重疊天數並處理無交集的情況

由於區間包含首尾兩端，重疊天數為終點減起點再加一。若結果不為正數，代表兩段停留沒有交集，回傳 0。

```typescript
const overlap = overlapEnd - overlapStart + 1;

// 寬度為負代表兩段停留從未相交。
return overlap > 0 ? overlap : 0;
```

## 時間複雜度

- 每個日期字串固定長度為 5，轉換時只讀取固定數量的字元並查表一次；
- 共轉換 4 個日期，其餘皆為常數次的比較與運算。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 累積天數對照表長度固定為 13；
- 僅使用固定數量的變數，無任何動態配置的空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
