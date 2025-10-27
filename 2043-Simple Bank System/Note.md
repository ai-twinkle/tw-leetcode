# 2043. Simple Bank System

You have been tasked with writing a program for a popular bank that will automate all its incoming transactions (transfer, deposit, and withdraw). 
The bank has `n` accounts numbered from `1` to `n`. 
The initial balance of each account is stored in a 0-indexed integer array `balance`, with the $(i + 1)^{th}$ account having an initial balance of `balance[i]`.

Execute all the valid transactions. 
A transaction is valid if:

- The given account number(s) are between `1` and `n`, and
- The amount of money withdrawn or transferred from is less than or equal to the balance of the account.

Implement the `Bank` class:

- `Bank(long[] balance)` Initializes the object with the 0-indexed integer array balance.
- `boolean transfer(int account1, int account2, long money)` Transfers money dollars from the account numbered account1 to the account numbered account2. Return true if the transaction was successful, false otherwise.
- `boolean deposit(int account, long money)` Deposit money dollars into the account numbered account. Return true if the transaction was successful, false otherwise.
- `boolean withdraw(int account, long money)` Withdraw money dollars from the account numbered account. Return true if the transaction was successful, false otherwise.

**Constraints:**

- `n == balance.length`
- `1 <= n, account, account1, account2 <= 10^5`
- `0 <= balance[i], money <= 10^12`
- At most `10^4` calls will be made to each function `transfer`, `deposit`, `withdraw`.

## 基礎思路

本題要求我們設計一個銀行交易系統，能夠自動處理三種操作：**轉帳 (transfer)**、**存款 (deposit)** 與 **提款 (withdraw)**。
每個帳戶在初始化時都有一筆初始餘額，系統需根據輸入的交易請求判斷其是否有效，並返回對應的布林值結果。

在思考解法時，我們需特別注意以下幾個重點：

- **帳戶編號驗證**：所有帳戶均為 1-indexed（即帳號從 1 開始），輸入若超出範圍視為無效。
- **餘額檢查**：提款與轉帳操作都需確認帳戶餘額是否足夠。
- **大數精度問題**：由於金額上限為 $10^{12}$，在 JavaScript/TypeScript 中應使用 `Float64Array` 或 `bigint` 以避免精度誤差。
- **效能需求**：最多 $10^4$ 次操作，操作次數雖高但每次僅涉及索引查詢與加減法，可維持常數時間完成。

為了解決這個問題，我們可以採用以下策略：

- **以固定長度陣列儲存所有帳戶餘額**，透過索引直接訪問實現 O(1) 操作；
- **輔助驗證函數**：
    - `isValidAccount(account)`：確認帳號是否存在；
    - `hasSufficientBalance(account, amount)`：確認餘額是否足夠；
- **三個主要操作方法**：
    - `transfer(a, b, m)`：若兩帳戶皆存在且來源帳戶餘額足夠，執行轉帳；
    - `deposit(a, m)`：確認帳戶存在後加上金額；
    - `withdraw(a, m)`：確認帳戶存在且餘額足夠後扣款；
- **返回布林值**：每個操作皆回傳是否成功，符合題目要求。

## 解題步驟

### Step 1：主類別與欄位宣告

使用 `Float64Array` 儲存所有帳戶餘額，確保數值運算穩定且索引訪問快速。

```typescript
class Bank {
  // 儲存所有帳戶餘額（以浮點陣列儲存，支援大數精度）
  private readonly accountBalances: Float64Array;

  // ...
}
```

### Step 2：建構子 — 初始化所有帳戶餘額

接收初始餘額陣列並轉為 `Float64Array`。

```typescript
class Bank {
  // Step 1：主類別與欄位宣告
  
  /**
   * @param balance 初始餘額陣列（1-indexed 帳戶）
   */
  constructor(balance: number[]) {
    // 初始化帳戶餘額
    this.accountBalances = Float64Array.from(balance);
  }

  // ...
}
```

### Step 3：私有輔助函數 `isValidAccount`

檢查帳號是否存在於有效範圍 `[1, n]` 之內。

```typescript
class Bank {
  // Step 1：主類別與欄位宣告
  
  // Step 2：建構子 — 初始化所有帳戶餘額
  
  /**
   * 驗證帳號是否存在
   * @param accountNumber 1-indexed 帳號
   * @returns 帳號有效則回傳 true，否則 false
   */
  private isValidAccount(accountNumber: number): boolean {
    // 帳號需介於 1 到帳戶總數之間
    return accountNumber >= 1 && accountNumber <= this.accountBalances.length;
  }
  
  // ...
}
```

