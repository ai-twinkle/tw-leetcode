# 3876. Construct Uniform Parity Array II

You are given an array `nums1` of `n` distinct integers.

You want to construct another array `nums2` of length `n` such that the elements in `nums2` are either all odd or all even.

For each index `i`, you must choose exactly one of the following (in any order):

- `nums2[i] = nums1[i]`
- `nums2[i] = nums1[i] - nums1[j]`, for an index `j != i`, such that `nums1[i] - nums1[j] >= 1`

Return `true` if it is possible to construct such an array, otherwise return `false`.

**Constraints:**

- `1 <= n == nums1.length <= 10^5`
- `1 <= nums1[i] <= 10^9`
- `nums1` consists of distinct integers.

## 基礎思路

本題要求判斷是否能構造出一個「全為奇數」或「全為偶數」的新陣列，其中每個位置只能保留原值，或減去另一個嚴格較小的元素（因為要求差值至少為 1，且原陣列元素互異）。

在思考解法時，可掌握以下核心觀察：

- **一切關鍵只在奇偶性**：
  保留原值時奇偶性不變；相減時，奇偶性由兩者的奇偶關係決定——同奇偶相減得偶數，一奇一偶相減得奇數。因此數值本身的大小只在「能不能找到更小的被減數」時才有意義。

- **目標為全奇數時的需求最單純**：
  原本就是奇數的元素直接保留即可；原本是偶數的元素，必須找到一個嚴格較小的奇數來相減，才能翻轉成奇數。

- **目標為全偶數時存在無法克服的瓶頸**：
  偶數元素保留即可，但奇數元素想變成偶數，只能減去另一個更小的奇數；如此一來，整組中最小的那個奇數將永遠找不到可用的對象，也不允許維持奇數，故只要同時存在奇數與偶數，全偶數的方案必然失敗。

- **只需檢查最嚴苛的個案**：
  全奇數方案中，最難被滿足的是「最小的偶數」；若連它都能找到更小的奇數，其餘偶數自然也可以。因此整個問題可化約為比較兩種奇偶性的最小值。

- **僅有單一奇偶性時必然成立**：
  若整組元素同為奇數或同為偶數，所有元素原樣保留即已滿足條件。

依據以上特性，可以採用以下策略：

- **單次掃描分別記錄奇數與偶數的最小值**，並以哨兵值表示某種奇偶性不存在。
- **若某一奇偶性缺席，直接判定成立**。
- **兩者皆存在時，只需判斷最小的奇數是否小於最小的偶數**即可得到答案。
- 由於數值下界為 1，一旦掃描到 1 便可確定它是全域最小值，能提早結束判斷。

此策略只需一次線性掃描與常數個變數，即可完成判定。

## 解題步驟

### Step 1：取得輸入長度

先取得陣列長度，作為後續掃描的邊界。

```typescript
const length = nums1.length;
```

### Step 2：設定哨兵值與兩種奇偶性的最小值紀錄

以一個高於題目數值上限的哨兵值代表「該奇偶性尚未出現」，如此便能以是否等於哨兵值來辨識缺席狀態；並分別初始化奇數與偶數的最小值紀錄。

```typescript
// 哨兵值高於 10^9 的數值上限，因此可用等值比較判斷某種奇偶性是否缺席。
const ABSENT = 0x7fffffff;
let smallestOdd = ABSENT;
let smallestEven = ABSENT;
```

### Step 3：單次掃描並分別維護奇數與偶數的最小值

逐一取出每個元素，依其奇偶性更新對應的最小值；其中若掃描到 1，由於題目保證數值皆為正整數，1 即為全域最小值，任何偶數都不可能比它更小，故可立即判定成立並回傳。

```typescript
for (let index = 0; index < length; index += 1) {
  const value = nums1[index];

  if ((value & 1) === 1) {
    if (value < smallestOdd) {
      smallestOdd = value;
      // 1 是全域可能的最小值，因此不會有偶數比它更小。
      if (value === 1) {
        return true;
      }
    }
  } else {
    if (value < smallestEven) {
      smallestEven = value;
    }
  }
}
```

### Step 4：處理僅有單一奇偶性的情況

若掃描結束後某一方仍維持哨兵值，代表整組元素同為奇數或同為偶數，所有元素保留原值即已滿足條件，直接回傳成立。

```typescript
// 全為偶數時每個元素保留自身即可，全為奇數亦然，兩者皆自然滿足一致性。
if (smallestOdd === ABSENT || smallestEven === ABSENT) {
  return true;
}
```

### Step 5：奇偶並存時比較兩者的最小值

當兩種奇偶性並存時，唯一可行的目標是全奇數，此時每個偶數都需找到嚴格較小的奇數相減；只要最小的奇數小於最小的偶數，所有偶數即皆可被滿足。

```typescript
// 奇偶並存時：每個偶數元素都必須找到一個嚴格較小的奇數來相減。
return smallestOdd < smallestEven;
```

## 時間複雜度

- 僅對輸入陣列進行一次線性掃描，每個元素的處理皆為常數時間；
- 後續判斷為固定次數的比較運算。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的純量變數紀錄兩種奇偶性的最小值；
- 未配置任何額外陣列或動態結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
