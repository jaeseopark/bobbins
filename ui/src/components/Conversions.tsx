import { Flex, Input } from "@chakra-ui/react";
import { useState } from "preact/hooks";

import { cmToInchString, inchesToCmString } from "../utilities/numbers";

import "./Conversions.scss";

// TODO replace anything non-numeric (and a dot)
const getFloat = (input: string): number => parseFloat(input.trim());

const FromCmToInches = () => {
  const [cm, setCm] = useState(0);
  return (
    <div className="conversions">
      <Flex direction="row">
        <Input type="text" onChange={({ target: { value } }) => setCm(getFloat(value))} placeholder="cm" />
        <label>...</label>
        <Input type="text" value={cm ? `${cmToInchString(cm)}"` : ""} isReadOnly placeholder={`"`} />
      </Flex>
    </div>
  );
};

const FromInchesToCm = () => {
  const [inches, setInches] = useState(0);
  return (
    <div className="conversions">
      <Flex direction="row">
        <Input type="text" onChange={({ target: { value } }) => setInches(getFloat(value))} placeholder={`"`} />
        <label>...</label>
        <Input type="text" value={inches ? `${inchesToCmString(inches)} cm` : ""} isReadOnly placeholder="cm" />
      </Flex>
    </div>
  );
};

const DualConversions = () => {
  return (
    <div>
      <FromCmToInches />
      <FromInchesToCm />
    </div>
  );
};

export default DualConversions;
