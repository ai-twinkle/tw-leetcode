# 2092. Find All People With Secret

You are given an integer `n` indicating there are `n` people numbered from `0` to `n - 1`. 
You are also given a 0-indexed 2D integer array `meetings` where `meetings[i] = [x_i, y_i, time_i]` indicates 
that person `x_i` and person `y_i` have a meeting at `time_i`. 
A person may attend multiple meetings at the same time. 
Finally, you are given an integer `firstPerson`.

Person `0` has a secret and initially shares the secret with a person `firstPerson` at time `0`. 
This secret is then shared every time a meeting takes place with a person that has the secret. 
More formally, for every meeting, if a person `x_i` has the secret at `time_i`, 
then they will share the secret with person `y_i`, and vice versa.

The secrets are shared instantaneously. 
That is, a person may receive the secret and share it with people in other meetings within the same time frame.

Return a list of all the people that have the secret after all the meetings have taken place. 
You may return the answer in any order.

**Constraints:**

- `2 <= n <= 10^5`
- `1 <= meetings.length <= 10^5`
- `meetings[i].length == 3`
- `0 <= x_i, y_i <= n - 1`
- `x_i != y_i`
- `1 <= time_i <= 10^5`
- `1 <= firstPerson <= n - 1`

## 基礎思路

本題描述「秘密」隨著會議時間推進而擴散的過程。關鍵在於：

* **必須依時間順序處理**：秘密只能在會議發生時傳遞，且時間有先後。
* **同一時間內可瞬間多跳傳播**：同一個時間點，若某人剛在一場會議拿到秘密，仍可立刻在同時間的其他會議傳出去。因此同時間的所有會議必須視為「一個同步時間框」處理。
* **跨時間不能保留無效連通關係**：同時間形成的連通群組，只有「包含秘密持有者」的群組才會真的獲得秘密；不包含秘密的群組，即使在該時間內彼此連通，也不能影響後續時間，因此要在處理完該時間後回滾。
* **最後只要判斷是否與秘密來源同群組**：所有會議結束後，凡是與 `0` 同連通群組的人都持有秘密。

因此策略是：

1. 依時間將會議分組，確保能按時間順序處理（避免全排序的成本）。
2. 對同一時間的所有會議建立「暫時連通關係」，讓秘密能在該時間內於群組內瞬間擴散。
3. 該時間處理完後，只保留與秘密來源連通的那些連通關係，其餘參與者回復成獨立狀態（回滾）。
4. 最後掃描所有人，找出與 `0` 同群組者。

## 解題步驟

### Step 1：初始化時間分桶所需結構與範圍

以固定上限時間（題目上限 `1e5`）建立時間桶頭節點陣列，並準備同時間會議的鏈結指標，同時追蹤最小/最大時間以縮小掃描範圍。

```typescript
const meetingCount = meetings.length;
const MAX_TIME = 100000;

// 以時間為索引的鏈結串列頭節點：headByTime[t] 代表時間 t 的第一個會議索引
// 這樣可避免 Array.sort() 的開銷，並以線性方式依時間分組
const headByTime = new Int32Array(MAX_TIME + 1);
headByTime.fill(-1);

// 同一時間桶內的「下一個會議索引」指標（鏈結串列 next）
const nextMeetingIndex = new Int32Array(meetingCount);

let minimumTime = MAX_TIME;
let maximumTime = 0;
```

### Step 2：建立時間分桶（類計數排序分組）

掃描每筆會議，依其 `time` 插入對應時間桶的鏈結串列頭部，並更新 `minimumTime` 與 `maximumTime` 以便後續只掃描出現過的時間區間。

```typescript
// 使用類計數排序的方式建立時間分桶
for (let meetingIndex = 0; meetingIndex < meetingCount; meetingIndex++) {
  const meeting = meetings[meetingIndex];
  const time = meeting[2];

  nextMeetingIndex[meetingIndex] = headByTime[time];
  headByTime[time] = meetingIndex;

  if (time < minimumTime) {
    minimumTime = time;
  }
  if (time > maximumTime) {
    maximumTime = time;
  }
}
```

