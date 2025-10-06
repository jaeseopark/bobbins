import { ArrowUpIcon, CopyIcon, DownloadIcon, EditIcon } from "@chakra-ui/icons";
import { Button, HStack, IconButton, useToast } from "@chakra-ui/react";
import { useRef } from "preact/hooks";

import { Product } from "../../types";

import { getDescription, openUserGuide, uploadThumbnail } from "./utils";

type ProductActionsProps = {
  product: Product;
  onEdit: () => void;
  onThumbnailUploaded?: (url: string) => void;
};

const ProductActions = ({ product, onEdit, onThumbnailUploaded }: ProductActionsProps) => {
  const toast = useToast();
  const thumbnailFile = useRef<HTMLInputElement | null>(null);

  const handleUploadThumbnail = (event: any) => {
    const file = event.target.files[0];
    uploadThumbnail(product.id, file)
      .then((path) => {
        if (onThumbnailUploaded) onThumbnailUploaded(path);
        toast({
          title: product.name,
          description: "Thumbnail was uploaded successfully.",
          status: "success",
          duration: 1500,
          isClosable: true,
        });
      })
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

  const handleCopyDescription = () => {
    const desc = getDescription(product);
    if (typeof window !== "undefined" && window.navigator && window.navigator.clipboard) {
      window.navigator.clipboard
        .writeText(desc)
        .then(() => {
          toast({
            title: product.name,
            description: "Description copied to clipboard.",
            status: "success",
            duration: 1500,
            isClosable: true,
          });
        })
        .catch(() => {
          toast({
            title: "Clipboard Error",
            description: "Could not copy to clipboard.",
            status: "error",
            duration: 1500,
            isClosable: true,
          });
        });
    } else {
      toast({
        title: "Clipboard Unavailable",
        description: "Clipboard API is not available in this environment.",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    }
  };

  return (
    <HStack spacing={2}>
      <IconButton aria-label="Edit this product" icon={<EditIcon />} onClick={onEdit} />
      <input type="file" id="file" ref={thumbnailFile} style={{ display: "none" }} onChange={handleUploadThumbnail} />
      <Button leftIcon={<ArrowUpIcon />} onClick={() => thumbnailFile.current?.click()} variant="solid" size="sm">
        Upload thumbnail
      </Button>
      <Button leftIcon={<DownloadIcon />} onClick={openUserGuide} variant="solid" size="sm">
        User guide
      </Button>
      <Button variant="solid" size="sm" leftIcon={<CopyIcon />} onClick={handleCopyDescription}>
        Description
      </Button>
    </HStack>
  );
};

export default ProductActions;
