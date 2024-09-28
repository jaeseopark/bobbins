import { Flex, Input } from "@chakra-ui/react";
import { useState } from "preact/hooks";

import { cmToInchString } from "../utilities/numbers";

import "./Conversions.scss";

// TODO replace anything non-numeric (and a dot)
const getCm = (input: string): number => parseFloat(input.trim());

const Conversions = () => {
  const [cm, setCm] = useState(0);
  return (
    <div className="conversions">
      <Flex direction="row">
        <Input type="text" onChange={({ target: { value } }) => setCm(getCm(value))} placeholder="cm" />
        <label>...</label>
        <Input type="text" value={cm ? `${cmToInchString(cm)}"` : ""} isReadOnly placeholder={`"`} />
      </Flex>
    </div>
  );
};

export default Conversions;
