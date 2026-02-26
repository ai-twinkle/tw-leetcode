const MAXIMUM_VALUE = 10000;
const VALUE_BIT_MASK = (1 << 14) - 1; // 16383, enough to hold values up to 10000

/**
 * Precomputed popcount (number of 1-bits) for all values in [0, 10000].
 * This avoids repeated bit-count work inside the sort path.
 */
const POPCOUNT_TABLE = (function precomputePopcountTable() {
    const table = new Uint8Array(MAXIMUM_VALUE + 1);
    for (let value = 1; value <= MAXIMUM_VALUE; value += 1) {
        table[value] = (table[value >>> 1] + (value & 1)) as number;
    }
    return table;
})();

function sortByBits(arr: number[]): number[] {
    const length = arr.length;

    // Fast path for tiny inputs.
    if (length <= 1) {
        return arr;
    }

    // Pack (popcount, value) into a single sortable integer to avoid comparator overhead.
    const packedKeys = new Uint32Array(length);

    for (let index = 0; index < length; index += 1) {
        const value = arr[index] | 0;
        packedKeys[index] = (POPCOUNT_TABLE[value] << 14) | value;
    }

    // TypedArray sort is numeric ascending and avoids JS comparator call overhead.
    packedKeys.sort();

    // Unpack values back into the original array.
    for (let index = 0; index < length; index += 1) {
        arr[index] = packedKeys[index] & VALUE_BIT_MASK;
    }

    return arr;
}
