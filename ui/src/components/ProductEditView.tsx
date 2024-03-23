import { Signal, useSignal } from "@preact/signals";
import { Product } from "../types";
import {
  FormControl,
  FormLabel,
  Input,
  ButtonGroup,
  Button,
  Textarea,
  useToast,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Checkbox,
  Select,
} from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { ChatIcon, DeleteIcon } from "@chakra-ui/icons";
export type SubmitResponse = "ADDED" | "UPDATED" | "FAILED";
import apiclient from "../apiclient";

import "./ProductEditView.scss";

const getIntroGenerationPrompt = (p: Product): string => {
  const sizeCount = Object.keys(p.sizes).length;
  return [
    `In 4 joyful sentences, write a product description for a PDF sewing pattern "${p.name}"`,
    `with the following characteristics: ${p.keywords.join(", ")}.`,
    "The pattern can be printed on standard US Letter size or A4 paper at home.",
    `The project comes with a ${p.duration}-minute step-by-step youtube tutorial video.`,
    sizeCount > 1 && `The pattern comes in ${sizeCount} sizes.`,
  ]
    .filter((line) => line)
    .join(" ");
};

const DimensionField = ({ sigSizes, i, k }: { k: number; sigSizes: Signal; i: number }) => {
  const dimensions = sigSizes.value[i].dimensions;
  return (
    <NumberInput
      allowMouseWheel
      value={dimensions[k]}
      step={0.1}
      onChange={(_, value) => {
        dimensions[k] = value;
        sigSizes.value[i].dimensions = dimensions;
        sigSizes.value = [...sigSizes.value];
      }}
    >
      <NumberInputField />
    </NumberInput>
  );
};

const NumericField = ({ label, sig, ...rest }: { label: string; sig: Signal } & Record<string, any>) => (
  <>
    <FormLabel>{label}</FormLabel>
    <NumberInput
      size="md"
      maxW={24}
      value={sig.value}
      onChange={(_, value) => (sig.value = value)}
      allowMouseWheel
      {...rest}
    >
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  </>
);

