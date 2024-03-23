import {
  MinChatUiProvider,
  MainContainer,
  MessageInput,
  MessageContainer,
  MessageList,
  MessageHeader,
} from "@minchat/react-chat-ui";
import apiclient from "../../apiclient";
import { signal, useSignal } from "@preact/signals";
import MessageType from "@minchat/react-chat-ui/dist/types/MessageType";

import "./Chat.scss";

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

const Chat = () => {
  const sigShowTypingIndicator = useSignal(false);

  const handleSend = (question: string) => {
    sigShowTypingIndicator.value = true;
    sigMessages.value = getUpdatedMessageArray(sigMessages.value, "HUMAN", question);

    apiclient
      .ask({ question })
      .then(({ answer }) => {
        sigMessages.value = getUpdatedMessageArray(sigMessages.value, "BOT", answer);
      })
      .finally(() => {
        sigShowTypingIndicator.value = false;
      });
  };

  return (
    <MinChatUiProvider>
      <MainContainer style={{height: "calc(100vh - 5em)"}}>
        <MessageContainer>
          <MessageHeader />
          <MessageList
            showTypingIndicator={sigShowTypingIndicator.value}
            currentUserId="HUMAN"
            messages={sigMessages.value}
          />
          <MessageInput onSendMessage={handleSend} showSendButton placeholder="Type message here" />
        </MessageContainer>
      </MainContainer>
    </MinChatUiProvider>
  );
};

export default Chat;