### Step 3：初始化並查集（每人獨立集合）

使用兩個 TypedArray 來維護並查集：`parent` 指向父節點、`componentSize` 用於按大小合併，初始化時每個人各自成一個集合。

```typescript
// 並查集 parent 與 size（使用 TypedArray 提升速度與快取區域性）
const parent = new Int32Array(n);
const componentSize = new Int32Array(n);

// 初始化 DSU：每個人一開始都是獨立集合
for (let person = 0; person < n; person++) {
  parent[person] = person;
  componentSize[person] = 1;
}
```

### Step 4：輔助函式 `findRoot` 與 `unionSets`

`findRoot` 透過路徑壓縮降低樹高；`unionSets` 透過按大小合併避免退化。這兩者確保大量操作下仍能維持良好效率。

```typescript
/**
 * 尋找節點的根（路徑壓縮）。
 * 路徑壓縮對維持 DSU 操作接近常數時間非常重要。
 *
 * @param node 要查找的節點
 * @returns 根代表
 */
function findRoot(node: number): number {
  while (parent[node] !== node) {
    parent[node] = parent[parent[node]];
    node = parent[node];
  }
  return node;
}

/**
 * 以集合大小合併兩個集合（union-by-size）。
 * 可降低樹高並改善快取行為。
 *
 * @param first 第一個節點
 * @param second 第二個節點
 * @returns 合併後的根代表
 */
function unionSets(first: number, second: number): number {
  let firstRoot = findRoot(first);
  let secondRoot = findRoot(second);

  if (firstRoot === secondRoot) {
    return firstRoot;
  }

  if (componentSize[firstRoot] < componentSize[secondRoot]) {
    const temp = firstRoot;
    firstRoot = secondRoot;
    secondRoot = temp;
  }

  parent[secondRoot] = firstRoot;
  componentSize[firstRoot] += componentSize[secondRoot];
  return firstRoot;
}
```

### Step 5：處理時間 0 的初始秘密分享

題意指出 `0` 在時間 0 會把秘密分享給 `firstPerson`，因此在任何會議前，先把兩人合併成同集合。

```typescript
// 初始秘密傳播（時間 0）：0 與 firstPerson 需先在同一集合
unionSets(0, firstPerson);
```

### Step 6：建立時間戳機制與當時間參與者清單

為了在每個時間點只回滾「該時間出現過的人」，用 `lastSeenStamp` 搭配遞增 `stamp` 來避免每輪清空陣列，並用 `uniqueParticipants` 收集該時間的唯一參與者。

```typescript
// 以時間戳標記「本時間點有出現過的人」避免每輪清空陣列
const lastSeenStamp = new Int32Array(n);
const uniqueParticipants = new Int32Array(n);
let stamp = 0;
```

### Step 7：依時間順序掃描每個時間桶

外層依時間遞增處理；若該時間沒有會議則跳過。每個有會議的時間點會先更新 `stamp` 並重置 `uniqueCount`。

```typescript
for (let time = minimumTime; time <= maximumTime; time++) {
  const firstMeetingAtTime = headByTime[time];
  if (firstMeetingAtTime === -1) {
    continue;
  }

  stamp++;
  let uniqueCount = 0;

  // ...
}
```

### Step 8：在同一時間內合併所有會議，並收集唯一參與者

同一時間內的所有會議都必須先建立連通關係，才能正確模擬「同時間瞬間傳播」。並在處理每筆會議時，把參與者記入 `uniqueParticipants`（以時間戳去重）。

