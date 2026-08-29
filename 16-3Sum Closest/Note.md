# 16. 3Sum Closest

Given an integer array nums of length `n` and an integer `target`, 
find three integers at distinct indices in `nums` such that the sum is closest to `target`.

Return the sum of the three integers.

You may assume that each input would have exactly one solution.

**Constraints:**

- `3 <= nums.length <= 500`
- `-1000 <= nums[i] <= 1000`
- `-10^4 <= target <= 10^4`

## 基礎思路

本題要求從陣列中挑選三個位於相異索引的整數，使其總和最接近給定的目標值，並回傳該總和。與「和恰好為零」的變形不同，本題不要求命中特定值，而是求「距離最小」，因此重點在於如何有效率地逼近目標並盡早排除不可能更優的組合。

在思考解法時，可掌握以下核心觀察：

- **數值範圍極小且固定**：
  每個元素都落在一個有限且已知的區間內，因此排序不必依賴一般性的比較排序，可改用以值域為索引的計數方式完成，避免比較函式的呼叫成本。

- **排序後可固定一數並化為兩數問題**：
  一旦資料有序，只要固定最小的那個數，剩下的即是在有序區間中尋找「和最接近某個殘餘目標」的一對數，可用雙指標由兩端向中收斂。

- **有序性提供強力剪枝條件**：
  固定第一個數後，該列所能達到的最小和與最大和都可立即算出。若最小和已超過目標，由於後續的第一個數只會更大，整個搜尋可直接終止；若最大和仍不及目標，則該列的最佳解就是這個最大和，可直接跳過內層搜尋。

- **重複的首個數值不會帶來新解**：
  相同的首值所對應的搜尋區間是前一次的子集合，不可能產生更接近的結果，可直接略過。

- **距離為零即為最優解**：
  一旦找到總和恰好等於目標的組合，便不可能再更接近，可立即回傳。

依據以上特性，可以採用以下策略：

- **以計數方式完成排序**，將輸入轉換為緊湊的有序序列。
- **先以最小的三個數初始化目前最佳解與最小距離**，作為後續比較的基準。
- **逐一固定第一個數，先用上下界剪枝，再以雙指標在剩餘區間中收斂**，過程中持續更新最接近的總和。

此策略在保持正確性的同時，透過值域排序與雙向剪枝大幅減少實際的搜尋量。

## 解題步驟

### Step 1：預先定義值域偏移與範圍常數

先定義由約束條件推得的最小值偏移量與可能數值的總數，供後續以值域為索引的計數排序使用。

```typescript
/** 由約束條件允許的最小值，用於將數值平移為桶索引。 */
const VALUE_OFFSET = 1000;

/** 由約束條件允許的相異數值數量：-1000 .. 1000（含）。 */
const VALUE_RANGE = 2001;
```

### Step 2：取得長度並統計各數值的出現次數

取得輸入長度後，建立涵蓋整個值域的計數陣列，將每個元素平移為對應桶索引並累加其出現次數。

```typescript
const length = nums.length;

// 數值範圍有界，因此計數排序能以 O(n + range) 完成，且不需要任何比較函式呼叫。
const bucketCounts = new Uint16Array(VALUE_RANGE);
for (let index = 0; index < length; index += 1) {
  bucketCounts[nums[index] + VALUE_OFFSET] += 1;
}
```

### Step 3：依桶的順序展開為已排序序列

由小到大掃過所有桶，將每個桶所代表的數值依其出現次數重複寫入輸出緩衝區，即可得到遞增有序的資料。

```typescript
// Int16Array 足以容納所有可能的數值，並讓掃描維持在緊湊且未裝箱的緩衝區內。
const sorted = new Int16Array(length);
let writeCursor = 0;
for (let bucket = 0; bucket < VALUE_RANGE; bucket += 1) {
  let remaining = bucketCounts[bucket];
  const value = bucket - VALUE_OFFSET;
  while (remaining > 0) {
    sorted[writeCursor] = value;
    writeCursor += 1;
    remaining -= 1;
  }
}
```

### Step 4：以最小的三個數初始化最佳解

取有序序列中最前面的三個數作為初始候選，並計算其與目標的距離；若距離已為零，代表恰好命中目標，可立即回傳。

