# 1910. Remove All Occurrences of a Substring

Given two strings `s` and `part`, perform the following operation on `s` until all occurrences of the substring `part` are removed:

- Find the leftmost occurrence of the substring `part` and remove it from `s`.
- Return `s` after removing all occurrences of `part`.

A substring is a contiguous sequence of characters in a string.

## 基礎思路
題目要求從字串 `s` 中刪除所有出現的子字串 `part`。可以採用以下三種方式來逐步移除 `part`：

1. **使用 Stack**  
   逐一將 `s` 的字元推入 stack，並在 stack 長度足夠時檢查尾端是否剛好形成 `part`，若符合則刪除該部分。

2. **使用 while 與 includes**  
   只要 `s` 中仍包含 `part`，就利用內建方法 `replace` 刪除第一個符合項，直到完全移除。

3. **使用遞迴**  
   每次檢查 `s` 是否含有 `part`，若有則移除一次並以新字串再次呼叫自己，直到 `s` 中不再包含 `part`。

## 解題步驟

### Method 1: 使用 Stack 來刪除 `part`

```typescript
function removeOccurrences(s: string, part: string): string {
  const stack: string[] = [];
  for (const char of s) {
    stack.push(char);
    // 當 stack 長度足夠時，檢查尾端是否形成 part
    if (stack.length >= part.length &&
        stack.slice(-part.length).join('') === part) {
      stack.splice(-part.length);
    }
  }
  return stack.join('');
}
```

- **時間複雜度**：  
  每個字元都進行比對，最壞情況下比對需要 $O(k)$（其中 $k = part$ 長度），因此時間複雜度為 $O(n * k)$。

- **空間複雜度**：  
  需要額外的 stack 存放最多 n 個字元，故為 $O(n)$。

---

### Method 2: 使用 while 與 includes 來刪除 `part`

```typescript
function removeOccurrences(s: string, part: string): string {
  while (s.includes(part)) {
    s = s.replace(part, '');
  }
  return s;
}
```

- **時間複雜度**：  
  每次使用 `includes` 與 `replace` 都需掃描整個字串，若最壞情況下需進行 $O(n)$ 次替換，每次操作為 $O(n)$，故總時間複雜度為 $O(n^2)$。

- **空間複雜度**：  
  主要儲存新的字串，為 $O(n)$。

---

### Method 3: 使用遞迴來刪除 `part`

```typescript
function removeOccurrences(s: string, part: string): string {
  return s.includes(part) ? removeOccurrences(s.replace(part, ''), part) : s;
}
```

- **時間複雜度**：  
  與方法 2 相同，每次呼叫都會進行一次掃描和替換，最壞情況下遞迴深度達 $O(n)$（若 part 長度為常數），總時間複雜度為 $O(n^2)$

- **空間複雜度**：  
  除了存放字串外，遞迴呼叫的棧深最壞可達 $O(n)$，因此空間複雜度為 $O(n)$。
