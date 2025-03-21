function findAllRecipes(
  recipes: string[],
  ingredients: string[][],
  supplies: string[]
): string[] {
  const supplySet = new Set<string>(supplies);
  // Map each recipe to its index in the recipes array for fast lookup.
  const recipeIndexMap = new Map<string, number>(
    recipes.map((recipeName, index) => [recipeName, index])
  );
  // Track recipes in the current recursion stack to detect cycles.
  const inRecursion = new Array<boolean>(recipes.length).fill(false);

  const canPrepareRecipe = (recipe: string): boolean => {
    // If the item is already a supply, we can prepare it.
    if (supplySet.has(recipe)) {
      return true;
    }
    // If it's not a recipe we know, return false.
    if (!recipeIndexMap.has(recipe)) {
      return false;
    }

    const index = recipeIndexMap.get(recipe)!;
    // Cycle detection: if already processing this recipe, a cycle exists.
    if (inRecursion[index]) {
      return false;
    }

    inRecursion[index] = true;

    // Check if all ingredients are preparable.
    for (const ingredient of ingredients[index]) {
      if (!canPrepareRecipe(ingredient)) {
        return false;
      }
    }
    // Mark the recipe as preparable by adding it to our supplies.
    supplySet.add(recipe);
    return true;
  };

  const creatableRecipes: string[] = [];
  for (const recipe of recipes) {
    if (canPrepareRecipe(recipe)) {
      creatableRecipes.push(recipe);
    }
  }

  return creatableRecipes;
}
