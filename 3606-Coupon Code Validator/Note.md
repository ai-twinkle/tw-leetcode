# 3606. Coupon Code Validator

You are given three arrays of length `n` that describe the properties of `n` coupons: `code`, `businessLine`, and `isActive`. 
The $i^{th}$ coupon has:

- `code[i]`: a string representing the coupon identifier.
- `businessLine[i]`: a string denoting the business category of the coupon.
- `isActive[i]`: a boolean indicating whether the coupon is currently active.

A coupon is considered valid if all of the following conditions hold:

1. `code[i]` is non-empty and consists only of alphanumeric characters (a-z, A-Z, 0-9) and underscores (`_`).
2. `businessLine[i]` is one of the following four categories: `"electronics"`, `"grocery"`, `"pharmacy"`, `"restaurant"`.
3. `isActive[i]` is true.

Return an array of the codes of all valid coupons, 
sorted first by their businessLine in the order: `"electronics"`, `"grocery"`, `"pharmacy"`, `"restaurant"`, 
and then by code in lexicographical (ascending) order within each category.

**Constraints:**

- `n == code.length == businessLine.length == isActive.length`
- `1 <= n <= 100`
- `0 <= code[i].length, businessLine[i].length <= 100`
- `code[i]` and `businessLine[i]` consist of printable ASCII characters.
- `isActive[i]` is either `true` or `false`.

## 基礎思路

本題要求從多個優惠券資料中，篩選出**同時滿足多項條件**的有效優惠券，並依照指定規則進行排序後輸出其代碼。

問題可拆解為兩個核心階段：

* **有效性判斷階段**
  每一筆優惠券是否有效，取決於三個彼此獨立的條件：

    1. 是否為啟用狀態；
    2. 所屬商業分類是否落在指定的四種合法類別中；
    3. 優惠券代碼是否為非空，且只包含英數字與底線。

* **排序與輸出階段**
  所有通過篩選的優惠券需依照：

    1. 商業分類的既定順序排序；
    2. 同一分類內再依優惠券代碼字典序遞增排序。

為了讓邏輯清楚且效率穩定，可以採用以下策略：

* **以固定順序的桶（bucket）結構分組資料**
  先依商業分類順序，為每一種類別準備一個獨立容器，避免後續排序時需要反覆比對分類順序。

* **單次線性掃描完成所有過濾條件檢查**
  在同一輪迴圈中完成啟用狀態、分類合法性與代碼格式檢查，避免多次掃描或額外資料結構的成本。

* **分類後再排序，最後依序合併結果**
  每個分類桶內只需處理同類型資料，排序邏輯單純，最後依既定分類順序串接即可。

透過此方式，可以在結構清楚的前提下，穩定完成所有條件檢查與排序需求。

## 解題步驟

### Step 1：定義商業分類順序與對應索引

先以常數定義商業分類的合法順序，並建立分類名稱對應索引的對照表，方便後續快速定位所屬分類桶。

```typescript
const BUSINESS_LINE_ORDER = ["electronics", "grocery", "pharmacy", "restaurant"] as const;

const BUSINESS_LINE_INDEX: Readonly<Record<string, number>> = {
  electronics: 0,
  grocery: 1,
  pharmacy: 2,
  restaurant: 3,
};
```

### Step 2：定義優惠券代碼格式的驗證規則

使用正規表達式描述合法的優惠券代碼格式，確保代碼為非空，且僅包含英數字與底線。

```typescript
const COUPON_CODE_PATTERN = /^\w+$/;
```

## 解題步驟（主函式 validateCoupons）

### Step 3：初始化分類桶結構

建立固定長度的二維陣列，每一個子陣列對應一種商業分類，用於暫存通過驗證的優惠券代碼。

```typescript
const bucketedCodes: string[][] = [[], [], [], []];
```

### Step 4：單次掃描所有優惠券並進行有效性篩選

透過一次線性掃描，同時檢查三項有效性條件，並將通過驗證的優惠券代碼放入對應的分類桶中。

```typescript
// 單次掃描進行篩選，避免額外資料結構的開銷
for (let index = 0; index < code.length; index++) {
  if (!isActive[index]) {
    continue;
  }

  const businessLineValue = businessLine[index];
  const businessLineBucketIndex = BUSINESS_LINE_INDEX[businessLineValue];

  if (businessLineBucketIndex === undefined) {
    continue;
  }

  const codeValue = code[index];
  if (!COUPON_CODE_PATTERN.test(codeValue)) {
    continue;
  }

  // 放入對應商業分類的桶中
  bucketedCodes[businessLineBucketIndex].push(codeValue);
}
```

### Step 5：依商業分類順序排序並合併結果

對每一個分類桶內的優惠券代碼進行字典序排序，並依既定商業分類順序將結果依序加入最終輸出陣列。

```typescript
const result: string[] = [];

for (let bucketIndex = 0; bucketIndex < BUSINESS_LINE_ORDER.length; bucketIndex++) {
  const codesInBucket = bucketedCodes[bucketIndex];

  if (codesInBucket.length === 0) {
    continue;
  }

  // 同一商業分類內依字典序排序
  codesInBucket.sort();

  for (let codeIndex = 0; codeIndex < codesInBucket.length; codeIndex++) {
    result.push(codesInBucket[codeIndex]);
  }
}
```

### Step 6：回傳排序後的有效優惠券代碼列表

完成所有分類與排序後，回傳最終結果。

```typescript
return result;
```

## 時間複雜度

- 單次掃描所有優惠券進行有效性檢查，時間為 $O(n)$。
- 每個分類桶內進行排序，最壞情況下所有優惠券落在同一桶中，排序成本為 $O(n \log n)$。
- 其餘操作皆為線性或常數時間。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 使用固定大小的分類桶結構（4 個陣列）。
- 額外結果陣列最多存放 $n$ 個代碼。
- 不依賴額外與輸入規模成比例的輔助資料結構。
- 總空間複雜度為 $O(n)$。

> $O(n)$
