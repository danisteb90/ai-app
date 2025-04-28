import { SchematicClient } from "@schematichq/schematic-typescript-node";

if (!process.env.SCHEMATIC_API_KEY) {
  throw new Error(
    "Schematic API key is not defined in the environment variables."
  );
}

export const client = new SchematicClient({
  apiKey: process.env.SCHEMATIC_API_KEY,
  cacheProviders: {
    flagChecks: [],
  },
});
