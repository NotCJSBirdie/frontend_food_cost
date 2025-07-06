/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { FaTrash } from "react-icons/fa";
import { usePagination } from "../hooks/usePagination";
import Pagination from "./Pagination";

interface RecipesTabProps {
  data: any;
  recipeForm: any;
  setRecipeForm: (form: any) => void;
  formErrors: any;
  setFormErrors: (errors: any) => void;
  isSubmitting: any;
  createRecipeLoading: boolean;
  deletingItems: any;
  deleteRecipeLoading: boolean;
  confirmCreateRecipe: () => void;
  resetRecipeForm: () => void;
  addIngredientToRecipe: () => void;
  updateRecipeIngredient: (index: number, field: string, value: string) => void;
  confirmDeleteRecipe: (id: string) => void;
}

const RecipesTab: React.FC<RecipesTabProps> = ({
  data,
  recipeForm,
  setRecipeForm,
  formErrors,
  setFormErrors,
  isSubmitting,
  createRecipeLoading,
  deletingItems,
  deleteRecipeLoading,
  confirmCreateRecipe,
  resetRecipeForm,
  addIngredientToRecipe,
  updateRecipeIngredient,
  confirmDeleteRecipe,
}) => {
  const recipes = data?.recipes ?? [];

  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    isFirstPage,
    isLastPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({
    data: recipes,
    itemsPerPage: 10,
  });

  return (
    <div className="card" role="region" aria-labelledby="recipes-title">
      <h2 id="recipes-title" className="card-title">
        Recipes
      </h2>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          confirmCreateRecipe();
        }}
      >
        <div className="form-group">
          <label htmlFor="recipe-name">Recipe Name</label>
          <input
            type="text"
            id="recipe-name"
            value={recipeForm.name}
            onChange={(e) => {
              setRecipeForm({ ...recipeForm, name: e.target.value });
              if (formErrors.recipe.name) {
                setFormErrors({
                  ...formErrors,
                  recipe: { ...formErrors.recipe, name: "" },
                });
              }
            }}
            placeholder="Enter recipe name"
            className={formErrors.recipe.name ? "error" : ""}
            aria-describedby={
              formErrors.recipe.name ? "recipe-name-error" : undefined
            }
            aria-invalid={!!formErrors.recipe.name}
          />
          {formErrors.recipe.name && (
            <p
              id="recipe-name-error"
              className="error-message"
              aria-live="polite"
            >
              {formErrors.recipe.name}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="recipe-target-margin">Target Margin (%)</label>
          <input
            type="number"
            id="recipe-target-margin"
            value={recipeForm.targetMargin}
            onChange={(e) => {
              setRecipeForm({ ...recipeForm, targetMargin: e.target.value });
              if (formErrors.recipe.targetMargin) {
                setFormErrors({
                  ...formErrors,
                  recipe: { ...formErrors.recipe, targetMargin: "" },
                });
              }
            }}
            placeholder="Enter target margin"
            step="0.01"
            min="0"
            max="100"
            className={formErrors.recipe.targetMargin ? "error" : ""}
            aria-describedby={
              formErrors.recipe.targetMargin
                ? "recipe-target-margin-error"
                : undefined
            }
            aria-invalid={!!formErrors.recipe.targetMargin}
          />
          {formErrors.recipe.targetMargin && (
            <p
              id="recipe-target-margin-error"
              className="error-message"
              aria-live="polite"
            >
              {formErrors.recipe.targetMargin}
            </p>
          )}
        </div>
        <div className="form-group">
          <label>Ingredients</label>
          {recipeForm.ingredients.map((ingredient: any, index: number) => (
            <div key={index} className="recipe-ingredient-row">
              <select
                value={ingredient.id}
                onChange={(e) =>
                  updateRecipeIngredient(index, "id", e.target.value)
                }
                className={formErrors.recipe.ingredients ? "error" : ""}
                aria-label={`Select ingredient ${index + 1}`}
              >
                <option value="">Select ingredient</option>
                {(data?.ingredients ?? []).map((ing: any) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} (£{(ing.unitPrice ?? 0).toFixed(2)}/{ing.unit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={ingredient.quantity}
                onChange={(e) =>
                  updateRecipeIngredient(index, "quantity", e.target.value)
                }
                placeholder="Quantity"
                step="0.01"
                min="0"
                className={formErrors.recipe.ingredients ? "error" : ""}
                aria-label={`Quantity for ingredient ${index + 1}`}
              />
              <button
                type="button"
                className="button button-danger"
                onClick={() => {
                  setRecipeForm((prev: any) => ({
                    ...prev,
                    ingredients: prev.ingredients.filter(
                      (_: any, i: number) => i !== index
                    ),
                  }));
                }}
                aria-label={`Remove ingredient ${index + 1}`}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="button button-secondary"
            onClick={addIngredientToRecipe}
            aria-label="Add ingredient to recipe"
          >
            Add Ingredient
          </button>
          {formErrors.recipe.ingredients && (
            <p className="error-message" aria-live="polite">
              {formErrors.recipe.ingredients}
            </p>
          )}
        </div>
        <div className="form-buttons">
          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting.recipe || createRecipeLoading}
            aria-label="Create recipe"
          >
            {isSubmitting.recipe || createRecipeLoading
              ? "Creating..."
              : "Create Recipe"}
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={resetRecipeForm}
            aria-label="Reset form"
          >
            Reset
          </button>
        </div>
      </form>
      <h3 className="section-title">Existing Recipes</h3>

      {totalItems === 0 ? (
        <div className="empty-state">
          <p>No recipes found. Add your first recipe above!</p>
        </div>
      ) : (
        <>
          <ul className="list">
            {paginatedData.map((recipe: any) => (
              <li key={recipe.id} className="list-item">
                <div className="list-item-content">
                  <div>
                    <p className="list-item-title">
                      {recipe.name ?? "Unknown"}
                    </p>
                    <p className="list-item-description">
                      Cost: £{(recipe.totalCost ?? 0).toFixed(2)} | Suggested
                      Price: £{(recipe.suggestedPrice ?? 0).toFixed(2)} |
                      Ingredients: {recipe.ingredients?.length ?? 0}
                    </p>
                  </div>
                  <button
                    className="button button-danger"
                    onClick={() => confirmDeleteRecipe(recipe.id)}
                    disabled={
                      deletingItems.recipes.has(recipe.id) ||
                      deleteRecipeLoading
                    }
                    aria-label={`Delete ${recipe.name}`}
                  >
                    {deletingItems.recipes.has(recipe.id) ? (
                      <div
                        className="loading-spinner small"
                        aria-label="Deleting"
                      ></div>
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
            isFirstPage={isFirstPage}
            isLastPage={isLastPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
          />
        </>
      )}
    </div>
  );
};

export default RecipesTab;
