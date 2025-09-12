# 3227. Vowels Game in a String

Alice and Bob are playing a game on a string.

You are given a string `s`, Alice and Bob will take turns playing the following game where Alice starts first:

- On Alice's turn, she has to remove any non-empty substring from `s` that contains an odd number of vowels.
- On Bob's turn, he has to remove any non-empty substring from `s` that contains an even number of vowels.

The first player who cannot make a move on their turn loses the game. We assume that both Alice and Bob play optimally.

Return `true` if Alice wins the game, and `false` otherwise.

The English vowels are: `a`, `e`, `i`, `o`, and `u`.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists only of lowercase English letters.

## 基礎思路

這是一道博弈題目，但在觀察規則後可以發現，其實只需要判斷一個非常簡單的條件。

* Alice 與 Bob 輪流操作，Alice 只能移除「奇數個母音」的子字串，Bob 只能移除「偶數個母音」的子字串。
* 如果輪到某個人無法操作，就輸了。
* 題目還強調「兩人都採取最優策略」。

從規則出發，我們可以注意到一個重要性質：

* 任何**只要有至少一個母音**存在的字串，Alice 都可以移除單一母音，這是合法的奇數母音子字串。
* Alice 是先手，只要她能做出第一次移除動作，就一定能掌握主動權並最終獲勝（她可以強迫 Bob 回應她的行為）。
* 相反地，若字串中**完全沒有母音**，那 Alice 在第一回合就沒有合法行為，直接輸掉遊戲。

因此，我們只需要檢查字串中是否包含任一個母音，即可直接得出勝負。

## 解題步驟

### Step 1：遍歷字串，尋找任一母音是否存在

- 若發現任何一個母音（a/e/i/o/u），代表 Alice 可以先手出招，直接回傳 `true`；
- 否則整個字串不含母音，Alice 無法出手，回傳 `false`。

```typescript
for (let i = 0; i < s.length; i++) {
  if (s[i] === 'a' || s[i] === 'e' || s[i] === 'i' || s[i] === 'o' || s[i] === 'u') {
    // 若存在任一母音：Alice 可以在第一輪出手並獲勝
    return true;
  }
}

// 若完全沒有母音：Alice 無法出手，直接輸掉遊戲
return false;
```

## 時間複雜度

- 最多只需掃描整個字串一次。
- 每次判斷一個字元是否為母音屬於常數時間。
- 總時間複雜度為 $O(n)$，其中 $n$ 為字串長度。

> $O(n)$

## 空間複雜度

- 除了迴圈中的索引變數外，未使用額外空間。
- 沒有使用任何額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
