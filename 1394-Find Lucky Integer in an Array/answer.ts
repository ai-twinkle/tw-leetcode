function findLucky(arr: number[]): number {
  // Use a typed array for frequency counting, 0 index unused
  const frequencyArray = new Uint16Array(501);

  // Count the frequency of each number
  for (let i = 0; i < arr.length; i++) {
    frequencyArray[arr[i]]++;
  }

  // Check from largest to smallest for the lucky integer
  for (let value = 500; value >= 1; value--) {
    if (frequencyArray[value] === value) {
      return value;
    }
  }

  return -1;
}
