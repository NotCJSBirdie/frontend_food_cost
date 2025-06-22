/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import App from "./App";
import "./index.css";

// Log environment variables at startup
console.log("Environment variables:", {
  VITE_ENV: import.meta.env.VITE_ENV,
  VITE_APPSYNC_URL: import.meta.env.VITE_APPSYNC_URL,
  VITE_APPSYNC_REGION: import.meta.env.VITE_APPSYNC_REGION,
  VITE_APPSYNC_API_KEY: import.meta.env.VITE_APPSYNC_API_KEY
    ? "Set"
    : "Missing",
  VITE_LOCAL_GRAPHQL_URL: import.meta.env.VITE_LOCAL_GRAPHQL_URL,
});

// Environment variables
const env = import.meta.env.VITE_ENV;
const isDevelopment = env === "development";

// Error link to log network and GraphQL errors
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  console.error("Apollo Client error:", {
    operationName: operation.operationName,
    variables: operation.variables,
  });
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error("GraphQL error:", {
        message,
        locations,
        path,
      });
    });
  }
  if (networkError) {
    console.error("Network error:", {
      message: networkError.message,
      statusCode: "status" in networkError ? networkError.status : "N/A",
      body: "bodyText" in networkError ? networkError.bodyText : "N/A",
    });
  }
});

// Log HTTP requests
const loggingLink = {
  request: (operation: any, forward: any) => {
    console.log("Sending GraphQL request:", {
      operationName: operation.operationName,
      variables: operation.variables,
      query: operation.query.loc?.source.body,
    });
    return forward(operation).map((response: any) => {
      console.log("GraphQL response:", {
        operationName: operation.operationName,
        data: response.data,
        errors: response.errors,
      });
      return response;
    });
  },
};

// Local Apollo Client
const localClient = new ApolloClient({
  link: from([
    errorLink,
    new HttpLink({ uri: import.meta.env.VITE_LOCAL_GRAPHQL_URL }),
  ]),
  cache: new InMemoryCache(),
});

// Amplify configuration for AppSync (production)
if (!isDevelopment) {
  console.log("Configuring Amplify for AppSync...");
  try {
    Amplify.configure({
      API: {
        GraphQL: {
          endpoint: import.meta.env.VITE_APPSYNC_URL,
          region: import.meta.env.VITE_APPSYNC_REGION,
          defaultAuthMode: "apiKey",
          apiKey: import.meta.env.VITE_APPSYNC_API_KEY,
        },
      },
    });
    console.log("Amplify configured successfully");
  } catch (error: any) {
    console.error("Amplify configuration error:", {
      message: error.message,
      stack: error.stack,
    });
  }
}

// Apollo Client for AppSync (production)
const appSyncClient = isDevelopment
  ? localClient
  : new ApolloClient({
      link: from([
        loggingLink as any,
        errorLink,
        new HttpLink({
          uri: import.meta.env.VITE_APPSYNC_URL,
          headers: {
            "x-api-key": import.meta.env.VITE_APPSYNC_API_KEY,
          },
        }),
      ]),
      cache: new InMemoryCache(),
    });

console.log("Apollo Client initialized:", {
  isDevelopment,
  uri: isDevelopment
    ? import.meta.env.VITE_LOCAL_GRAPHQL_URL
    : import.meta.env.VITE_APPSYNC_URL,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={appSyncClient}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ApolloProvider>
);
