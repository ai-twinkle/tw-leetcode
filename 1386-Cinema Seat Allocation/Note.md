# 1386. Cinema Seat Allocation

A cinema has `n` rows of seats, numbered from `1` to `n`. 
Each row has 10 seats, numbered from 1 to 10.

You are given a 2D integer array `reservedSeats`, 
where `reservedSeats[i] = [rowi, seat_i]` means that seat `seat_i` in row `row_i` is already reserved.

A four-person group must be assigned to four seats in the same row. 
The group can be seated in one of the following seat blocks:

- seats `2, 3, 4, 5`
- seats `4, 5, 6, 7`
- seats `6, 7, 8, 9`

A block can be used only if none of its seats are reserved. 
Each seat can be assigned to at most one group.

Return an integer denoting the maximum number of four-person groups that can be assigned.

**Constraints:**

- `1 <= n <= 10^9`
- `1 <= reservedSeats.length <= min(10 * n, 10^4)`
- `reservedSeats[i] == [row_i, seat_i]`
- `1 <= row_i <= n`
- `1 <= seat_i <= 10`
- All `reservedSeats[i]` are distinct.

## 基礎思路

本題要求計算電影院中最多能安排多少組四人座位。
列數上限可達十億，但已預訂的座位數量最多僅有一萬筆，因此**絕對不能逐列掃描**，必須讓計算量僅與訂位資料量相關。

在思考解法時，可掌握以下核心觀察：

- **未被訂位的列具有固定貢獻**：
  一列完全空著時，可同時安排左側與右側兩個區塊，恰好容納兩組。既然絕大多數列都未被觸及，便可先假設全部列皆貢獻兩組，再針對被訂位的列扣除其損失。

- **兩側座位與答案無關**：
  最左與最右的座位不屬於任何一個四人區塊，因此對這些位置的訂位可直接忽略，不會造成任何損失。

- **單列狀態的可能性極為有限**：
  真正會影響結果的只有中間八個座位，其被佔用與否的組合數量固定且極小，因此可以在程式啟動時一次算出所有狀態對應的可容納組數，之後每一列的評估都退化為常數時間的查表。

- **同一列可能出現多筆訂位**：
  必須將散落的訂位資料依列聚合，而列編號的範圍極大且稀疏，故適合以雜湊結構儲存，並在每次更新時只調整該列造成的差值，避免最後再重新掃描一輪。

依據以上特性，可以採用以下策略：

- **預先建立狀態對照表**，將每種座位佔用狀態直接對應到該列仍可安排的組數。
- **以總量扣除損失的方式計算答案**，先假設所有列皆可容納兩組，再累計被訂位列所減少的組數。
- **以開放定址雜湊聚合同列訂位**，每次更新僅以前後狀態的差值增量修正損失，使整體流程維持線性。

此策略使計算量僅取決於訂位資料的筆數，與列數的規模完全脫鉤。

## 解題步驟

### Step 1：建立狀態對照表並判斷三個區塊是否可用

先配置一張涵蓋所有座位佔用狀態的表格，並逐一列舉每種狀態；對每個狀態分別檢查左、中、右三個四人區塊是否完全沒有座位被佔用。

```typescript
/**
 * 建立一張對照表，將座位 2..9 的訂位位元遮罩
 * 對應到該列仍可安排的四人組數量。
 * 當座位被訂走時，第 (seat - 2) 個位元會被設為 1。
 * @returns 一張以列遮罩為索引、共 256 筆的對照表。
 */
function buildGroupsByMaskTable(): Uint8Array {
  const table = new Uint8Array(256);
  for (let mask = 0; mask < 256; mask++) {
    // 左側區塊 = 座位 2..5，中間區塊 = 座位 4..7，右側區塊 = 座位 6..9。
    const isLeftFree = (mask & 0x0f) === 0;
    const isMiddleFree = (mask & 0x3c) === 0;
    const isRightFree = (mask & 0xf0) === 0;

    // ...
  }

  // ...
}
```

### Step 2：依可用區塊組合填入組數並回傳表格

當左右兩側同時可用時，兩者互不重疊，可安排兩組；若三個區塊中至少有一個可用，則只能安排一組；否則該列無法安排任何一組。填完所有狀態後回傳此表。

```typescript
function buildGroupsByMaskTable(): Uint8Array {
  // Step 1：配置對照表

  for (let mask = 0; mask < 256; mask++) {
    // Step 1：判斷左、中、右三個區塊是否可用

    if (isLeftFree && isRightFree) {
      table[mask] = 2;
    } else if (isLeftFree || isMiddleFree || isRightFree) {
      table[mask] = 1;
    } else {
      table[mask] = 0;
    }
  }
  return table;
}
```

### Step 3：建立全域共用的預先計算表格

在模組載入時就完成表格建構，使後續每次呼叫都能直接查表，將單列的評估壓縮為常數時間。

```typescript
/** 供每次呼叫共用的預先計算表格，使每一列的評估為 O(1)。 */
const GROUPS_BY_MASK = buildGroupsByMaskTable();
```

