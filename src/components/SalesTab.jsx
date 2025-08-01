import React from "react";
import { FaTrash } from "react-icons/fa";
import { usePagination } from "../hooks/usePagination";
import Pagination from "./Pagination";

const SalesTab = ({
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
}) => {
  const sales = data?.sales ?? [];

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
    data: sales,
    itemsPerPage: 10,
  });

  return (
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
            {(data?.recipes ?? []).map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name} (Cost: £{(recipe.totalCost ?? 0).toFixed(2)})
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

      {totalItems === 0 ? (
        <div className="empty-state">
          <p>No sales found. Add your first sale above!</p>
        </div>
      ) : (
        <>
          <ul className="list">
            {paginatedData.map((sale) => (
              <li key={sale.id} className="list-item">
                <div className="list-item-content">
                  <div>
                    <p className="list-item-title">
                      {sale.recipe?.name ?? "Unknown Recipe"}
                    </p>
                    <p className="list-item-description">
                      Sale Amount: £{Number(sale.saleAmount ?? 0).toFixed(2)} |
                      Date:{" "}
                      {sale.createdAt
                        ? new Date(sale.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <button
                    className="button button-danger"
                    onClick={() => confirmDeleteSale(sale.id)}
                    disabled={
                      deletingItems.sales.has(sale.id) || deleteSaleLoading
                    }
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

export default SalesTab;
