import {
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import { Controller, useFormContext } from "react-hook-form";

type NumericFieldProps = {
  name: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  width?: string;
  required?: boolean;
};

const NumericField = ({
  name,
  label,
  min = 0,
  max = 1000,
  step = 1,
  width = "120px",
  required = false,
}: NumericFieldProps) => {
  const { control } = useFormContext();

  return (
    <>
      {label && <FormLabel>{label}</FormLabel>}
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label || name} is required` } : undefined}
        render={({ field }) => (
          <NumberInput {...field} min={min} max={max} step={step} width={width} allowMouseWheel>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        )}
      />
    </>
  );
};

export default NumericField;
