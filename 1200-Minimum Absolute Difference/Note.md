# 1200. Minimum Absolute Difference

Given an array of distinct integers `arr`, 
find all pairs of elements with the minimum absolute difference of any two elements.

Return a list of pairs in ascending order(with respect to pairs), each pair `[a, b]` follows

- `a, b` are from `arr`
- `a < b`
- `b - a` equals to the minimum absolute difference of any two elements in `arr`

**Constraints:**

- `2 <= arr.length <= 10^5`
- `-10^6 <= arr[i] <= 10^6`

## 基礎思路

本題要找出所有元素配對中，**絕對差值最小**的那些配對，並以遞增順序輸出每個 `[a, b]`（且 `a < b`）。

在思考解法時，我們需要注意幾個核心觀察：

* **最小差值只可能出現在排序後的相鄰元素之間**：
  若將陣列排序，任意兩個非相鄰元素之間必定夾著其他數值，差距不會比相鄰更小。因此只要檢查排序後相鄰差即可找到全域最小差。

* **需要同時找出最小差與所有符合的配對**：
  我們可以在一次線性掃描中維護目前最小差值；當發現更小差值時，先前的配對全部作廢並重新開始收集；若差值相同則加入結果。

* **輸出順序自然成立**：
  排序後從左到右掃描得到的相鄰配對，本身就是依 `(a, b)` 由小到大產生，因此收集到的結果即符合題目要求的遞增順序。

透過「先排序、再線性掃描」的策略，可以在題目限制下有效率地完成所有配對收集。

## 解題步驟

### Step 1：複製輸入並準備排序容器

先取得長度，並複製輸入值到新的容器中，避免排序時改動原陣列。

```typescript
const length = arr.length;

// 複製輸入值，避免排序時改動原始陣列。
const sortedValues = new Int32Array(length);
for (let index = 0; index < length; index++) {
  sortedValues[index] = arr[index];
}
```

### Step 2：排序以便只比較相鄰差值

排序後，最小絕對差只需比較相鄰元素即可。

```typescript
// 排序後，最小絕對差只需比較相鄰元素即可找到。
sortedValues.sort();
```

### Step 3：初始化最小差與結果收集結構

設定最小差為一個極大值，並準備用陣列逐步收集配對，同時用 `pairsLength` 控制有效長度。

```typescript
// 以最大的正整數差值作為初始最小差。
let minimumDifference = 2147483647;

// 在掃描過程中逐步收集結果配對。
const pairs: number[][] = [];
let pairsLength = 0;
```

### Step 4：初始化相鄰比較起點

從排序後第一個元素開始，作為相鄰差比較的前一個值。

```typescript
// 從第一個元素開始做相鄰比較。
let previousValue = sortedValues[0];
```

### Step 5：單次掃描相鄰元素並維護最小差與配對集合

逐一比較相鄰差值：

* 若發現更小差值，清空先前結果並重新收集；
* 若差值相同，加入結果；
  最後更新 `previousValue` 前進。

```typescript
// 排序後只需一次掃描，因為最小差只可能出現在相鄰元素。
for (let index = 1; index < length; index++) {
  const currentValue = sortedValues[index];

  // 因為已排序，差值必為非負。
  const difference = currentValue - previousValue;

  if (difference < minimumDifference) {
    // 發現更小差值，先前配對全部作廢。
    minimumDifference = difference;
    pairsLength = 0;
    pairs[pairsLength] = [previousValue, currentValue];
    pairsLength++;
  } else if (difference === minimumDifference) {
    // 此配對符合目前最小差值。
    pairs[pairsLength] = [previousValue, currentValue];
    pairsLength++;
  }

  // 前進到下一組相鄰比較。
  previousValue = currentValue;
}
```

### Step 6：裁切結果陣列並回傳

掃描結束後，將 `pairs` 的長度裁切到實際收集的有效數量並回傳。

```typescript
// 將結果陣列裁切到實際收集到的有效配對數量。
pairs.length = pairsLength;
return pairs;
```

## 時間複雜度

- 複製輸入到新容器需走訪一次：$O(n)$；
- 排序需：$O(n \log n)$；
- 排序後單次線性掃描相鄰差並收集配對：$O(n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- `sortedValues` 為長度 `n` 的額外陣列：$O(n)$；
- `pairs` 最多收集 `k` 組配對（$0 \le k \le n-1$）：$O(k)$；
- 其餘變數為常數空間：$O(1)$；
- 總空間複雜度為 $O(n + k)$

> $O(n + k)$
