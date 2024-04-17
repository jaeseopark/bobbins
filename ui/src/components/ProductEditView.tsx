import { ChatIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { Signal, useSignal } from "@preact/signals";
import { v4 as uuidv4 } from "uuid";

import { Product } from "../types";

import apiclient from "../apiclient";

import "./ProductEditView.scss";

export type SubmitResponse = "ADDED" | "UPDATED" | "FAILED";

const TOAST_DURATION = 4500;

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
  const sigStitches = useSignal(product?.stitches || {});
  const sigSizes = useSignal(product?.sizes || []);
  const sigTutorialLink = useSignal(product?.tutorialLink || "https://youtube.com/");
  const sigNumMissingSeamAllowances = useSignal(product?.numMissingSeamAllowances || 0);
  const sigContainsNotches = useSignal(product?.containsNotches || true);
  const sigTips = useSignal(product?.tips || "");

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
    tips: sigTips.value,
  });

  const updateSigWithChatGpt = (sig: Signal, getPrompt: () => string) => {
    let question;

    try {
      question = getPrompt();
    } catch (error) {
      toast({
        description: "Could not get the chat prompt.",
        status: "warning",
        duration: TOAST_DURATION,
        isClosable: true,
      });
      return;
    }

    toast({
      description: "Processing...",
      status: "info",
      duration: TOAST_DURATION,
      isClosable: true,
    });

    apiclient
      .ask({ question })
      .then(({ answer }) => {
        sig.value = answer;
        toast({
          description: "Done! Don't forget to save 💾",
          status: "success",
          duration: TOAST_DURATION,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Something went wrong.",
          status: "error",
          duration: TOAST_DURATION,
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
            <Tab>Intro</Tab>
            <Tab>Stitches</Tab>
            <Tab>Sizes & Mats</Tab>
            <Tab>Tips</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <FormLabel>Name</FormLabel>
              <Input type="text" onChange={getSingularChangeHandler(sigName)} value={sigName.value} />
              <FormLabel>Tutorial Link</FormLabel>
              <Input type="text" onChange={getSingularChangeHandler(sigTutorialLink)} value={sigTutorialLink.value} />
              <NumericField label="Duration (minutes)" sig={sigDuration} min={1} max={600} step={1} />
            </TabPanel>
            <TabPanel>
              <FormLabel>Keywords (Line-separated)</FormLabel>
              <Textarea
                type="text"
                onChange={getSingularChangeHandler(sigKeywords)}
                value={sigKeywords.value}
                minHeight="200px"
              />
              <FormLabel>Introduction</FormLabel>
              <Textarea
                type="text"
                onChange={getSingularChangeHandler(sigIntroduction)}
                value={sigIntroduction.value}
                minHeight="300px"
              />
              <Button
                onClick={() =>
                  updateSigWithChatGpt(sigIntroduction, () => {
                    const updated = getUpdatedProductObject();
                    return getIntroGenerationPrompt(updated);
                  })
                }
                isDisabled={(sigIntroduction?.value?.length || 0) > 0}
                leftIcon={<ChatIcon />}
                size="sm"
                marginTop="1em"
                marginRight="1em"
              >
                Generate w/ ChatGPT
              </Button>
              <Button
                onClick={() => {
                  sigIntroduction.value = "";
                }}
                leftIcon={<DeleteIcon />}
                size="sm"
                marginTop="1em"
                isDisabled={(sigIntroduction?.value?.length || 0) === 0}
              >
                Clear
              </Button>
            </TabPanel>
            <TabPanel>
              <FormLabel>Seam Allowance (cm)</FormLabel>
              <NumberInput
                size="md"
                maxW={24}
                value={sigStitches.value.seamAllowance || 0}
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
                value={sigStitches.value.secondSeamAllowance || 0}
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
                value={sigStitches.value.topStitch || 0}
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
                value={sigStitches.value.basteStitch || 0}
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
              <FormLabel>Tips</FormLabel>
              <Textarea
                type="text"
                onChange={getSingularChangeHandler(sigTips)}
                value={sigTips.value}
                minHeight="300px"
              />
              <Button
                onClick={() =>
                  updateSigWithChatGpt(sigTips, () => {
                    const updated = getUpdatedProductObject();
                    return `Translate into American English in the context of sewing: ${updated.tips}`;
                  })
                }
                leftIcon={<ChatIcon />}
                size="sm"
                marginTop="1em"
                marginRight="1em"
                isDisabled={sigTips.value.length === 0}
              >
                Translate into English
              </Button>
              <Button
                onClick={() =>
                  updateSigWithChatGpt(sigTips, () => {
                    const updated = getUpdatedProductObject();
                    return `Rephrase in a friendly and delightful tone in the context of sewing: ${updated.tips}`;
                  })
                }
                leftIcon={<ChatIcon />}
                size="sm"
                marginTop="1em"
                marginRight="1em"
                isDisabled={sigTips.value.length === 0}
              >
                Rephrase w/ ChatGPT
              </Button>
              <Button
                onClick={() => {
                  sigTips.value = "";
                }}
                leftIcon={<DeleteIcon />}
                size="sm"
                marginTop="1em"
                isDisabled={sigTips.value.length === 0}
              >
                Clear
              </Button>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </FormControl>
      <ButtonGroup marginTop=".75em" marginBottom=".75em">
        <Button
          colorScheme="purple"
          mr={3}
          onClick={() => {
            let updatedProduct: Product;

            try {
              updatedProduct = getUpdatedProductObject();
            } catch (e) {
              console.error(e);
              toast({
                description: "Save failed due to invalid product details.",
                status: "warning",
                duration: TOAST_DURATION,
              });
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
