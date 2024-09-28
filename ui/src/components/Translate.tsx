import { ChatIcon, DeleteIcon } from "@chakra-ui/icons";
import { Button, Textarea, useToast } from "@chakra-ui/react";
import { useState } from "preact/hooks";

import { updateWithChatGpt } from "../utilities/gpt";
import { cmToInchString, mmToInchString } from "../utilities/numbers";

import "./Translate.scss";

const CalcIcon = () => <div className="black-calc-icon" />;

const convert = (ogPhrase: string): string => {
  return ogPhrase.replace(/(\d+\.?\d?)\s?(cm|mm)/g, (token) => {
    const matchArray = /(\d+\.?\d?)\s?(cm|mm)/g.exec(token);
    if (!matchArray) {
      console.log("no match: " + token);
      return token;
    }

    const number = parseFloat(matchArray[1]);
    const unit = matchArray[2];

    console.log(`match found: array=${matchArray} number=${number} unit=${unit}`);
    if (unit === "cm") {
      return `${token} (${cmToInchString(number)}")`;
    } else if (unit === "mm") {
      return `${token} (${mmToInchString(number)}")`;
    }
    throw new Error(`Unsupported unit: ${unit}`);
  });
};

const Translate = () => {
  const [phrase, setPhrase] = useState("");
  const toast = useToast();

  return (
    <>
      <Textarea
        type="text"
        onChange={({ target: { value } }) => {
          setPhrase(value);
        }}
        value={phrase}
        minHeight="300px"
      />
      <Button
        onClick={() =>
          updateWithChatGpt(
            setPhrase,
            () => `Translate into American English in the context of sewing: ${phrase}`,
            toast,
          )
        }
        leftIcon={<ChatIcon />}
        size="sm"
        marginTop="1em"
        marginRight="1em"
        isDisabled={phrase.length === 0}
      >
        Translate into English
      </Button>
      <Button
        onClick={() =>
          updateWithChatGpt(
            setPhrase,
            () => `Rephrase in a friendly and delightful tone in the context of sewing: ${phrase}`,
            toast,
          )
        }
        leftIcon={<ChatIcon />}
        size="sm"
        marginTop="1em"
        marginRight="1em"
        isDisabled={phrase.length === 0}
      >
        Rephrase w/ ChatGPT
      </Button>
      <Button
        onClick={() => setPhrase(convert(phrase))}
        leftIcon={<CalcIcon />}
        size="sm"
        marginTop="1em"
        marginRight="1em"
        isDisabled={phrase.length === 0}
      >
        Convert
      </Button>
      <Button
        onClick={() => setPhrase("")}
        leftIcon={<DeleteIcon />}
        size="sm"
        marginTop="1em"
        isDisabled={phrase.length === 0}
      >
        Clear
      </Button>
    </>
  );
};

export default Translate;
