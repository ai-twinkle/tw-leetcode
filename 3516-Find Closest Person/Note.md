# 3516. Find Closest Person

You are given three integers `x`, `y`, and `z`, representing the positions of three people on a number line:

- `x` is the position of Person 1.
- `y` is the position of Person 2.
- `z` is the position of Person 3, who does not move.

Both Person 1 and Person 2 move toward Person 3 at the same speed.

Determine which person reaches Person 3 first:

- Return 1 if Person 1 arrives first.
- Return 2 if Person 2 arrives first.
- Return 0 if both arrive at the same time.

Return the result accordingly.

**Constraints:**

- `1 <= x, y, z <= 100`

## 基礎思路

因為兩個人以**相同速度**朝固定目標 `z` 前進，誰先到只取決於**與 `z` 的距離誰較小**。
因此，我們只要各自計算到目標的絕對距離：Person 1 的距離為 $|x-z|$，Person 2 的距離為 $|y-z|$。

- 若兩者距離相同，代表同時到達，回傳 `0`。
- 若 $|x-z|<|y-z|$，Person 1 先到，回傳 `1`；否則 Person 2 先到，回傳 `2`。

這個判斷與移動過程無關，只依賴起點到目標的距離，比較後即可定案。

## 解題步驟

### Step 1：計算 Person 1 到目標的絕對距離

說明：以減法取得相對位移，再取絕對值轉為距離。

```typescript
const distancePerson1ToTarget = Math.abs(x - z);
```

### Step 2：計算 Person 2 到目標的絕對距離

說明：同理，對 `y` 與 `z` 求距離。

```typescript
const distancePerson2ToTarget = Math.abs(y - z);
```

### Step 3：若距離相同，直接回傳同時到達

說明：兩者距離相等即同時到達，依題意回傳 `0`。

```typescript
if (distancePerson1ToTarget === distancePerson2ToTarget) {
  return 0;
}
```

### Step 4：距離較小者先到，使用三元運算子回傳

說明：若 Person 1 距離較短回傳 `1`，否則回傳 `2`。

```typescript
return distancePerson1ToTarget < distancePerson2ToTarget ? 1 : 2;
```

## 時間複雜度

* 僅進行常數次的四則運算與比較運算，無迴圈或遞迴。
* 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

* 僅使用固定數量暫存變數保存距離與比較結果。
* 總空間複雜度為 $O(1)$。

> $O(1)$
