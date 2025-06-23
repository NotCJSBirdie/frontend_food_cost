/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, gql } from "@apollo/client";
import { useState } from "react";
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
    }
  }
`;

const DELETE_INGREDIENT = gql`
  mutation DeleteIngredient($id: ID!) {
    deleteIngredient(id: $id)
  }
`;

const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
  }
`;

const DELETE_SALE = gql`
  mutation DeleteSale($id: ID!) {
    deleteSale(id: $id)
  }
`;

function App() {
  console.log("Rendering App component...");
  const { loading, error, data, refetch } = useQuery(GET_DATA, {
    onCompleted: (data) => {
      console.log("GET_DATA query completed:", data);
    },
    onError: (err) => {
      console.error("GET_DATA query error:", {
        message: err.message,
        graphQLErrors: err.graphQLErrors,
        networkError: err.networkError,
      });
    },
  });
  const [addIngredient, { error: addIngredientError }] = useMutation(
    ADD_INGREDIENT,
    {
      onCompleted: (data) => {
        console.log("ADD_INGREDIENT mutation completed:", data);
        refetch();
      },
      onError: (err) => {
        console.error("ADD_INGREDIENT mutation error:", {
          message: err.message,
          graphQLErrors: err.graphQLErrors,
          networkError: err.networkError,
        });
      },
    }
  );
  const [createRecipe, { error: createRecipeError }] = useMutation(
    CREATE_RECIPE,
    {
      onCompleted: (data) => {
        console.log("CREATE_RECIPE mutation completed:", data);
        refetch();
      },
      onError: (err) => {
        console.error("CREATE_RECIPE mutation error:", {
          message: err.message,
          graphQLErrors: err.graphQLErrors,
          networkError: err.networkError,
        });
      },
    }
  );
  const [recordSale, { error: recordSaleError }] = useMutation(RECORD_SALE, {
    onCompleted: (data) => {
      console.log("RECORD_SALE mutation completed:", data);
      refetch();
    },
    onError: (err) => {
      console.error("RECORD_SALE mutation error:", {
        message: err.message,
        graphQLErrors: err.graphQLErrors,
        networkError: err.networkError,
      });
    },
  });
  const [deleteIngredient, { error: deleteIngredientError }] = useMutation(
    DELETE_INGREDIENT,
    {
      onCompleted: (data) => {
        console.log("DELETE_INGREDIENT mutation completed:", data);
        refetch();
      },
      onError: (err) => {
        console.error("DELETE_INGREDIENT mutation error:", {
          message: err.message,
          graphQLErrors: err.graphQLErrors,
          networkError: err.networkError,
        });
      },
    }
  );
  const [deleteRecipe, { error: deleteRecipeError }] = useMutation(
    DELETE_RECIPE,
    {
      onCompleted: (data) => {
        console.log("DELETE_RECIPE mutation completed:", data);
        refetch();
      },
      onError: (err) => {
        console.error("DELETE_RECIPE mutation error:", {
          message: err.message,
          graphQLErrors: err.graphQLErrors,
          networkError: err.networkError,
        });
      },
    }
  );
  const [deleteSale, { error: deleteSaleError }] = useMutation(DELETE_SALE, {
    onCompleted: (data) => {
      console.log("DELETE_SALE mutation completed:", data);
      refetch();
    },
    onError: (err) => {
      console.error("DELETE_SALE mutation error:", {
        message: err.message,
        graphQLErrors: err.graphQLErrors,
        networkError: err.networkError,
      });
    },
  });
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
  const [saleFormError, setSaleFormError] = useState("");

  console.log("App state:", {
    loading,
    error: error ? error.message : null,
    activeTab,
    isSubmitting,
  });

  if (loading) {
    console.log("App is in loading state");
    return <p className="loading">Loading...</p>;
  }
  if (error) {
    console.error("App error state:", {
      message: error.message,
      graphQLErrors: error.graphQLErrors,
      networkError: error.networkError,
    });
    return <p className="error">Error: {error.message}</p>;
  }

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting addIngredient:", ingredientForm);
    setIsSubmitting({ ...isSubmitting, ingredient: true });
    try {
      await addIngredient({
        variables: {
          name: ingredientForm.name,
          unitPrice: parseFloat(ingredientForm.unitPrice),
          unit: ingredientForm.unit,
          stockQuantity: parseFloat(ingredientForm.stockQuantity),
          restockThreshold: parseFloat(ingredientForm.restockThreshold),
        },
      });
      console.log("addIngredient succeeded");
      setIngredientForm({
        name: "",
        unitPrice: "",
        unit: "",
        stockQuantity: "",
        restockThreshold: "",
      });
    } catch (err) {
      console.error("addIngredient failed:", err);
    } finally {
      setIsSubmitting({ ...isSubmitting, ingredient: false });
    }
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting createRecipe:", recipeForm);
    if (
      recipeForm.name &&
      recipeForm.ingredients.every((ing) => ing.id && ing.quantity)
    ) {
      setIsSubmitting({ ...isSubmitting, recipe: true });
      try {
        await createRecipe({
          variables: {
            name: recipeForm.name,
            ingredientIds: recipeForm.ingredients.map((ing) => ing.id),
            quantities: recipeForm.ingredients.map((ing) =>
              parseFloat(ing.quantity)
            ),
            targetMargin: parseFloat(recipeForm.targetMargin) / 100,
          },
        });
        console.log("createRecipe succeeded");
        setRecipeForm({
          name: "",
          targetMargin: "30",
          ingredients: [{ id: "", quantity: "" }],
        });
      } catch (err) {
        console.error("createRecipe failed:", err);
      } finally {
        setIsSubmitting({ ...isSubmitting, recipe: false });
      }
    } else {
      console.warn("createRecipe form invalid:", recipeForm);
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting recordSale:", saleForm);
    setSaleFormError("");

    const saleAmount = parseFloat(saleForm.saleAmount);
    const quantitySold = parseInt(saleForm.quantitySold);

    if (!saleForm.recipeId) {
      console.warn("recordSale validation failed: Missing recipeId");
      setSaleFormError("Please select a recipe");
      return;
    }
    if (isNaN(saleAmount) || saleAmount <= 0) {
      console.warn("recordSale validation failed: Invalid saleAmount");
      setSaleFormError("Please enter a valid sale amount greater than 0");
      return;
    }
    if (isNaN(quantitySold) || quantitySold <= 0) {
      console.warn("recordSale validation failed: Invalid quantitySold");
      setSaleFormError("Please enter a valid quantity greater than 0");
      return;
    }

    setIsSubmitting({ ...isSubmitting, sale: true });
    try {
      await recordSale({
        variables: {
          recipeId: saleForm.recipeId,
          saleAmount,
          quantitySold,
        },
      });
      console.log("recordSale succeeded");
      setSaleForm({ recipeId: "", saleAmount: "", quantitySold: "1" });
    } catch (err) {
      console.error("recordSale failed:", err);
      setSaleFormError("Failed to record sale. Please try again.");
    } finally {
      setIsSubmitting({ ...isSubmitting, sale: false });
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    console.log("Deleting ingredient:", id);
    try {
      const result = await deleteIngredient({ variables: { id } });
      if (!result.data.deleteIngredient) {
        alert("Cannot delete ingredient: it may be used in recipes");
      }
    } catch (err) {
      console.error("deleteIngredient failed:", err);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    console.log("Deleting recipe:", id);
    try {
      const result = await deleteRecipe({ variables: { id } });
      if (!result.data.deleteRecipe) {
        alert("Cannot delete recipe: it may have associated sales");
      }
    } catch (err) {
      console.error("deleteRecipe failed:", err);
    }
  };

  const handleDeleteSale = async (id: string) => {
    console.log("Deleting sale:", id);
    try {
      const result = await deleteSale({ variables: { id } });
      if (!result.data.deleteSale) {
        alert("Cannot delete sale");
      }
    } catch (err) {
      console.error("deleteSale failed:", err);
    }
  };

  const addIngredientToRecipe = () => {
    console.log("Adding ingredient to recipe form");
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
    console.log("Updating recipe ingredient:", { index, field, value });
    const newIngredients = [...recipeForm.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipeForm({ ...recipeForm, ingredients: newIngredients });
  };

  console.log("Rendering tab content for:", activeTab);
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        console.log("Rendering dashboard tab");
        return (
          <div className="card">
            <h2 className="card-title">Dashboard</h2>
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
            <ul className="list">
              {(data?.dashboardStats?.lowStockIngredients ?? []).map(
                (ingredient: any) => (
                  <li key={ingredient.id} className="list-item alert">
                    {ingredient.name ?? "Unknown"}:{" "}
                    {ingredient.stockQuantity ?? 0} {ingredient.unit ?? ""}{" "}
                    (Threshold: {ingredient.restockThreshold ?? 0})
                  </li>
                )
              )}
            </ul>
          </div>
        );
      case "ingredients":
        console.log("Rendering ingredients tab");
        return (
          <div className="card">
            <h2 className="card-title">Ingredients</h2>
            {addIngredientError && (
              <p className="error">Error: {addIngredientError.message}</p>
            )}
            {deleteIngredientError && (
              <p className="error">Error: {deleteIngredientError.message}</p>
            )}
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
                />
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
                />
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
                />
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
                />
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
                />
              </div>
              <button
                type="submit"
                className="button"
                disabled={isSubmitting.ingredient}
              >
                {isSubmitting.ingredient ? "Adding..." : "Add Ingredient"}
              </button>
            </form>
            <ul className="list">
              {(data?.ingredients ?? []).map((ingredient: any) => (
                <li key={ingredient.id} className="list-item">
                  <div className="list-item-content">
                    {ingredient.name ?? "Unknown"}: £
                    {(ingredient.unitPrice ?? 0).toFixed(2)}/
                    {ingredient.unit ?? ""}, Stock:{" "}
                    {ingredient.stockQuantity ?? 0} (Threshold:{" "}
                    {ingredient.restockThreshold ?? 0})
                    <button
                      className="button delete"
                      onClick={() => handleDeleteIngredient(ingredient.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      case "recipes":
        console.log("Rendering recipes tab");
        return (
          <div className="card">
            <h2 className="card-title">Create Recipe</h2>
            {createRecipeError && (
              <p className="error">Error: {createRecipeError.message}</p>
            )}
            {deleteRecipeError && (
              <p className="error">Error: {deleteRecipeError.message}</p>
            )}
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
                />
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
                />
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
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="button secondary"
                onClick={addIngredientToRecipe}
              >
                Add Another Ingredient
              </button>
              <button
                type="submit"
                className="button"
                disabled={isSubmitting.recipe}
              >
                {isSubmitting.recipe ? "Creating..." : "Create Recipe"}
              </button>
            </form>
            <ul className="list">
              {(data?.recipes ?? []).map((recipe: any) => (
                <li key={recipe.id} className="list-item">
                  <div className="list-item-content">
                    {recipe.name ?? "Unknown"}: £
                    {(recipe.totalCost ?? 0).toFixed(2)} (Suggested Price: £
                    {(recipe.suggestedPrice ?? 0).toFixed(2)})
                    <button
                      className="button delete"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                    >
                      Delete
                    </button>
                    <ul className="nested-list">
                      {(recipe.ingredients ?? []).map((ri: any) => (
                        <li key={ri.id} className="nested-list-item">
                          {ri.ingredient?.name ?? "Unknown"}: {ri.quantity ?? 0}{" "}
                          {ri.ingredient?.unit ?? ""} (£
                          {(ri.ingredient?.unitPrice ?? 0).toFixed(2)}/unit)
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      case "sales":
        console.log("Rendering sales tab");
        return (
          <div className="card">
            <h2 className="card-title">Record Sale</h2>
            {recordSaleError && (
              <p className="error">Error: {recordSaleError.message}</p>
            )}
            {deleteSaleError && (
              <p className="error">Error: {deleteSaleError.message}</p>
            )}
            {saleFormError && <p className="error">{saleFormError}</p>}
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
                />
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
                />
              </div>
              <button
                type="submit"
                className="button"
                disabled={isSubmitting.sale}
              >
                {isSubmitting.sale ? "Recording..." : "Record Sale"}
              </button>
            </form>
            <ul className="list">
              {(data?.sales ?? []).map((sale: any) => (
                <li key={sale.id} className="list-item">
                  <div className="list-item-content">
                    Sale of {sale.recipe?.name ?? "Unknown"}: £
                    {(sale.saleAmount ?? 0).toFixed(2)} (Created:{" "}
                    {sale.createdAt
                      ? new Date(sale.createdAt).toLocaleDateString()
                      : "N/A"}
                    )
                    <button
                      className="button delete"
                      onClick={() => handleDeleteSale(sale.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        console.warn("Unknown tab:", activeTab);
        return null;
    }
  };

  return (
    <div className="container">
      <h1 className="title">Food Cost Manager</h1>
      <div className="tab-bar">
        <button
          className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`tab ${activeTab === "ingredients" ? "active" : ""}`}
          onClick={() => setActiveTab("ingredients")}
        >
          Ingredients
        </button>
        <button
          className={`tab ${activeTab === "recipes" ? "active" : ""}`}
          onClick={() => setActiveTab("recipes")}
        >
          Recipes
        </button>
        <button
          className={`tab ${activeTab === "sales" ? "active" : ""}`}
          onClick={() => setActiveTab("sales")}
        >
          Sales
        </button>
      </div>
      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
}

export default App;
