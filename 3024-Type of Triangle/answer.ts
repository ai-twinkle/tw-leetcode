function triangleType(nums: number[]): string {
  // Destructure input into clearly named constants
  const [firstSideLength, secondSideLength, thirdSideLength] = nums;

  // Case 1: Triangle inequality theorem:
  //         Any two sides of a triangle must be greater than the third side
  if (firstSideLength + secondSideLength <= thirdSideLength ||
    firstSideLength + thirdSideLength <= secondSideLength ||
    secondSideLength + thirdSideLength <= firstSideLength) {
    return "none";
  }

  // Case 2: Equilateral triangle: All sides are equal
  if (firstSideLength === secondSideLength &&
    secondSideLength === thirdSideLength) {
    return "equilateral";
  }

  // Case 3: Isosceles triangle: One pair of sides are equal
  if (firstSideLength === secondSideLength ||
    secondSideLength === thirdSideLength ||
    firstSideLength === thirdSideLength) {
    return "isosceles";
  }

  // Case 4: Scalene triangle: All sides are different
  return "scalene";
}
