import {
  Checkbox,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import { Controller, useFormContext } from "react-hook-form";

const StitchesTab = () => {
  const { register, control } = useFormContext();

  return (
    <>
      <FormLabel>Seam Allowance (cm)</FormLabel>
      <Controller
        name="stitches.seamAllowance"
        control={control}
        render={({ field }) => (
          <NumberInput {...field} min={0.1} max={1000} step={0.1} allowMouseWheel>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        )}
      />

      <FormLabel>Second Seam Allowance (cm) - Set to 0 to ignore</FormLabel>
      <Controller
        name="stitches.secondSeamAllowance"
        control={control}
        render={({ field }) => (
          <NumberInput {...field} min={0} max={1000} step={0.1} allowMouseWheel>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        )}
      />

      <FormLabel>Top Stitch (cm)</FormLabel>
      <Controller
        name="stitches.topStitch"
        control={control}
        render={({ field }) => (
          <NumberInput {...field} min={0.1} max={1000} step={0.1} allowMouseWheel>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        )}
      />

      <FormLabel>Baste Stitch (cm)</FormLabel>
      <Controller
        name="stitches.basteStitch"
        control={control}
        render={({ field }) => (
          <NumberInput {...field} min={0.1} max={1000} step={0.1} allowMouseWheel>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        )}
      />

      <FormLabel>No. Pieces Missing S/A</FormLabel>
      <Controller
        name="numMissingSeamAllowances"
        control={control}
        render={({ field }) => (
          <NumberInput {...field} min={0} max={10} step={1} allowMouseWheel>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        )}
      />

      <Checkbox {...register("containsNotches")}>Notches</Checkbox>
    </>
  );
};

export default StitchesTab;