```typescript
let bestSum = sorted[0] + sorted[1] + sorted[2];
let bestDistance = bestSum > target ? bestSum - target : target - bestSum;
if (bestDistance === 0) {
  return bestSum;
}
```

### Step 5：逐一固定第一個數並跳過重複的首值

以外層迴圈固定最小的那個數。若目前的首值與前一個相同，其對應的搜尋區間僅是前一次的子集合，不可能得到更接近的結果，直接略過。

```typescript
const lastIndex = length - 1;
for (let first = 0; first < length - 2; first += 1) {
  // 重複的首值所掃描的區間是前一次的子集合，因此不可能更優。
  if (first > 0 && sorted[first] === sorted[first - 1]) {
    continue;
  }

  const firstValue = sorted[first];

  // ...
}
```

### Step 6：以該列可達的最小和進行上界剪枝

固定首值後，最小可達的總和即為其後最小的兩個數之和加上首值。若此值已超過目標，代表之後的每一列都只會超過更多，可先嘗試更新最佳解後直接終止整個搜尋。

```typescript
for (let first = 0; first < length - 2; first += 1) {
  // Step 5：跳過重複的首值並取出當前首值

  // 此處可達的最小和；若已超過目標，後續每一列都會超過更多。
  const minimumSum = firstValue + sorted[first + 1] + sorted[first + 2];
  if (minimumSum > target) {
    if (minimumSum - target < bestDistance) {
      bestSum = minimumSum;
    }
    break;
  }

  // ...
}
```

### Step 7：以該列可達的最大和進行下界剪枝

同理，最大可達的總和為序列末端最大的兩個數之和加上首值。若此值仍未達目標，代表該列所能提供的最佳結果就是這個最大和，更新後即可跳過內層搜尋。

```typescript
for (let first = 0; first < length - 2; first += 1) {
  // Step 5：跳過重複的首值並取出當前首值

  // Step 6：以最小可達之和進行上界剪枝

  // 此處可達的最大和；若仍不及目標，它就是這一列所能提供的最佳結果。
  const maximumSum = firstValue + sorted[lastIndex - 1] + sorted[lastIndex];
  if (maximumSum < target) {
    if (target - maximumSum < bestDistance) {
      bestSum = maximumSum;
      bestDistance = target - maximumSum;
    }
    continue;
  }

  // ...
}
```

### Step 8：以雙指標在剩餘區間中逼近殘餘目標

將問題轉為在首值之後的區間中尋找「和最接近殘餘目標」的一對數。若配對和恰好等於殘餘目標，即為完美解可立即回傳；否則計算其距離並在更優時更新最佳解，再依配對和的大小決定收縮哪一側指標。

```typescript
for (let first = 0; first < length - 2; first += 1) {
  // Step 5：跳過重複的首值並取出當前首值

  // Step 6：以最小可達之和進行上界剪枝

  // Step 7：以最大可達之和進行下界剪枝

  // 將配對與殘餘目標比較，可省去內層迴圈中的一次加法。
  const residual = target - firstValue;
  let low = first + 1;
  let high = lastIndex;
  while (low < high) {
    const pairSum = sorted[low] + sorted[high];
    if (pairSum === residual) {
      return target;
    }

    const distance = pairSum > residual ? pairSum - residual : residual - pairSum;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestSum = firstValue + pairSum;
    }

    if (pairSum > residual) {
      high -= 1;
    } else {
      low += 1;
    }
  }
}
```

### Step 9：回傳最接近目標的總和

所有候選皆已檢視完畢，此時保存的即是距離目標最近的三數之和，直接回傳。

```typescript
return bestSum;
```

## 時間複雜度

- 統計桶計數需一次線性掃描，為 $O(n)$；
- 展開有序序列需走訪整個值域與所有元素，為 $O(n + r)$，其中 $r$ 為值域大小；
- 外層固定首值共 $O(n)$ 次，每次內層雙指標最多收斂 $O(n)$ 步，為 $O(n^2)$；
- 值域大小由約束條件固定為常數，總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 計數陣列大小為值域 $O(r)$，由約束條件固定為常數；
- 有序序列緩衝區需 $O(n)$；
- 其餘僅使用固定數量的純量變數；
- 總空間複雜度為 $O(n)$。

> $O(n)$
