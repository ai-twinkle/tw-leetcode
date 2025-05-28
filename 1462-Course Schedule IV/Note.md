# 1462. Course Schedule IV

There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. 
You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that 
you must take course `a_i` first if you want to take course `b_i`.

For example, the pair `[0, 1]` indicates that you have to take course `0` before you can take course `1`.
Prerequisites can also be indirect. 
If course `a` is a prerequisite of course `b`, 
and course `b` is a prerequisite of course `c`, then course `a` is a prerequisite of course `c`.

You are also given an array `queries` where `queries[j] = [uj, vj]`. 
For the `j_th` query, you should answer whether course `u_j` is a prerequisite of course `v_j` or not.

Return a boolean array answer, where `answer[j]` is the answer to the `j_th` query.

**Constraints:**

- `2 <= numCourses <= 100`
- `0 <= prerequisites.length <= (numCourses * (numCourses - 1) / 2)`
- `prerequisites[i].length == 2`
- `0 <= a_i, b_i <= numCourses - 1`
- `a_i != b_i`
- All the pairs `[a_i, b_i]` are unique.
- The prerequisites graph has no cycles.
- `1 <= queries.length <= 10^4`
- `0 <= u_i, v_i <= numCourses - 1`
- `u_i != v_i`

## 基礎思路

本題的核心在於如何高效判斷兩門課之間是否存在直接或間接的先修關係。
由於先修關係構成一個有向無環圖（DAG），而查詢次數可能很多，最佳策略是在查詢前先利用 **傳遞閉包（transitive closure）** 預先計算所有課程間的可達性。

這裡可使用 Floyd–Warshall 演算法，將所有先修關係（無論直接或間接）預先存進一個矩陣。
如此，每次查詢僅需 $O(1)$ 查表，即可判斷一門課是否為另一門課的先修。

## 解題步驟

### Step 1：初始化可達性矩陣

建立一個 $n \times n$ 的矩陣，預設所有課程對之間不可達。

```typescript
// 1. 分配 reachabilityMatrix[i][j]：若課程 i 是課程 j 的（直接或間接）先修，則為 1，否則為 0。
const reachabilityMatrix: Uint8Array[] = new Array(numCourses);
for (let i = 0; i < numCourses; i++) {
  reachabilityMatrix[i] = new Uint8Array(numCourses);
}
```

### Step 2：標記直接先修關係

將所有 prerequisites 資料中的直接先修邊，標記到矩陣中。

```typescript
// 2. 在可達性矩陣中標記所有直接先修關係。
for (let p = 0; p < prerequisites.length; p++) {
  const prerequisiteCourse = prerequisites[p][0];
  const targetCourse = prerequisites[p][1];
  reachabilityMatrix[prerequisiteCourse][targetCourse] = 1;
}
```

### Step 3：利用 Floyd–Warshall 算法計算間接可達性

三重迴圈分別枚舉中繼點 $k$、起點 $i$、終點 $j$，如果 $i \to k$ 且 $k \to j$，則補上 $i \to j$，也就是所有直接、間接的可達路徑都被填滿。

```typescript
// 3. 使用 Floyd–Warshall 算法計算傳遞閉包：
//    若 i 可以到 k，且 k 可以到 j，則 i 可以到 j。
for (let k = 0; k < numCourses; k++) {
  const rowK = reachabilityMatrix[k];
  for (let i = 0; i < numCourses; i++) {
    if (reachabilityMatrix[i][k] === 1) {
      const rowI = reachabilityMatrix[i];
      for (let j = 0; j < numCourses; j++) {
        if (rowK[j] === 1) {
          rowI[j] = 1;
        }
      }
    }
  }
}
```

### Step 4：查詢回應

每次查詢只需直接查表即可。

```typescript
// 4. 根據計算好的矩陣，O(1) 回答所有查詢。
const result: boolean[] = new Array(queries.length);
for (let index = 0; index < queries.length; index++) {
  const fromCourse = queries[index][0];
  const toCourse = queries[index][1];
  result[index] = reachabilityMatrix[fromCourse][toCourse] === 1;
}

return result;
```

## 時間複雜度

- 進行 Floyd–Warshall 三重迴圈計算遞移閉包，需 $O(\text{numCourses}^3)$。
- 回答 $\text{queries.length}$ 個查詢，每個 $O(1)$，共 $O(\text{queries.length})$。
- 總時間複雜度為 $O(n^3 + m)$ （其中 $n = numCourses,\ m = queries.length$）。

> $O(n^3 + m)$

## 空間複雜度

- 使用了 $n \times n$ 的可到達性矩陣，需 $O(n^2)$。
- 使用結果陣列需 $O(m)$。
- 總空間複雜度為 $O(n^2 + m)$。

> $O(n^2 + m)$
