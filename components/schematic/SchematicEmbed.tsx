"use client";
import { SchematicEmbed as SchematicEmbedComponent } from "@schematichq/schematic-components";

const SchematicEmbed = ({
  accessToken,
  componentId,
}: {
  accessToken: string;
  componentId: string;
}) => {
  return (
    <SchematicEmbedComponent
      accessToken={accessToken}
      id={componentId}
    ></SchematicEmbedComponent>
  );
};

export default SchematicEmbed;
