# 1910. Remove All Occurrences of a Substring

Given two strings `s` and `part`, perform the following operation on `s` until all occurrences of the substring `part` are removed:

- Find the leftmost occurrence of the substring `part` and remove it from `s`.
- Return `s` after removing all occurrences of `part`.

A substring is a contiguous sequence of characters in a string.

## 基礎思路

題目要求從字串 `s` 中刪除所有出現的子字串 `part`。
每次檢查 `s` 是否含有 `part`，若有則移除一次並以新字串再次呼叫自己，直到 `s` 中不再包含 `part`。

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
