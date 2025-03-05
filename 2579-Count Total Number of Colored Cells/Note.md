# 2579. Count Total Number of Colored Cells

There exists an infinitely large two-dimensional grid of uncolored unit cells. You are given a positive integer `n`, indicating that you must do the following routine for `n` minutes:

- At the first minute, color any arbitrary unit cell blue.
- Every minute thereafter, color blue every uncolored cell that touches a blue cell.

Below is a pictorial representation of the state of the grid after minutes 1, 2, and 3.

## 基礎思路

這題的關鍵在於發現藍色區域會以曼哈頓距離（Manhattan distance）的概念向外擴散，形成一個「菱形」的區域。
只要能推導出藍色區域中藍色格子的數目與時間的關係，就可以解出這個問題。

### 數學證明

#### 1. 啟動與擴散機制

在開始推導之前，我們先觀察一下這個問題的規律。

- **第一分鐘：**  
  選擇一個單位格染成藍色，作為「中心」。

- **第二分鐘：**  
  將所有與藍色格子相鄰（上下左右）的未染色格子染成藍色。這些格子與中心的曼哈頓距離為 1，一共會有 4 個格子。  
  **此時藍色格子總數：** $1 + 4 = 5$。

- **第三分鐘：**  
  現在所有與藍色格子相鄰的未染色格子也會被染成藍色，此時新染上的格子正好是離中心曼哈頓距離為 2 的那些格子，數量為 8 個。  
  **此時藍色格子總數：** $1 + 4 + 8 = 13$。

---

#### 2. 利用曼哈頓距離建立模型

觀察上述模式可以發現，經過 $n$ 分鐘後，所有與中心的曼哈頓距離不超過 $n-1$ 的格子都會染成藍色。也就是說，藍色區域由滿足 $|x| + |y| \le n-1$ 的格子組成，其中 $x$ 與 $y$ 是與中心的水平與垂直距離。

---

### 3. 計算菱形內格子的數量

對於曼哈頓半徑 $m = n-1$ 的菱形，格子數量可分為兩部分計算：

- **中心格子：** 只有 1 個。
- **距離 $d$ 的格子（其中 $1 \le d \le m$）：** 每一個 $d$ 的距離上有 $4d$ 個格子（分別位於上下左右及其對角延伸方向，但不含角點重複計算）。

所以，總格子數為：
$$
\text{總數} = 1 + \sum_{d=1}^{m} 4d = 1 + 4\left(1 + 2 + \cdots + m\right)
$$

利用等差數列求和公式 $1 + 2 + \cdots + m = \frac{m(m+1)}{2}$，我們可以得到：
$$
\text{總數} = 1 + 4\left(\frac{m(m+1)}{2}\right) = 1 + 2m(m+1)
$$

把 $m = n - 1$ 帶回去，最終的公式為：
$$
\text{藍色格子數} = 1 + 2(n-1)n
$$

---

#### 4. 遞推關係

另外，我們也可以用遞推關係來描述這個過程。設 $f(n)$ 表示第 $n$ 分鐘後的藍色格子總數：

- 初始條件：$f(1) = 1$
- 對於 $n \ge 2$：每分鐘新增的藍色格子數為 $4(n-1)$，因此：
  $$
  f(n) = f(n-1) + 4(n-1)
  $$
  經過遞推求和，也會得到相同的公式：
  $$
  f(n) = 1 + 4\left(1 + 2 + \cdots + (n-1)\right) = 1 + 2(n-1)n
  $$

---

#### 5. 結論

經過 $n$ 分鐘後，藍色區域中藍色格子的數目為：
$$
1 + 2(n-1)n = \boxed{2n^2 - 2n + 1}
$$

## 解題步驟

### Step 1: 依照數學公式計算

根據上述推導，我們可以直接計算出 $n$ 分鐘後的藍色格子數量。

```typescript
return 2 * n * n - 2 * n + 1; 
```

## 時間複雜度

- 我們只需要進行一次計算，因此時間複雜度為 $O(1)$。
- 總時間複雜度：$O(1)$。

> $O(1)$

## 空間複雜度

- 我們僅需要常數空間來儲存變數，因此空間複雜度為 $O(1)$。
- 總空間複雜度：$O(1)$。

> $O(1)$
