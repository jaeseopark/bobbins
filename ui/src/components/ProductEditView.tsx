import { Signal, useSignal } from "@preact/signals";
import { Material, Product } from "../types";
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
  Checkbox,
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { ChatIcon } from "@chakra-ui/icons";
export type SubmitResponse = "ADDED" | "UPDATED" | "FAILED";
import apiclient from "../apiclient";

// TODO: support URLs
const MATERIAL_URL_REGEX = "^([^:])*:*(.*)$";

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

const sizeMapToString = (sizes: { [key: string]: number[] }) => {
  return Object.entries(sizes)
    .map(([sizeAlias, dimensions]) => `${sizeAlias}: ${dimensions.join("x")}`)
    .join("\n");
};

const materialArrayToString = (materials: Material[]): string =>
  materials
    .map(({ name, notes, url }) => {
      if (url) {
        return `${name}: ${notes} ${url}`;
      }
      return `${name}: ${notes}`;
    })
    .join("\n");

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
  const sigMaterials = useSignal(materialArrayToString(product?.materials || []));
  const sigDuration = useSignal(product?.duration || 30);
  const sigThumbnails = useSignal(product?.thumbnails);
  const sigSizes = useSignal(sizeMapToString(product?.sizes || {}));
  const sigTutorialLink = useSignal(product?.tutorialLink || "https://youtube.com/");
  const sigNumMissingSeamAllowances = useSignal(product?.numMissingSeamAllowances || 0);
  const sigSeamAllowance = useSignal(product?.seamAllowance || 1);
  const sigTopStitch = useSignal(product?.topStitch || 0.2);
  const sigBasteStitch = useSignal(product?.basteStitch || 0.5);
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

  const getSizesAsMap = () =>
    sigSizes.value
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        line = line.replace("cm", "");
        let sizeAlias = "regular";
        let dimStr = line;
        if (line.includes(":")) {
          const splitLine = line.split(":");
          sizeAlias = splitLine[0];
          dimStr = splitLine[1];
        }
        return { sizeAlias, dimensions: dimStr.split("x").map((num) => parseFloat(num.trim())) };
      })
      .reduce((acc, { sizeAlias, dimensions }) => {
        return {
          ...acc,
          [sizeAlias]: dimensions,
        };
      }, {});

  const getMaterialsAsArray = (): Material[] =>
    sigMaterials.value
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.match(MATERIAL_URL_REGEX))
      .filter((match) => match)
      .map((match) => {
        // TODO: support URLs
        const [_, name, notes] = match!;
        return {
          name: name.trim(),
          notes: notes.trim(),
        };
      });

  const getUpdatedProductObject = (): Product => ({
    ...product!,
    id: sigId.value,
    date: sigDate.value,
    name: sigName.value,
    tutorialLink: sigTutorialLink.value,
    duration: sigDuration.value,
    introduction: sigIntroduction.value,
    keywords: getKeywordsAsArray(),
    sizes: getSizesAsMap(),
    materials: getMaterialsAsArray(),
    numMissingSeamAllowances: sigNumMissingSeamAllowances.value,
    seamAllowance: sigSeamAllowance.value,
    topStitch: sigTopStitch.value,
    basteStitch: sigBasteStitch.value,
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

  return (
    <div className="product-edit-view">
      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input type="text" onChange={getSingularChangeHandler(sigName)} value={sigName.value} />
        <FormLabel>Tutorial Link</FormLabel>
        <Input type="text" onChange={getSingularChangeHandler(sigTutorialLink)} value={sigTutorialLink.value} />
        <HStack>
          <NumericField label="Duration (minutes)" sig={sigDuration} min={1} max={600} step={1} />
          {/* @ts-ignore */}
          <Checkbox isChecked={sigContainsNotches.value} onChange={getCheckboxChangeHandler(sigContainsNotches)}>
            Notches
          </Checkbox>
        </HStack>
        <HStack>
          <div>
            <NumericField label="Seam Allowance (cm)" sig={sigSeamAllowance} min={0.1} max={2} step={0.1} />
          </div>
          <div>
            <NumericField label="Top Stitch (cm)" sig={sigTopStitch} min={0.1} max={2} step={0.1} />
          </div>
          <div>
            <NumericField label="Baste Stitch (cm)" sig={sigBasteStitch} min={0.1} max={2} step={0.1} />
          </div>
        </HStack>
        <NumericField label="No. Pieces Missing S/A" sig={sigNumMissingSeamAllowances} min={0} max={10} step={1} />
        <FormLabel>Keywords (Line-separated)</FormLabel>
        <Textarea type="text" onChange={getSingularChangeHandler(sigKeywords)} value={sigKeywords.value} />
        <FormLabel>Introduction</FormLabel>
        <Textarea type="text" onChange={getSingularChangeHandler(sigIntroduction)} value={sigIntroduction.value} />
        <Button onClick={generateIntro} leftIcon={<ChatIcon />} size="sm">
          Generate w/ ChatGPT
        </Button>
        <FormLabel>Sizes</FormLabel>
        <Textarea type="text" onChange={getSingularChangeHandler(sigSizes)} value={sigSizes.value} />
        <FormLabel>Materials</FormLabel>
        <Textarea type="text" onChange={getSingularChangeHandler(sigMaterials)} value={sigMaterials.value} />
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
