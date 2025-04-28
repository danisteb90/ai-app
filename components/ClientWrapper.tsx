"use client";
import { SchematicProvider } from "@schematichq/schematic-react";
import SchematicWrapper from "./SchematicWrapper";
import ConvexClientProvider from "./ConvexClientProvider";

export default function ClientWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schematicPubKey = process.env.NEXT_PUBLIC_SCHEMATIC_PUBLISHABLE_KEY;
  if (!schematicPubKey) {
    throw new Error(
      "No Schematic Publishable Key found. Please add NEXT_PUBLIC_SCHEMATIC_PUBLISHABLE_KEY to your .env file."
    );
  }

  return (
    <ConvexClientProvider>
      <SchematicProvider publishableKey={schematicPubKey}>
        <SchematicWrapper>{children}</SchematicWrapper>
      </SchematicProvider>
    </ConvexClientProvider>
  );
}
