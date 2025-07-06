/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface DashboardTabProps {
  data: any;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ data }) => (
  <div className="card" role="region" aria-labelledby="dashboard-title">
    <h2 id="dashboard-title" className="card-title">
      Dashboard
    </h2>
    <div className="stats-grid">
      <div className="stat">
        <p>
          Total Sales: £{(data?.dashboardStats?.totalSales ?? 0).toFixed(2)}
        </p>
      </div>
      <div className="stat">
        <p>
          Total Costs: £{(data?.dashboardStats?.totalCosts ?? 0).toFixed(2)}
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
                  {ingredient.stockQuantity ?? 0} {ingredient.unit ?? ""}{" "}
                  (Threshold: {ingredient.restockThreshold ?? 0})
                </p>
              </div>
            </div>
          </li>
        )
      )}
    </ul>
    <div className="guide">
      <h3 className="section-title">Usage Guide</h3>
      <p>The Dashboard provides an overview of your business performance:</p>
      <ul className="guide-list">
        <li>
          <strong>Total Sales</strong>: Total revenue from all recorded sales.
        </li>
        <li>
          <strong>Total Costs</strong>: Sum of costs for all ingredients used in
          recipes.
        </li>
        <li>
          <strong>Total Margin</strong>: Profit calculated as sales minus costs.
        </li>
        <li>
          <strong>Low Stock Alerts</strong>: Lists ingredients below their
          restock threshold.
        </li>
      </ul>
    </div>
  </div>
);

export default DashboardTab;
