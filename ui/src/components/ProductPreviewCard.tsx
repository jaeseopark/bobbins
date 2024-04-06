import { ArrowUpIcon, CopyIcon, DownloadIcon, EditIcon } from "@chakra-ui/icons";
import {
  Button,
  Card,
  CardBody,
  HStack,
  Heading,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useRef } from "preact/hooks";

import { Product } from "../types";

import { updateProduct } from "../state";

import apiclient from "../apiclient";

import { cmToInchString } from "../utilities/numbers";
import { DESC_POINT_SYMBOL } from "../utilities/settings";
import { capitalizeFirstLetter, getDimensionsAsString } from "../utilities/strings";

import ProductEditView, { SubmitResponse } from "./ProductEditView";

import "./ProductPreviewCard.scss";

const DEFAULT_THUMBNAIL_URL = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

const getDescription = (product: Product) => {
  const getSizeStrings = (): string[] => {
    if (product.sizes.length === 1) {
      return [`${DESC_POINT_SYMBOL.value} Size: ${getDimensionsAsString(product.sizes[0].dimensions, cmToInchString)}`];
    }

    return [
      `${DESC_POINT_SYMBOL.value} ${product.sizes.length} sizes provided`,
      ...product.sizes.map(
        ({ alias, dimensions }) =>
          `${DESC_POINT_SYMBOL.value} - ${capitalizeFirstLetter(alias)}: ${getDimensionsAsString(dimensions, cmToInchString)}`,
      ),
    ];
  };

  const text = [
    product.introduction,
    "✂️ Seam allowances included ✂️",
    `${DESC_POINT_SYMBOL.value} Digital download only`,
    `${DESC_POINT_SYMBOL.value} Video tutorial only. No written instructions`,
    `${DESC_POINT_SYMBOL.value} Home printer friendly - Standard US Letter or A4 size design`,
    ...getSizeStrings(),
    `${DESC_POINT_SYMBOL.value} Youtube tutorial: ${product.tutorialLink}`,
    `${DESC_POINT_SYMBOL.value} Craft time: ${product.duration} minutes`,
    `${DESC_POINT_SYMBOL.value} The information regarding pattern printing methods, stitching details, materials used, and more can be found on the "User Guide_Thank you for purchasing" page, which is included in the PDF file when you make a purchase`,
    `${DESC_POINT_SYMBOL.value} The downloads links are only available on the Etsy website and not on the mobile app. Please make sure you are using the web browser and navigate to the the Purchases and Reviews section of your profile after placing the order.`,
    `${DESC_POINT_SYMBOL.value} No refunds available as the PDF is an immediate download`,
    `${DESC_POINT_SYMBOL.value} When selling the final product, please credit Sewing Stroll as the pattern's original creator.`,
  ]
    .filter((line) => line)
    .join("\n");

  return text;
};

const ProductPreviewCard = ({ product }: { product: Product }) => {
  const toast = useToast();
  const { isOpen: isEditorModalOpen, onOpen: openEditorModal, onClose: closeEditorModal } = useDisclosure();
  const thumbnailFile = useRef<HTMLInputElement | null>(null);

  const getFirstThumbnailUrl = (): string => {
    if (!product.thumbnails || product.thumbnails.length === 0) return DEFAULT_THUMBNAIL_URL;
    return product.thumbnails[0];
  };

  const onChange = async (updated: Product): Promise<SubmitResponse> => {
    try {
      await updateProduct(updated);
      return "UPDATED";
    } catch (e) {
      const { message } = e as Error;
      console.error(message);
      return "FAILED";
    }
  };

  const openUserGuide = () => {
    window.open(`/api/products/${product.id}/user_guide`, "_blank").focus();
  };

  const uploadThumbnail = (event: any) => {
    const file = event.target.files[0];
    apiclient
      .uploadThumbnail(product, file)
      .then((path) => updateProduct({ ...product, thumbnails: [path] }))
      .then(() =>
        toast({
          title: product.name,
          description: "Thumbnail was uploaded successully.",
          status: "success",
          duration: 1500,
          isClosable: true,
        }),
      )
      .catch(() =>
        toast({
          title: "Error",
          description: "Something went wrong.",
          status: "error",
          duration: 1500,
          isClosable: true,
        }),
      );
  };

  return (
    <>
      <Card maxW="sm">
        <CardBody>
          <img className="bobbins-thmb" src={getFirstThumbnailUrl()} alt="Product image" />
          <Stack mt="6" spacing="3">
            <HStack>
              <Heading size="md">{product.name}</Heading>
              <IconButton aria-label="Edit this product" icon={<EditIcon />} onClick={openEditorModal} />
            </HStack>
            <input type="file" id="file" ref={thumbnailFile} style={{ display: "none" }} onChange={uploadThumbnail} />
            <Button
              leftIcon={<ArrowUpIcon />}
              onClick={() => thumbnailFile.current?.click()}
              variant="solid"
              size="sm"
            >
              Upload thumbnail
            </Button>
            <Button leftIcon={<DownloadIcon />} onClick={openUserGuide} variant="solid" size="sm">
              User guide
            </Button>
            <Button
              variant="solid"
              size="sm"
              leftIcon={<CopyIcon />}
              onClick={() => {
                const desc = getDescription(product);
                window.navigator.clipboard.writeText(desc);
                toast({
                  title: product.name,
                  description: "Description copied to clipboard.",
                  status: "success",
                  duration: 1500,
                  isClosable: true,
                });
              }}
            >
              Description
            </Button>
          </Stack>
        </CardBody>
      </Card>
      <Modal isOpen={isEditorModalOpen} onClose={closeEditorModal}>
        <ModalOverlay />
        <ModalContent minWidth="750px">
          <ModalBody>
            <ProductEditView product={product} onSubmit={onChange} onCancel={closeEditorModal} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductPreviewCard;
