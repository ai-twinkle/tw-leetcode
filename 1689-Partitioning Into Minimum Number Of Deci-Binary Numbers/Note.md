# 1689. Partitioning Into Minimum Number Of Deci-Binary Numbers

A decimal number is called deci-binary if each of its digits is either `0` or `1` without any leading zeros. 
For example, `101` and `1100` are deci-binary, while `112` and `3001` are not.

Given a string `n` that represents a positive decimal integer, 
return the minimum number of positive deci-binary numbers needed so that they sum up to `n`.

**Constraints:**

- `1 <= n.length <= 10^5`
- `n` consists of only digits.
- `n` does not contain any leading zeros and represents a positive integer.

## 基礎思路

本題要將一個十進位正整數表示成多個「僅由 0 與 1 組成且無前導 0」的數字相加，並求所需的最少個數。
由於每個加數在任一位上最多只能提供 `1`，因此答案完全由原數各位數的「位需求」決定。

在思考解法時，可掌握以下核心觀察：

* **逐位相加的本質是「每一位需要多少個 1」**：
  對於某一位的數字為 `d`，要用若干個只含 `0/1` 的加數湊出該位的 `d`，必然需要至少 `d` 個加數在該位提供 `1`。

* **最少個數由最大位需求決定**：
  只要加數的數量達到所有位數需求中的最大值，就能安排每個加數在需要的位上放置 `1`，其餘放 `0`，同時滿足各位的需求。

* **因此答案等於字串中出現的最大數字**：
  最大位需求就是字串 `n` 內最大的單一數字，無須真的構造加數，只要找出最大數字即可。

依據以上特性，可以採用以下策略：

* **從高到低檢查是否存在某個數字**，一旦找到第一個存在的數字，即為最大數字，也就是最少加數個數。
* **若字串為正整數，理論上至少包含 `1`**，因此實務上會在 `1..9` 間返回答案；保留 `0` 作為防禦性回傳值。

## 解題步驟

### Step 1：由大到小搜尋字串中出現的最大數字

答案等於 `n` 中出現的最大數字，因此從 `9` 往下檢查，第一個在字串中出現的數字就是答案，可立即回傳。

```typescript
// 答案等於 n 中出現的最大數字，因此從 '9' 往 '1' 檢查
for (let digit = 9; digit > 0; digit--) {
  if (n.includes(`${digit}`)) {
    return digit;
  }
}
```

### Step 2：若未找到任何數字則回傳 0

若 `1` 到 `9` 都未出現，代表字串不符合正整數條件；此處保留回傳 `0` 作為保底結果。

```typescript
return 0;
```

## 時間複雜度

- 需要檢查 `9` 個候選數字（`9` 到 `1`）。
- 每次檢查在長度為 `n` 的字串上進行搜尋。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數與常數額外空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
