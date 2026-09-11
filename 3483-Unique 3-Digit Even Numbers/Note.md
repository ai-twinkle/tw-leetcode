# 3483. Unique 3-Digit Even Numbers

You are given an array of digits called `digits`. 
Your task is to determine the number of distinct three-digit even numbers that can be formed using these `digits`.

Note: Each copy of a digit can only be used once per number, and there may not be leading zeros.

**Constraints:**

- `3 <= digits.length <= 10`
- `0 <= digits[i] <= 9`

## 基礎思路

本題要求計算：從給定的數字池中，能組成多少個**相異**的三位數偶數，且每個數字的每一份副本在同一個數中最多只能使用一次，並且百位不得為零。

在思考解法時，可掌握以下核心觀察：

- **答案的計數對象是「數值」而非「排列方式」**：
  只要組成的三位數數值相同，即視為同一個答案，因此不能對副本逐一枚舉，而應以「相異數值」為單位計數。

- **三個位置的限制互相獨立又彼此牽連**：
  個位必須是偶數、百位不得為零，這兩個限制彼此獨立；但十位能選什麼，取決於前兩個位置已經消耗掉哪些副本，故存在牽連關係。

- **候選數字的種類數極小**：
  數字只有 0 到 9 共十種，個位的合法選擇最多只有五種、百位最多只有九種，因此「固定兩端、再計算中間可選數」的枚舉規模是常數級。

- **副本數量決定端點是否會排擠中間位置**：
  若某個端點所用的數字在池中還有其他副本，中間位置仍可再次選用它；唯有當池中恰好只有一份時，該數字才會從中間的可選集合裡消失。這也代表我們只需知道「每個數字有幾份」，而不需知道它們的排列位置。

- **兩端使用同一個數字是特殊情況**：
  當百位與個位是同一個數字時，必須有兩份以上的副本；而此時被消耗的只有這一個數字，最多只會讓中間的可選集合減少一種。

依據以上特性，可以採用以下策略：

- **先統計每個數字的出現次數**，讓後續任何「是否還可用」的查詢都是常數時間。
- **預先算出相異數字的種類數**，作為中間位置可選數量的基準值。
- **枚舉所有合法的個位與百位組合**，再依據兩端消耗的副本情況，由基準值扣除被耗盡的種類，得到該組合對應的中間可選數量並累加。

此策略以次數表取代實際排列的枚舉，天然避免重複計數，並讓整體計算量維持在常數規模。

## 解題步驟

### Step 1：預先定義合法的個位數字集合

三位數偶數的個位只能是偶數，先將這五個候選數字定義為常數表，供後續枚舉使用。

```typescript
/** 三位數偶數的個位所允許的數字。 */
const EVEN_UNIT_DIGITS = new Uint8Array([0, 2, 4, 6, 8]);
```

### Step 2：統計每個數字的出現次數

先掃描一次輸入，將這個多重集合分桶統計，使後續任何「某數字是否仍可用、還有幾份」的判斷都只需常數時間。

```typescript
// 先將多重集合分桶統計一次，使後續所有可用性檢查皆為 O(1)。
const digitCounts = new Uint8Array(10);
const digitsLength = digits.length;
for (let index = 0; index < digitsLength; index += 1) {
  digitCounts[digits[index]] += 1;
}
```

### Step 3：計算相異數字的種類數

十位可以選用任何「仍然可用」的相異數字，因此數字池中的相異種類數即為中間位置可選數量的基準值。

```typescript
// 中間位置可接受任何仍可用的相異數字，故數字池的種類數即為基準值。
let distinctDigits = 0;
for (let digit = 0; digit < 10; digit += 1) {
  if (digitCounts[digit] > 0) {
    distinctDigits += 1;
  }
}
```

### Step 4：枚舉個位候選數字並確認其可用性

初始化累計答案後，逐一取出偶數表中的候選數字作為個位；若該數字在池中完全不存在，則此候選無法成立，直接跳過。

```typescript
let total = 0;
for (let unitIndex = 0; unitIndex < 5; unitIndex += 1) {
  const unitDigit = EVEN_UNIT_DIGITS[unitIndex];
  const unitCount = digitCounts[unitDigit];
  if (unitCount === 0) {
    continue;
  }

  // ...
}
```

### Step 5：枚舉百位候選數字並確認其可用性

在固定個位之後，從 1 開始枚舉百位候選數字（從 1 起始即自然排除了前導零）；若該數字在池中不存在，同樣跳過。

```typescript
for (let unitIndex = 0; unitIndex < 5; unitIndex += 1) {
  // Step 4：取出個位候選數字並確認其可用性

  for (let hundredDigit = 1; hundredDigit < 10; hundredDigit += 1) {
    const hundredCount = digitCounts[hundredDigit];
    if (hundredCount === 0) {
      continue;
    }

    // ...
  }
}
```

### Step 6：處理百位與個位為同一個數字的情況

當兩端使用相同的數字時，必須具備兩份以上的副本才能成立。若副本恰好為兩份，則該數字會被耗盡，中間可選種類需減一；若副本超過兩份，中間仍可再次選用它，故維持基準值。

```typescript
for (let unitIndex = 0; unitIndex < 5; unitIndex += 1) {
  // Step 4：取出個位候選數字並確認其可用性

  for (let hundredDigit = 1; hundredDigit < 10; hundredDigit += 1) {
    // Step 5：取出百位候選數字並確認其可用性

    if (hundredDigit === unitDigit) {
      // 兩端消耗同一個數字，因此必須具備兩份副本。
      if (hundredCount < 2) {
        continue;
      }
      // 取用兩份副本只可能耗盡這一個數字，絕不會影響其他數字。
      if (hundredCount === 2) {
        total += distinctDigits - 1;
      } else {
        total += distinctDigits;
      }
      continue;
    }

    // ...
  }
}
```

### Step 7：處理兩端為不同數字的情況並累計答案

當兩端為相異數字時，以基準值為起點，分別檢查兩個端點所用的數字是否因池中僅有一份而被耗盡；每耗盡一種便扣除一個中間選擇，最後將結果累加到答案。

```typescript
for (let unitIndex = 0; unitIndex < 5; unitIndex += 1) {
  // Step 4：取出個位候選數字並確認其可用性

  for (let hundredDigit = 1; hundredDigit < 10; hundredDigit += 1) {
    // Step 5：取出百位候選數字並確認其可用性

    // Step 6：處理百位與個位為同一個數字的情況

    // 唯有當數字池中恰好只有一份副本時，端點使用後才會讓中間的可選集合減少。
    let middleChoices = distinctDigits;
    if (hundredCount === 1) {
      middleChoices -= 1;
    }
    if (unitCount === 1) {
      middleChoices -= 1;
    }
    total += middleChoices;
  }
}
```

### Step 8：回傳最終統計結果

所有合法的兩端組合皆已列舉完畢，累計值即為相異三位數偶數的總數，直接回傳。

```typescript
return total;
```

## 時間複雜度

- 分桶統計需掃描輸入一次，為 $O(n)$，其中 $n$ 為數字池的長度；
- 計算相異種類數需固定掃描十個桶，為常數時間；
- 兩端枚舉最多為 5 × 9 種組合，每種組合僅做常數次判斷與累加；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定長度為 10 的次數表與數個純量變數；
- 不隨輸入規模成長而配置額外空間；
- 總空間複雜度為 $O(1)$。

> $O(1)$
