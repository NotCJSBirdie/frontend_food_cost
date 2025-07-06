export interface Ingredient {
  id: string;
  name: string;
  unitPrice: number;
  unit: string;
  stockQuantity: number;
  restockThreshold: number;
}

export interface Recipe {
  id: string;
  name: string;
  cost: number;
  targetMargin: number;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: string;
  ingredient: Ingredient;
  quantity: number;
}

export interface Sale {
  id: string;
  recipe: Recipe;
  saleAmount: number;
  quantitySold: number;
  profit: number;
  createdAt: string;
}

export interface DashboardStats {
  totalSales: number;
  totalCosts: number;
  totalMargin: number;
  lowStockIngredients: Ingredient[];
}

export interface FormData {
  ingredient: {
    name: string;
    unitPrice: string;
    unit: string;
    stockQuantity: string;
    restockThreshold: string;
  };
  recipe: {
    name: string;
    targetMargin: string;
    ingredients: { id: string; quantity: string }[];
  };
  sale: {
    recipeId: string;
    saleAmount: string;
    quantitySold: string;
  };
}

export interface FormErrors {
  ingredient: {
    name: string;
    unitPrice: string;
    unit: string;
    stockQuantity: string;
    restockThreshold: string;
  };
  recipe: {
    name: string;
    targetMargin: string;
    ingredients: string;
  };
  sale: {
    recipeId: string;
    saleAmount: string;
    quantitySold: string;
  };
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "loading" | "confirm";
  onConfirm?: () => void;
}
