class ProductOfNumbers {
  // Initialize the cumulative products list with a base value of 1.
  private products: number[] = [1];

  constructor() {}

  add(num: number): void {
    if (num === 0) {
      // Reset the list when encountering a 0, since any product including 0 is 0.
      this.products = [1];
    } else {
      // Append the cumulative product.
      const lastProduct = this.products[this.products.length - 1];
      this.products.push(lastProduct * num);
    }
  }

  getProduct(k: number): number {
    // If there are fewer than k numbers since the last 0, the product is 0.
    if (k >= this.products.length) {
      return 0;
    }
    const n = this.products.length;
    // The product of the last k numbers is the ratio of the cumulative product at the end
    // and the cumulative product k numbers back.
    return this.products[n - 1] / this.products[n - 1 - k];
  }
}


/**
 * Your ProductOfNumbers object will be instantiated and called as such:
 * var obj = new ProductOfNumbers()
 * obj.add(num)
 * var param_2 = obj.getProduct(k)
 */
