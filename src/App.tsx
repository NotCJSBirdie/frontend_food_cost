/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, gql } from "@apollo/client";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import "./App.css";

const GET_DATA = gql`
  query {
    dashboardStats {
      totalSales
      totalCosts
      totalMargin
      lowStockIngredients {
        id
        name
        stockQuantity
        restockThreshold
      }
    }
    ingredients {
      id
      name
      unitPrice
      unit
      stockQuantity
      restockThreshold
    }
    recipes {
      id
      name
      totalCost
      suggestedPrice
      ingredients {
        id
        quantity
        ingredient {
          id
          name
          unitPrice
          unit
        }
      }
    }
    sales {
      id
      saleAmount
      createdAt
      recipe {
        id
        name
      }
    }
  }
`;

const ADD_INGREDIENT = gql`
  mutation AddIngredient(
    $name: String!
    $unitPrice: Float!
    $unit: String!
    $stockQuantity: Float!
    $restockThreshold: Float!
  ) {
    addIngredient(
      name: $name
      unitPrice: $unitPrice
      unit: $unit
      stockQuantity: $stockQuantity
      restockThreshold: $restockThreshold
    ) {
      id
      name
      unitPrice
      unit
      stockQuantity
      restockThreshold
      success
      error
    }
  }
`;

const CREATE_RECIPE = gql`
  mutation CreateRecipe(
    $name: String!
    $ingredientIds: [ID!]!
    $quantities: [Float!]!
    $targetMargin: Float
  ) {
    createRecipe(
      name: $name
      ingredientIds: $ingredientIds
      quantities: $quantities
      targetMargin: $targetMargin
    ) {
      id
      name
      totalCost
      suggestedPrice
      ingredients {
        id
        quantity
        ingredient {
          id
          name
          unitPrice
          unit
        }
      }
      success
      error
    }
  }
`;

const RECORD_SALE = gql`
  mutation RecordSale(
    $recipeId: ID!
    $saleAmount: Float!
    $quantitySold: Int!
  ) {
    recordSale(
      recipeId: $recipeId
      saleAmount: $saleAmount
      quantitySold: $quantitySold
    ) {
      id
      saleAmount
      createdAt
      recipe {
        id
        name
      }
      success
      error
    }
  }
`;

const DELETE_INGREDIENT = gql`
  mutation DeleteIngredient($id: ID!) {
    deleteIngredient(id: $id) {
      success
      error
    }
  }
`;

const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id) {
      success
      error
    }
  }
