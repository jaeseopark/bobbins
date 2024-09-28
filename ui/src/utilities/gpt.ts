import { CreateToastFnReturn } from "@chakra-ui/react";

import apiclient from "../apiclient";

const DEFAULT_TOAST_DURATION = 4500;

export const updateWithChatGpt = (
  setter: (value: string) => void,
  getPrompt: () => string,
  toast: CreateToastFnReturn,
  toastDuration?: number,
) => {
  let question;

  try {
    question = getPrompt();
  } catch (error) {
    toast({
      description: "Could not get the chat prompt.",
      status: "warning",
      duration: toastDuration || DEFAULT_TOAST_DURATION,
      isClosable: true,
    });
    return;
  }

  toast({
    description: "Processing...",
    status: "info",
    duration: toastDuration || DEFAULT_TOAST_DURATION,
    isClosable: true,
  });

  apiclient
    .ask({ question })
    .then(({ answer }) => {
      setter(answer);
      toast({
        description: "Done! Don't forget to save 💾",
        status: "success",
        duration: toastDuration || DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
    })
    .catch(() => {
      toast({
        title: "Error",
        description: "Something went wrong.",
        status: "error",
        duration: toastDuration || DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
    });
};
