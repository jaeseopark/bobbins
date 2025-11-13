// OverviewTab.tsx
import {
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import { Controller, useFormContext } from "react-hook-form";

const OverviewTab = () => {
  const { register, control } = useFormContext();

  return (
    <>
      <FormLabel>Name</FormLabel>
      <Input type="text" {...register("name", { required: "Name is required" })} />

      <FormLabel>Tutorial Link</FormLabel>
      <Input type="text" {...register("tutorialLink")} />

      <FormLabel>Duration (minutes)</FormLabel>
      <Controller
        name="duration"
        control={control}
        rules={{ min: 1, max: 600 }}
        render={({ field }) => (
          <NumberInput {...field} min={1} max={600} step={1} allowMouseWheel>
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

export default OverviewTab;
