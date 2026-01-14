import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useRouteError, useLoaderData } from "react-router";
import { boundary, } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-box padding="base base">
        <s-app-nav>
          <s-link href="/app">Home</s-link>
          <s-link href="/app/back-to-top">back-to-top</s-link>
        </s-app-nav>
        <Outlet />
      </s-box>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
