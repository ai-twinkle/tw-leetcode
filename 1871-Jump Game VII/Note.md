# 1871. Jump Game VII

You are given a 0-indexed binary string `s` and two integers `minJump` and `maxJump`. 
In the beginning, you are standing at index `0`, which is equal to `'0'`. 
You can move from index `i` to index `j` if the following conditions are fulfilled:

- `i + minJump <= j <= min(i + maxJump, s.length - 1)`, and
- `s[j] == '0'`.

Return `true` if you can reach index `s.length - 1` in `s`, or `false` otherwise.

**Constraints:**

- `2 <= s.length <= 10^5`
- `s[i]` is either `'0'` or `'1'`.
- `s[0] == '0'`
- `1 <= minJump <= maxJump < s.length`

## 基礎思路

本題要求判斷能否從字串起始位置出發，在每次跳躍距離受限於 `[minJump, maxJump]` 的條件下，最終抵達字串最後一個索引；同時所有落腳位置都必須為字元 `'0'`。

在思考解法時，可掌握以下核心觀察：

- **可達性具備傳遞性**：
  若某位置可達，則該位置往後 `[minJump, maxJump]` 範圍內所有為 `'0'` 的位置同樣可達；因此可達性可由前向後依序推導。

- **每個位置的可達性僅取決於固定區間**：
  位置 `i` 是否可達，僅與區間 `[i - maxJump, i - minJump]` 中是否存在任一可達位置有關，與更早的位置無直接關聯。

- **此區間在 i 增長時為固定寬度的滑動窗口**：
  當 `i` 增加 1，窗口同時向右移動 1，左右邊界各自進出一個元素，可用維護當前窗口內可達位置數量的方式快速判斷。

- **目的地必須本身為 `'0'`**：
  若終點為 `'1'`，則無論如何跳躍皆無法落腳，可直接回傳否定結果。

依據以上特性，可以採用以下策略：

- **以一個布林陣列紀錄每個位置是否可達，並初始化起點為可達**。
- **由左至右依序掃描，維護一個寬度為 `maxJump - minJump + 1` 的滑動窗口，動態計算窗口內可達位置的數量**。
- **僅當窗口內存在可達位置且該位置為 `'0'` 時，標記為可達；一旦終點被標記則立即回傳成功**。

此策略能將原本可能達到平方等級的搜尋成本，壓縮為單次線性掃描。

## 解題步驟

### Step 1：提取基本資訊並進行終點快速排除

先取得字串長度與末端索引，並預先快取字元 `'0'` 的 ASCII 編碼以加速比較；
若終點本身不是 `'0'`，則無論如何皆無法抵達，可直接回傳否定結果。

```typescript
const length = s.length;
const lastIndex = length - 1;
const zeroCharCode = 48;

// 提早否決：終點本身必須為 '0'
if (s.charCodeAt(lastIndex) !== zeroCharCode) {
  return false;
}
```

### Step 2：建立可達性陣列並標記起點為可達

使用一個位元緊湊的陣列來記錄每個索引是否可達，並將起點 `0` 標記為可達狀態。

```typescript
// 將可達性旗標打包進 Uint8Array，以利快取友善的存取
const reachable = new Uint8Array(length);
reachable[0] = 1;
```

### Step 3：初始化滑動窗口的可達計數器

使用一個計數器追蹤目前窗口 `[i - maxJump, i - minJump]` 範圍內可達位置的總數，初始為 0。

```typescript
// 滑動窗口 [i - maxJump, i - minJump] 內可達索引的累計計數
let windowReachableCount = 0;
```

### Step 4：滑動窗口右邊界進入新元素

當 `i` 增加時，索引 `(i - minJump)` 剛好進入窗口右側；
若該位置在範圍內且可達，則計數器加 1。

```typescript
for (let i = 1; i < length; i++) {
  // 將窗口右邊界推進：索引 (i - minJump) 剛剛具備資格進入窗口
  const enteringIndex = i - minJump;
  if (enteringIndex >= 0 && reachable[enteringIndex] === 1) {
    windowReachableCount++;
  }

  // ...
}
```

### Step 5：滑動窗口左邊界移除過期元素

同時，索引 `(i - maxJump - 1)` 已經離開窗口的左邊界；
若該位置在範圍內且原本為可達，則計數器需扣回 1，以維持窗口內的真實計數。

```typescript
for (let i = 1; i < length; i++) {
  // Step 4：將窗口右邊界推進

  // 將窗口左邊界推進：索引 (i - maxJump - 1) 剛剛離開窗口
  const leavingIndex = i - maxJump - 1;
  if (leavingIndex >= 0 && reachable[leavingIndex] === 1) {
    windowReachableCount--;
  }

  // ...
}
```

### Step 6：判斷當前位置是否可達並偵測終點

若窗口內存在可達位置且當前字元為 `'0'`，則將此位置標記為可達；
進一步若此位置正好是終點，可立即回傳成功，無需繼續掃描。

```typescript
for (let i = 1; i < length; i++) {
  // Step 4：將窗口右邊界推進

  // Step 5：將窗口左邊界推進

  // 當窗口內至少存在一個可達前驅且當前字元為 '0' 時，標記索引 i 為可達
  if (windowReachableCount > 0 && s.charCodeAt(i) === zeroCharCode) {
    reachable[i] = 1;

    // 一旦終點變為可達，立即短路回傳
    if (i === lastIndex) {
      return true;
    }
  }
}
```

### Step 7：掃描結束仍未抵達終點則回傳失敗

若整個掃描過程中終點始終未被標記為可達，代表無路可走，回傳否定結果。

```typescript
return false;
```

## 時間複雜度

- 主迴圈從索引 `1` 掃描至 `n - 1`，共執行 $n - 1$ 次；
- 每次迭代僅進行常數次窗口邊界更新與字元比較；
- 不存在任何巢狀迴圈或重複掃描。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個長度為 `n` 的可達性陣列；
- 其餘僅使用固定數量的標量變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
