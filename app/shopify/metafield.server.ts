export async function saveBackToTopMetafield({
  admin,
  settings,
}: {
  admin: any;
  settings: {
    enabled: boolean;
    position: string;
    color: string;
    animation: string;
    visibility: string;
  };
}) {
  console.log("✅ saveBackToTopMetafield CALLED");

  // 1️⃣ Get shop ID
  const shopRes = await admin.graphql(`
    query {
      shop {
        id
      }
    }
  `);   

  const shopJson: any = await shopRes.json();
  const shopId = shopJson.data.shop.id;

  console.log(" SHOP ID:", shopId);

  let fixedColor = settings.color;
  if (fixedColor && !fixedColor.startsWith("#")) {
    fixedColor = "#" + fixedColor;
  }

  const finalSettings = {
    ...settings,
    color: fixedColor,
  };

  console.log(" SAVING COLOR:", finalSettings.color);

  const result = await admin.graphql(
    `
    mutation SetMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        userErrors { field message }
      }
    }
    `,
    {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: "back_to_top",
            key: "settings",
            type: "json",
            value: JSON.stringify(finalSettings),
          },
        ],
      },
    },
  );

  const json: any = await result.json();

  console.log(" METAFIELD SAVE RESULT:");
  console.log(JSON.stringify(json, null, 2));

  return json;
}
