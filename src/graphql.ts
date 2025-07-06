import { gql } from "@apollo/client";

export const GET_DATA = gql`
  query GetData {
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
        ingredient {
          id
          name
          unitPrice
          unit
        }
        quantity
      }
    }
    sales {
      id
      recipe {
        id
        name
        totalCost
      }
      saleAmount
      createdAt
    }
    dashboardStats {
      totalSales
      totalCosts
      totalMargin
      lowStockIngredients {
        id
        name
        stockQuantity
        unit
        restockThreshold
      }
    }
  }
`;

export const ADD_INGREDIENT = gql`
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

export const CREATE_RECIPE = gql`
  mutation CreateRecipe(
    $name: String!
    $ingredientIds: [ID!]!
    $quantities: [Float!]!
    $targetMargin: Float!
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
          ingredient {
            id
            name
            unitPrice
            unit
          }
          quantity
        }
      }
    }
  }
`;

export const RECORD_SALE = gql`
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
        recipe {
          id
          name
          totalCost
        }
        saleAmount
        createdAt
      }
    }
  }
`;

export const DELETE_INGREDIENT = gql`
  mutation DeleteIngredient($id: ID!) {
    deleteIngredient(id: $id) {
      success
      error
    }
  }
`;

export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id) {
      success
      error
    }
  }
`;

export const DELETE_SALE = gql`
  mutation DeleteSale($id: ID!) {
    deleteSale(id: $id) {
      success
      error
    }
  }
`;
