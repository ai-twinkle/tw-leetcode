const BUSINESS_LINE_ORDER = ["electronics", "grocery", "pharmacy", "restaurant"] as const;

const BUSINESS_LINE_INDEX: Readonly<Record<string, number>> = {
  electronics: 0,
  grocery: 1,
  pharmacy: 2,
  restaurant: 3,
};

const COUPON_CODE_PATTERN = /^\w+$/;

/**
 * Return valid coupon codes sorted by business line order, then lexicographically within each line.
 * @param code Coupon identifiers.
 * @param businessLine Coupon business categories.
 * @param isActive Whether each coupon is active.
 * @returns Sorted list of valid coupon codes.
 */
function validateCoupons(code: string[], businessLine: string[], isActive: boolean[]): string[] {
  const bucketedCodes: string[][] = [[], [], [], []];

  // Filter in one pass without Map/includes/flatMap overhead
  for (let index = 0; index < code.length; index++) {
    if (!isActive[index]) {
      continue;
    }

    const businessLineValue = businessLine[index];
    const businessLineBucketIndex = BUSINESS_LINE_INDEX[businessLineValue];

    if (businessLineBucketIndex === undefined) {
      continue;
    }

    const codeValue = code[index];
    if (!COUPON_CODE_PATTERN.test(codeValue)) {
      continue;
    }

    // Store into the correct business line bucket
    bucketedCodes[businessLineBucketIndex].push(codeValue);
  }

  // Sort each bucket and concatenate in required business order
  const result: string[] = [];
  for (let bucketIndex = 0; bucketIndex < BUSINESS_LINE_ORDER.length; bucketIndex++) {
    const codesInBucket = bucketedCodes[bucketIndex];

    if (codesInBucket.length === 0) {
      continue;
    }

    codesInBucket.sort();

    for (let codeIndex = 0; codeIndex < codesInBucket.length; codeIndex++) {
      result.push(codesInBucket[codeIndex]);
    }
  }

  return result;
}
