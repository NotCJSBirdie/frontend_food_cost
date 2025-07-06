/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { FaTrash } from "react-icons/fa";

interface SalesTabProps {
  data: any;
  saleForm: any;
  setSaleForm: (form: any) => void;
  formErrors: any;
  setFormErrors: (errors: any) => void;
  isSubmitting: any;
  recordSaleLoading: boolean;
  deletingItems: any;
  deleteSaleLoading: boolean;
  confirmRecordSale: () => void;
  resetSaleForm: () => void;
  confirmDeleteSale: (id: string) => void;
}

const SalesTab: React.FC<SalesTabProps> = ({
  data,
  saleForm,
  setSaleForm,
  formErrors,
  setFormErrors,
  isSubmitting,
  recordSaleLoading,
  deletingItems,
  deleteSaleLoading,
  confirmRecordSale,
  resetSaleForm,
  confirmDeleteSale,
}) => (
  <div className="card" role="region" aria-labelledby="sales-title">
    <h2 id="sales-title" className="card-title">
      Sales
    </h2>
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        confirmRecordSale();
      }}
    >
      <div className="form-group">
        <label htmlFor="sale-recipe">Recipe</label>
        <select
          id="sale-recipe"
          value={saleForm.recipeId}
          onChange={(e) => {
            setSaleForm({ ...saleForm, recipeId: e.target.value });
            if (formErrors.sale.recipeId) {
              setFormErrors({
                ...formErrors,
                sale: { ...formErrors.sale, recipeId: "" },
              });
            }
          }}
          className={formErrors.sale.recipeId ? "error" : ""}
          aria-describedby={
            formErrors.sale.recipeId ? "sale-recipe-error" : undefined
          }
          aria-invalid={!!formErrors.sale.recipeId}
        >
          <option value="">Select recipe</option>
          {(data?.recipes ?? []).map((recipe: any) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.name} (Cost: £{(recipe.cost ?? 0).toFixed(2)})
            </option>
          ))}
        </select>
        {formErrors.sale.recipeId && (
          <p
            id="sale-recipe-error"
            className="error-message"
            aria-live="polite"
          >
            {formErrors.sale.recipeId}
          </p>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="sale-amount">Sale Amount (£)</label>
        <input
          type="number"
          id="sale-amount"
          value={saleForm.saleAmount}
          onChange={(e) => {
            setSaleForm({ ...saleForm, saleAmount: e.target.value });
            if (formErrors.sale.saleAmount) {
              setFormErrors({
                ...formErrors,
                sale: { ...formErrors.sale, saleAmount: "" },
              });
            }
          }}
          placeholder="Enter sale amount"
          step="0.01"
          min="0"
          className={formErrors.sale.saleAmount ? "error" : ""}
          aria-describedby={
            formErrors.sale.saleAmount ? "sale-amount-error" : undefined
          }
          aria-invalid={!!formErrors.sale.saleAmount}
        />
        {formErrors.sale.saleAmount && (
          <p
            id="sale-amount-error"
            className="error-message"
            aria-live="polite"
          >
            {formErrors.sale.saleAmount}
          </p>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="sale-quantity">Quantity Sold</label>
        <input
          type="number"
          id="sale-quantity"
          value={saleForm.quantitySold}
          onChange={(e) => {
            setSaleForm({ ...saleForm, quantitySold: e.target.value });
            if (formErrors.sale.quantitySold) {
              setFormErrors({
                ...formErrors,
                sale: { ...formErrors.sale, quantitySold: "" },
              });
            }
          }}
          placeholder="Enter quantity sold"
          step="1"
          min="1"
          className={formErrors.sale.quantitySold ? "error" : ""}
          aria-describedby={
            formErrors.sale.quantitySold ? "sale-quantity-error" : undefined
          }
          aria-invalid={!!formErrors.sale.quantitySold}
        />
        {formErrors.sale.quantitySold && (
          <p
            id="sale-quantity-error"
            className="error-message"
            aria-live="polite"
          >
            {formErrors.sale.quantitySold}
          </p>
        )}
      </div>
      <div className="form-buttons">
        <button
          type="submit"
          className="button button-primary"
          disabled={isSubmitting.sale || recordSaleLoading}
          aria-label="Record sale"
        >
          {isSubmitting.sale || recordSaleLoading
            ? "Recording..."
            : "Record Sale"}
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={resetSaleForm}
          aria-label="Reset form"
        >
          Reset
        </button>
      </div>
    </form>
    <h3 className="section-title">Existing Sales</h3>
    <ul className="list" aria-label="Sales list">
      {(data?.sales ?? []).map((sale: any) => (
        <li key={sale.id} className="list-item">
          <div className="list-item-content">
            <div>
              <p className="list-item-title">
                {sale.recipe?.name ?? "Unknown Recipe"}
              </p>
              <p className="list-item-description">
                Amount: £{(sale.saleAmount ?? 0).toFixed(2)} | Quantity:{" "}
                {sale.quantitySold ?? 0} | Profit: £
                {(sale.profit ?? 0).toFixed(2)}
              </p>
            </div>
            <button
              className="button button-danger"
              onClick={() => confirmDeleteSale(sale.id)}
              disabled={deletingItems.sales.has(sale.id) || deleteSaleLoading}
              aria-label={`Delete sale for ${
                sale.recipe?.name || "Unknown Recipe"
              }`}
            >
              {deletingItems.sales.has(sale.id) ? (
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

export default SalesTab;
