import { HStack, Input } from "@chakra-ui/react";
import { Controller, useFormContext } from "react-hook-form";

type DimensionFieldProps = {
  name: string; // e.g. "sizes.0.dimensions"
  labels?: string[]; // e.g. ["Length", "Width", "Height"]
  count?: number; // number of dimensions
};

const defaultLabels = ["Length", "Width", "Height"];

const DimensionField = ({ name, labels = defaultLabels, count = 3 }: DimensionFieldProps) => {
  const { control } = useFormContext();

  return (
    <HStack spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Controller
          key={i}
          name={`${name}.${i}`}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              placeholder={labels[i] || `Dim ${i + 1}`}
              min={0}
              step={0.1}
              width="100px"
            />
          )}
        />
      ))}
    </HStack>
  );
};

export default DimensionField;
