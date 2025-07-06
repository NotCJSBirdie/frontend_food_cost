import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import "./App.css";
import {
  GET_DATA,
  ADD_INGREDIENT,
  CREATE_RECIPE,
  RECORD_SALE,
  DELETE_INGREDIENT,
  DELETE_RECIPE,
  DELETE_SALE,
} from "./graphql";
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
import type {
  FormData,
  FormErrors,
  ModalState,
  Ingredient,
  Recipe,
  Sale,
  DashboardStats,
} from "./types";

// Type definitions for the component state
interface SubmittingState {
  ingredient: boolean;
  recipe: boolean;
  sale: boolean;
}

interface DeletingItemsState {
  ingredients: Set<string>;
  recipes: Set<string>;
  sales: Set<string>;
}

// GraphQL query data type
interface QueryData {
  ingredients: Ingredient[];
  recipes: Recipe[];
  sales: Sale[];
  dashboardStats: DashboardStats;
}

function App() {
  const { loading, error, data, refetch } = useQuery<QueryData>(GET_DATA, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
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

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSubmitting, setIsSubmitting] = useState<SubmittingState>({
    ingredient: false,
    recipe: false,
    sale: false,
  });
  const [ingredientForm, setIngredientForm] = useState<FormData["ingredient"]>(
    initialIngredientForm
  );
  const [recipeForm, setRecipeForm] =
    useState<FormData["recipe"]>(initialRecipeForm);
  const [saleForm, setSaleForm] = useState<FormData["sale"]>(initialSaleForm);
  const [formErrors, setFormErrors] = useState<FormErrors>(initialFormErrors);
  const [deletingItems, setDeletingItems] =
    useState<DeletingItemsState>(initialDeletingItems);
  const [modal, setModal] = useState<ModalState>(initialModal);

  const closeModal = (): void => setModal({ ...modal, isOpen: false });

  useEffect(() => {
    if (addIngredientError)
      setModal({
        isOpen: true,
        title: "Error",
        message: addIngredientError.message,
        type: "error",
        onConfirm: undefined,
      });
    if (createRecipeError)
      setModal({
        isOpen: true,
        title: "Error",
        message: createRecipeError.message,
        type: "error",
        onConfirm: undefined,
      });
    if (recordSaleError)
      setModal({
        isOpen: true,
        title: "Error",
        message: recordSaleError.message,
        type: "error",
        onConfirm: undefined,
      });
    if (deleteIngredientError)
      setModal({
        isOpen: true,
        title: "Error",
        message: deleteIngredientError.message,
        type: "error",
        onConfirm: undefined,
      });
    if (deleteRecipeError)
      setModal({
        isOpen: true,
        title: "Error",
        message: deleteRecipeError.message,
        type: "error",
        onConfirm: undefined,
      });
    if (deleteSaleError)
      setModal({
        isOpen: true,
        title: "Error",
        message: deleteSaleError.message,
        type: "error",
        onConfirm: undefined,
      });
  }, [
    addIngredientError,
    createRecipeError,
    recordSaleError,
    deleteIngredientError,
    deleteRecipeError,
    deleteSaleError,
  ]);

  const handleAddIngredient = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting({ ...isSubmitting, ingredient: true });

    if (!validateIngredientForm(ingredientForm, setFormErrors)) {
      setIsSubmitting({ ...isSubmitting, ingredient: false });
      return;
    }

    try {
      const result = await addIngredient({
        variables: {
          name: ingredientForm.name,
          unitPrice: parseFloat(ingredientForm.unitPrice),
          unit: ingredientForm.unit,
          stockQuantity: parseFloat(ingredientForm.stockQuantity),
          restockThreshold: parseFloat(ingredientForm.restockThreshold),
        },
      });

      if (result.data?.addIngredient?.success) {
        setModal({
          isOpen: true,
          title: "Success",
          message: "Ingredient added successfully!",
          type: "success",
          onConfirm: undefined,
        });
        resetIngredientForm();
        refetch();
      } else {
        setModal({
          isOpen: true,
          title: "Error",
          message:
            result.data?.addIngredient?.error || "Failed to add ingredient",
          type: "error",
          onConfirm: undefined,
        });
      }
    } catch (error) {
      console.error("Error adding ingredient:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "An unexpected error occurred",
        type: "error",
        onConfirm: undefined,
      });
    } finally {
      setIsSubmitting({ ...isSubmitting, ingredient: false });
    }
  };

  const handleCreateRecipe = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting({ ...isSubmitting, recipe: true });

    if (!validateRecipeForm(recipeForm, setFormErrors)) {
      setIsSubmitting({ ...isSubmitting, recipe: false });
      return;
    }

    try {
      const validIngredients = recipeForm.ingredients.filter(
        (ing) => ing.id && ing.quantity
      );
      const ingredientIds = validIngredients.map((ing) => ing.id);
      const quantities = validIngredients.map((ing) =>
        parseFloat(ing.quantity)
      );

      // Convert percentage from 0-100 to 0-1 for backend
      const targetMarginDecimal = parseFloat(recipeForm.targetMargin) / 100;

      const result = await createRecipe({
        variables: {
          name: recipeForm.name,
          ingredientIds: ingredientIds,
          quantities: quantities,
          targetMargin: targetMarginDecimal, // Send decimal value to backend
        },
      });

      if (result.data?.createRecipe?.success) {
        setModal({
          isOpen: true,
          title: "Success",
          message: "Recipe created successfully!",
          type: "success",
          onConfirm: undefined,
        });
        resetRecipeForm();
        refetch();
      } else {
        setModal({
          isOpen: true,
          title: "Error",
          message:
            result.data?.createRecipe?.error || "Failed to create recipe",
          type: "error",
          onConfirm: undefined,
        });
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "An unexpected error occurred",
        type: "error",
        onConfirm: undefined,
      });
    } finally {
      setIsSubmitting({ ...isSubmitting, recipe: false });
    }
  };

  const handleRecordSale = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting({ ...isSubmitting, sale: true });

    if (!validateSaleForm(saleForm, setFormErrors)) {
      setIsSubmitting({ ...isSubmitting, sale: false });
      return;
    }

    try {
      const result = await recordSale({
        variables: {
          recipeId: saleForm.recipeId,
          saleAmount: parseFloat(saleForm.saleAmount),
          quantitySold: parseInt(saleForm.quantitySold),
        },
      });

      if (result.data?.recordSale?.success) {
        setModal({
          isOpen: true,
          title: "Success",
          message: "Sale recorded successfully!",
          type: "success",
          onConfirm: undefined,
        });
        resetSaleForm();
        refetch();
      } else {
        setModal({
          isOpen: true,
          title: "Error",
          message: result.data?.recordSale?.error || "Failed to record sale",
          type: "error",
          onConfirm: undefined,
        });
      }
    } catch (error) {
      console.error("Error recording sale:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "An unexpected error occurred",
        type: "error",
        onConfirm: undefined,
      });
    } finally {
      setIsSubmitting({ ...isSubmitting, sale: false });
    }
  };

  const confirmAddIngredient = (): void => {
    setModal({
      isOpen: true,
      title: "Confirm Addition",
      message: "Are you sure you want to add this ingredient?",
      type: "confirm",
      onConfirm: () => {
        closeModal();
        handleAddIngredient({ preventDefault: () => {} } as React.FormEvent);
      },
    });
  };

  const confirmCreateRecipe = (): void => {
    setModal({
      isOpen: true,
      title: "Confirm Creation",
      message: "Are you sure you want to create this recipe?",
      type: "confirm",
      onConfirm: () => {
        closeModal();
        handleCreateRecipe({ preventDefault: () => {} } as React.FormEvent);
      },
    });
  };

  const confirmRecordSale = (): void => {
    setModal({
      isOpen: true,
      title: "Confirm Sale",
      message: "Are you sure you want to record this sale?",
      type: "confirm",
      onConfirm: () => {
        closeModal();
        handleRecordSale({ preventDefault: () => {} } as React.FormEvent);
      },
    });
  };

  const confirmDeleteIngredient = (id: string): void => {
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

  const confirmDeleteRecipe = (id: string): void => {
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

  const confirmDeleteSale = (id: string): void => {
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

  const handleDeleteIngredient = async (id: string): Promise<void> => {
    setDeletingItems((prev) => ({
      ...prev,
      ingredients: new Set(prev.ingredients).add(id),
    }));

    try {
      const result = await deleteIngredient({ variables: { id } });

      if (result.data?.deleteIngredient?.success) {
        setModal({
          isOpen: true,
          title: "Success",
          message: "Ingredient deleted successfully!",
          type: "success",
          onConfirm: undefined,
        });
        refetch();
      } else {
        setModal({
          isOpen: true,
          title: "Error",
          message:
            result.data?.deleteIngredient?.error ||
            "Failed to delete ingredient",
          type: "error",
          onConfirm: undefined,
        });
      }
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "An unexpected error occurred",
        type: "error",
        onConfirm: undefined,
      });
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.ingredients);
        newSet.delete(id);
        return { ...prev, ingredients: newSet };
      });
    }
  };

  const handleDeleteRecipe = async (id: string): Promise<void> => {
    setDeletingItems((prev) => ({
      ...prev,
      recipes: new Set(prev.recipes).add(id),
    }));

    try {
      const result = await deleteRecipe({ variables: { id } });

      if (result.data?.deleteRecipe?.success) {
        setModal({
          isOpen: true,
          title: "Success",
          message: "Recipe deleted successfully!",
          type: "success",
          onConfirm: undefined,
        });
        refetch();
      } else {
        setModal({
          isOpen: true,
          title: "Error",
          message:
            result.data?.deleteRecipe?.error || "Failed to delete recipe",
          type: "error",
          onConfirm: undefined,
        });
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "An unexpected error occurred",
        type: "error",
        onConfirm: undefined,
      });
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.recipes);
        newSet.delete(id);
        return { ...prev, recipes: newSet };
      });
    }
  };

  const handleDeleteSale = async (id: string): Promise<void> => {
    setDeletingItems((prev) => ({
      ...prev,
      sales: new Set(prev.sales).add(id),
    }));

    try {
      const result = await deleteSale({ variables: { id } });

      if (result.data?.deleteSale?.success) {
        setModal({
          isOpen: true,
          title: "Success",
          message: "Sale deleted successfully!",
          type: "success",
          onConfirm: undefined,
        });
        refetch();
      } else {
        setModal({
          isOpen: true,
          title: "Error",
          message: result.data?.deleteSale?.error || "Failed to delete sale",
          type: "error",
          onConfirm: undefined,
        });
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "An unexpected error occurred",
        type: "error",
        onConfirm: undefined,
      });
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev.sales);
        newSet.delete(id);
        return { ...prev, sales: newSet };
      });
    }
  };

  const resetIngredientForm = (): void => {
    setIngredientForm(initialIngredientForm);
    setFormErrors((prev) => ({
      ...prev,
      ingredient: initialFormErrors.ingredient,
    }));
  };

  const resetRecipeForm = (): void => {
    setRecipeForm(initialRecipeForm);
    setFormErrors((prev) => ({ ...prev, recipe: initialFormErrors.recipe }));
  };

  const resetSaleForm = (): void => {
    setSaleForm(initialSaleForm);
    setFormErrors((prev) => ({ ...prev, sale: initialFormErrors.sale }));
  };

  const addIngredientToRecipe = (): void => {
    setRecipeForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: "", quantity: "" }],
    }));
  };

  const updateRecipeIngredient = (
    index: number,
    field: string,
    value: string
  ): void => {
    setRecipeForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const renderTabContent = (): React.ReactNode => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab data={data} />;
      case "ingredients":
        return (
          <IngredientsTab
            data={data}
            ingredientForm={ingredientForm}
            setIngredientForm={setIngredientForm}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            isSubmitting={isSubmitting}
            addIngredientLoading={addIngredientLoading}
            deletingItems={deletingItems}
            deleteIngredientLoading={deleteIngredientLoading}
            confirmAddIngredient={confirmAddIngredient}
            resetIngredientForm={resetIngredientForm}
            confirmDeleteIngredient={confirmDeleteIngredient}
          />
        );
      case "recipes":
        return (
          <RecipesTab
            data={data}
            recipeForm={recipeForm}
            setRecipeForm={setRecipeForm}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            isSubmitting={isSubmitting}
            createRecipeLoading={createRecipeLoading}
            deletingItems={deletingItems}
            deleteRecipeLoading={deleteRecipeLoading}
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
            data={data}
            saleForm={saleForm}
            setSaleForm={setSaleForm}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            isSubmitting={isSubmitting}
            recordSaleLoading={recordSaleLoading}
            deletingItems={deletingItems}
            deleteSaleLoading={deleteSaleLoading}
            confirmRecordSale={confirmRecordSale}
            resetSaleForm={resetSaleForm}
            confirmDeleteSale={confirmDeleteSale}
          />
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
