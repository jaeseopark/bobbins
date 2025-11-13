import { ChatIcon, DeleteIcon } from "@chakra-ui/icons";
import { Button, FormLabel, Textarea } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";

import { bulkConvertUnits } from "../../utilities/numbers";

import { BlackCalcIcon } from "../global";

const TipsTab = ({ updateWithChatGpt }: { updateWithChatGpt: (field: "tips", getPrompt: () => string) => void }) => {
  const { register, setValue, getValues, watch } = useFormContext();

  return (
    <>
      <FormLabel>Tips</FormLabel>
      <Textarea {...register("tips")} minHeight="300px" />

      <Button
        onClick={() =>
          updateWithChatGpt("tips", () => {
            const updated = getValues();
            return `Translate into American English in the context of sewing: ${updated.tips}`;
          })
        }
        leftIcon={<ChatIcon />}
        size="sm"
        marginTop="1em"
        marginRight="1em"
        isDisabled={!watch("tips")}
      >
        Translate into English
      </Button>
      <Button
        onClick={() =>
          updateWithChatGpt("tips", () => {
            const updated = getValues();
            return `Rephrase in a friendly and delightful tone in the context of sewing: ${updated.tips}`;
          })
        }
        leftIcon={<ChatIcon />}
        size="sm"
        marginTop="1em"
        marginRight="1em"
        isDisabled={!watch("tips")}
      >
        Rephrase w/ ChatGPT
      </Button>
      <Button
        onClick={() => setValue("tips", bulkConvertUnits(getValues().tips))}
        leftIcon={<BlackCalcIcon />}
        size="sm"
        marginTop="1em"
        marginRight="1em"
        isDisabled={!watch("tips")}
      >
        Convert
      </Button>
      <Button
        onClick={() => setValue("tips", "")}
        leftIcon={<DeleteIcon />}
        size="sm"
        marginTop="1em"
        isDisabled={!watch("tips")}
      >
        Clear
      </Button>
    </>
  );
};

export default TipsTab;
