import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import App from "./App";
import "./index.css";

// Log environment variables
console.log({
  VITE_ENV: import.meta.env.VITE_ENV,
  VITE_APPSYNC_URL: import.meta.env.VITE_APPSYNC_URL,
  VITE_APPSYNC_REGION: import.meta.env.VITE_APPSYNC_REGION,
  VITE_APPSYNC_API_KEY: import.meta.env.VITE_APPSYNC_API_KEY
    ? "Set"
    : "Missing",
});

// Environment variables
const env = import.meta.env.VITE_ENV;
const isDevelopment = env === "development";

// Local Apollo Client
const localClient = new ApolloClient({
  link: new HttpLink({ uri: import.meta.env.VITE_LOCAL_GRAPHQL_URL }),
  cache: new InMemoryCache(),
});

// Amplify configuration for AppSync (production)
if (!isDevelopment) {
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
}

// Apollo Client for AppSync (production)
const appSyncClient = isDevelopment
  ? localClient
  : new ApolloClient({
      link: new HttpLink({
        uri: import.meta.env.VITE_APPSYNC_URL,
        headers: {
          "x-api-key": import.meta.env.VITE_APPSYNC_API_KEY,
        },
      }),
      cache: new InMemoryCache(),
    });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={appSyncClient}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ApolloProvider>
);
