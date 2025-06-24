/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, gql } from "@apollo/client";
import { useState, useEffect, useRef } from "react";
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
      success
      error
      ingredient {
        id
        name
        unitPrice
        unit
        stockQuantity
        restockThreshold
      }
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
      success
      error
      recipe {
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
      success
      error
      sale {
        id
        saleAmount
        createdAt
        recipe {
          id
          name
        }
      }
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
  type: "success" | "error" | "loading" | "confirm";
  onConfirm?: () => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
  onConfirm,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-labelledby="modal-title">
      <div
        className={`modal modal-${type}`}
        ref={modalRef}
        tabIndex={-1}
        aria-modal="true"
      >
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        <p className="modal-message">{message}</p>
        {type === "loading" ? (
          <div className="loading-spinner" aria-label="Loading"></div>
        ) : type === "confirm" ? (
          <div className="modal-buttons">
            <button
              className="modal-button modal-button-confirm"
              onClick={onConfirm}
              aria-label="Confirm action"
            >
              Confirm
            </button>
            <button
              className="modal-button modal-button-cancel"
              onClick={onClose}
              aria-label="Cancel action"
            >
              Cancel
            </button>
          </div>
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
    type: "success" | "error" | "loading" | "confirm";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

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
    if (
      recipeForm.targetMargin &&
      (isNaN(targetMargin) || targetMargin < 0 || targetMargin >= 100)
    ) {
      errors.targetMargin = "Target margin must be between 0 and 99";
      isValid = false;
    }

    if (
      !recipeForm.ingredients.every(
        (ing) => ing.id && parseFloat(ing.quantity) > 0
      )
    ) {
      errors.ingredients =
        "All ingredients must have a selected ingredient and positive quantity";
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
      errors.saleAmount = "Sale amount must be greater than 0";
      isValid = false;
    }

    const quantitySold = parseInt(saleForm.quantitySold);
    if (!saleForm.quantitySold || isNaN(quantitySold) || quantitySold <= 0) {
      errors.quantitySold = "Quantity sold must be greater than 0";
      isValid = false;
    }

    setFormErrors((prev) => ({ ...prev, sale: errors }));
    return isValid;
  };

  const handleAddIngredient = async () => {
    setIsSubmitting({ ...isSubmitting, ingredient: true });
    setModal({
      isOpen: true,
      title: "Adding Ingredient",
      message: `Adding ingredient "${ingredientForm.name}"...`,
      type: "loading",
    });

    try {
      const { data } = await addIngredient({
        variables: {
          name: ingredientForm.name.trim(),
          unitPrice: parseFloat(ingredientForm.unitPrice),
          unit: ingredientForm.unit.trim(),
          stockQuantity: parseFloat(ingredientForm.stockQuantity),
          restockThreshold: parseFloat(ingredientForm.restockThreshold),
        },
      });

      if (!data.addIngredient.success) {
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
          message: `Ingredient "${ingredientForm.name}" added successfully!`,
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
      setModal({
        isOpen: true,
        title: "Error",
        message: err.message || "Failed to add ingredient",
        type: "error",
      });
    } finally {
      setIsSubmitting({ ...isSubmitting, ingredient: false });
    }
  };

  const handleCreateRecipe = async () => {
    setIsSubmitting({ ...isSubmitting, recipe: true });
    setModal({
      isOpen: true,
      title: "Creating Recipe",
      message: `Creating recipe "${recipeForm.name}"...`,
      type: "loading",
    });

    try {
      const { data } = await createRecipe({
        variables: {
          name: recipeForm.name.trim(),
          ingredientIds: recipeForm.ingredients.map((ing) => ing.id),
          quantities: recipeForm.ingredients.map((ing) =>
            parseFloat(ing.quantity)
          ),
          targetMargin: recipeForm.targetMargin
            ? parseFloat(recipeForm.targetMargin) / 100
            : undefined,
        },
      });

      if (!data.createRecipe.success) {
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
          message: `Recipe "${recipeForm.name}" created successfully!`,
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
      setModal({
        isOpen: true,
        title: "Error",
        message: err.message || "Failed to create recipe",
        type: "error",
      });
    } finally {
      setIsSubmitting({ ...isSubmitting, recipe: false });
    }
  };

  const handleRecordSale = async () => {
    setIsSubmitting({ ...isSubmitting, sale: true });
    setModal({
      isOpen: true,
      title: "Recording Sale",
      message: `Recording sale for recipe ID ${saleForm.recipeId}...`,
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

      if (!data.recordSale.success) {
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
          message: `Sale of "${data.recordSale.sale.recipe.name}" recorded successfully!`,
          type: "success",
        });
        setSaleForm({ recipeId: "", saleAmount: "", quantitySold: "1" });
        refetch();
      }
    } catch (err: any) {
      console.error("recordSale failed:", err);
      setModal({
        isOpen: true,
        title: "Error",
        message: err.message || "Failed to record sale",
        type: "error",
      });
    } finally {
      setIsSubmitting({ ...isSubmitting, sale: false });
    }
  };

  const handleDeleteIngredient = async (id: string, name: string) => {
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
    } catch (err: any) {
      console.error("deleteIngredient failed:", err);
      setModal({
        isOpen: true,
        title: "Error",
        message: err.message || "Failed to delete ingredient",
        type: "error",
      });
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.ingredients);
        newSet.delete(id);
        return { ...prev, ingredients: newSet };
      });
    }
  };

  const handleDeleteRecipe = async (id: string, name: string) => {
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
    } catch (err: any) {
      console.error("deleteRecipe failed:", err);
      setModal({
        isOpen: true,
        title: "Error",
        message: err.message || "Failed to delete recipe",
        type: "error",
      });
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.recipes);
        newSet.delete(id);
        return { ...prev, recipes: newSet };
      });
    }
  };

  const handleDeleteSale = async (id: string, recipeName: string) => {
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
    } catch (err: any) {
      console.error("deleteSale failed:", err);
      setModal({
        isOpen: true,
        title: "Error",
        message: err.message || "Failed to delete sale",
        type: "error",
      });
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.sales);
        newSet.delete(id);
        return { ...prev, sales: newSet };
      });
    }
  };

  const confirmAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIngredientForm()) return;

    setModal({
      isOpen: true,
      title: "Confirm Add Ingredient",
      message: `Are you sure you want to add ingredient "${ingredientForm.name}"?`,
      type: "confirm",
      onConfirm: handleAddIngredient,
    });
  };

  const confirmCreateRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRecipeForm()) return;

    setModal({
      isOpen: true,
      title: "Confirm Create Recipe",
      message: `Are you sure you want to create recipe "${recipeForm.name}"?`,
      type: "confirm",
      onConfirm: handleCreateRecipe,
    });
  };

  const confirmRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSaleForm()) return;

    const recipeName =
      data?.recipes?.find((r: any) => r.id === saleForm.recipeId)?.name ||
      "Unknown";

    setModal({
      isOpen: true,
      title: "Confirm Record Sale",
      message: `Are you sure you want to record a sale for "${recipeName}"?`,
      type: "confirm",
      onConfirm: handleRecordSale,
    });
  };

  const confirmDeleteIngredient = (id: string, name: string) => {
    setModal({
      isOpen: true,
      title: "Confirm Delete Ingredient",
      message: `Are you sure you want to delete ingredient "${name}"? This will remove it from all recipes.`,
      type: "confirm",
      onConfirm: () => handleDeleteIngredient(id, name),
    });
  };

  const confirmDeleteRecipe = (id: string, name: string) => {
    setModal({
      isOpen: true,
      title: "Confirm Delete Recipe",
      message: `Are you sure you want to delete recipe "${name}"? This will remove all associated sales.`,
      type: "confirm",
      onConfirm: () => handleDeleteRecipe(id, name),
    });
  };

  const confirmDeleteSale = (id: string, recipeName: string) => {
    setModal({
      isOpen: true,
      title: "Confirm Delete Sale",
      message: `Are you sure you want to delete sale of "${recipeName}"?`,
      type: "confirm",
      onConfirm: () => handleDeleteSale(id, recipeName),
    });
  };

  const resetIngredientForm = () => {
    setIngredientForm({
      name: "",
      unitPrice: "",
      unit: "",
      stockQuantity: "",
      restockThreshold: "",
    });
    setFormErrors((prev) => ({
      ...prev,
      ingredient: {
        name: "",
        unitPrice: "",
        unit: "",
        stockQuantity: "",
        restockThreshold: "",
      },
    }));
  };

  const resetRecipeForm = () => {
    setRecipeForm({
      name: "",
      targetMargin: "30",
      ingredients: [{ id: "", quantity: "" }],
    });
    setFormErrors((prev) => ({
      ...prev,
      recipe: { name: "", targetMargin: "", ingredients: "" },
    }));
  };

  const resetSaleForm = () => {
    setSaleForm({ recipeId: "", saleAmount: "", quantitySold: "1" });
    setFormErrors((prev) => ({
      ...prev,
      sale: { recipeId: "", saleAmount: "", quantitySold: "" },
    }));
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
            <form onSubmit={confirmAddIngredient} className="form">
              <div className="form-group">
                <label htmlFor="ingredient-name">Ingredient Name</label>
                <p className="form-description">
                  Enter the name (e.g., Flour, Sugar)
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
                  Price per unit (e.g., 1.50 for £1.50/kg)
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
                  min="0"
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
                  Unit of measurement (e.g., kg, g, L)
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
                  Current stock amount (e.g., 10 for 10kg)
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
                  min="0"
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
                  Minimum stock level for restocking
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
                  min="0"
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
              <div className="form-buttons">
                <button
                  type="submit"
                  className="button"
                  disabled={isSubmitting.ingredient || addIngredientLoading}
                  aria-busy={addIngredientLoading ? "true" : "false"}
                >
                  {addIngredientLoading ? "Adding..." : "Add Ingredient"}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={resetIngredientForm}
                  aria-label="Reset ingredient form"
                >
                  Reset
                </button>
              </div>
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
                        confirmDeleteIngredient(ingredient.id, ingredient.name)
                      }
                      disabled={
                        deletingItems.ingredients.has(ingredient.id) ||
                        deleteIngredientLoading
                      }
                      aria-label={`Delete ${ingredient.name}`}
                    >
                      {deletingItems.ingredients.has(ingredient.id) ||
                      deleteIngredientLoading ? (
                        <span
                          className="loading-spinner small"
                          aria-hidden="true"
                        ></span>
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
                  data and confirm.
                </li>
                <li>
                  <strong>Validation</strong>: Names ≤50 chars,
                  prices/quantities positive, units letters only.
                </li>
                <li>
                  <strong>Delete Ingredient</strong>: Confirm deletion to remove
                  from recipes.
                </li>
                <li>
                  <strong>Reset Form</strong>: Clear all fields to start over.
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
            <form onSubmit={confirmCreateRecipe} className="form">
              <div className="form-group">
                <label htmlFor="recipe-name">Recipe Name</label>
                <p className="form-description">
                  Enter the name (e.g., Chocolate Cake)
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
                  Desired profit margin (0-99, default 30%)
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
                  min="0"
                  max="99"
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
                    <p className="form-description">Select an ingredient</p>
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
                    <p className="form-description">Quantity needed</p>
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
                      min="0.1"
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
              <div className="form-buttons">
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
                <button
                  type="button"
                  className="button secondary"
                  onClick={resetRecipeForm}
                  aria-label="Reset recipe form"
                >
                  Reset
                </button>
              </div>
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
                      onClick={() =>
                        confirmDeleteRecipe(recipe.id, recipe.name)
                      }
                      disabled={
                        deletingItems.recipes.has(recipe.id) ||
                        deleteRecipeLoading
                      }
                      aria-label={`Delete ${recipe.name}`}
                    >
                      {deletingItems.recipes.has(recipe.id) ||
                      deleteRecipeLoading ? (
                        <span
                          className="loading-spinner small"
                          aria-hidden="true"
                        ></span>
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
                  <strong>Add Recipe</strong>: Enter name, ingredients, and
                  confirm creation.
                </li>
                <li>
                  <strong>Validation</strong>: Names ≤50 chars, quantities
                  positive, ingredients selected.
                </li>
                <li>
                  <strong>Delete Recipe</strong>: Confirm deletion to remove
                  recipe and sales.
                </li>
                <li>
                  <strong>Reset Form</strong>: Clear all fields to start over.
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
            <form onSubmit={confirmRecordSale} className="form">
              <div className="form-group">
                <label htmlFor="recipe-select">Recipe</label>
                <p className="form-description">Select the sold recipe</p>
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
                <p className="form-description">Total sale price</p>
                <input
                  id="sale-amount"
                  type="number"
                  value={saleForm.saleAmount}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, saleAmount: e.target.value })
                  }
                  step="0.01"
                  min="0.01"
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
                <p className="form-description">Number of units sold</p>
                <input
                  id="quantity-sold"
                  type="number"
                  value={saleForm.quantitySold}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, quantitySold: e.target.value })
                  }
                  step="1"
                  min="1"
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
              <div className="form-buttons">
                <button
                  type="submit"
                  className="button"
                  disabled={isSubmitting.sale || recordSaleLoading}
                  aria-busy={recordSaleLoading ? "true" : "false"}
                >
                  {recordSaleLoading ? "Recording..." : "Record Sale"}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={resetSaleForm}
                  aria-label="Reset sale form"
                >
                  Reset
                </button>
              </div>
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
                        confirmDeleteSale(sale.id, sale.recipe?.name)
                      }
                      disabled={
                        deletingItems.sales.has(sale.id) || deleteSaleLoading
                      }
                      aria-label={`Delete sale of ${sale.recipe?.name}`}
                    >
                      {deletingItems.sales.has(sale.id) || deleteSaleLoading ? (
                        <span
                          className="loading-spinner small"
                          aria-hidden="true"
                        ></span>
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
                  <strong>Record Sale</strong>: Select recipe, enter amount,
                  quantity, and confirm.
                </li>
                <li>
                  <strong>Validation</strong>: Amount and quantity must be
                  positive.
                </li>
                <li>
                  <strong>Delete Sale</strong>: Confirm deletion to remove sale.
                </li>
                <li>
                  <strong>Reset Form</strong>: Clear all fields to start over.
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
          <div className="loading-container" aria-live="polite">
            <div className="loading-spinner" aria-label="Loading data"></div>
          </div>
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
        onConfirm={modal.onConfirm}
      />
      <footer className="footer">
        <p>© 2025 Carl Serquina. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
