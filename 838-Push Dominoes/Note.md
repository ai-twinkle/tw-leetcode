# 838. Push Dominoes

There are `n` dominoes in a line, and we place each domino vertically upright. 
In the beginning, we simultaneously push some of the dominoes either to the left or to the right.

After each second, each domino that is falling to the left pushes the adjacent domino on the left. 
Similarly, the dominoes falling to the right push their adjacent dominoes standing on the right.

When a vertical domino has dominoes falling on it from both sides, it stays still due to the balance of the forces.

For the purposes of this question, we will consider that a falling domino expends no additional force to a falling or already fallen domino.

You are given a string `dominoes` representing the initial state where:

- `dominoes[i] = 'L'`, if the $i^{th}$ domino has been pushed to the left,
- `dominoes[i] = 'R'`, if the $i^{th}$ domino has been pushed to the right, and
- `dominoes[i] = '.'`, if the $i^{th}$ domino has not been pushed.

Return a string representing the final state.

**Constraints:**

- `n == dominoes.length`
- `1 <= n <= 105`
- `dominoes[i]` is either `'L'`, `'R'`, or `'.'`.

## 基礎思路

本題的核心在於模擬一排多米諾骨牌相互推倒後的穩定狀態。由題意可知，每個骨牌初始狀態為：

- 向左推倒 (`'L'`)
- 向右推倒 (`'R'`)
- 保持直立 (`'.'`)

根據骨牌推倒的特性：

- 當兩側推力相同（例如：`L...L`或`R...R`），中間的骨牌將全部朝該方向倒下。
- 當兩側推力相反且為`R...L`，則兩邊向內同時推倒骨牌，直到中間位置。若中間位置剛好一個，則保持直立。
- 當兩側推力相反且為`L...R`，則中間的骨牌保持直立不受影響。

基於此，我們可設置兩個虛擬邊界：

- 左側索引 `-1` 處設為推力 `'L'`，方便處理開頭連續未推的骨牌。
- 右側索引 `n` 處設為推力 `'R'`，方便處理結尾連續未推的骨牌。

透過單次線性掃描，逐步更新骨牌狀態，即可得到答案。

## 解題步驟

### Step 1: 初始化資料結構與邊界

將輸入字串轉換成可修改的陣列，同時設定前一次推倒的方向與位置：

```typescript
const length = dominoes.length;
const resultChars = dominoes.split('');
let previousForceIndex = -1; // 前一次推力位置，虛擬邊界為 -1
let previousForce = 'L';     // 前一次推力方向，初始為 'L'
```

### Step 2: 線性掃描與狀態更新

遍歷整個陣列，並且在最後一個位置之後加上虛擬邊界（視為`'R'`）：

```typescript
for (let currentIndex = 0; currentIndex <= length; currentIndex++) {
  const currentForce = currentIndex < length ? resultChars[currentIndex] : 'R';
  if (currentForce === '.') continue;

  if (previousForce === currentForce) {
    // 若前後推力相同，區間內骨牌倒向同一方向
    for (let k = previousForceIndex + 1; k < currentIndex; k++) {
      resultChars[k] = currentForce;
    }
  } else if (previousForce === 'R' && currentForce === 'L') {
    // 若前推力為右、後推力為左，兩端向內倒下
    let leftPointer = previousForceIndex + 1;
    let rightPointer = currentIndex - 1;
    while (leftPointer < rightPointer) {
      resultChars[leftPointer++] = 'R';
      resultChars[rightPointer--] = 'L';
    }
    // 若兩指針相遇，該骨牌保持直立
  }
  // previousForce 為 'L' 且 currentForce 為 'R' 時，區間內保持直立

  previousForce = currentForce;
  previousForceIndex = currentIndex;
}
```

### Step 3: 輸出結果

最終將陣列合併為字串後輸出：

```typescript
return resultChars.join('');
```

## 時間複雜度

- 主要邏輯僅有單次線性掃描。
- 每個骨牌至多處理一次，時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用額外長度為 $n$ 的陣列儲存最終結果，空間複雜度為 $O(n)$。
- 僅額外使用常數個輔助變數，空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
