# 2115. Find All Possible Recipes from Given Supplies

You have information about `n` different `recipes`. 
You are given a string array recipes and a 2D string array `ingredients`. 
The $i^{th}$ recipe has the name `recipes[i]`, 
and you can create it if you have all the needed ingredients from `ingredients[i]`. 
A recipe can also be an ingredient for other recipes, i.e., `ingredients[i]` may contain a string that is in `recipes`.

You are also given a string array `supplies` containing all the ingredients that you initially have, 
and you have an infinite supply of all of them.

Return a list of all the recipes that you can create. You may return the answer in any order.

Note that two recipes may contain each other in their ingredients.

## 基礎思路

我們可以透過 **深度優先搜尋 (Depth-First Search, DFS)** 來解決這個問題。

具體實現方法是，針對每個想要製作的食譜，逐一檢查它所需的所有食材：

- 若所有需要的食材我們都已經擁有，那麼我們就能製作這個食譜。
- 若還缺少某些食材，我們則需要繼續搜尋這些食材是否可以透過其他食譜製作出來。

但這種方式會遇到一個潛在的問題：**食譜間可能會互相依賴，形成循環**，導致無限遞迴。

為了解決這個問題，我們可以引入一個 `inRecursion` 集合（或稱為遞迴堆疊），來記錄當前正在處理的食譜。當我們在搜尋過程中發現某個食譜已經在 `inRecursion` 中，表示發生了循環依賴，此時就能立刻判定這個食譜無法被製作，從而避免無窮迴圈的情形。

> Tips:  
> 處理具有關聯性的問題時，DFS 是一種有效的策略，但需特別注意「循環依賴 (loop)」的問題。  
> 此時可透過額外的 visited 或 recursion set 等集合來避免無限遞迴的發生。

## 解題步驟

### Step 1: 初始化變數與食譜索引

首先，我們需要初始化一些變數：
- `supplySet`：將 `supplies` 轉換為集合，方便快速查找。
- `recipeIndexMap`：將 `recipes` 轉換為 Map，方便之後快速查找食譜的索引。
- `inRecursion`：用來記錄當前遞迴堆疊中的食譜，用於檢測循環依賴。

```typescript
const supplySet = new Set<string>(supplies);
const recipeIndexMap = new Map<string, number>(
  recipes.map((recipeName, index) => [recipeName, index])
);
const inRecursion = new Array<boolean>(recipes.length).fill(false);
```

### Step 2: 深度優先搜尋

接下來，我們可以定義一個 DFS 函數，用來搜尋所有可以製作的食譜。

```typescript
const canPrepareRecipe = (recipe: string): boolean => {
  // 如果我們已經知道這個食譜可以製作，則直接返回 true。
  if (supplySet.has(recipe)) {
    return true;
  }
  // 如果該食譜不在我們的食譜索引中，則返回 false。
  if (!recipeIndexMap.has(recipe)) {
    return false;
  }

  const index = recipeIndexMap.get(recipe)!;
  // 循環依賴檢測：如果當前食譜已經在遞迴堆疊中，則表示存在循環依賴。
  if (inRecursion[index]) {
    return false;
  }

  inRecursion[index] = true;

  // 檢驗所有食材是否都可以製作。
  for (const ingredient of ingredients[index]) {
    // 當有任一食材無法製作時，則返回 false。
    if (!canPrepareRecipe(ingredient)) {
      return false;
    }
  }
  // 標記該食譜可以製作，將其加入到我們的食材中。
  supplySet.add(recipe);
  return true;
};
```

### Step 3: 遍歷所有食譜

接下來，我們可以遍歷所有食譜，並透過 DFS 函數來檢查是否可以製作。

```typescript
const creatableRecipes: string[] = [];
for (const recipe of recipes) {
  if (canPrepareRecipe(recipe)) {
    creatableRecipes.push(recipe);
  }
}
```

### Step 4: 返回結果

最後，我們可以將所有可以製作的食譜返回。

```typescript
return creatableRecipes;
```

## 時間複雜度

- **預處理階段：**  
  建立 `supplySet`、`recipeIndexMap` 以及初始化 `inRecursion` 陣列均需遍歷所有食譜，故耗時 $O(n)$，其中 $n$ 為食譜數量。

- **DFS 搜索階段：**  
  在最壞情況下，DFS 會遍歷所有食譜及其依賴關係，假設所有食譜的依賴總數為 $E$，則 DFS 部分的時間複雜度為 $O(n + E)$。  
  由於每個食譜只被處理一次（利用 memoization 將可製作的食譜加入 `supplySet` 避免重複計算），所以總時間複雜度維持在 $O(n + E)$。

- 總時間複雜度為 $O(n + E)$。

> $O(n + E)$

## 空間複雜度

- **資料結構：**
    - `supplySet` 與 `recipeIndexMap` 需要 $O(n)$ 空間。
    - `inRecursion` 陣列亦需 $O(n)$ 空間。

- **遞迴堆疊分析：**  
  在 DFS 最壞情況下，依賴鏈極長（每個食譜依賴下一個食譜），遞迴堆疊深度可能達到 $O(n)$。

- 總空間複雜度為 $O(n)$。

> $O(n)$
