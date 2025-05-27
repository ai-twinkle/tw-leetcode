# 1910. Remove All Occurrences of a Substring

Given two strings `s` and `part`, perform the following operation on `s` until all occurrences of the substring `part` are removed:

- Find the leftmost occurrence of the substring `part` and remove it from `s`.
- Return `s` after removing all occurrences of `part`.

A substring is a contiguous sequence of characters in a string.

**Constraints:**

- `1 <= s.length <= 1000`
- `1 <= part.length <= 1000`
- `s` and `part` consists of lowercase English letters.

## 基礎思路

這題要求我們反覆移除字串中所有出現的指定子字串，直到完全不存在為止。

我們可以將這個問題視為一個「持續移除」的過程：

- 每次只移除最左側（第一個出現）的 `part` 子字串。
- 必須持續這個動作直到整個字串中不再包含 `part`。

針對這種「持續移除、直到條件不再成立」的情境，實作上常見的兩種方式有：

- 遞迴法：不斷判斷字串中是否還有 `part`，有則移除後遞迴處理新的字串；否則結束遞迴。
- 迴圈法：用迴圈重複檢查與移除，直到再也找不到 `part` 為止。

在本題的約束下，任一方法都可以保證最終結果已經完全清除所有 `part` 子字串。

## 解題步驟

### Step 1: 使用遞迴來刪除 `part`

```typescript
function removeOccurrences(s: string, part: string): string {
  return s.includes(part) ? removeOccurrences(s.replace(part, ''), part) : s;
}
```

## 時間複雜度

- 每次呼叫都會進行一次掃描和替換，最壞情況下遞迴深度達 $O(n)$（若 part 長度為常數）。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 除了存放字串外，遞迴呼叫的棧深最壞可達 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
