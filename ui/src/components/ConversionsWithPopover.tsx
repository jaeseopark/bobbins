import {
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";

import Conversions from "./Conversions";

import "./ConversionsWithPopover.scss";

const CalcIcon = () => <div className="calc-icon" />;

const WithPopover = ({ buttonSize }: { buttonSize?: string }) => (
  <Popover>
    <PopoverTrigger>
      <Button leftIcon={<CalcIcon />} size={buttonSize} colorScheme="purple">
        Convert
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <PopoverArrow />
      <PopoverHeader>Convert cm to inches</PopoverHeader>
      <PopoverBody>
        <Conversions />
      </PopoverBody>
    </PopoverContent>
  </Popover>
);

export default WithPopover;
