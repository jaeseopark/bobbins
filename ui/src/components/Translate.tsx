import { ChatIcon, DeleteIcon } from "@chakra-ui/icons";
import { Button, Textarea, useToast } from "@chakra-ui/react";
import { useState } from "preact/hooks";

import { updateWithChatGpt } from "../utilities/gpt";
import { bulkConvertUnits } from "../utilities/numbers";

import { BlackCalcIcon } from "./global";

import "./Translate.scss";

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
        onClick={() => setPhrase(bulkConvertUnits(phrase))}
        leftIcon={<BlackCalcIcon />}
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
