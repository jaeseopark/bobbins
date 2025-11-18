import { ChatIcon, DeleteIcon } from "@chakra-ui/icons";
import { Button, FormLabel, Textarea } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";

const IntroTab = ({
  updateWithChatGpt,
}: {
  updateWithChatGpt: (field: "introduction", getPrompt: () => string) => void;
}) => {
  const { register, setValue, getValues, watch } = useFormContext();

  return (
    <>
      <FormLabel>Keywords (Line-separated)</FormLabel>
      <Textarea
        {...register("keywords", {
          setValueAs: (v: string | string[]) =>
            Array.isArray(v)
              ? v
              : v
                  .split("\n")
                  .map((keyword: string) => keyword.trim())
                  .filter((keyword: string) => keyword),
        })}
        minHeight="200px"
      />

      <FormLabel>Introduction</FormLabel>
      <Textarea {...register("introduction")} minHeight="300px" />

      <Button
        onClick={() =>
          updateWithChatGpt("introduction", () => {
            const updated = getValues();
            return [
              `In 4 joyful sentences, write a product description for a PDF sewing pattern "${updated.name}"`,
              `with the following characteristics: ${Array.isArray(updated.keywords) ? updated.keywords.join(", ") : updated.keywords}.`,
              "The pattern can be printed on standard US Letter size or A4 paper at home.",
              `The project comes with a ${updated.duration}-minute step-by-step youtube tutorial video.`,
              updated.sizes?.length > 1 && `The pattern comes in ${updated.sizes.length} sizes.`,
            ]
              .filter(Boolean)
              .join(" ");
          })
        }
        isDisabled={!!watch("introduction")}
        leftIcon={<ChatIcon />}
        size="sm"
        marginTop="1em"
        marginRight="1em"
      >
        Generate w/ ChatGPT
      </Button>
      <Button
        onClick={() => setValue("introduction", "")}
        leftIcon={<DeleteIcon />}
        size="sm"
        marginTop="1em"
        isDisabled={!watch("introduction")}
      >
        Clear
      </Button>
    </>
  );
};

export default IntroTab;
