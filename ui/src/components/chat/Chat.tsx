import {
  MinChatUiProvider,
  MainContainer,
  MessageInput,
  MessageContainer,
  MessageList,
  MessageHeader,
} from "@minchat/react-chat-ui";
import apiclient from "../../apiclient";
import { signal } from "@preact/signals";
import MessageType from "@minchat/react-chat-ui/dist/types/MessageType";
import { useState } from "preact/hooks";

const sigMessages = signal<MessageType[]>([]);

const getUpdatedMessageArray = (messages: MessageType[], user: string, message: string): MessageType[] => {
  return [
    ...messages,
    {
      text: message,
      user: {
        id: user,
        name: user,
      },
    },
  ];
};

function App() {
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);

  const handleSend = (question: string) => {
    setShowTypingIndicator(true);
    sigMessages.value = getUpdatedMessageArray(sigMessages.value, "HUMAN", question);

    apiclient.ask({ question }).then(({ answer }) => {
      sigMessages.value = getUpdatedMessageArray(sigMessages.value, "BOT", answer);
    }).finally(() => {
      setShowTypingIndicator(false);
    });
  };

  return (
    <MinChatUiProvider theme="#6ea9d7">
      <MainContainer>
        <MessageContainer>
          <MessageHeader />
          <MessageList showTypingIndicator={showTypingIndicator} currentUserId="HUMAN" messages={sigMessages.value} />
          <MessageInput onSendMessage={handleSend} showSendButton placeholder="Type message here" />
        </MessageContainer>
      </MainContainer>
    </MinChatUiProvider>
  );
}

export default App;
