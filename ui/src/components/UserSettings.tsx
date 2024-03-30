import { Input, Table, Tbody, Td, Tr } from "@chakra-ui/react";
import { DESC_POINT_SYMBOL } from "../utilities/settings";

const UserSettings = () => {
  return (
    <div>
      <Table>
        <Tbody>
          <Tr>
            <Td>Description point symbol</Td>
            <Td>
              <Input
                value={DESC_POINT_SYMBOL.value}
                onChange={(event) => {
                  DESC_POINT_SYMBOL.value = event.target.value;
                }}
                placeholder="Enter a symbol here"
              />
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </div>
  );
};

export default UserSettings;
