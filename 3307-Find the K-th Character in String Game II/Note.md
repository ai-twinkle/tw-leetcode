# 3307. Find the K-th Character in String Game II

Alice and Bob are playing a game. 
Initially, Alice has a string `word = "a"`.

You are given a positive integer `k`. 
You are also given an integer array operations, where `operations[i]` represents the type of the $i^{th}$ operation.

Now Bob will ask Alice to perform all operations in sequence:

- If `operations[i] == 0`, append a copy of word to itself.
- If `operations[i] == 1`, generate a new string by changing each character in `word` to its next character in the English alphabet, and append it to the original `word`. 
  For example, performing the operation on `"c"` generates `"cd"` and performing the operation on `"zb"` generates `"zbac"`.

Return the value of the $k^{th}$ character in `word` after performing all the operations.

Note that the character `'z'` can be changed to `'a'` in the second type of operation.

**Constraints:**

- `1 <= k <= 10^14`
- `1 <= operations.length <= 100`
- `operations[i]` is either 0 or 1.
- The input is generated such that `word` has at least `k` characters after all operations.

## 基礎思路

本題關鍵在於發現每一次操作後字串長度會倍增，若直接模擬字串構造，必定造成記憶體溢出。
因此必須採用**逆向推導**的策略：

- 考慮題目給定的位置 $k$，我們從最終狀態反向推回原始狀態，確認這個字元經歷了哪些操作。
- 每次反推時：
  - 若遇到操作類型為 $0$，則該位置對應到原字串的前半段，無其他影響；
  - 若遇到操作類型為 $1$，則該位置同樣對應到前半段，但需紀錄一次字母向後移動。
- 透過不斷重複上述步驟，直到回推到最初位置（位置為 $1$）為止，累積的移動次數即可推算出第 $k$ 個字元的正確答案。

此策略確保即使字串長度指數成長，也可高效處理極大的 $k$ 值。

## 解題步驟

### Step 1：初始化位移計數器

初始化一個變數，記錄字元經過「向後位移」的總次數：

```typescript
let shiftCount = 0; // 記錄字元需向後移動的總次數
```

### Step 2：反向推算位置來源

從目標位置 $k$ 開始，反向追蹤其在前一次操作的位置，直到回溯至初始位置為止：

- `operationIndex` 透過 $\lfloor\log_2(k)\rfloor$ 判斷位置 $k$ 所屬的操作次數。
- 若位置剛好落在邊界（2 的次方），修正索引至前一次操作。
- 若操作為類型 $1$，則位置回溯時必須累積一次位移。

```typescript
while (k !== 1) { // 當位置尚未回溯到起始字元時持續進行
  let operationIndex = Math.floor(Math.log2(k)); // 計算當前位置對應的操作索引

  // 若 k 恰為 2 的次方邊界位置，須調整到前一操作索引
  if (Number(1n << BigInt(operationIndex)) === k) {
    operationIndex--;
  }

  // 透過減去此操作新增部分的長度，映射回前一操作位置
  k -= Number(1n << BigInt(operationIndex));

  // 若此操作類型為 1，需累積一次字元向後位移
  if (operations[operationIndex]) {
    shiftCount++;
  }
}
```

### Step 3：計算並返回最終字元

最後依據累積的位移次數計算答案：

```typescript
return String.fromCharCode(
  'a'.charCodeAt(0) + (shiftCount % 26)
);
```

* 由於字母循環周期為 26，因此對位移次數取餘後即可得正確的字元位置。

## 時間複雜度

- 反推過程最多執行 `operations` 陣列的長度次，每次計算 $\log_2$ 與位元運算皆為 $O(1)$。
- 總時間複雜度為 $O(m)$，其中 $m$ 為 `operations` 的長度。

> $O(m)$

## 空間複雜度

- 僅使用常數個額外變數進行追蹤，無需動態配置任何資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
