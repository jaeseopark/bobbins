import { CopyIcon, DeleteIcon } from "@chakra-ui/icons";
import { Button, Checkbox, useToast } from "@chakra-ui/react";
import { useState } from "preact/hooks";
import "./CsMessageComposer.scss";

const MESSAGES: string[] = [
  "Hi, thank you for your order.",
  "I am sorry for the trouble you have gone through.",
  "Etsy does not send the PDF files to your email directly.",
  "Please note the downloads are only available on the Etsy website and not on the mobile app.",
  "In your web browser, please navigate to the Purchases and Reviews menu to download the files.",
  "If the problem persists, I will be happy to send you the files to your email.",
  "Can you tell me your email address?",
  "If you have access to a computer, especially newer models, can you try opening the files there? The PDF programs on newer computers tend to be compatible with a wider range of PDF formats and they often have a better chance of success.",
  "If you have further questions, feel free to message me again.",
  "Happy sewing!",
];

const CsMessageComposer = () => {
  const [indices, setIndices] = useState<number[]>([]);
  const toast = useToast();

  const toggle = (i: number) => {
    if (indices.includes(i)) {
      setIndices(indices.filter((existing) => existing !== i));
      return;
    }

    setIndices([...indices, i]);
  };

  const copy = () => {
    const composedMessage = indices.map((i) => MESSAGES[i].trim()).join(" ");
    window.navigator.clipboard.writeText(composedMessage);
    toast({
      description: "Copied to clipboard.",
      status: "success",
      duration: 1500,
      isClosable: true,
    });
  };
  const reset = () => setIndices([]);

  return (
    <div className="cs-message-composer">
      {MESSAGES.map((message, i) => {
        const isChecked = indices.includes(i);
        return (
          <div className="row" key={message}>
            <Checkbox onChange={() => toggle(i)} isChecked={isChecked}>
              <div className="text">
                {isChecked && <span className="index">{indices.findIndex((existing) => existing === i) + 1}</span>}
                <p>{message}</p>
              </div>
            </Checkbox>
          </div>
        );
      })}
      <div>
        <Button leftIcon={<CopyIcon />} onClick={copy}>
          Copy to clipboard
        </Button>
        <Button leftIcon={<DeleteIcon />} onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default CsMessageComposer;