### Step 4：配置開放定址雜湊表

先取得訂位筆數，並依此決定雜湊表容量：取二的冪次以便用位元遮罩取代取餘運算，同時讓負載因子維持在 0.5 以下以降低探測次數。接著分別配置儲存列編號與座位遮罩的陣列。

```typescript
const reservedCount = reservedSeats.length;

// 使用開放定址雜湊表，容量取為二的冪次，使負載因子維持在 0.5 以下。
let capacity = 16;
while (capacity < reservedCount * 2) {
  capacity <<= 1;
}
const slotMask = capacity - 1;
const rowKeys = new Int32Array(capacity);
const rowSeatMasks = new Uint8Array(capacity);
```

### Step 5：初始化損失累計並略過無關座位

由於預設每一列都能安排兩組，因此只需累計被訂位列所造成的損失。逐筆掃描訂位資料時，先取出座位編號；最左與最右的座位不屬於任何區塊，可直接跳過。

```typescript
// 每一列若未被觸及都能安排 2 組，因此只需追蹤被觸及列所造成的損失。
let unavailableGroups = 0;

for (let index = 0; index < reservedCount; index++) {
  const reservation = reservedSeats[index];
  const seat = reservation[1];

  // 座位 1 與 10 不屬於任何區塊，因此永遠不會減少答案。
  if (seat === 1 || seat === 10) {
    continue;
  }

  // ...
}
```

### Step 6：計算座位對應位元並求得雜湊起始槽位

將座位編號映射為該列狀態中的對應位元，接著以乘法雜湊搭配位移互斥或，把列編號的高位資訊擴散到低位，得到分佈均勻的起始槽位。

```typescript
for (let index = 0; index < reservedCount; index++) {
  // Step 5：取出訂位資料並略過座位 1 與 10

  const row = reservation[0];
  const seatBit = 1 << (seat - 2);

  // 以 Fibonacci 雜湊搭配 xor-shift，將高位擴散到槽位索引中。
  const hash = Math.imul(row, 0x9e3779b1);
  let slot = (hash ^ (hash >>> 15)) & slotMask;

  // ...
}
```

### Step 7：線性探測命中既有列時以差值更新損失

從起始槽位開始探測，若該槽位已記錄相同的列編號，則將此座位併入該列的狀態；只有在狀態確實改變時才需更新，並以查表所得的前後組數差值增量修正累計損失。

```typescript
for (let index = 0; index < reservedCount; index++) {
  // Step 5：取出訂位資料並略過座位 1 與 10

  // Step 6：計算座位位元與雜湊起始槽位

  while (true) {
    const key = rowKeys[slot];
    if (key === row) {
      const previousMask = rowSeatMasks[slot];
      const updatedMask = previousMask | seatBit;
      if (updatedMask !== previousMask) {
        rowSeatMasks[slot] = updatedMask;
        // 僅以此列的差值調整累計損失。
        unavailableGroups += GROUPS_BY_MASK[previousMask] - GROUPS_BY_MASK[updatedMask];
      }
      break;
    }

    // ...
  }
}
```

### Step 8：遇到空槽位時插入新列，否則向後繼續探測

若探測到尚未使用的槽位，代表此列是第一次被觸及，需寫入列編號與座位狀態，並以「原本兩組」與「現在可容納組數」的差額累計損失；若槽位已被其他列佔用，則往下一個槽位繼續探測。

```typescript
for (let index = 0; index < reservedCount; index++) {
  // Step 5：取出訂位資料並略過座位 1 與 10

  // Step 6：計算座位位元與雜湊起始槽位

  while (true) {
    // Step 7：命中既有列時以差值更新損失

    if (key === 0) {
      rowKeys[slot] = row;
      rowSeatMasks[slot] = seatBit;
      unavailableGroups += 2 - GROUPS_BY_MASK[seatBit];
      break;
    }
    slot = (slot + 1) & slotMask;
  }
}
```

### Step 9：以總量扣除損失得出答案

所有訂位資料處理完畢後，將「全部列皆可安排兩組」的理論上限扣掉累計的損失，即為最終可安排的四人組數量。

```typescript
return 2 * n - unavailableGroups;
```

## 時間複雜度

- 預先建構狀態對照表需列舉固定的 256 種狀態，為 $O(1)$；
- 雜湊表容量的倍增僅需 $O(\log m)$ 次位移，其中 $m$ 為訂位筆數；
- 每筆訂位僅做一次查表與均攤常數次的線性探測，共 $O(m)$；
- 最終以常數時間完成扣除運算。
- 總時間複雜度為 $O(m)$。

> $O(m)$

## 空間複雜度

- 狀態對照表大小固定，為 $O(1)$；
- 雜湊表的列編號與座位遮罩陣列容量與訂位筆數成正比，為 $O(m)$；
- 其餘僅使用固定數量的變數。
- 總空間複雜度為 $O(m)$。

> $O(m)$
