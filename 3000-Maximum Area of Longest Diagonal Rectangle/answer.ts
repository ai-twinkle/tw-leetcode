function areaOfMaxDiagonal(dimensions: number[][]): number {
  let maximumDiagonalSquare = 0;
  let maximumArea = 0;

  for (let i = 0; i < dimensions.length; i++) {
    const length = dimensions[i][0];
    const width = dimensions[i][1];

    const diagonalSquare = length * length + width * width;
    const area = length * width;

    if (diagonalSquare > maximumDiagonalSquare) {
      maximumDiagonalSquare = diagonalSquare;
      maximumArea = area;
    } else if (diagonalSquare === maximumDiagonalSquare) {
      if (area > maximumArea) {
        maximumArea = area;
      }
    }
  }

  return maximumArea;
}
