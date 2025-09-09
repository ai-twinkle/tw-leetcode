# 2327. Number of People Aware of a Secret

On day `1`, one person discovers a secret.

You are given an integer `delay`, which means that each person will share the secret with a new person every day, starting from `delay` days after discovering the secret. 
You are also given an integer `forget`, which means that each person will `forget` the secret forget days after discovering it. 
A person cannot share the secret on the same day they forgot it, or on any day afterwards.

Given an integer `n`, return the number of people who know the secret at the end of day `n`. 
Since the answer may be very large, return it modulo `10^9 + 7`.

**Constraints:**

- `2 <= n <= 1000`
- `1 <= delay < forget <= n`

## 基礎思路

這題是在模擬「祕密傳播」的過程：第 1 天只有 1 個人知道祕密；每個人在知道祕密 **滿 `delay` 天後才開始每天各分享給 1 個新的人**，並在 **滿 `forget` 天時就遺忘**（當天起不可再分享）。
若以第 `d` 天為基準，今天能分享的人，正是那些在區間 **\[`d - forget + 1`, `d - delay`]** 這些天「剛學到祕密的人」。因此，今天新增學到祕密的總數就是這個區間內「每日新學到的人數」之和。

直接每天做區間加總會是 $O(n^2)$；關鍵在於用**滑動視窗**把「可分享人數」視為上述區間的移動總和：

- 當天加入 `d - delay` 這一天的新學者（因為他們今天起可分享）。
- 同步移除 `d - forget` 這一天的新學者（因為他們今天起遺忘，不可再分享）。
  同時維護「仍記得祕密的人數」作為答案，對上限取模即可。

## 解題步驟

### Step 1：初始化常數與每日新學者記錄

建立模數與一個長度 `n + 1` 的型別化陣列，記錄「每天新學到祕密的人數」。第 1 天有 1 人知道祕密。

```typescript
const MOD = 1_000_000_007;

// 1. 初始化型別化陣列以記錄每天新學到祕密的人數
const newLearners = new Int32Array(n + 1);
newLearners[1] = 1;
```

### Step 2：初始化追蹤變數

維護兩個量：

- 「今天可分享的人數」：代表當天會帶來的新學者數。
- 「仍記得祕密的人數」：用來在最後回傳答案。

```typescript
// 2. 追蹤變數
let numberShareable = 0;   // 今天有資格分享的人數
let numberRemembering = 1; // 第 1 天結束時仍記得的人數
```

### Step 3：主迴圈（第 2 天到第 n 天），用滑動視窗更新

對於每天 `day`：

- 先讓「遺忘日 = day - forget」這批人從「仍記得」中移除；若也在可分享名單中，同步從可分享移除。
- 再把「開始分享日 = day - delay」這批人加入「可分享」。
- 當天新學者數就是目前「可分享」的人數；更新兩個統計量並做模數維護。

```typescript
// 3. 從第 2 天處理到第 n 天
for (let day = 2; day <= n; day++) {
  const indexToStartSharing = day - delay;
  const indexToForget = day - forget;

  // 今天會遺忘的人（把其從仍記得的總數扣掉）
  if (indexToForget >= 1) {
    numberRemembering -= newLearners[indexToForget];
    if (numberRemembering < 0) {
      numberRemembering += MOD;
    }
  }

  // 新增「今天開始可以分享」的人（delay 天前學到的人）
  if (indexToStartSharing >= 1) {
    numberShareable += newLearners[indexToStartSharing];
    if (numberShareable >= MOD) {
      numberShareable -= MOD;
    }
  }

  // 從可分享名單中移除「今天剛遺忘」的人
  if (indexToForget >= 1) {
    numberShareable -= newLearners[indexToForget];
    if (numberShareable < 0) {
      numberShareable += MOD;
    }
  }

  // 指派「今天的新學者數」= 目前可分享的人數
  const todaysNewLearners = numberShareable;
  newLearners[day] = todaysNewLearners;

  // 更新仍記得的人數（加入今天的新學者），並取模
  numberRemembering += todaysNewLearners;
  if (numberRemembering >= MOD) {
    numberRemembering -= MOD;
  }
}
```

### Step 4：回傳答案

第 `n` 天結束時「仍記得祕密的人數」即為答案。

```typescript
// 4. 最終答案為第 n 天結束時仍記得的人數
return numberRemembering;
```

## 時間複雜度

- 透過滑動視窗，每一天的更新皆為 $O(1)$，總共迭代 `n` 天。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需要一個長度為 `n + 1` 的陣列記錄每天新學者數，額外只用到常數變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
