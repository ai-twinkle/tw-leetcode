class Bank {
  // Store account balances for all users
  private readonly accountBalances: Float64Array;

  /**
   * @param balance Initial balances for each account (1-indexed API).
   */
  constructor(balance: number[]) {
    // Initialize all balances
    this.accountBalances = Float64Array.from(balance);
  }

  /**
   * Check if the account number exists.
   * @param accountNumber 1-indexed account number
   * @return true if valid; false otherwise
   * @private
   */
  private isValidAccount(accountNumber: number): boolean {
    // Account number must be within the valid range
    return accountNumber >= 1 && accountNumber <= this.accountBalances.length;
  }

  /**
   * Check if the account has enough money for the operation.
   * @param accountNumber 1-indexed account number
   * @param requiredAmount amount required
   * @private
   */
  private hasSufficientBalance(accountNumber: number, requiredAmount: number): boolean {
    // Compare current balance with required amount
    return this.accountBalances[accountNumber - 1] >= requiredAmount;
  }

  /**
   * Transfer money from one account to another.
   * @param account1 1-indexed source account
   * @param account2 1-indexed destination account
   * @param money amount to transfer
   * @return true if succeeded; false otherwise
   */
  transfer(account1: number, account2: number, money: number): boolean {
    // Check both accounts exist and source account has enough money
    if (
      !this.isValidAccount(account1) ||
      !this.isValidAccount(account2) ||
      !this.hasSufficientBalance(account1, money)
    ) {
      return false;
    }

    // Deduct money from source account
    this.accountBalances[account1 - 1] -= money;

    // Add money to destination account
    this.accountBalances[account2 - 1] += money;

    // Transfer completed
    return true;
  }

  /**
   * Deposit money into an account.
   * @param account 1-indexed account
   * @param money amount to deposit
   * @return true if succeeded; false otherwise
   */
  deposit(account: number, money: number): boolean {
    // Check if account exists
    if (!this.isValidAccount(account)) {
      return false;
    }

    // Increase account balance
    this.accountBalances[account - 1] += money;

    // Deposit completed
    return true;
  }

  /**
   * Withdraw money from an account.
   * @param account 1-indexed account
   * @param money amount to withdraw
   * @return true if succeeded; false otherwise
   */
  withdraw(account: number, money: number): boolean {
    // Check if account exists and has enough balance
    if (!this.isValidAccount(account) || !this.hasSufficientBalance(account, money)) {
      return false;
    }

    // Decrease account balance
    this.accountBalances[account - 1] -= money;

    // Withdrawal completed
    return true;
  }
}

/**
 * Your Bank object will be instantiated and called as such:
 * var obj = new Bank(balance)
 * var param_1 = obj.transfer(account1,account2,money)
 * var param_2 = obj.deposit(account,money)
 * var param_3 = obj.withdraw(account,money)
 */
