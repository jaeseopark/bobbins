import { DeleteIcon } from "@chakra-ui/icons";
import { Button, FormLabel, Input, Select, Table, Tbody, Td, Tr } from "@chakra-ui/react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

const SizesMaterialsTab = () => {
  const { control, register } = useFormContext();

  // Sizes field array
  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: "sizes",
  });

  // Materials field array
  const {
    fields: materialFields,
    append: appendMaterial,
    remove: removeMaterial,
  } = useFieldArray({
    control,
    name: "materials",
  });

  return (
    <>
      <FormLabel>Sizes (cm)</FormLabel>
      <Table>
        <Tbody>
          {sizeFields.map((field, i) => (
            <Tr key={field.id}>
              <Td>
                <Input type="text" placeholder="Alias" {...register(`sizes.${i}.alias`)} />
              </Td>
              <Td>
                <Select {...register(`sizes.${i}.dimensions.length`)} width="150px">
                  <option value={2}>2 dimensions</option>
                  <option value={3}>3 dimensions</option>
                </Select>
              </Td>
              {/* Example for 3 dimensions, adjust as needed */}
              {[0, 1, 2].map((k) => (
                <Td key={k}>
                  <Controller
                    name={`sizes.${i}.dimensions.${k}`}
                    control={control}
                    render={({ field }) => <Input type="number" {...field} placeholder={`Dim ${k + 1}`} />}
                  />
                </Td>
              ))}
              <Td>
                <Button leftIcon={<DeleteIcon />} onClick={() => removeSize(i)} size="sm" />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Button onClick={() => appendSize({ alias: "", dimensions: [0, 0, 0] })} size="sm" mt={2}>
        Add Size
      </Button>

      <FormLabel mt={4}>Materials</FormLabel>
      <Table>
        <Tbody>
          {materialFields.map((field, i) => (
            <Tr key={field.id}>
              <Td>
                <Input type="text" placeholder="Material Name" {...register(`materials.${i}.name`)} />
              </Td>
              <Td>
                <Input type="text" placeholder="Notes" {...register(`materials.${i}.notes`)} />
              </Td>
              <Td>
                <Button leftIcon={<DeleteIcon />} onClick={() => removeMaterial(i)} size="sm" />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Button onClick={() => appendMaterial({ name: "", notes: "" })} size="sm" mt={2}>
        Add Material
      </Button>
    </>
  );
};

export default SizesMaterialsTab;
