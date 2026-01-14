import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { saveBackToTopMetafield } from "../shopify/metafield.server";

import { Form, useLoaderData, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "app/db.server";

import { useActionData } from "react-router";
import { useEffect, useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("🟢 LOADER HIT");
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const settings = {
    shop,
    enabled: false,
    position: "bottom-right",
    color: "#0000",
    animation: "fade",
    visibility: "optional",
  };

  return { settings };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("🔥 ACTION HIT");

  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  console.log("🔥 SHOP:", shop);

  const formData = await request.formData();

  console.log("🧪 FORM DATA START");
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }
  console.log("🧪 FORM DATA END");

  // Parse values
  const enabled = formData.get("enabled") === "on";
  const position = String(formData.get("position") || "bottom-right");
  const color = String(formData.get("color") || "#000000");
  const animation = formData.get("animation") === "on" ? "fade" : "none";
  const visibility = String(formData.get("visibility") || "optional");
  console.log("🧾 FORM DATA:", { enabled, position, color });

  // Save to Prisma
  const saved = await prisma.backToTopSettings.upsert({
    where: { shop },
    update: { enabled, position, color, animation, visibility },
    create: { shop, enabled, position, color, animation, visibility },
  });

  console.log("✅ PRISMA SAVED:", saved);

  // 🔥 Save to Shopify Metafield (THIS USES THE FUNCTION)
  await saveBackToTopMetafield({
    admin,
    settings: {
      enabled,
      position,
      color,
      animation,
      visibility,
    },
  });

  return { success: true };
};

export default function Index() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const app = useAppBridge();

  const [position, setPosition] = useState(settings.position);
  const [visibility, setVisibility] = useState(settings.visibility);
  const [color, setColor] = useState(settings.color);

  useEffect(() => {
    if (actionData?.success) {
      app.toast.show("Back to Top settings saved");
    }
  }, [actionData, app]);

  return (
    <s-page>
      <Form method="post" data-save-bar>
        <s-page heading="Back to Top">
          <s-section heading="Back to top settings">
            <s-paragraph>
              The Back to Top widget adds a button that lets customers quickly
              return to the top of the page while scrolling.
            </s-paragraph>

            <s-switch
              name="enabled"
              label="Enable Back to Top"
              details="Show Back to Top button on your store"
              defaultChecked={settings.enabled}
            />
          </s-section>

          <s-grid
            gridTemplateColumns="repeat(6, 1fr)"
            gap="small"
            justifyContent="center"
          >
            <s-grid-item gridColumn="span 2" border="base" borderStyle="dashed">
              <s-section heading="Widget Settings">
                {/* POSITION */}
                <s-select
                  name="position"
                  label="Button position"
                  value={position}
                  onChange={(e: any) => setPosition(e.detail.value)}
                >
                  <s-option value="bottom-right">Bottom Right</s-option>
                  <s-option value="bottom-left">Bottom Left</s-option>
                </s-select>

                {/* ANIMATION */}
                <s-switch
                  name="animation"
                  label="Enable animation"
                  details="Smooth scroll animation"
                  defaultChecked={settings.animation !== null}
                />

                {/* VISIBILITY */}
                <s-choice-list
                  name="visibility"
                  label="Button visibility"
                  details="Choose when the button is visible"
                  values={[visibility]}
                  onChange={(e: any) => setVisibility(e.detail.value)}
                >
                  <s-choice value="hidden">Hidden</s-choice>
                  <s-choice value="optional">Optional</s-choice>
                  <s-choice value="required">Required</s-choice>
                </s-choice-list>

                {/* COLOR */}
                <s-color-field
                  name="color"
                  placeholder="Select a color"
                  value={color}
                  onChange={(e: any) => setColor(e.detail.value)}
                />
              </s-section>
            </s-grid-item>

            <s-grid-item gridColumn="span 4" border="base" borderStyle="dashed">
              <s-section heading="Preview">
                <s-paragraph />
              </s-section>
            </s-grid-item>
          </s-grid>
        </s-page>
      </Form>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