const ProductEditView = ({
  product,
  onSubmit,
  onCancel: cancel,
}: {
  product?: Product;
  onSubmit: (product: Product) => Promise<SubmitResponse>;
  onCancel: () => void;
}) => {
  const toast = useToast();
  const sigId = useSignal<string>(product?.id || uuidv4().toString());
  const sigName = useSignal(product?.name || "New Product");
  const sigDate = useSignal(product?.date || Date.now());
  const sigIntroduction = useSignal(product?.introduction);
  const sigKeywords = useSignal(product?.keywords.join("\n") || "");
  const sigMaterials = useSignal(product?.materials || []);
  const sigDuration = useSignal(product?.duration || 30);
  const sigStitches = useSignal(
    product?.stitches || {
      seamAllowance: 1,
      secondSeamAllowance: 0,
      topStitch: 0.2,
      basteStitch: 0.2,
    },
  );
  const sigSizes = useSignal(product?.sizes || []);
  const sigTutorialLink = useSignal(product?.tutorialLink || "https://youtube.com/");
  const sigNumMissingSeamAllowances = useSignal(product?.numMissingSeamAllowances || 0);
  const sigContainsNotches = useSignal(product?.containsNotches || true);

  const handleSubmitResponse = (response: SubmitResponse) => {
    if (response === "FAILED") {
      // TODO
    }

    cancel();
  };

  const getSingularChangeHandler =
    (sig: Signal): ((e: any) => void) =>
    ({ target: { value } }) => {
      sig.value = value;
    };

  const getCheckboxChangeHandler =
    (sig: Signal): ((e: any) => void) =>
    ({ target: { checked } }) => {
      sig.value = checked;
    };

  const getKeywordsAsArray = () =>
    sigKeywords.value
      .split("\n")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword);

  const getUpdatedProductObject = (): Product => ({
    ...product!,
    id: sigId.value,
    date: sigDate.value,
    name: sigName.value,
    tutorialLink: sigTutorialLink.value,
    duration: sigDuration.value,
    introduction: sigIntroduction.value,
    keywords: getKeywordsAsArray(),
    sizes: sigSizes.value,
    materials: sigMaterials.value,
    stitches: sigStitches.value,
    numMissingSeamAllowances: sigNumMissingSeamAllowances.value,
    containsNotches: sigContainsNotches.value,
  });

  const generateIntro = () => {
    let p, question;

    try {
      p = getUpdatedProductObject();
      question = getIntroGenerationPrompt(p);
    } catch (error) {
      toast({
        description: "The product information is missing or malformed.",
        status: "warning",
        duration: 1500,
        isClosable: true,
      });
      return;
    }

    toast({
      description: "Generating...",
      status: "info",
      duration: 7500,
      isClosable: true,
    });

    apiclient
      .ask({ question })
      .then(({ answer }) => {
        sigIntroduction.value = answer;
        toast({
          description: "The introduction has been generated. Don't forget to save!",
          status: "success",
          duration: 1500,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Something went wrong.",
          status: "error",
          duration: 1500,
          isClosable: true,
        });
      });
  };

  const addMaterial = () => {
    sigMaterials.value = [...sigMaterials.value, { name: "{Material}", notes: "{Detail}" }];
  };

  const addSize = () => {
    sigSizes.value = [...sigSizes.value, { alias: "Another Size", dimensions: [1, 2, 3] }];
  };

  return (
    <div className="product-edit-view">
      <FormControl>
        <Tabs>
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Stitches</Tab>
            <Tab>Sizes & Mats</Tab>
            <Tab>Intro</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <FormLabel>Name</FormLabel>
              <Input type="text" onChange={getSingularChangeHandler(sigName)} value={sigName.value} />
              <FormLabel>Tutorial Link</FormLabel>
              <Input type="text" onChange={getSingularChangeHandler(sigTutorialLink)} value={sigTutorialLink.value} />
              <NumericField label="Duration (minutes)" sig={sigDuration} min={1} max={600} step={1} />
              <FormLabel>Keywords (Line-separated)</FormLabel>
              <Textarea
                type="text"
                onChange={getSingularChangeHandler(sigKeywords)}
                value={sigKeywords.value}
                minHeight="200px"
              />
            </TabPanel>
            <TabPanel>
              <FormLabel>Seam Allowance (cm)</FormLabel>
              <NumberInput
                size="md"
                maxW={24}
                value={sigStitches.value.seamAllowance}
                onChange={(_, value) => (sigStitches.value = { ...sigStitches.value, seamAllowance: value })}
                allowMouseWheel
                min={0.1}
                max={1000}
                step={0.1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormLabel>Second Seam Allowance (cm) - Set to 0 to ignore</FormLabel>
              <NumberInput
                size="md"
                maxW={24}
                value={sigStitches.value.secondSeamAllowance}
                onChange={(_, value) => (sigStitches.value = { ...sigStitches.value, secondSeamAllowance: value })}
                allowMouseWheel
                min={0}
                max={1000}
                step={0.1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormLabel>Top Stitch (cm)</FormLabel>
              <NumberInput
                size="md"
                maxW={24}
                value={sigStitches.value.topStitch}
                onChange={(_, value) => (sigStitches.value = { ...sigStitches.value, topStitch: value })}
                allowMouseWheel
                min={0.1}
                max={1000}
                step={0.1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormLabel>Baste Stitch (cm)</FormLabel>
              <NumberInput
                size="md"
                maxW={24}
                value={sigStitches.value.basteStitch}
                onChange={(_, value) => (sigStitches.value = { ...sigStitches.value, basteStitch: value })}
                allowMouseWheel
                min={0.1}
                max={1000}
                step={0.1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <NumericField
                label="No. Pieces Missing S/A"
                sig={sigNumMissingSeamAllowances}
                min={0}
                max={10}
                step={1}
              />
              {/* @ts-ignore */}
              <Checkbox isChecked={sigContainsNotches.value} onChange={getCheckboxChangeHandler(sigContainsNotches)}>
                Notches
              </Checkbox>
            </TabPanel>
            <TabPanel>
              <FormLabel>Sizes (cm)</FormLabel>
              <table>
                <tbody>
                  {sigSizes.value.map(({ alias, dimensions }, i) => {
                    return (
                      <tr>
                        {sigSizes.value.length > 1 && (
                          <td>
                            <Input
                              type="text"
                              value={alias}
                              onChange={({ target: { value } }) => {
                                sigSizes.value[i].alias = value;
                                sigSizes.value = [...sigSizes.value];
                              }}
                            />
                          </td>
                        )}
                        <td>
                          <Select
                            value={dimensions.length}
                            width="150px"
                            onChange={({ target: { value } }) => {
                              const valueAsNumber = parseFloat(value);
                              if (valueAsNumber !== dimensions.length) {
                                // TODO revise this logic
                                const newDimensions =
                                  valueAsNumber === 2 ? dimensions.slice(0, 2) : [...dimensions.slice(0, 2), 1];
                                sigSizes.value[i].dimensions = newDimensions;
                                sigSizes.value = [...sigSizes.value];
                              }
                            }}
                          >
                            <option value={2}>2 dimensions</option>
                            <option value={3}>3 dimensions</option>
                          </Select>
                        </td>
                        {dimensions.map((_, k) => (
                          <td>
                            <DimensionField sigSizes={sigSizes} i={i} k={k} />
                          </td>
                        ))}
                        <td>
                          <Button
                            leftIcon={<DeleteIcon />}
                            onClick={() => {
                              sigSizes.value = sigSizes.value.filter((_, j) => i !== j);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Button onClick={addSize}>+</Button>
              <FormLabel>Materials</FormLabel>
              <table>
                <tbody>
                  {sigMaterials.value.map(({ name, notes }, i) => (
                    <tr>
                      <td>
                        <Input
                          type="text"
                          value={name}
                          onChange={({ target: { value } }) => {
                            sigMaterials.value[i].name = value as string;
                            sigMaterials.value = [...sigMaterials.value]; // tell the observe the value has changed.
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          value={notes}
                          minWidth="275px"
                          onChange={({ target: { value } }) => {
                            sigMaterials.value[i].notes = value as string;
                            sigMaterials.value = [...sigMaterials.value]; // tell the observe the value has changed.
                          }}
                        />
                      </td>
                      <td>
                        <Button
                          leftIcon={<DeleteIcon />}
                          onClick={() => {
                            sigMaterials.value = sigMaterials.value.filter((_, j) => i !== j);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button onClick={addMaterial}>+</Button>
            </TabPanel>
            <TabPanel>
              <FormLabel>Introduction</FormLabel>
              <Textarea
                type="text"
                onChange={getSingularChangeHandler(sigIntroduction)}
                value={sigIntroduction.value}
                minHeight="300px"
              />{" "}
              <Button onClick={generateIntro} leftIcon={<ChatIcon />} size="sm" marginTop="1em">
                Generate w/ ChatGPT
              </Button>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </FormControl>
      <ButtonGroup marginTop=".75em" marginBottom=".75em">
        <Button
          colorScheme="blue"
          mr={3}
          onClick={() => {
            let updatedProduct: Product;

            try {
              updatedProduct = getUpdatedProductObject();
            } catch (e) {
              console.error(e);
              toast({ description: "Invalid input detected", status: "warning", duration: 2000 });
              return;
            }
            onSubmit(updatedProduct).then(handleSubmitResponse);
          }}
        >
          OK
        </Button>
        <Button variant="ghost" onClick={cancel}>
          Cancel
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default ProductEditView;
