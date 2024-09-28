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
import { StateUpdater, useState } from "preact/hooks";
import { v4 as uuidv4 } from "uuid";

import { Product, Size } from "../types";

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

const DimensionField = ({
  sizes,
  sizeSetter,
  i,
  k,
}: {
  sizes: Size[];
  sizeSetter: StateUpdater<Size[]>;
  k: number;
  i: number;
}) => {
  const dimensions = sizes[i].dimensions;
  return (
    <NumberInput
      allowMouseWheel
      value={dimensions[k]}
      step={0.1}
      onChange={(_, value) => {
        dimensions[k] = value;
        sizes[i].dimensions = dimensions;
        sizeSetter((prevSizes) => prevSizes);
      }}
    >
      <NumberInputField />
    </NumberInput>
  );
};

const NumericField = ({
  value,
  label,
  setter,
  ...rest
}: { value: number; label: string; setter: StateUpdater<number> } & Record<string, any>) => (
  <>
    <FormLabel>{label}</FormLabel>
    <NumberInput size="md" maxW={24} value={value} onChange={(_, value) => setter(value)} allowMouseWheel {...rest}>
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
  const [id] = useState<string>(product?.id || uuidv4().toString());
  const [name, setName] = useState(product?.name || "New Product");
  const [date, setDate] = useState(product?.date || Date.now());
  const [introduction, setIntroduction] = useState(product?.introduction || "");
  const [keywords, setKeywords] = useState(product?.keywords.join("\n") || "");
  const [materials, setMaterials] = useState(product?.materials || []);
  const [duration, setDuration] = useState(product?.duration || 30);
  const [stitches, setStitches] = useState(product?.stitches || {});
  const [sizes, setSizes] = useState(product?.sizes || []);
  const [tutorialLink, setTutorialLink] = useState(product?.tutorialLink || "https://youtube.com/");
  const [numMissingSeamAllowances, setNumMissingSeamAllowances] = useState(product?.numMissingSeamAllowances || 0);
  const [containsNotches, setContainsNotches] = useState(product?.containsNotches || true);
  const [tips, setTips] = useState(product?.tips || "");

  const handleSubmitResponse = (response: SubmitResponse) => {
    if (response === "FAILED") {
      // TODO
    }

    cancel();
  };

  const getSingularChangeHandler =
    (setter: StateUpdater<any>): ((e: any) => void) =>
    ({ target: { value } }) => {
      setter(value);
    };

  const getCheckboxChangeHandler =
    (setter: StateUpdater<boolean>): ((e: any) => void) =>
    ({ target: { checked } }) => {
      setter(checked);
    };

  const getKeywordsAsArray = () =>
    keywords
      .split("\n")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword);

  const getUpdatedProductObject = (): Product => ({
    ...product!,
    id,
    date,
    name,
    tutorialLink,
    duration,
    introduction,
    keywords: getKeywordsAsArray(),
    sizes,
    materials,
    stitches,
    numMissingSeamAllowances,
    containsNotches,
    tips,
  });

  const updateWithChatGpt = (setter: StateUpdater<string>, getPrompt: () => string) => {
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
        setter(answer);
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
    setMaterials((prevMaterials) => [...prevMaterials, { name: "{Material}", notes: "{Detail}" }]);
  };

  const addSize = () => {
    setSizes((prevSizes) => [...prevSizes, { alias: "Another Size", dimensions: [1, 2, 3] }]);
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
              <Input type="text" onChange={getSingularChangeHandler(setName)} value={name} />
              <FormLabel>Tutorial Link</FormLabel>
              <Input type="text" onChange={getSingularChangeHandler(setTutorialLink)} value={tutorialLink} />
              <NumericField
                label="Duration (minutes)"
                value={duration}
                setter={setDuration}
                min={1}
                max={600}
                step={1}
              />
            </TabPanel>
            <TabPanel>
              <FormLabel>Keywords (Line-separated)</FormLabel>
              <Textarea
                type="text"
                onChange={getSingularChangeHandler(setKeywords)}
                value={keywords}
                minHeight="200px"
              />
              <FormLabel>Introduction</FormLabel>
              <Textarea
                type="text"
                onChange={getSingularChangeHandler(setIntroduction)}
                value={introduction}
                minHeight="300px"
              />
              <Button
                onClick={() =>
                  updateWithChatGpt(setIntroduction, () => {
                    const updated = getUpdatedProductObject();
                    return getIntroGenerationPrompt(updated);
                  })
                }
                isDisabled={(introduction.length || 0) > 0}
                leftIcon={<ChatIcon />}
                size="sm"
                marginTop="1em"
                marginRight="1em"
              >
                Generate w/ ChatGPT
              </Button>
              <Button
                onClick={() => setIntroduction("")}
                leftIcon={<DeleteIcon />}
                size="sm"
                marginTop="1em"
                isDisabled={(introduction.length || 0) === 0}
              >
                Clear
              </Button>
            </TabPanel>
            <TabPanel>
              <FormLabel>Seam Allowance (cm)</FormLabel>
              <NumberInput
                size="md"
                maxW={24}
                value={stitches.seamAllowance || 0}
                onChange={(_, value) =>
                  setStitches((prevStitches) => ({
                    ...prevStitches,
                    seamAllowance: value,
                  }))
                }
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
                value={stitches.secondSeamAllowance || 0}
                onChange={(_, value) =>
                  setStitches((prevStitches) => ({
                    ...prevStitches,
                    secondSeamAllowance: value,
                  }))
                }
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
                value={stitches.topStitch || 0}
                onChange={(_, value) =>
                  setStitches((prevStitches) => ({
                    ...prevStitches,
                    topStitch: value,
                  }))
                }
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
                value={stitches.basteStitch || 0}
                onChange={(_, value) =>
                  setStitches((prevStitches) => ({
                    ...prevStitches,
                    basteStitch: value,
                  }))
                }
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
                value={numMissingSeamAllowances}
                setter={setNumMissingSeamAllowances}
                min={0}
                max={10}
                step={1}
              />
              {/* @ts-ignore */}
              <Checkbox isChecked={containsNotches} onChange={getCheckboxChangeHandler(setContainsNotches)}>
                Notches
              </Checkbox>
            </TabPanel>
            <TabPanel>
              <FormLabel>Sizes (cm)</FormLabel>
              <table>
                <tbody>
                  {sizes.map(({ alias, dimensions }, i) => {
                    return (
                      <tr>
                        {sizes.length > 1 && (
                          <td>
                            <Input
                              type="text"
                              value={alias}
                              onChange={({ target: { value } }) => {
                                // TODO: refactor with .reduce()
                                sizes[i].alias = value;
                                setSizes((prevSizes) => prevSizes);
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
                                // TODO: refactor with .reduce()
                                sizes[i].dimensions = newDimensions;
                                setSizes((prevSizes) => prevSizes);
                              }
                            }}
                          >
                            <option value={2}>2 dimensions</option>
                            <option value={3}>3 dimensions</option>
                          </Select>
                        </td>
                        {dimensions.map((_, k) => (
                          <td>
                            <DimensionField sizes={sizes} sizeSetter={setSizes} i={i} k={k} />
                          </td>
                        ))}
                        <td>
                          <Button
                            leftIcon={<DeleteIcon />}
                            onClick={() => setSizes((prevSizes) => prevSizes.filter((_, j) => i !== j))}
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
                  {materials.map(({ name, notes }, i) => (
                    <tr>
                      <td>
                        <Input
                          type="text"
                          value={name}
                          onChange={({ target: { value } }) => {
                            // TODO: use .reduce()
                            materials[i].name = value as string;
                            setMaterials((prevMaterials) => prevMaterials);
                          }}
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          value={notes}
                          minWidth="275px"
                          onChange={({ target: { value } }) => {
                            materials[i].notes = value as string;
                            setMaterials((prevMaterials) => prevMaterials);
                          }}
                        />
                      </td>
                      <td>
                        <Button
                          leftIcon={<DeleteIcon />}
                          onClick={() => setMaterials((prevMaterials) => prevMaterials.filter((_, j) => i !== j))}
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
              <Textarea type="text" onChange={getSingularChangeHandler(setTips)} value={tips} minHeight="300px" />
              <Button
                onClick={() =>
                  updateWithChatGpt(setTips, () => {
                    const updated = getUpdatedProductObject();
                    return `Translate into American English in the context of sewing: ${updated.tips}`;
                  })
                }
                leftIcon={<ChatIcon />}
                size="sm"
                marginTop="1em"
                marginRight="1em"
                isDisabled={tips.length === 0}
              >
                Translate into English
              </Button>
              <Button
                onClick={() =>
                  updateWithChatGpt(setTips, () => {
                    const updated = getUpdatedProductObject();
                    return `Rephrase in a friendly and delightful tone in the context of sewing: ${updated.tips}`;
                  })
                }
                leftIcon={<ChatIcon />}
                size="sm"
                marginTop="1em"
                marginRight="1em"
                isDisabled={tips.length === 0}
              >
                Rephrase w/ ChatGPT
              </Button>
              <Button
                onClick={() => setTips("")}
                leftIcon={<DeleteIcon />}
                size="sm"
                marginTop="1em"
                isDisabled={tips.length === 0}
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