### Step 4：私有輔助函數 `hasSufficientBalance`

確認指定帳號的餘額是否足以執行提款或轉帳。

```typescript
class Bank {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化所有帳戶餘額

  // Step 3：私有輔助函數 `isValidAccount`

  /**
   * 檢查帳戶餘額是否足夠
   * @param accountNumber 1-indexed 帳號
   * @param requiredAmount 所需金額
   * @returns 若餘額足夠則回傳 true
   */
  private hasSufficientBalance(accountNumber: number, requiredAmount: number): boolean {
    // 比較餘額與所需金額
    return this.accountBalances[accountNumber - 1] >= requiredAmount;
  }

  // ...
}
```

### Step 5：`transfer` — 轉帳操作

若來源帳號、目標帳號皆存在，且來源帳號餘額充足，則執行轉帳並回傳成功；否則回傳失敗。

```typescript
class Bank {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化所有帳戶餘額

  // Step 3：私有輔助函數 `isValidAccount`

  // Step 4：私有輔助函數 `hasSufficientBalance`

  /**
   * 轉帳操作：從 account1 轉出金額至 account2
   * @param account1 來源帳號
   * @param account2 目標帳號
   * @param money 轉帳金額
   * @returns 若成功則回傳 true，否則 false
   */
  transfer(account1: number, account2: number, money: number): boolean {
    // 檢查兩帳戶皆有效且來源帳戶餘額足夠
    if (
      !this.isValidAccount(account1) ||
      !this.isValidAccount(account2) ||
      !this.hasSufficientBalance(account1, money)
    ) {
      return false;
    }

    // 扣除來源帳戶金額
    this.accountBalances[account1 - 1] -= money;

    // 增加目標帳戶金額
    this.accountBalances[account2 - 1] += money;

    // 成功執行轉帳
    return true;
  }

  // ...
}
```

### Step 6：`deposit` — 存款操作

確認帳號有效後，將金額加至對應帳戶餘額。

```typescript
class Bank {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化所有帳戶餘額

  // Step 3：私有輔助函數 `isValidAccount`

  // Step 4：私有輔助函數 `hasSufficientBalance`

  // Step 5：`transfer` — 轉帳操作

  /**
   * 存款操作：將金額加至指定帳戶
   * @param account 帳號
   * @param money 存入金額
   * @returns 若成功則回傳 true，否則 false
   */
  deposit(account: number, money: number): boolean {
    // 若帳戶不存在，回傳失敗
    if (!this.isValidAccount(account)) {
      return false;
    }

    // 增加該帳戶餘額
    this.accountBalances[account - 1] += money;

    // 存款成功
    return true;
  }

  // ...
}
```

### Step 7：`withdraw` — 提款操作

若帳號存在且餘額足夠，執行扣款；否則回傳失敗。

```typescript
class Bank {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化所有帳戶餘額

  // Step 3：私有輔助函數 `isValidAccount`

  // Step 4：私有輔助函數 `hasSufficientBalance`

  // Step 5：`transfer` — 轉帳操作
  
  // Step 6：`deposit` — 存款操作
  
  /**
   * 提款操作：從帳戶中扣除指定金額
   * @param account 帳號
   * @param money 提領金額
   * @returns 若成功則回傳 true，否則 false
   */
  withdraw(account: number, money: number): boolean {
    // 檢查帳戶是否存在且餘額足夠
    if (!this.isValidAccount(account) || !this.hasSufficientBalance(account, money)) {
      return false;
    }

    // 扣除金額
    this.accountBalances[account - 1] -= money;

    // 提款成功
    return true;
  }
}
```

## 時間複雜度

- `transfer()`：索引訪問與加減運算皆為常數時間 → $O(1)$。
- `deposit()`：僅一次索引加法操作 → $O(1)$。
- `withdraw()`：索引訪問與減法操作 → $O(1)$。
- 輔助驗證函數 (`isValidAccount`, `hasSufficientBalance`) 亦為常數時間。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅儲存一個長度為 $n$ 的 `Float64Array` 以保存帳戶餘額，
  其中 $n$ 為帳戶數量。
- 其餘僅為常數級輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$

