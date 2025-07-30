import React, { useState, useEffect } from "react";
import * as api from "./api";
import "./App.css";
import Modal from "./components/Modal";
import DashboardTab from "./components/DashboardTab";
import IngredientsTab from "./components/IngredientsTab";
import RecipesTab from "./components/RecipesTab";
import SalesTab from "./components/SalesTab";
import {
  initialIngredientForm,
  initialRecipeForm,
  initialSaleForm,
  initialFormErrors,
  initialDeletingItems,
  initialModal,
} from "./utils/initialStates";
import {
  validateIngredientForm,
  validateRecipeForm,
  validateSaleForm,
} from "./utils/validation";

// --- App Start ---

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [sales, setSales] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState({
    ingredient: false,
    recipe: false,
    sale: false,
  });
  const [ingredientForm, setIngredientForm] = useState(initialIngredientForm);
  const [recipeForm, setRecipeForm] = useState(initialRecipeForm);
  const [saleForm, setSaleForm] = useState(initialSaleForm);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [deletingItems, setDeletingItems] = useState(initialDeletingItems);
  const [modal, setModal] = useState(initialModal);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data from REST endpoints
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ingredientsRes, recipesRes, salesRes, dashboardRes] =
        await Promise.all([
          api.getIngredients(),
          api.getRecipes(),
          api.getSales(),
          api.getDashboardStats(),
        ]);
      setIngredients(ingredientsRes);
      setRecipes(recipesRes);
      setSales(salesRes);
      setDashboard(dashboardRes);
      setError(null);
    } catch (e) {
      setError(e.message || "API Fetch Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- Error/Success Modal Display ---
  const showApiError = (e) =>
    setModal({
      isOpen: true,
      title: "Error",
      message: e.message || "An unexpected error occurred",
      type: "error",
      onConfirm: undefined,
    });

  // ========== INGREDIENTS ==========
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    setIsSubmitting((s) => ({ ...s, ingredient: true }));
    if (!validateIngredientForm(ingredientForm, setFormErrors)) {
      setIsSubmitting((s) => ({ ...s, ingredient: false }));
      return;
    }
    try {
      await api.addIngredient({
        name: ingredientForm.name,
        unitPrice: Number(ingredientForm.unitPrice),
        unit: ingredientForm.unit,
        stockQuantity: Number(ingredientForm.stockQuantity),
        restockThreshold: Number(ingredientForm.restockThreshold),
      });
      setModal({
        isOpen: true,
        title: "Success",
        message: "Ingredient added successfully!",
        type: "success",
        onConfirm: undefined,
      });
      resetIngredientForm();
      fetchAll();
    } catch (e) {
      showApiError(e);
    } finally {
      setIsSubmitting((s) => ({ ...s, ingredient: false }));
    }
  };

  const handleDeleteIngredient = async (id) => {
    setDeletingItems((prev) => ({
      ...prev,
      ingredients: new Set(prev.ingredients).add(id),
    }));
    try {
      await api.deleteIngredient(id);
      setModal({
        isOpen: true,
        title: "Success",
        message: "Ingredient deleted successfully!",
        type: "success",
        onConfirm: undefined,
      });
      fetchAll();
    } catch (e) {
      showApiError(e);
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.ingredients);
        newSet.delete(id);
        return { ...prev, ingredients: newSet };
      });
    }
  };

  // ========== RECIPES ==========
  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    setIsSubmitting((s) => ({ ...s, recipe: true }));
    if (!validateRecipeForm(recipeForm, setFormErrors)) {
      setIsSubmitting((s) => ({ ...s, recipe: false }));
      return;
    }
    try {
      const validIngredients = recipeForm.ingredients.filter(
        (ing) => ing.id && ing.quantity
      );
      const ingredientIds = validIngredients.map((ing) => ing.id);
      const quantities = validIngredients.map((ing) => Number(ing.quantity));
      const targetMarginDecimal = recipeForm.targetMargin
        ? Number(recipeForm.targetMargin) / 100
        : undefined;
      await api.addRecipe({
        name: recipeForm.name,
        ingredientIds,
        quantities,
        targetMargin: targetMarginDecimal,
      });
      setModal({
        isOpen: true,
        title: "Success",
        message: "Recipe created successfully!",
        type: "success",
        onConfirm: undefined,
      });
      resetRecipeForm();
      fetchAll();
    } catch (e) {
      showApiError(e);
    } finally {
      setIsSubmitting((s) => ({ ...s, recipe: false }));
    }
  };

  const handleDeleteRecipe = async (id) => {
    setDeletingItems((prev) => ({
      ...prev,
      recipes: new Set(prev.recipes).add(id),
    }));
    try {
      await api.deleteRecipe(id);
      setModal({
        isOpen: true,
        title: "Success",
        message: "Recipe deleted successfully!",
        type: "success",
        onConfirm: undefined,
      });
      fetchAll();
    } catch (e) {
      showApiError(e);
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.recipes);
        newSet.delete(id);
        return { ...prev, recipes: newSet };
      });
    }
  };

  // ========== SALES ==========
  const handleRecordSale = async (e) => {
    e.preventDefault();
    setIsSubmitting((s) => ({ ...s, sale: true }));
    if (!validateSaleForm(saleForm, setFormErrors)) {
      setIsSubmitting((s) => ({ ...s, sale: false }));
      return;
    }
    try {
      await api.recordSale({
        recipeId: saleForm.recipeId,
        saleAmount: Number(saleForm.saleAmount),
        quantitySold: Number(saleForm.quantitySold),
      });
      setModal({
        isOpen: true,
        title: "Success",
        message: "Sale recorded successfully!",
        type: "success",
        onConfirm: undefined,
      });
      resetSaleForm();
      fetchAll();
    } catch (e) {
      showApiError(e);
    } finally {
      setIsSubmitting((s) => ({ ...s, sale: false }));
    }
  };

  const handleDeleteSale = async (id) => {
    setDeletingItems((prev) => ({
      ...prev,
      sales: new Set(prev.sales).add(id),
    }));
    try {
      await api.deleteSale(id);
      setModal({
        isOpen: true,
        title: "Success",
        message: "Sale deleted successfully!",
        type: "success",
        onConfirm: undefined,
      });
      fetchAll();
    } catch (e) {
      showApiError(e);
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.sales);
        newSet.delete(id);
        return { ...prev, sales: newSet };
      });
    }
  };

  // ========== FORM/STATE UTILITIES ==========
  const resetIngredientForm = () => {
    setIngredientForm(initialIngredientForm);
    setFormErrors((prev) => ({
      ...prev,
      ingredient: initialFormErrors.ingredient,
    }));
  };
  const resetRecipeForm = () => {
    setRecipeForm(initialRecipeForm);
    setFormErrors((prev) => ({ ...prev, recipe: initialFormErrors.recipe }));
  };
  const resetSaleForm = () => {
    setSaleForm(initialSaleForm);
    setFormErrors((prev) => ({ ...prev, sale: initialFormErrors.sale }));
  };
  const addIngredientToRecipe = () => {
    setRecipeForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: "", quantity: "" }],
    }));
  };
  const updateRecipeIngredient = (index, field, value) => {
    setRecipeForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  // ========== MODAL CONFIRMATION LOGIC ==========
  const closeModal = () => setModal({ ...modal, isOpen: false });

  const confirmAddIngredient = () => {
    setModal({
      isOpen: true,
      title: "Confirm Addition",
      message: "Are you sure you want to add this ingredient?",
      type: "confirm",
      onConfirm: () => {
        closeModal();
        handleAddIngredient({ preventDefault: () => {} });
      },
    });
  };

  const confirmCreateRecipe = () => {
    setModal({
      isOpen: true,
      title: "Confirm Creation",
      message: "Are you sure you want to create this recipe?",
      type: "confirm",
      onConfirm: () => {
        closeModal();
        handleCreateRecipe({ preventDefault: () => {} });
      },
    });
  };

  const confirmRecordSale = () => {
    setModal({
      isOpen: true,
      title: "Confirm Sale",
      message: "Are you sure you want to record this sale?",
      type: "confirm",
      onConfirm: () => {
        closeModal();
        handleRecordSale({ preventDefault: () => {} });
      },
    });
  };

  const confirmDeleteIngredient = (id) => {
    setModal({
      isOpen: true,
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this ingredient? This action cannot be undone.",
      type: "confirm",
      onConfirm: () => {
        closeModal();
        handleDeleteIngredient(id);
      },
    });
  };

  const confirmDeleteRecipe = (id) => {
    setModal({
      isOpen: true,
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this recipe? This action cannot be undone.",
      type: "confirm",
      onConfirm: () => {
        closeModal();
        handleDeleteRecipe(id);
      },
    });
  };

  const confirmDeleteSale = (id) => {
    setModal({
      isOpen: true,
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this sale? This action cannot be undone.",
      type: "confirm",
      onConfirm: () => {
        closeModal();
        handleDeleteSale(id);
      },
    });
  };

  // ========== PER-TAB RENDER ==========
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab data={{ dashboard }} />;
      case "ingredients":
        return (
          <IngredientsTab
            data={{ ingredients }}
            ingredientForm={ingredientForm}
            setIngredientForm={setIngredientForm}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            isSubmitting={isSubmitting}
            deletingItems={deletingItems}
            confirmAddIngredient={confirmAddIngredient}
            resetIngredientForm={resetIngredientForm}
            confirmDeleteIngredient={confirmDeleteIngredient}
          />
        );
      case "recipes":
        return (
          <RecipesTab
            data={{ recipes, ingredients }}
            recipeForm={recipeForm}
            setRecipeForm={setRecipeForm}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            isSubmitting={isSubmitting}
            deletingItems={deletingItems}
            confirmCreateRecipe={confirmCreateRecipe}
            resetRecipeForm={resetRecipeForm}
            addIngredientToRecipe={addIngredientToRecipe}
            updateRecipeIngredient={updateRecipeIngredient}
            confirmDeleteRecipe={confirmDeleteRecipe}
          />
        );
      case "sales":
        return (
          <SalesTab
            data={{ sales, recipes }}
            saleForm={saleForm}
            setSaleForm={setSaleForm}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            isSubmitting={isSubmitting}
            deletingItems={deletingItems}
            confirmRecordSale={confirmRecordSale}
            resetSaleForm={resetSaleForm}
            confirmDeleteSale={confirmDeleteSale}
          />
        );
      default:
        return null;
    }
  };

  // ========== MAIN RENDER ==========
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
            Error: {error}
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
