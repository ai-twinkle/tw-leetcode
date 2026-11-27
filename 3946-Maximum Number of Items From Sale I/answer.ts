function maximumSaleItems(items: number[][], budget: number): number {
  const itemCount = items.length;
  const maximumFactor = 1500;

  // Histogram of factors to count multiples quickly
  const factorFrequency = new Int32Array(maximumFactor + 1);
  let minimumPrice = Infinity;
  for (let index = 0; index < itemCount; index++) {
    const item = items[index];
    factorFrequency[item[0]]++;
    if (item[1] < minimumPrice) {
      minimumPrice = item[1];
    }
  }

  // multipleCount[f] = number of items whose factor is a multiple of f
  const multipleCount = new Int32Array(maximumFactor + 1);
  for (let factor = 1; factor <= maximumFactor; factor++) {
    if (factorFrequency[factor] === 0) {
      continue;
    }
    let total = 0;
    for (let multiple = factor; multiple <= maximumFactor; multiple += factor) {
      total += factorFrequency[multiple];
    }
    multipleCount[factor] = total;
  }

  // best[cost] = max value of a set of distinct item types costing at most `cost`
  const best = new Int32Array(budget + 1);
  for (let index = 0; index < itemCount; index++) {
    const item = items[index];
    const price = item[1];
    if (price > budget) {
      continue;
    }
    // First copy yields itself plus one free copy for every other multiple (excluding itself)
    const value = multipleCount[item[0]];
    for (let cost = budget; cost >= price; cost--) {
      const candidate = best[cost - price] + value;
      if (candidate > best[cost]) {
        best[cost] = candidate;
      }
    }
  }

  // Spend leftover budget on the cheapest item, one copy per minimumPrice
  let answer = 0;
  for (let cost = 0; cost <= budget; cost++) {
    const total = best[cost] + Math.floor((budget - cost) / minimumPrice);
    if (total > answer) {
      answer = total;
    }
  }
  return answer;
}
