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
  HStack,
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { ChatIcon } from "@chakra-ui/icons";
export type SubmitResponse = "ADDED" | "UPDATED" | "FAILED";

const sizeMapToString = (sizes: { [key: string]: number[] }) => {
  return Object.entries(sizes)
    .map(([sizeAlias, dimensions]) => `${sizeAlias}: ${dimensions.join("x")}`)
    .join("\n");
};

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
  const sigMaterials = useSignal(product?.materials);
  const sigDuration = useSignal(product?.duration || 30);
  const sigThumbnails = useSignal(product?.thumbnails);
  const sigSizes = useSignal(sizeMapToString(product?.sizes || {}));
  const sigTutorialLink = useSignal(product?.tutorialLink || "https://youtube.com/");

  const handleSubmitResponse = (response: SubmitResponse) => {
    if (response === "FAILED") {
      // TODO
    }

    cancel();
  };

  const getSingularChangeHandler =
    (sig: Signal) =>
    // @ts-ignore
    ({ target: { value } }) => {
      sig.value = value;
    };

  const getKeywordsAsArray = () =>
    sigKeywords.value
      .split("\n")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword);

  const generateIntro = () => {
    const keywordsAsArray = getKeywordsAsArray();
    if (keywordsAsArray.length < 5) {
      toast({ description: "5 or more keywords required.", duration: 2500, status: "warning" });
      return;
    }
  };

  const getSizesAsMap = () =>
    sigSizes.value
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [sizeAlias, dimensionsAsString] = line.split(":");
        const dimensions = dimensionsAsString.split("x").map((num) => parseFloat(num.trim()));
        return { sizeAlias, dimensions };
      })
      .reduce((acc, { sizeAlias, dimensions }) => {
        return {
          ...acc,
          [sizeAlias]: dimensions,
        };
      }, {});

  return (
    <div>
      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input type="text" onChange={getSingularChangeHandler(sigName)} value={sigName.value} />
        <FormLabel>Tutorial Link</FormLabel>
        <Input type="text" onChange={getSingularChangeHandler(sigTutorialLink)} value={sigTutorialLink.value} />
        <FormLabel>Duration (minutes)</FormLabel>
        <NumberInput
          size="md"
          maxW={24}
          min={10}
          value={sigDuration.value}
          onChange={(_, value) => (sigDuration.value = value)}
          allowMouseWheel
          step={5}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <FormLabel>Keywords (Line-separated)</FormLabel>
        <Textarea type="text" onChange={getSingularChangeHandler(sigKeywords)} value={sigKeywords.value} />
        <FormLabel>Introduction</FormLabel>
        <Textarea type="text" onChange={getSingularChangeHandler(sigIntroduction)} value={sigIntroduction.value} />
        <Button onClick={generateIntro} leftIcon={<ChatIcon />} size="sm" isDisabled>
          Generate w/ ChatGPT
        </Button>
        <HStack>
          <FormLabel>Sizes</FormLabel>
        </HStack>
        <Textarea type="text" onChange={getSingularChangeHandler(sigSizes)} value={sigSizes.value} />
      </FormControl>
      <ButtonGroup marginTop=".75em" marginBottom=".75em">
        <Button
          colorScheme="blue"
          mr={3}
          onClick={() => {
            let newProduct: Product;

            try {
              newProduct = {
                ...product!,
                id: sigId.value,
                date: sigDate.value,
                name: sigName.value,
                tutorialLink: sigTutorialLink.value,
                duration: sigDuration.value,
                introduction: sigIntroduction.value,
                keywords: getKeywordsAsArray(),
                sizes: getSizesAsMap(),
              };
            } catch (e) {
              toast({ description: "Invalid input detected", status: "warning", duration: 2000 });
              return;
            }
            onSubmit(newProduct).then(handleSubmitResponse);
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
