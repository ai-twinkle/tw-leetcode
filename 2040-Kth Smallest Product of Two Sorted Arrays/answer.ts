function kthSmallestProduct(nums1: number[], nums2: number[], k: number): number {
  const lengthOfFirstArray = nums1.length;
  const lengthOfSecondArray = nums2.length;

  // Count the number of negative numbers in each array
  let negativeCountFirstArray = 0;
  while (negativeCountFirstArray < lengthOfFirstArray && nums1[negativeCountFirstArray] < 0) {
    negativeCountFirstArray++;
  }
  let negativeCountSecondArray = 0;
  while (negativeCountSecondArray < lengthOfSecondArray && nums2[negativeCountSecondArray] < 0) {
    negativeCountSecondArray++;
  }

  // Set the binary search bounds for the product
  let leftProduct = -1e10;
  let rightProduct = 1e10;

  // Binary search to find the kth smallest product
  while (leftProduct <= rightProduct) {
    const midProduct = Math.floor((leftProduct + rightProduct) / 2);
    let productCount = 0;

    // Case 1: (negative) x (negative) -> positive products
    let indexFirst = 0;
    let indexSecond = negativeCountSecondArray - 1;
    while (indexFirst < negativeCountFirstArray && indexSecond >= 0) {
      if (nums1[indexFirst] * nums2[indexSecond] > midProduct) {
        indexFirst++;
      } else {
        productCount += negativeCountFirstArray - indexFirst;
        indexSecond--;
      }
    }

    // Case 2: (positive) x (positive) -> positive products
    indexFirst = negativeCountFirstArray;
    indexSecond = lengthOfSecondArray - 1;
    while (indexFirst < lengthOfFirstArray && indexSecond >= negativeCountSecondArray) {
      if (nums1[indexFirst] * nums2[indexSecond] > midProduct) {
        indexSecond--;
      } else {
        productCount += indexSecond - negativeCountSecondArray + 1;
        indexFirst++;
      }
    }

    // Case 3: (negative) x (positive) -> negative products
    indexFirst = 0;
    indexSecond = negativeCountSecondArray;
    while (indexFirst < negativeCountFirstArray && indexSecond < lengthOfSecondArray) {
      if (nums1[indexFirst] * nums2[indexSecond] > midProduct) {
        indexSecond++;
      } else {
        productCount += lengthOfSecondArray - indexSecond;
        indexFirst++;
      }
    }

    // Case 4: (positive) x (negative) -> negative products
    indexFirst = negativeCountFirstArray;
    indexSecond = 0;
    while (indexFirst < lengthOfFirstArray && indexSecond < negativeCountSecondArray) {
      if (nums1[indexFirst] * nums2[indexSecond] > midProduct) {
        indexFirst++;
      } else {
        productCount += lengthOfFirstArray - indexFirst;
        indexSecond++;
      }
    }

    // Narrow the binary search based on the count
    if (productCount < k) {
      leftProduct = midProduct + 1;
    } else {
      rightProduct = midProduct - 1;
    }
  }

  return leftProduct;
}
