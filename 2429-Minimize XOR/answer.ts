const countOnes = (num: number): number =>
  num.toString(2).split('').filter((bit) => bit === '1').length;

function minimizeXor(num1: number, num2: number): number {
  const countOfOneInNum1 = countOnes(num1);
  const countOfOneInNum2 = countOnes(num2);

  if (countOfOneInNum1 === countOfOneInNum2) {
    return num1;
  }

  let resultBits = num1.toString(2).split('');
  let remainingOne: number;

  if (countOfOneInNum1 < countOfOneInNum2) {
    remainingOne = countOfOneInNum2 - countOfOneInNum1;
    for (let i = resultBits.length - 1; i >= 0; i--) {
      if (remainingOne === 0) {
        break;
      }

      if (resultBits[i] === '0') {
        resultBits[i] = '1';
        remainingOne--;
      }
    }

    if (remainingOne > 0) {
      resultBits = Array(remainingOne).fill('1').concat(resultBits);
    }
  } else {
    remainingOne = countOfOneInNum1 - countOfOneInNum2;
    for (let i = resultBits.length - 1; i >= 0; i--) {
      if (remainingOne === 0) {
        break;
      }
      if (resultBits[i] === '1') {
        resultBits[i] = '0';
        remainingOne--;
      }
    }
  }

  return parseInt(resultBits.join(''), 2);
}