```typescript
for (let time = minimumTime; time <= maximumTime; time++) {
  // Step 7：依時間順序掃描每個時間桶

  // 合併同時間的所有會議，模擬同時間內瞬間分享
  let meetingIndex = firstMeetingAtTime;
  while (meetingIndex !== -1) {
    const meeting = meetings[meetingIndex];
    const firstPersonInMeeting = meeting[0];
    const secondPersonInMeeting = meeting[1];

    unionSets(firstPersonInMeeting, secondPersonInMeeting);

    // 收集本時間點出現過的唯一參與者
    if (lastSeenStamp[firstPersonInMeeting] !== stamp) {
      lastSeenStamp[firstPersonInMeeting] = stamp;
      uniqueParticipants[uniqueCount] = firstPersonInMeeting;
      uniqueCount++;
    }

    if (lastSeenStamp[secondPersonInMeeting] !== stamp) {
      lastSeenStamp[secondPersonInMeeting] = stamp;
      uniqueParticipants[uniqueCount] = secondPersonInMeeting;
      uniqueCount++;
    }

    meetingIndex = nextMeetingIndex[meetingIndex];
  }

  // ...
}
```

### Step 9：回滾未與秘密來源連通的參與者

同時間的會議合併後，只有與 `0` 同集合的參與者才真正拿到秘密；其餘參與者必須回復成獨立集合，避免影響後續時間。

```typescript
for (let time = minimumTime; time <= maximumTime; time++) {
  // Step 7：依時間順序掃描每個時間桶

  // Step 8：合併同時間的所有會議並收集參與者

  // 回滾未與秘密持有者（0）連通的集合
  const secretRoot = findRoot(0);
  for (let index = 0; index < uniqueCount; index++) {
    const participant = uniqueParticipants[index];
    if (findRoot(participant) !== secretRoot) {
      parent[participant] = participant;
      componentSize[participant] = 1;
    }
  }
}
```

### Step 10：掃描所有人並輸出結果

最後只要找出所有與 `0` 同集合的人，即為持有秘密者。

```typescript
// 最終掃描：與 0 同一集合的人即持有秘密
const result: number[] = [];
const finalSecretRoot = findRoot(0);

for (let person = 0; person < n; person++) {
  if (findRoot(person) === finalSecretRoot) {
    result.push(person);
  }
}

return result;
```

## 時間複雜度

- 建立時間分桶：掃描 `meetings.length = m` 次，為 $O(m)$。
- 初始化並查集：掃描 `n` 人，為 $O(n)$。
- 初始化 `headByTime` 並填入 `-1`：長度為 `MAX_TIME + 1`，為 $O(MAX\_TIME)$。
- 依時間掃描區間：`minimumTime..maximumTime` 長度設為 $T = maximumTime - minimumTime + 1$，為 $O(T)$。
- 同時間合併會議：每場會議做一次 `unionSets`，總共 `m` 次；每次 DSU 操作為 $O(\alpha(n))$，合計 $O(m\alpha(n))$。
- 回滾參與者：每個會議最多提供兩個參與者進入「當時間唯一參與者集合」，因此所有時間點的 `uniqueCount` 總和至多為 $2m$，回滾迴圈總成本為 $O(m\alpha(n))$。
- 最終掃描所有人並做 `findRoot`：$O(n\alpha(n))$。
- 總時間複雜度為 $O(MAX\_TIME + T + m\alpha(n) + n\alpha(n))$。

> $O(MAX\_TIME + T + (m + n)\alpha(n))$

## 空間複雜度

- 時間分桶與鏈結陣列：`headByTime` 為 $O(MAX\_TIME)$，`nextMeetingIndex` 為 $O(m)$。
- 並查集結構：`parent`、`componentSize` 為 $O(n)$。
- 時間戳與參與者暫存：`lastSeenStamp`、`uniqueParticipants` 為 $O(n)$。
- 結果陣列最壞情況收集所有人：$O(n)$。
- 總空間複雜度為 $O(MAX\_TIME + m + n)$。

> $O(MAX\_TIME + m + n)$
