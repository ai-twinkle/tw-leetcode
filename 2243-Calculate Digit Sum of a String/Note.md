# 2243. Calculate Digit Sum of a String

You are given a string `s` consisting of digits and an integer `k`.

A round can be completed if the length of `s` is greater than `k`. 
In one round, do the following:

- Divide `s` into consecutive groups of size `k` such that the first `k` characters are in the first group, 
  the next `k` characters are in the second group, and so on. 
  Note that the size of the last group can be smaller than `k`.
- Replace each group of `s` with a string representing the sum of all its digits. 
  For example, `"346"` is replaced with `"13"` because `3 + 4 + 6 = 13`.
- Merge consecutive groups together to form a new string. 
  If the length of the string is greater than `k`, repeat from step `1`.

Return `s` after all rounds have been completed.

**Constraints:**

- `1 <= s.length <= 100`
- `2 <= k <= 100`
- `s` consists of digits only.

## 基礎思路

本題要求反覆將數字字串依固定大小切分成群組，並將每個群組替換為其數字總和的十進位表示，直到字串長度不超過 `k` 為止。
由於每一回合都會產生新的字串，若每回合都進行字串切割與串接，將產生大量不必要的字串建構成本。

在思考解法時，可掌握以下核心觀察：

- **運算本質是數字層級的處理**：
  整個過程只涉及逐位加總與重新拆位，字串僅是表示形式。因此可在一開始就把字元轉為數值，之後全程以數值陣列運算，最後才轉回字串。

- **新字串的長度永遠不會超過舊字串**：
  每個群組至少一個字元，其總和的位數不會多於群組本身的長度。因此寫入位置永遠不會超越讀取位置，可以在同一塊空間中原地覆寫。

- **群組總和的位數有明確上限**：
  每位數字至多為 9，群組最多包含 `k` 位，在約束下總和至多為三位數，因此可直接依總和大小分情況拆出各位數字，不需一般化的轉字串流程。

- **長度會快速收斂**：
  群組總和的位數遠少於群組長度，每經過一到兩個回合，長度便會縮減為原本的常數比例。

依據以上特性，可以採用以下策略：

- **先將字串一次性轉為數字陣列**，避免後續回合重複處理字串。
- **每回合以讀寫雙指標原地處理**：讀取端逐群組加總，寫入端將總和的各位數字依序寫回陣列前段。
- **以寫入端最終位置作為新長度**，持續回合直到長度不超過 `k`。
- **最後將剩餘數字組回字串**並回傳。

此策略讓整個模擬過程只使用一塊固定大小的陣列，既避免了字串反覆建構，也維持線性的處理效率。

## 解題步驟

### Step 1：將字串一次性轉換為數字陣列

先記錄目前的有效長度，再把每個字元依其字元碼轉換為對應的數字，存入型別化陣列。之後的所有回合都只操作此陣列，不再接觸字串。

```typescript
let length = s.length;

// 一次性將字元轉為數字，讓之後的回合完全不需處理字串
const digits = new Uint8Array(length);
for (let index = 0; index < length; index++) {
  digits[index] = s.charCodeAt(index) - 48;
}
```

### Step 2：進入回合迴圈，初始化讀寫指標並決定群組範圍

只要有效長度仍大於 `k`，就再進行一回合。每回合開始時，把寫入指標與讀取指標都歸零；接著在內層迴圈中，以讀取指標為起點，算出當前群組的結束位置。最後一組可能不足 `k` 個，因此結束位置不得超過有效長度。

```typescript
while (length > k) {
  let writeIndex = 0;
  let readIndex = 0;

  while (readIndex < length) {
    let groupEnd = readIndex + k;
    if (groupEnd > length) {
      groupEnd = length;
    }

    // ...
  }

  // ...
}
```

### Step 3：加總當前群組內的所有數字

在確定群組範圍後，從讀取指標開始逐一累加，直到抵達群組結束位置。讀取指標會同步推進到下一組的起點。

```typescript
while (length > k) {
  // Step 2：初始化讀寫指標

  while (readIndex < length) {
    // Step 2：決定當前群組的結束位置

    // 加總當前群組內的所有數字
    let groupSum = 0;
    while (readIndex < groupEnd) {
      groupSum += digits[readIndex];
      readIndex++;
    }

    // ...
  }

  // ...
}
```

### Step 4：將群組總和的各位數字原地寫回陣列

群組總和至多為三位數，因此依其大小分成三種情況，直接拆出百位、十位與個位，依序寫入寫入指標所在位置，並推進寫入指標。由於寫入的位數不會多於讀取的位數，原地覆寫不會破壞尚未讀取的資料。

```typescript
while (length > k) {
  // Step 2：初始化讀寫指標

  while (readIndex < length) {
    // Step 2：決定當前群組的結束位置

    // Step 3：加總當前群組內的所有數字

    // 將總和的十進位各位數字原地寫回（總和至多為 900，因此至多 3 位數）
    if (groupSum >= 100) {
      const hundreds = (groupSum / 100) | 0;
      const remainder = groupSum - hundreds * 100;
      const tens = (remainder / 10) | 0;
      digits[writeIndex] = hundreds;
      digits[writeIndex + 1] = tens;
      digits[writeIndex + 2] = remainder - tens * 10;
      writeIndex += 3;
    } else if (groupSum >= 10) {
      const tens = (groupSum / 10) | 0;
      digits[writeIndex] = tens;
      digits[writeIndex + 1] = groupSum - tens * 10;
      writeIndex += 2;
    } else {
      digits[writeIndex] = groupSum;
      writeIndex++;
    }
  }

  // ...
}
```

### Step 5：以寫入位置更新本回合結束後的有效長度

一回合處理完所有群組後，寫入指標的位置就是新字串的長度。以此更新有效長度，作為下一回合是否繼續的判斷依據。

```typescript
while (length > k) {
  // Step 2：初始化讀寫指標

  while (readIndex < length) {
    // Step 2：決定當前群組的結束位置

    // Step 3：加總當前群組內的所有數字

    // Step 4：將群組總和的各位數字原地寫回陣列
  }

  length = writeIndex;
}
```

### Step 6：將剩餘數字組回字串

所有回合結束後，陣列前段的有效數字即為最終結果，依序串接成字串。

```typescript
// 由剩餘的數字建構最終字串
let result = "";
for (let index = 0; index < length; index++) {
  result += digits[index];
}
```

### Step 7：回傳最終結果

字串建構完成後，直接回傳。

```typescript
return result;
```

## 時間複雜度

- 初始的字元轉換需一次線性掃描，為 $O(n)$；
- 每回合中每個有效數字恰好被讀取一次，單回合成本與當前長度成正比；
- 當 `k >= 3` 時，群組總和的位數遠少於群組長度，每回合長度至少縮減為原本的 $\frac{2}{3}$；
- 當 `k = 2` 時，長度至多每兩回合減半；
- 因此各回合長度構成等比遞減數列，所有回合的總成本為 $O(n)$；
- 最後組回字串需 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個長度為 $n$ 的數字陣列，所有回合皆在其中原地進行；
- 其餘僅使用固定數量的變數；
- 總空間複雜度為 $O(n)$。

> $O(n)$
