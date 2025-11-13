import CsMessageComposer from "./CsMessageComposer";

import "./Chat.scss";

/**
 * Chat component - Now implements a customer response wizard
 * instead of traditional chat interface.
 * 
 * The wizard guides customer service agents through creating
 * AI-assisted responses to customer feedback, including both
 * public reviews and private messages.
 */
const Chat = () => {
  // note: 20 px padding all around and the nav bar is 60 px tall.
  const height = "calc(100vh - 100px)";

  return (
    <div style={{ height }}>
      <CsMessageComposer />
    </div>
  );
};

export default Chat;
