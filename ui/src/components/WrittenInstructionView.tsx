import { Button, Table, Tbody, Td, Tr, useToast } from "@chakra-ui/react";
import { Product, ProductLocalFileStat, WebsocketListener } from "../types";
import apiclient from "../apiclient";
import { useEffect, useState } from "preact/hooks";

type WrittenInstructionViewProps = {
    product: Product,
    onClose: () => void
}

const WrittenInstructionView = ({product}: WrittenInstructionViewProps) => {
  const toast = useToast();
  const [record, setRecord] = useState<ProductLocalFileStat>();

  useEffect(() => {
    apiclient.getLocalFileStats(product.id).then(({stats}) => {
        stats
    })

    const listener:WebsocketListener = ({topic, payload}) => {
        // const {id: productId} = payload as ProgressRecord;
        // if (topic === "transcript" && productId === product.id) {
        //     setRecord(payload as ProgressRecord);
        // }
    };

    apiclient.addWsListener(listener);

    return () => apiclient.removeWsListener(listener);
  }, []);
  
  const generateWrittenInstructions = () => {
        apiclient.generateWrittenInstructions(product.id).then(() => {
            toast({
                description: "Processing...",
                duration: 2500
            })
        })
    };

    const shouldRenderProgress = record && record.progress > 0 && record.progress < 1;

    return <div>
        <Button onClick={generateWrittenInstructions}>Generate</Button>
        {shouldRenderProgress &&
        <Table>
            <Tbody>
                <Tr>
                    <Td>{record.progress}</Td>
                </Tr>
            </Tbody>
        </Table>
        }
    </div>
};

export default WrittenInstructionView;
