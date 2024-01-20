import { Product } from "../types";
import { CopyIcon, DownloadIcon, EditIcon } from "@chakra-ui/icons";
import {
  Card,
  CardBody,
  Image,
  Button,
  Heading,
  Stack,
  HStack,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import { capitalizeFirstLetter, getDimensionsAsString } from "../utilities/strings";
import { cmToInchString } from "../utilities/numbers";
import ProductEditView, { SubmitResponse } from "./ProductEditView";
import { updateProduct } from "../state";

// TODO: change the default URL
const DEFAULT_THUMBNAIL_URL = "https://i.etsystatic.com/46820714/r/il/04b528/5574088154/il_1588xN.5574088154_pcd7.jpg";

const getDescription = (product: Product) => {
  const getSizeStrings = (): string[] => {
    const sizeKeys = Object.keys(product.sizes);

    if (sizeKeys.length === 1) {
      const [firstKey] = sizeKeys;
      return [`💜 Size: ${getDimensionsAsString(Object.values(product.sizes[firstKey]), cmToInchString)}`];
    }

    return [
      `💜 ${sizeKeys.length} sizes provided`,
      ...Object.entries(product.sizes).map(
        ([sizeAlias, dims]) =>
          `💜 - ${capitalizeFirstLetter(sizeAlias)}: ${getDimensionsAsString(dims, cmToInchString)}`,
      ),
    ];
  };

  const text = [
    product.introduction,
    "✂️ Seam allowances included ✂️",
    "💜 Digital download only",
    "💜 Video tutorial only. No written instructions",
    "💜 Home printer friendly - Standard US Letter or A4 size design",
    ...getSizeStrings(),
    `💜 Youtube tutorial: ${product.tutorialLink}`,
    `💜 Craft time: ${product.duration} minutes`,
    "💜 No refunds available as the PDF is an immediate download",
  ]
    .filter((line) => line)
    .join("\n");

  return text;
};

const ProductPreviewCard = ({ product }: { product: Product }) => {
  const toast = useToast();
  const { isOpen: isEditorModalOpen, onOpen: openEditorModal, onClose: closeEditorModal } = useDisclosure();

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

  return (
    <>
      <Card maxW="sm">
        <CardBody>
          <Image src={getFirstThumbnailUrl()} alt="Green double couch with wooden legs" borderRadius="lg" />
          <Stack mt="6" spacing="3">
            <HStack>
              <Heading size="md">{product.name}</Heading>
              <IconButton aria-label="Edit this product" icon={<EditIcon />} onClick={openEditorModal} />
            </HStack>
            <Button leftIcon={<DownloadIcon />} onClick={openUserGuide} variant="solid" colorScheme="blue" size="sm">
              User guide
            </Button>
            <Button variant="solid" colorScheme="blue" size="sm" isDisabled>
              Create thumbnails
            </Button>
            <Button variant="solid" colorScheme="blue" size="sm" isDisabled>
              Create videos
            </Button>
            <Button
              variant="solid"
              colorScheme="blue"
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
        <ModalContent>
          <ModalBody>
            <ProductEditView product={product} onSubmit={onChange} onCancel={closeEditorModal} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductPreviewCard;