`;

const DELETE_SALE = gql`
  mutation DeleteSale($id: ID!) {
    deleteSale(id: $id) {
      success
      error
    }
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error" | "loading";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-labelledby="modal-title">
      <div className={`modal ${type}`}>
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        <p className="modal-message">{message}</p>
        {type === "loading" ? (
          <div className="spinner"></div>
        ) : (
          <button
            className="modal-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

function App() {
  const { loading, error, data, refetch } = useQuery(GET_DATA);
  const [
    addIngredient,
    { error: addIngredientError, loading: addIngredientLoading },
  ] = useMutation(ADD_INGREDIENT);
  const [
    createRecipe,
    { error: createRecipeError, loading: createRecipeLoading },
  ] = useMutation(CREATE_RECIPE);
  const [recordSale, { error: recordSaleError, loading: recordSaleLoading }] =
    useMutation(RECORD_SALE);
  const [
    deleteIngredient,
    { error: deleteIngredientError, loading: deleteIngredientLoading },
  ] = useMutation(DELETE_INGREDIENT);
  const [
    deleteRecipe,
    { error: deleteRecipeError, loading: deleteRecipeLoading },
  ] = useMutation(DELETE_RECIPE);
  const [deleteSale, { error: deleteSaleError, loading: deleteSaleLoading }] =
    useMutation(DELETE_SALE);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSubmitting, setIsSubmitting] = useState({
    ingredient: false,
    recipe: false,
    sale: false,
  });
  const [ingredientForm, setIngredientForm] = useState({
    name: "",
    unitPrice: "",
    unit: "",
    stockQuantity: "",
    restockThreshold: "",
  });
  const [recipeForm, setRecipeForm] = useState({
    name: "",
    targetMargin: "30",
    ingredients: [{ id: "", quantity: "" }],
  });
  const [saleForm, setSaleForm] = useState({
    recipeId: "",
    saleAmount: "",
    quantitySold: "1",
  });
  const [formErrors, setFormErrors] = useState({
    ingredient: {
      name: "",
      unitPrice: "",
      unit: "",
      stockQuantity: "",
      restockThreshold: "",
    },
    recipe: { name: "", targetMargin: "", ingredients: "" },
    sale: { recipeId: "", saleAmount: "", quantitySold: "" },
  });
  const [deletingItems, setDeletingItems] = useState<{
    ingredients: Set<string>;
    recipes: Set<string>;
    sales: Set<string>;
  }>({
    ingredients: new Set(),
    recipes: new Set(),
    sales: new Set(),
  });
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "loading";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const closeModal = () => setModal({ ...modal, isOpen: false });

  useEffect(() => {
    if (addIngredientError) {
      setModal({
        isOpen: true,
        title: "Error",
        message: addIngredientError.message,
        type: "error",
      });
    }
    if (createRecipeError) {
      setModal({
        isOpen: true,
        title: "Error",
        message: createRecipeError.message,
        type: "error",
      });
    }
    if (recordSaleError) {
      setModal({
        isOpen: true,
        title: "Error",
        message: recordSaleError.message,
        type: "error",
      });
    }
    if (deleteIngredientError) {
      setModal({
        isOpen: true,
        title: "Error",
        message: deleteIngredientError.message,
        type: "error",
      });
    }
    if (deleteRecipeError) {
      setModal({
        isOpen: true,
        title: "Error",
        message: deleteRecipeError.message,
        type: "error",
      });
    }
    if (deleteSaleError) {
      setModal({
        isOpen: true,
        title: "Error",
        message: deleteSaleError.message,
        type: "error",
      });
    }
  }, [
    addIngredientError,
    createRecipeError,
    recordSaleError,
    deleteIngredientError,
    deleteRecipeError,
    deleteSaleError,
  ]);

  const validateIngredientForm = () => {
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
    } else if (ingredientForm.name.length > 50) {
      errors.name = "Name must be 50 characters or less";
      isValid = false;
    }

    const unitPrice = parseFloat(ingredientForm.unitPrice);
    if (!ingredientForm.unitPrice || isNaN(unitPrice)) {
      errors.unitPrice = "Valid unit price is required";
      isValid = false;
    } else if (unitPrice < 0) {
      errors.unitPrice = "Unit price cannot be negative";
      isValid = false;
    }

    if (!ingredientForm.unit.trim()) {
      errors.unit = "Unit is required";
      isValid = false;
    } else if (!/^[a-zA-Z]+$/.test(ingredientForm.unit)) {
      errors.unit = "Unit must contain only letters";
      isValid = false;
    }

    const stockQuantity = parseFloat(ingredientForm.stockQuantity);
    if (!ingredientForm.stockQuantity || isNaN(stockQuantity)) {
      errors.stockQuantity = "Valid stock quantity is required";
      isValid = false;
    } else if (stockQuantity < 0) {
      errors.stockQuantity = "Stock quantity cannot be negative";
      isValid = false;
    }

    const restockThreshold = parseFloat(ingredientForm.restockThreshold);
    if (!ingredientForm.restockThreshold || isNaN(restockThreshold)) {
      errors.restockThreshold = "Valid restock threshold is required";
      isValid = false;
    } else if (restockThreshold < 0) {
      errors.restockThreshold = "Restock threshold cannot be negative";
      isValid = false;
    }

    setFormErrors((prev) => ({ ...prev, ingredient: errors }));
    return isValid;
  };

  const validateRecipeForm = () => {
    const errors = { name: "", targetMargin: "", ingredients: "" };
    let isValid = true;

    if (!recipeForm.name.trim()) {
      errors.name = "Recipe name is required";
      isValid = false;
    } else if (recipeForm.name.length > 50) {
      errors.name = "Name must be 50 characters or less";
      isValid = false;
    }

    const targetMargin = parseFloat(recipeForm.targetMargin);
    if (recipeForm.targetMargin && (isNaN(targetMargin) || targetMargin < 0)) {
      errors.targetMargin = "Target margin must be a positive number";
      isValid = false;
    }

    if (
      !recipeForm.ingredients.every(
        (ing) => ing.id && parseFloat(ing.quantity) > 0
      )
    ) {
      errors.ingredients =
        "All ingredients must have valid ID and positive quantity";
      isValid = false;
    }

    setFormErrors((prev) => ({ ...prev, recipe: errors }));
    return isValid;
  };

  const validateSaleForm = () => {
    const errors = { recipeId: "", saleAmount: "", quantitySold: "" };
    let isValid = true;

    if (!saleForm.recipeId) {
      errors.recipeId = "Please select a recipe";
      isValid = false;
    }

    const saleAmount = parseFloat(saleForm.saleAmount);
    if (!saleForm.saleAmount || isNaN(saleAmount) || saleAmount <= 0) {
      errors.saleAmount = "Valid sale amount greater than 0 is required";
      isValid = false;
    }

    const quantitySold = parseInt(saleForm.quantitySold);
    if (!saleForm.quantitySold || isNaN(quantitySold) || quantitySold <= 0) {
      errors.quantitySold = "Valid quantity greater than 0 is required";
      isValid = false;
    }

    setFormErrors((prev) => ({ ...prev, sale: errors }));
    return isValid;
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIngredientForm()) return;

    setIsSubmitting({ ...isSubmitting, ingredient: true });
    setModal({
      isOpen: true,
      title: "Adding Ingredient",
      message: "Please wait while the ingredient is being added...",
      type: "loading",
    });

    try {
      const { data } = await addIngredient({
        variables: {
          name: ingredientForm.name,
          unitPrice: parseFloat(ingredientForm.unitPrice),
          unit: ingredientForm.unit,
          stockQuantity: parseFloat(ingredientForm.stockQuantity),
          restockThreshold: parseFloat(ingredientForm.restockThreshold),
        },
      });

      if (data.addIngredient.success === false) {
        setModal({
          isOpen: true,
          title: "Error",
          message: data.addIngredient.error || "Failed to add ingredient",
          type: "error",
        });
      } else {
        setModal({
          isOpen: true,
          title: "Success",
          message: "Ingredient added successfully!",
          type: "success",
        });
        setIngredientForm({
          name: "",
          unitPrice: "",
          unit: "",
          stockQuantity: "",
          restockThreshold: "",
        });
        refetch();
      }
    } catch (err: any) {
      console.error("addIngredient failed:", err);
    } finally {
      setIsSubmitting({ ...isSubmitting, ingredient: false });
    }
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRecipeForm()) return;

    setIsSubmitting({ ...isSubmitting, recipe: true });
    setModal({
      isOpen: true,
      title: "Creating Recipe",
      message: "Please wait while the recipe is being created...",
      type: "loading",
    });

    try {
      const { data } = await createRecipe({
        variables: {
          name: recipeForm.name,
          ingredientIds: recipeForm.ingredients.map((ing) => ing.id),
          quantities: recipeForm.ingredients.map((ing) =>
            parseFloat(ing.quantity)
          ),
          targetMargin: parseFloat(recipeForm.targetMargin) / 100,
        },
      });

      if (data.createRecipe.success === false) {
        setModal({
          isOpen: true,
          title: "Error",
          message: data.createRecipe.error || "Failed to create recipe",
          type: "error",
        });
      } else {
        setModal({
          isOpen: true,
          title: "Success",
          message: "Recipe created successfully!",
          type: "success",
        });
        setRecipeForm({
          name: "",
          targetMargin: "30",
          ingredients: [{ id: "", quantity: "" }],
        });
        refetch();
      }
    } catch (err: any) {
      console.error("createRecipe failed:", err);
    } finally {
      setIsSubmitting({ ...isSubmitting, recipe: false });
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSaleForm()) return;

    setIsSubmitting({ ...isSubmitting, sale: true });
    setModal({
      isOpen: true,
      title: "Recording Sale",
      message: "Please wait while the sale is being recorded...",
      type: "loading",
    });

    try {
      const { data } = await recordSale({
        variables: {
          recipeId: saleForm.recipeId,
          saleAmount: parseFloat(saleForm.saleAmount),
          quantitySold: parseInt(saleForm.quantitySold),
        },
      });

      if (data.recordSale.success === false) {
        setModal({
          isOpen: true,
          title: "Error",
          message: data.recordSale.error || "Failed to record sale",
          type: "error",
        });
      } else {
        setModal({
          isOpen: true,
          title: "Success",
          message: "Sale recorded successfully!",
          type: "success",
        });
        setSaleForm({ recipeId: "", saleAmount: "", quantitySold: "1" });
        refetch();
      }
    } catch (err: any) {
      console.error("recordSale failed:", err);
    } finally {
      setIsSubmitting({ ...isSubmitting, sale: false });
    }
  };

  const handleDeleteIngredient = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ingredient "${name}"? This will remove it from all recipes.`
      )
    )
      return;

    setDeletingItems((prev) => ({
      ...prev,
      ingredients: new Set(prev.ingredients).add(id),
    }));
    setModal({
      isOpen: true,
      title: "Deleting Ingredient",
      message: `Deleting ingredient "${name}"...`,
      type: "loading",
    });

    try {
      const { data } = await deleteIngredient({ variables: { id } });
      if (data.deleteIngredient.success) {
        setModal({
          isOpen: true,
          title: "Success",
          message: `Ingredient "${name}" deleted successfully!`,
          type: "success",
        });
        refetch();
      } else {
        setModal({
          isOpen: true,
          title: "Error",
          message: data.deleteIngredient.error || "Failed to delete ingredient",
          type: "error",
        });
      }
    } catch (err) {
      console.error("deleteIngredient failed:", err);
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.ingredients);
        newSet.delete(id);
        return { ...prev, ingredients: newSet };
      });
    }
  };

  const handleDeleteRecipe = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete recipe "${name}"? This will remove all associated sales.`
      )
    )
      return;

    setDeletingItems((prev) => ({
      ...prev,
      recipes: new Set(prev.recipes).add(id),
    }));
    setModal({
      isOpen: true,
      title: "Deleting Recipe",
      message: `Deleting recipe "${name}"...`,
      type: "loading",
    });

    try {
      const { data } = await deleteRecipe({ variables: { id } });
      if (data.deleteRecipe.success) {
        setModal({
          isOpen: true,
          title: "Success",
          message: `Recipe "${name}" deleted successfully!`,
          type: "success",
        });
        refetch();
      } else {
        setModal({
          isOpen: true,
          title: "Error",
          message: data.deleteRecipe.error || "Failed to delete recipe",
          type: "error",
        });
      }
    } catch (err) {
      console.error("deleteRecipe failed:", err);
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.recipes);
        newSet.delete(id);
        return { ...prev, recipes: newSet };
      });
    }
  };

  const handleDeleteSale = async (id: string, recipeName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete sale of "${recipeName}"?`
      )
    )
      return;

    setDeletingItems((prev) => ({
      ...prev,
      sales: new Set(prev.sales).add(id),
    }));
    setModal({
      isOpen: true,
      title: "Deleting Sale",
      message: `Deleting sale of "${recipeName}"...`,
      type: "loading",
    });

    try {
      const { data } = await deleteSale({ variables: { id } });
      if (data.deleteSale.success) {
        setModal({
          isOpen: true,
          title: "Success",
          message: `Sale of "${recipeName}" deleted successfully!`,
          type: "success",
        });
        refetch();
      } else {
        setModal({
          isOpen: true,
          title: "Error",
          message: data.deleteSale.error || "Failed to delete sale",
          type: "error",
        });
      }
    } catch (err) {
      console.error("deleteSale failed:", err);
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.sales);
        newSet.delete(id);
        return { ...prev, sales: newSet };
      });
    }
  };

  const addIngredientToRecipe = () => {
    setRecipeForm({
      ...recipeForm,
      ingredients: [...recipeForm.ingredients, { id: "", quantity: "" }],
    });
  };

  const updateRecipeIngredient = (
    index: number,
    field: "id" | "quantity",
    value: string
  ) => {
    const newIngredients = [...recipeForm.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipeForm({ ...recipeForm, ingredients: newIngredients });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="card" role="region" aria-labelledby="dashboard-title">
            <h2 id="dashboard-title" className="card-title">
              Dashboard
            </h2>
            <div className="stats-grid">
              <div className="stat">
                <p>
                  Total Sales: £
                  {(data?.dashboardStats?.totalSales ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="stat">
                <p>
                  Total Costs: £
                  {(data?.dashboardStats?.totalCosts ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="stat">
                <p>
                  Total Margin:{" "}
                  <span
                    className={
                      (data?.dashboardStats?.totalMargin ?? 0) >= 0
                        ? "margin-positive"
                        : "margin-negative"
                    }
                  >
                    £{(data?.dashboardStats?.totalMargin ?? 0).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
            <h3 className="section-title">Low Stock Alerts</h3>
            <ul className="list" aria-label="Low stock ingredients">
              {(data?.dashboardStats?.lowStockIngredients ?? []).map(
                (ingredient: any) => (
                  <li key={ingredient.id} className="list-item alert">
                    <div className="list-item-content">
                      <div>
                        <p className="list-item-title">
                          {ingredient.name ?? "Unknown"}
                        </p>
                        <p className="list-item-description">
                          {ingredient.stockQuantity ?? 0}{" "}
                          {ingredient.unit ?? ""} (Threshold:{" "}
                          {ingredient.restockThreshold ?? 0})
                        </p>
                      </div>
                    </div>
                  </li>
                )
              )}
            </ul>
            <div className="guide">
              <h3 className="section-title">Usage Guide</h3>
              <p>
                The Dashboard provides an overview of your business performance:
              </p>
              <ul className="guide-list">
                <li>
                  <strong>Total Sales</strong>: Total revenue from all recorded
                  sales.
                </li>
                <li>
                  <strong>Total Costs</strong>: Sum of costs for all ingredients
                  used in recipes.
                </li>
                <li>
                  <strong>Total Margin</strong>: Profit calculated as sales
                  minus costs.
                </li>
                <li>
                  <strong>Low Stock Alerts</strong>: Lists ingredients below
                  their restock threshold.
                </li>
              </ul>
            </div>
          </div>
        );
      case "ingredients":
        return (
          <div
            className="card"
            role="region"
            aria-labelledby="ingredients-title"
          >
            <h2 id="ingredients-title" className="card-title">
              Ingredients
            </h2>
            <form onSubmit={handleAddIngredient} className="form">
              <div className="form-group">
                <label htmlFor="ingredient-name">Ingredient Name</label>
                <p className="form-description">
                  Enter the name of the ingredient (e.g., Flour, Sugar)
                </p>
                <input
                  id="ingredient-name"
                  type="text"
                  value={ingredientForm.name}
                  onChange={(e) =>
                    setIngredientForm({
                      ...ingredientForm,
                      name: e.target.value,
                    })
                  }
                  className="input"
                  required
                  aria-describedby="ingredient-name-error"
                />
                {formErrors.ingredient.name && (
                  <p id="ingredient-name-error" className="error">
                    {formErrors.ingredient.name}
                  </p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="unit-price">Unit Price (£)</label>
                <p className="form-description">
                  Enter the price per unit (e.g., 1.50 for £1.50/kg)
                </p>
                <input
                  id="unit-price"
                  type="number"
                  value={ingredientForm.unitPrice}
                  onChange={(e) =>
                    setIngredientForm({
                      ...ingredientForm,
                      unitPrice: e.target.value,
                    })
                  }
                  step="0.01"
                  className="input"
                  required
                  aria-describedby="unit-price-error"
                />
                {formErrors.ingredient.unitPrice && (
                  <p id="unit-price-error" className="error">
                    {formErrors.ingredient.unitPrice}
                  </p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="unit">Unit</label>
                <p className="form-description">
                  Specify the unit of measurement (e.g., kg, g, L)
                </p>
                <input
                  id="unit"
                  type="text"
                  value={ingredientForm.unit}
                  onChange={(e) =>
                    setIngredientForm({
                      ...ingredientForm,
                      unit: e.target.value,
                    })
                  }
                  className="input"
                  required
                  aria-describedby="unit-error"
                />
                {formErrors.ingredient.unit && (
                  <p id="unit-error" className="error">
                    {formErrors.ingredient.unit}
                  </p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="stock-quantity">Stock Quantity</label>
                <p className="form-description">
                  Enter the current stock amount (e.g., 10 for 10kg)
                </p>
                <input
                  id="stock-quantity"
                  type="number"
                  value={ingredientForm.stockQuantity}
                  onChange={(e) =>
                    setIngredientForm({
                      ...ingredientForm,
                      stockQuantity: e.target.value,
                    })
                  }
                  step="0.1"
                  className="input"
                  required
                  aria-describedby="stock-quantity-error"
                />
                {formErrors.ingredient.stockQuantity && (
                  <p id="stock-quantity-error" className="error">
                    {formErrors.ingredient.stockQuantity}
                  </p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="restock-threshold">Restock Threshold</label>
                <p className="form-description">
                  Set the minimum stock level before restocking is needed
                </p>
                <input
                  id="restock-threshold"
                  type="number"
                  value={ingredientForm.restockThreshold}
                  onChange={(e) =>
                    setIngredientForm({
                      ...ingredientForm,
                      restockThreshold: e.target.value,
                    })
                  }
                  step="0.1"
                  className="input"
                  required
                  aria-describedby="restock-threshold-error"
                />
                {formErrors.ingredient.restockThreshold && (
                  <p id="restock-threshold-error" className="error">
                    {formErrors.ingredient.restockThreshold}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="button"
                disabled={isSubmitting.ingredient || addIngredientLoading}
                aria-busy={addIngredientLoading ? "true" : "false"}
              >
                {addIngredientLoading ? "Adding..." : "Add Ingredient"}
              </button>
            </form>
            <ul className="list" aria-label="Ingredients list">
              {(data?.ingredients ?? []).map((ingredient: any) => (
                <li key={ingredient.id} className="list-item">
                  <div className="list-item-content">
                    <div>
                      <p className="list-item-title">
                        {ingredient.name ?? "Unknown"}
                      </p>
                      <p className="list-item-description">
                        £{(ingredient.unitPrice ?? 0).toFixed(2)}/
                        {ingredient.unit ?? ""}, Stock:{" "}
                        {ingredient.stockQuantity ?? 0} (Threshold:{" "}
                        {ingredient.restockThreshold ?? 0})
                      </p>
                    </div>
                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDeleteIngredient(ingredient.id, ingredient.name)
                      }
                      disabled={
                        deletingItems.ingredients.has(ingredient.id) ||
                        deleteIngredientLoading
                      }
                      aria-label={`Delete ${ingredient.name}`}
                    >
                      {deletingItems.ingredients.has(ingredient.id) ||
                      deleteIngredientLoading ? (
                        "Deleting..."
                      ) : (
                        <FaTrash className="delete-icon" />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="guide">
              <h3 className="section-title">Usage Guide</h3>
              <p>Manage your ingredients effectively:</p>
              <ul className="guide-list">
                <li>
                  <strong>Add Ingredient</strong>: Fill in all fields with valid
                  data (name, price, unit, quantity, threshold).
                </li>
                <li>
                  <strong>Validation</strong>: Names must be ≤50 characters,
                  prices and quantities must be positive, units must be letters
                  only.
                </li>
                <li>
                  <strong>Delete Ingredient</strong>: Click the trash icon to
                  remove an ingredient (will affect recipes).
                </li>
                <li>
                  <strong>Automatic Updates</strong>: List refreshes
                  automatically after adding/deleting.
                </li>
              </ul>
            </div>
          </div>
        );
      case "recipes":
        return (
          <div className="card" role="region" aria-labelledby="recipes-title">
            <h2 id="recipes-title" className="card-title">
              Create Recipe
            </h2>
            <form onSubmit={handleCreateRecipe} className="form">
              <div className="form-group">
                <label htmlFor="recipe-name">Recipe Name</label>
                <p className="form-description">
                  Enter the name of the recipe (e.g., Chocolate Cake)
                </p>
                <input
                  id="recipe-name"
                  type="text"
                  value={recipeForm.name}
                  onChange={(e) =>
                    setRecipeForm({ ...recipeForm, name: e.target.value })
                  }
                  className="input"
                  required
                  aria-describedby="recipe-name-error"
                />
                {formErrors.recipe.name && (
                  <p id="recipe-name-error" className="error">
                    {formErrors.recipe.name}
                  </p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="target-margin">Target Margin (%)</label>
                <p className="form-description">
                  Desired profit margin as a percentage (default is 30%)
                </p>
                <input
                  id="target-margin"
                  type="number"
                  value={recipeForm.targetMargin}
                  onChange={(e) =>
                    setRecipeForm({
                      ...recipeForm,
                      targetMargin: e.target.value,
                    })
                  }
                  step="1"
                  className="input"
                  aria-describedby="target-margin-error"
                />
                {formErrors.recipe.targetMargin && (
                  <p id="target-margin-error" className="error">
                    {formErrors.recipe.targetMargin}
                  </p>
                )}
              </div>
              {recipeForm.ingredients.map((ing, index) => (
                <div key={index} className="ingredient-row">
                  <div className="form-group">
                    <label htmlFor={`ingredient-${index}`}>Ingredient</label>
                    <p className="form-description">
                      Select an ingredient from the list
                    </p>
                    <select
                      id={`ingredient-${index}`}
                      value={ing.id}
                      onChange={(e) =>
                        updateRecipeIngredient(index, "id", e.target.value)
                      }
                      className="input"
                      required
                      aria-describedby={`ingredient-${index}-error`}
                    >
                      <option value="" disabled>
                        Select an Ingredient
                      </option>
                      {(data?.ingredients ?? []).map((ingredient: any) => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name ?? "Unknown"} (£
                          {(ingredient.unitPrice ?? 0).toFixed(2)}/
                          {ingredient.unit ?? ""})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor={`quantity-${index}`}>Quantity</label>
                    <p className="form-description">
                      Enter the quantity needed for this recipe
                    </p>
                    <input
                      id={`quantity-${index}`}
                      type="number"
                      value={ing.quantity}
                      onChange={(e) =>
                        updateRecipeIngredient(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      step="0.1"
                      className="input"
                      required
                      aria-describedby={`quantity-${index}-error`}
                    />
                  </div>
                </div>
              ))}
              {formErrors.recipe.ingredients && (
                <p id="ingredients-error" className="error">
                  {formErrors.recipe.ingredients}
                </p>
              )}
              <button
                type="button"
                className="button secondary"
                onClick={addIngredientToRecipe}
                aria-label="Add another ingredient"
              >
                Add Another Ingredient
              </button>
              <button
                type="submit"
                className="button"
                disabled={isSubmitting.recipe || createRecipeLoading}
                aria-busy={createRecipeLoading ? "true" : "false"}
              >
                {createRecipeLoading ? "Creating..." : "Create Recipe"}
              </button>
            </form>
            <ul className="list" aria-label="Recipes list">
              {(data?.recipes ?? []).map((recipe: any) => (
                <li key={recipe.id} className="list-item">
                  <div className="list-item-content">
                    <div>
                      <p className="list-item-title">
                        {recipe.name ?? "Unknown"}
                      </p>
                      <p className="list-item-description">
                        £{(recipe.totalCost ?? 0).toFixed(2)} (Suggested Price:
                        £{(recipe.suggestedPrice ?? 0).toFixed(2)})
                      </p>
                      <ul className="nested-list">
                        {(recipe.ingredients ?? []).map((ri: any) => (
                          <li key={ri.id} className="nested-list-item">
                            {ri.ingredient?.name ?? "Unknown"}:{" "}
                            {ri.quantity ?? 0} {ri.ingredient?.unit ?? ""} (£
                            {(ri.ingredient?.unitPrice ?? 0).toFixed(2)}/unit)
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteRecipe(recipe.id, recipe.name)}
                      disabled={
                        deletingItems.recipes.has(recipe.id) ||
                        deleteRecipeLoading
                      }
                      aria-label={`Delete ${recipe.name}`}
                    >
                      {deletingItems.recipes.has(recipe.id) ||
                      deleteRecipeLoading ? (
                        "Deleting..."
                      ) : (
                        <FaTrash className="delete-icon" />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="guide">
              <h3 className="section-title">Usage Guide</h3>
              <p>Create and manage recipes:</p>
              <ul className="guide-list">
                <li>
                  <strong>Add Recipe</strong>: Enter a name and select
                  ingredients with quantities.
                </li>
                <li>
                  <strong>Validation</strong>: Names must be ≤50 characters,
                  quantities must be positive, all ingredients must be selected.
                </li>
                <li>
                  <strong>Delete Recipe</strong>: Click the trash icon to remove
                  a recipe (affects sales).
                </li>
                <li>
                  <strong>Automatic Updates</strong>: List refreshes
                  automatically after adding/deleting.
                </li>
              </ul>
            </div>
          </div>
        );
      case "sales":
        return (
          <div className="card" role="region" aria-labelledby="sales-title">
            <h2 id="sales-title" className="card-title">
              Record Sale
            </h2>
            <form onSubmit={handleRecordSale} className="form">
              <div className="form-group">
                <label htmlFor="recipe-select">Recipe</label>
                <p className="form-description">
                  Select the recipe that was sold
                </p>
                <select
                  id="recipe-select"
                  value={saleForm.recipeId}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, recipeId: e.target.value })
                  }
                  className="input"
                  required
                  aria-describedby="recipe-select-error"
                >
                  <option value="" disabled>
                    Select a Recipe
                  </option>
                  {(data?.recipes ?? []).map((recipe: any) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name ?? "Unknown"} (£
                      {(recipe.totalCost ?? 0).toFixed(2)})
                    </option>
                  ))}
                </select>
                {formErrors.sale.recipeId && (
                  <p id="recipe-select-error" className="error">
                    {formErrors.sale.recipeId}
                  </p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="sale-amount">Sale Amount (£)</label>
                <p className="form-description">
                  Enter the total sale price for this transaction
                </p>
                <input
                  id="sale-amount"
                  type="number"
                  value={saleForm.saleAmount}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, saleAmount: e.target.value })
                  }
                  step="0.01"
                  className="input"
                  required
                  aria-describedby="sale-amount-error"
                />
                {formErrors.sale.saleAmount && (
                  <p id="sale-amount-error" className="error">
                    {formErrors.sale.saleAmount}
                  </p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="quantity-sold">Quantity Sold</label>
                <p className="form-description">
                  Enter the number of units sold
                </p>
                <input
                  id="quantity-sold"
                  type="number"
                  value={saleForm.quantitySold}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, quantitySold: e.target.value })
                  }
                  step="1"
                  className="input"
                  required
                  aria-describedby="quantity-sold-error"
                />
                {formErrors.sale.quantitySold && (
                  <p id="quantity-sold-error" className="error">
                    {formErrors.sale.quantitySold}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="button"
                disabled={isSubmitting.sale || recordSaleLoading}
                aria-busy={recordSaleLoading ? "true" : "false"}
              >
                {recordSaleLoading ? "Recording..." : "Record Sale"}
              </button>
            </form>
            <ul className="list" aria-label="Sales list">
              {(data?.sales ?? []).map((sale: any) => (
                <li key={sale.id} className="list-item">
                  <div className="list-item-content">
                    <div>
                      <p className="list-item-title">
                        Sale of {sale.recipe?.name ?? "Unknown"}
                      </p>
                      <p className="list-item-description">
                        £{(sale.saleAmount ?? 0).toFixed(2)} (Created:{" "}
                        {sale.createdAt
                          ? new Date(sale.createdAt).toLocaleDateString()
                          : "N/A"}
                        )
                      </p>
                    </div>
                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDeleteSale(sale.id, sale.recipe?.name)
                      }
                      disabled={
                        deletingItems.sales.has(sale.id) || deleteSaleLoading
                      }
                      aria-label={`Delete sale of ${sale.recipe?.name}`}
                    >
                      {deletingItems.sales.has(sale.id) || deleteSaleLoading ? (
                        "Deleting..."
                      ) : (
                        <FaTrash className="delete-icon" />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="guide">
              <h3 className="section-title">Usage Guide</h3>
              <p>Record and track sales:</p>
              <ul className="guide-list">
                <li>
                  <strong>Record Sale</strong>: Select a recipe and enter sale
                  amount and quantity.
                </li>
                <li>
                  <strong>Validation</strong>: Sale amount and quantity must be
                  positive numbers.
                </li>
                <li>
                  <strong>Delete Sale</strong>: Click the trash icon to remove a
                  sale.
                </li>
                <li>
                  <strong>Automatic Updates</strong>: List refreshes
                  automatically after adding/deleting.
                </li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <h1 className="title">Food Cost Manager</h1>
      <nav className="tab-bar" role="tablist">
        <button
          className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
          role="tab"
          aria-selected={activeTab === "dashboard"}
          aria-controls="dashboard-panel"
        >
          Dashboard
        </button>
        <button
          className={`tab ${activeTab === "ingredients" ? "active" : ""}`}
          onClick={() => setActiveTab("ingredients")}
          role="tab"
          aria-selected={activeTab === "ingredients"}
          aria-controls="ingredients-panel"
        >
          Ingredients
        </button>
        <button
          className={`tab ${activeTab === "recipes" ? "active" : ""}`}
          onClick={() => setActiveTab("recipes")}
          role="tab"
          aria-selected={activeTab === "recipes"}
          aria-controls="recipes-panel"
        >
          Recipes
        </button>
        <button
          className={`tab ${activeTab === "sales" ? "active" : ""}`}
          onClick={() => setActiveTab("sales")}
          role="tab"
          aria-selected={activeTab === "sales"}
          aria-controls="sales-panel"
        >
          Sales
        </button>
      </nav>
      <div className="tab-content" id={`${activeTab}-panel`} role="tabpanel">
        {loading ? (
          <p className="loading" aria-live="polite">
            Loading...
          </p>
        ) : error ? (
          <p className="error" aria-live="assertive">
            Error: {error.message}
          </p>
        ) : (
          renderTabContent()
        )}
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      <footer className="footer">
        <p>© 2025 Carl Serquina. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
