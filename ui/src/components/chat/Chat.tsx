import { signal, useSignal } from "@preact/signals";
import {
  MinChatUiProvider,
  MainContainer,
  MessageInput,
  MessageContainer,
  MessageList,
  MessageHeader,
} from "@minchat/react-chat-ui";
import MessageType from "@minchat/react-chat-ui/dist/types/MessageType";
import apiclient from "../../apiclient";
import { ChatLogEntry } from "../../types";

import "./Chat.scss";

const sigMessages = signal<ChatLogEntry[]>([]);

const getUpdatedMessageArray = (messages: ChatLogEntry[], role: string, message: string): ChatLogEntry[] => {
  return [
    ...messages,
    {
      content: message,
      role
    },
  ];
};

const convert = (messages: ChatLogEntry[]): MessageType[] => messages.map(({role, content}) => ({
  text: content,
  user: {
    id: role,
    name: role
  }
}));

const Chat = () => {
  const sigShowTypingIndicator = useSignal(false);

  const handleSend = (question: string) => {
    sigShowTypingIndicator.value = true;
    const log = [...sigMessages.value];
    sigMessages.value = getUpdatedMessageArray(sigMessages.value, "user", question);

    apiclient
      .ask({ question, log })
      .then(({ answer }) => {
        sigMessages.value = getUpdatedMessageArray(sigMessages.value, "system", answer);
      })
      .finally(() => {
        sigShowTypingIndicator.value = false;
      });
  };

  return (
    <MinChatUiProvider>
      <MainContainer style={{ height: "calc(100vh - 5em)" }}>
        <MessageContainer>
          <MessageHeader />
          <MessageList
            showTypingIndicator={sigShowTypingIndicator.value}
            currentUserId="user"
            messages={convert(sigMessages.value)}
          />
          <MessageInput onSendMessage={handleSend} showSendButton placeholder="Type message here" />
        </MessageContainer>
      </MainContainer>
    </MinChatUiProvider>
  );
};

export default Chat;
