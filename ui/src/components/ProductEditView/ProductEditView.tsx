import { Button, ButtonGroup, FormControl, useToast } from "@chakra-ui/react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { FormProvider, useForm } from "react-hook-form";

// Added
import { Product } from "../../types";

import { updateWithChatGpt as withChatGpt } from "../../utilities/gpt";

import IntroTab from "./IntroTab";
import OverviewTab from "./OverviewTab";
import SizesMaterialsTab from "./SizesMaterialsTab";
import StitchesTab from "./StitchesTab";
import TipsTab from "./TipsTab";
import { getProductDefaultValues } from "./defaults";

import "./ProductEditView.scss";

export type SubmitResponse = "ADDED" | "UPDATED" | "FAILED";

const TOAST_DURATION = 4500;

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

  // --- react-hook-form setup ---
  const methods = useForm<Product>({
    defaultValues: getProductDefaultValues(product),
  });

  // --- ChatGPT helpers ---
  const updateWithChatGpt = (field: keyof Product, getPrompt: () => string) =>
    withChatGpt((value: string) => methods.setValue(field, value), getPrompt, toast, TOAST_DURATION);

  // --- Submission handler ---
  const handleSubmitResponse = (response: SubmitResponse) => {
    if (response === "FAILED") {
      // TODO
    }
    cancel();
  };

  // --- Render ---
  return (
    <div className="product-edit-view">
      <FormProvider {...methods}>
        <FormControl as="form" onSubmit={methods.handleSubmit((data) => onSubmit(data).then(handleSubmitResponse))}>
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
                <OverviewTab />
              </TabPanel>
              <TabPanel>
                <IntroTab updateWithChatGpt={updateWithChatGpt} />
              </TabPanel>
              <TabPanel>
                <StitchesTab />
              </TabPanel>
              <TabPanel>
                <SizesMaterialsTab />
              </TabPanel>
              <TabPanel>
                <TipsTab updateWithChatGpt={updateWithChatGpt} />
              </TabPanel>
            </TabPanels>
          </Tabs>
          <ButtonGroup marginTop=".75em" marginBottom=".75em">
            <Button colorScheme="purple" mr={3} type="submit">
              OK
            </Button>
            <Button variant="ghost" onClick={cancel}>
              Cancel
            </Button>
          </ButtonGroup>
        </FormControl>
      </FormProvider>
    </div>
  );
};

export default ProductEditView;
