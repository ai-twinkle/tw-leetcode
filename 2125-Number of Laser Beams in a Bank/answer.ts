function numberOfBeams(bank: string[]): number {
  // ASCII code for character '1' to avoid repeated string comparisons
  const codeOne = 49;

  // Keeps the device count of the most recent non-empty row seen so far
  let previousNonEmptyRowDeviceCount = 0;

  // Accumulates the total number of beams
  let totalBeams = 0;

  // Iterate each row once
  for (let rowIndex = 0, rowLength = bank.length; rowIndex < rowLength; rowIndex++) {
    const row = bank[rowIndex];

    // Count devices in the current row
    let currentRowDeviceCount = 0;
    for (let colIndex = 0, colLength = row.length; colIndex < colLength; colIndex++) {
      // Increment when we see '1' (device present)
      if (row.charCodeAt(colIndex) === codeOne) {
        currentRowDeviceCount++;
      }
    }

    // Only non-empty rows contribute beams with the previous non-empty row
    if (currentRowDeviceCount > 0) {
      if (previousNonEmptyRowDeviceCount > 0) {
        // Add beams formed between consecutive non-empty rows
        totalBeams += previousNonEmptyRowDeviceCount * currentRowDeviceCount;
      }

      // Update the previous non-empty row device count
      previousNonEmptyRowDeviceCount = currentRowDeviceCount;
    }
  }

  return totalBeams;
}
