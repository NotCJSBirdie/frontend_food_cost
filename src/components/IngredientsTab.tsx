/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { FaTrash } from "react-icons/fa";

interface IngredientsTabProps {
  data: any;
  ingredientForm: any;
  setIngredientForm: (form: any) => void;
  formErrors: any;
  setFormErrors: (errors: any) => void;
  isSubmitting: any;
  addIngredientLoading: boolean;
  deletingItems: any;
  deleteIngredientLoading: boolean;
  confirmAddIngredient: () => void;
  resetIngredientForm: () => void;
  confirmDeleteIngredient: (id: string) => void;
}

const IngredientsTab: React.FC<IngredientsTabProps> = ({
  data,
  ingredientForm,
  setIngredientForm,
  formErrors,
  setFormErrors,
  isSubmitting,
  addIngredientLoading,
  deletingItems,
  deleteIngredientLoading,
  confirmAddIngredient,
  resetIngredientForm,
  confirmDeleteIngredient,
}) => (
  <div className="card" role="region" aria-labelledby="ingredients-title">
    <h2 id="ingredients-title" className="card-title">
      Ingredients
    </h2>
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        confirmAddIngredient();
      }}
    >
      <div className="form-group">
        <label htmlFor="ingredient-name">Ingredient Name</label>
        <input
          type="text"
          id="ingredient-name"
          value={ingredientForm.name}
          onChange={(e) => {
            setIngredientForm({ ...ingredientForm, name: e.target.value });
            if (formErrors.ingredient.name) {
              setFormErrors({
                ...formErrors,
                ingredient: { ...formErrors.ingredient, name: "" },
              });
            }
          }}
          placeholder="Enter ingredient name"
          className={formErrors.ingredient.name ? "error" : ""}
          aria-describedby={
            formErrors.ingredient.name ? "ingredient-name-error" : undefined
          }
          aria-invalid={!!formErrors.ingredient.name}
        />
        {formErrors.ingredient.name && (
          <p
            id="ingredient-name-error"
            className="error-message"
            aria-live="polite"
          >
            {formErrors.ingredient.name}
          </p>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="ingredient-unit-price">Unit Price (£)</label>
        <input
          type="number"
          id="ingredient-unit-price"
          value={ingredientForm.unitPrice}
          onChange={(e) => {
            setIngredientForm({ ...ingredientForm, unitPrice: e.target.value });
            if (formErrors.ingredient.unitPrice) {
              setFormErrors({
                ...formErrors,
                ingredient: { ...formErrors.ingredient, unitPrice: "" },
              });
            }
          }}
          placeholder="Enter unit price"
          step="0.01"
          min="0"
          className={formErrors.ingredient.unitPrice ? "error" : ""}
          aria-describedby={
            formErrors.ingredient.unitPrice
              ? "ingredient-unit-price-error"
              : undefined
          }
          aria-invalid={!!formErrors.ingredient.unitPrice}
        />
        {formErrors.ingredient.unitPrice && (
          <p
            id="ingredient-unit-price-error"
            className="error-message"
            aria-live="polite"
          >
            {formErrors.ingredient.unitPrice}
          </p>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="ingredient-unit">Unit</label>
        <select
          id="ingredient-unit"
          value={ingredientForm.unit}
          onChange={(e) => {
            setIngredientForm({ ...ingredientForm, unit: e.target.value });
            if (formErrors.ingredient.unit) {
              setFormErrors({
                ...formErrors,
                ingredient: { ...formErrors.ingredient, unit: "" },
              });
            }
          }}
          className={formErrors.ingredient.unit ? "error" : ""}
          aria-describedby={
            formErrors.ingredient.unit ? "ingredient-unit-error" : undefined
          }
          aria-invalid={!!formErrors.ingredient.unit}
        >
          <option value="">Select unit</option>
          <option value="kg">Kilograms (kg)</option>
          <option value="g">Grams (g)</option>
          <option value="l">Liters (l)</option>
          <option value="ml">Milliliters (ml)</option>
          <option value="pcs">Pieces (pcs)</option>
          <option value="cups">Cups</option>
          <option value="tbsp">Tablespoons (tbsp)</option>
          <option value="tsp">Teaspoons (tsp)</option>
        </select>
        {formErrors.ingredient.unit && (
          <p
            id="ingredient-unit-error"
            className="error-message"
            aria-live="polite"
          >
            {formErrors.ingredient.unit}
          </p>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="ingredient-stock-quantity">Stock Quantity</label>
        <input
          type="number"
          id="ingredient-stock-quantity"
          value={ingredientForm.stockQuantity}
          onChange={(e) => {
            setIngredientForm({
              ...ingredientForm,
              stockQuantity: e.target.value,
            });
            if (formErrors.ingredient.stockQuantity) {
              setFormErrors({
                ...formErrors,
                ingredient: { ...formErrors.ingredient, stockQuantity: "" },
              });
            }
          }}
          placeholder="Enter stock quantity"
          step="0.01"
          min="0"
          className={formErrors.ingredient.stockQuantity ? "error" : ""}
          aria-describedby={
            formErrors.ingredient.stockQuantity
              ? "ingredient-stock-quantity-error"
              : undefined
          }
          aria-invalid={!!formErrors.ingredient.stockQuantity}
        />
        {formErrors.ingredient.stockQuantity && (
          <p
            id="ingredient-stock-quantity-error"
            className="error-message"
            aria-live="polite"
          >
            {formErrors.ingredient.stockQuantity}
          </p>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="ingredient-restock-threshold">Restock Threshold</label>
        <input
          type="number"
          id="ingredient-restock-threshold"
          value={ingredientForm.restockThreshold}
          onChange={(e) => {
            setIngredientForm({
              ...ingredientForm,
              restockThreshold: e.target.value,
            });
            if (formErrors.ingredient.restockThreshold) {
              setFormErrors({
                ...formErrors,
                ingredient: { ...formErrors.ingredient, restockThreshold: "" },
              });
            }
          }}
          placeholder="Enter restock threshold"
          step="0.01"
          min="0"
          className={formErrors.ingredient.restockThreshold ? "error" : ""}
          aria-describedby={
            formErrors.ingredient.restockThreshold
              ? "ingredient-restock-threshold-error"
              : undefined
          }
          aria-invalid={!!formErrors.ingredient.restockThreshold}
        />
        {formErrors.ingredient.restockThreshold && (
          <p
            id="ingredient-restock-threshold-error"
            className="error-message"
            aria-live="polite"
          >
            {formErrors.ingredient.restockThreshold}
          </p>
        )}
      </div>
      <div className="form-buttons">
        <button
          type="submit"
          className="button button-primary"
          disabled={isSubmitting.ingredient || addIngredientLoading}
          aria-label="Add ingredient"
        >
          {isSubmitting.ingredient || addIngredientLoading
            ? "Adding..."
            : "Add Ingredient"}
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={resetIngredientForm}
          aria-label="Reset form"
        >
          Reset
        </button>
      </div>
    </form>
    <h3 className="section-title">Existing Ingredients</h3>
    <ul className="list" aria-label="Ingredients list">
      {(data?.ingredients ?? []).map((ingredient: any) => (
        <li key={ingredient.id} className="list-item">
          <div className="list-item-content">
            <div>
              <p className="list-item-title">{ingredient.name ?? "Unknown"}</p>
              <p className="list-item-description">
                Price: £{(ingredient.unitPrice ?? 0).toFixed(2)} per{" "}
                {ingredient.unit ?? "unit"} | Stock:{" "}
                {ingredient.stockQuantity ?? 0} | Threshold:{" "}
                {ingredient.restockThreshold ?? 0}
              </p>
            </div>
            <button
              className="button button-danger"
              onClick={() => confirmDeleteIngredient(ingredient.id)}
              disabled={
                deletingItems.ingredients.has(ingredient.id) ||
                deleteIngredientLoading
              }
              aria-label={`Delete ${ingredient.name}`}
            >
              {deletingItems.ingredients.has(ingredient.id) ? (
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
  </div>
);

export default IngredientsTab;
