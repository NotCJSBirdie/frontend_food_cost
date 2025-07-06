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
      id
      name
      unitPrice
      unit
      stockQuantity
      restockThreshold
    }
  }
`;

export const CREATE_RECIPE = gql`
  mutation CreateRecipe(
    $name: String!
    $targetMargin: Float!
    $ingredients: [RecipeIngredientInput!]!
  ) {
    createRecipe(
      name: $name
      targetMargin: $targetMargin
      ingredients: $ingredients
    ) {
      id
      name
      # Only include fields that exist in your backend
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
      id
      recipe {
        id
        name
      }
      saleAmount
      # Only include fields that exist in your backend
      createdAt
    }
  }
`;

export const DELETE_INGREDIENT = gql`
  mutation DeleteIngredient($id: ID!) {
    deleteIngredient(id: $id) {
      id
    }
  }
`;

export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id) {
      id
    }
  }
`;

export const DELETE_SALE = gql`
  mutation DeleteSale($id: ID!) {
    deleteSale(id: $id) {
      id
    }
  }
`;
