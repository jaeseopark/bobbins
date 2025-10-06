import {
  Card,
  CardBody,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "preact/hooks";

import { Product } from "../../types";

import { updateProduct } from "../../state";

import ProductEditView, { SubmitResponse } from "../ProductEditView";
import ProductActions from "./ProductActions";
import { getFirstThumbnailUrl } from "./utils";

import "./ProductPreviewCard.scss";

const DEFAULT_THUMBNAIL_URL = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

const ProductPreviewCard = ({ product }: { product: Product }) => {
  const { isOpen: isEditorModalOpen, onOpen: openEditorModal, onClose: closeEditorModal } = useDisclosure();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(getFirstThumbnailUrl(product));

  const handleProductChange = async (updated: Product): Promise<SubmitResponse> => {
    try {
      await updateProduct(updated);
      return "UPDATED";
    } catch (e) {
      const { message } = e as Error;
      console.error(message);
      return "FAILED";
    }
  };

  return (
    <>
      <Card maxW="sm">
        <CardBody>
          <img className="bobbins-thmb" src={thumbnailUrl || DEFAULT_THUMBNAIL_URL} alt="Product image" />
          <Stack mt="6" spacing="3">
            <HStack>
              <Heading size="md">{product.name}</Heading>
              {/* Edit button is now in ProductActions */}
            </HStack>
            <ProductActions
              product={product}
              onEdit={openEditorModal}
              onThumbnailUploaded={(url) => {
                setThumbnailUrl(url);
              }}
            />
          </Stack>
        </CardBody>
      </Card>
      <Modal isOpen={isEditorModalOpen} onClose={closeEditorModal}>
        <ModalOverlay />
        <ModalContent minWidth="750px">
          <ModalBody>
            <ProductEditView product={product} onSubmit={handleProductChange} onCancel={closeEditorModal} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductPreviewCard;
