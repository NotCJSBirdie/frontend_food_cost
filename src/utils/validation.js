export function validateIngredientForm(ingredientForm, setFormErrors) {
  const errors = {
    name: "",
    unitPrice: "",
    unit: "",
    stockQuantity: "",
    restockThreshold: "",
  };
  let isValid = true;

  if (!ingredientForm.name.trim()) {
    errors.name = "Ingredient name is required";
    isValid = false;
  }

  if (!ingredientForm.unitPrice || parseFloat(ingredientForm.unitPrice) <= 0) {
    errors.unitPrice = "Unit price must be greater than 0";
    isValid = false;
  }

  if (!ingredientForm.unit) {
    errors.unit = "Unit is required";
    isValid = false;
  }

  if (
    !ingredientForm.stockQuantity ||
    parseFloat(ingredientForm.stockQuantity) < 0
  ) {
    errors.stockQuantity = "Stock quantity must be 0 or greater";
    isValid = false;
  }

  if (
    !ingredientForm.restockThreshold ||
    parseFloat(ingredientForm.restockThreshold) < 0
  ) {
    errors.restockThreshold = "Restock threshold must be 0 or greater";
    isValid = false;
  }

  if (!isValid) {
    setFormErrors((prev) => ({ ...prev, ingredient: errors }));
  }

  return isValid;
}

export function validateRecipeForm(recipeForm, setFormErrors) {
  const errors = { name: "", targetMargin: "", ingredients: "" };
  let isValid = true;

  if (!recipeForm.name.trim()) {
    errors.name = "Recipe name is required";
    isValid = false;
  }

  // Allow 0-100 range since UI converts to 0-1 for backend
  if (
    !recipeForm.targetMargin ||
    parseFloat(recipeForm.targetMargin) < 0 ||
    parseFloat(recipeForm.targetMargin) > 100
  ) {
    errors.targetMargin = "Target margin must be between 0 and 100";
    isValid = false;
  }

  const validIngredients = recipeForm.ingredients.filter(
    (ing) => ing.id && ing.quantity
  );
  if (validIngredients.length === 0) {
    errors.ingredients = "At least one ingredient is required";
    isValid = false;
  }

  if (!isValid) {
    setFormErrors((prev) => ({ ...prev, recipe: errors }));
  }

  return isValid;
}

export function validateSaleForm(saleForm, setFormErrors) {
  const errors = { recipeId: "", saleAmount: "", quantitySold: "" };
  let isValid = true;

  if (!saleForm.recipeId) {
    errors.recipeId = "Recipe is required";
    isValid = false;
  }

  if (!saleForm.saleAmount || parseFloat(saleForm.saleAmount) <= 0) {
    errors.saleAmount = "Sale amount must be greater than 0";
    isValid = false;
  }

  if (!saleForm.quantitySold || parseInt(saleForm.quantitySold) <= 0) {
    errors.quantitySold = "Quantity sold must be greater than 0";
    isValid = false;
  }

  if (!isValid) {
    setFormErrors((prev) => ({ ...prev, sale: errors }));
  }

  return isValid;
}
