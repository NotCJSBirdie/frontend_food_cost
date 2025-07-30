export const initialIngredientForm = {
  name: "",
  unitPrice: "",
  unit: "",
  stockQuantity: "",
  restockThreshold: "",
};

export const initialRecipeForm = {
  name: "",
  targetMargin: "30",
  ingredients: [{ id: "", quantity: "" }],
};

export const initialSaleForm = {
  recipeId: "",
  saleAmount: "",
  quantitySold: "1",
};

export const initialFormErrors = {
  ingredient: {
    name: "",
    unitPrice: "",
    unit: "",
    stockQuantity: "",
    restockThreshold: "",
  },
  recipe: {
    name: "",
    targetMargin: "",
    ingredients: "",
  },
  sale: {
    recipeId: "",
    saleAmount: "",
    quantitySold: "",
  },
};

// JS doesn't allow Set<string>(), just Set()
export const initialDeletingItems = {
  ingredients: new Set(),
  recipes: new Set(),
  sales: new Set(),
};

export const initialModal = {
  isOpen: false,
  title: "",
  message: "",
  type: "success",
  onConfirm: undefined,
};
