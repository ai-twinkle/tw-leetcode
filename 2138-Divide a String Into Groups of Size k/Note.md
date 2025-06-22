# 2138. Divide a String Into Groups of Size k

A string `s` can be partitioned into groups of size `k` using the following procedure:

- The first group consists of the first `k` characters of the string, 
  the second group consists of the next `k` characters of the string, and so on. 
  Each element can be a part of exactly one group.
- For the last group, if the string does not have `k` characters remaining, a character `fill` is used to complete the group.

Note that the partition is done so that after removing the `fill` character from the last group (if it exists) 
and concatenating all the groups in order, the resultant string should be `s`.

Given the string `s`, the size of each group `k` and the character `fill`, 
return a string array denoting the composition of every group `s` has been divided into, using the above procedure.

**Constraints:**

- `1 <= s.length <= 100`
- `s` consists of lowercase English letters only.
- `1 <= k <= 100`
- `fill` is a lowercase English letter.

## 基礎思路

本題的核心目標是將給定字串 `s` 按照固定大小 `k` 分割成數個群組，並在最後一組不足時透過指定的填充字元 `fill` 補滿。

我們可以透過以下步驟來實現這個目標：

1. **計算所需群組數量**：藉由字串長度除以每組大小 `k`，使用向上取整以確保所有字元皆能完整分配。
2. **預先產生填充字串**：為加速後續的補足動作，先建立一個長度恰好為 `k` 的填充字串，便於快速取用。
3. **逐組提取字串片段**：透過循環以每次取出大小為 `k` 的片段。
4. **檢查與補足**：若某組提取的字元數量不足 `k`，則使用預先產生的填充字串補齊該組。

透過上述步驟，即可高效完成字串的分組處理。

## 解題步驟

### Step 1：計算群組數量並準備填充字串和結果陣列

```typescript
// 計算會有多少個群組
const totalGroups = Math.ceil(s.length / k);

// 預先產生填充字串，長度為 k，以便快速切片使用
const fullFillString = fill.repeat(k);

// 一次性配置儲存所有結果的陣列
const result: string[] = new Array(totalGroups);
```

### Step 2：逐步切割並補足每組的內容

```typescript
for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
  const startIndex = groupIndex * k;
  const endIndex = startIndex + k;

  // 取出最多 k 個字元作為該組片段
  let groupSegment = s.substring(startIndex, endIndex);

  // 若最後一組字元不足 k，則透過填充字串補滿缺少的部分
  if (groupSegment.length < k) {
    groupSegment += fullFillString.slice(0, k - groupSegment.length);
  }

  // 存入結果陣列
  result[groupIndex] = groupSegment;
}
```

### Step 3：回傳處理完成的群組陣列

```typescript
return result;
```

## 時間複雜度

- 遍歷整個字串一次，操作數量與字串長度成正比。
- 總時間複雜度為 $O(n)$，其中 $n$ 為字串長度。

> $O(n)$

## 空間複雜度

- 使用額外的陣列儲存所有群組，長度為 $\frac{n}{k}$，總量仍與字串長度 $n$ 成正比。
- 使用額外的填充字串長度為 $k$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
