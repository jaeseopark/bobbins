import { Flex, Input } from "@chakra-ui/react";
import { useState } from "preact/hooks";

import { cmToInchString } from "../utilities/numbers";

import "./Conversions.scss";

// TODO replace anything non-numeric (and a dot)
const getCm = (input: string): number => parseFloat(input.trim());

const DirectConverter = () => {
  const [cm, setCm] = useState(0);
  return (
    <Flex direction="row">
      <Input type="text" onChange={({ target: { value } }) => setCm(getCm(value))} placeholder="cm" />
      <label>...</label>
      <Input type="text" value={cm ? `${cmToInchString(cm)}"` : ""} isReadOnly placeholder={`"`} />
    </Flex>
  );
};

const Conversions = () => {
  return (
    <div className="conversions">
      <DirectConverter />
    </div>
  );
};

export default Conversions;
