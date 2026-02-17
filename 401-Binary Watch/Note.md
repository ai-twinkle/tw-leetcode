# 401. Binary Watch

A binary watch has 4 LEDs on the top to represent the hours (0-11), and 6 LEDs on the bottom to represent the minutes (0-59). Each LED represents a zero or one, with the least significant bit on the right.

- For example, the below binary watch reads `"4:51"`.

```
H   8   [4]   2    1      [PM]
M [32] [16]   8    4   [2] [1]
```

Given an integer `turnedOn` which represents the number of LEDs that are currently on (ignoring the PM), 
return all possible times the watch could represent. 
You may return the answer in any order.

The hour must not contain a leading zero.

- For example, `"01:00"` is not valid. 
  It should be `"1:00"`.

The minute must consist of two digits and may contain a leading zero.

- For example, `"10:2"` is not valid. 
  It should be `"10:02"`.

**Constraints:**

- `0 <= turnedOn <= 10`

## 基礎思路

本題要找出二進位手錶在「亮燈數量固定」的前提下，所有可能表示的合法時間。手錶由兩個獨立部分組成：上方 4 顆表示小時（0～11），下方 6 顆表示分鐘（0～59），且每個部分的亮燈數量等同於該數值的二進位 `1` 的個數。

在解題時可掌握以下核心觀察：

* **小時與分鐘可獨立計算亮燈數**：總亮燈數等於「小時的 1 個數」加上「分鐘的 1 個數」，因此每個時間都可被歸類到某個亮燈總數的集合中。
* **狀態空間固定且很小**：小時只有 12 種、分鐘只有 60 種，總共 720 種時間狀態，屬於常數規模，可一次枚舉並預先整理。
* **查詢需求可能重複出現**：題目只提供 `turnedOn`（0～10），若每次都重新枚舉會做重複工作；更適合先把所有時間依亮燈數分桶，之後直接用索引取答案。
* **輸出格式需符合規則**：小時不能補前導零、分鐘必須兩位數，因此可預先把分鐘文字格式化成 `"00"..."59"` 以避免每次重組格式。

依據以上特性，可以採用以下策略：

* **預先建立 0～63 的位元 1 個數查表**，用於快速取得小時與分鐘各自的亮燈數。
* **預先建立分鐘的兩位數字串表**，確保輸出格式一致且組合成本為常數。
* **枚舉全部 12 × 60 個時間並依亮燈總數分桶**，得到 `turnedOn = 0...10` 的完整答案集合。
* **查詢時直接回傳對應桶**，達到常數時間回覆。

此策略將所有計算成本集中在一次性初始化，後續每次呼叫都能以 $O(1)$ 取回答案。

## 解題步驟

### Step 1：建立 0～63 的亮燈數查表以支援快速統計

先預先計算每個數字在二進位下 `1` 的個數，之後小時與分鐘都能直接查表取得亮燈數，避免重複計算。

```typescript
// 0...63 的位元 1 個數（涵蓋小時 0...11 與分鐘 0...59）
const BIT_COUNT_0_TO_63 = (() => {
  const table = new Uint8Array(64);
  for (let value = 1; value < 64; value++) {
    table[value] = (table[value >> 1] + (value & 1)) as number;
  }
  return table;
})();
```

### Step 2：預先建立分鐘 `"00"..."59"` 的字串表以固定輸出格式

分鐘必須固定兩位數，因此先把 0～59 的文字表示全部建好，後續組合時間時只需直接取用。

```typescript
// "00"..."59"
const MINUTE_TEXT_0_TO_59 = (() => {
  const table = new Array<string>(60);
  for (let minute = 0; minute < 60; minute++) {
    table[minute] = minute < 10 ? "0" + minute : "" + minute;
  }
  return table;
})();
```

### Step 3：枚舉所有合法時間並依亮燈總數分桶預先整理答案

建立 0～10 共 11 個桶，接著枚舉所有小時與分鐘組合；每個時間計算其亮燈總數後，放入對應桶中，形成之後可直接查詢的結果表。

```typescript
// 預先計算 turnedOn = 0...10 的結果
const TIMES_BY_LED_COUNT = (() => {
  const buckets = Array.from({ length: 11 }, () => [] as string[]);

  for (let hour = 0; hour < 12; hour++) {
    const hourBits = BIT_COUNT_0_TO_63[hour];
    for (let minute = 0; minute < 60; minute++) {
      buckets[hourBits + BIT_COUNT_0_TO_63[minute]].push(
        hour + ":" + MINUTE_TEXT_0_TO_59[minute]
      );
    }
  }

  return buckets;
})();
```

### Step 4：查詢時直接回傳對應亮燈數桶中的所有時間

由於所有答案都已依亮燈數分桶完成，面對任意 `turnedOn` 只需要直接取出對應集合即可，查詢成本為常數。

```typescript
/**
 * 回傳二進位手錶在恰好亮起 `turnedOn` 顆 LED 時的所有可能時間。
 * @param turnedOn - 目前亮起的 LED 數量。
 * @returns 手錶可能表示的所有合法時間。
 */
function readBinaryWatch(turnedOn: number): string[] {
  // 從預先計算的桶中以 O(1) 取答案
  return TIMES_BY_LED_COUNT[turnedOn];
}
```

## 時間複雜度

- 預處理會枚舉固定的 12 × 60 種時間狀態，屬於常數規模。
- 每次查詢僅做一次索引取值並回傳對應集合。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 需要儲存亮燈數查表、分鐘字串表，以及 11 個桶內的所有時間字串。
- 因為總狀態數固定為 720，整體仍為常數額外空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
