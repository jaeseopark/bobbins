import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { cmToInchString } from "../utilities/numbers";
import { signal } from "@preact/signals";

import "./Conversions.scss";
import { useState } from "preact/hooks";

const SHOULD_SHOW_TABLE = false;
const DEFAULT_START = 0;
const DEFAULT_END = 10;
const DEFAULT_STEP = 0.5;

const sigStart = signal(DEFAULT_START);
const sigEnd = signal(DEFAULT_END);
const sigStep = signal(DEFAULT_STEP);

const arrayRange = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);

// TODO replace anything non-numeric (and a dot)
const getCm = (input: string): number => parseFloat(input.trim());

const Slider = () => (
  <FormControl>
    <Flex direction="row">
      <label className="spacious">0 cm</label>
      <RangeSlider
        aria-label={["min", "max"]}
        defaultValue={[DEFAULT_START, DEFAULT_END]}
        onChange={(values) => {
          sigStart.value = values[0];
          sigEnd.value = values[1];
        }}
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumb index={0} />
        <RangeSliderThumb index={1} />
      </RangeSlider>
      <label className="spacious">100 cm</label>
    </Flex>

    <FormLabel>Step</FormLabel>
    <NumberInput
      size="sm"
      min={0.1}
      max={10}
      step={0.1}
      maxW={24}
      value={sigStep.value}
      onChange={(_, value) => (sigStep.value = value)}
      allowMouseWheel
    >
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  </FormControl>
);

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
      {SHOULD_SHOW_TABLE && (
        <>
          <Slider />
          <Table>
            <Thead>
              <Th>cm</Th>
              <Th>Decimal inch</Th>
              <Th>Fractional inch</Th>
            </Thead>
            <Tbody>
              {arrayRange(sigStart.value, sigEnd.value, sigStep.value).map((cm) => {
                return (
                  <Tr>
                    <Td>{cm.toFixed(1)}</Td>
                    <Td>{(cm / 2.54).toFixed(1)}"</Td>
                    <Td>{cmToInchString(cm)}"</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default Conversions;
