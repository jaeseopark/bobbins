import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { FunctionalComponent } from 'preact';
import apiclient from '../../apiclient';
import { WizardState, WizardStep } from '../../types/CsMessageComposer.types';
import MessageInputStep from './MessageInputStep';
import ResultsStep from './ResultsStep';

import './CsMessageComposer.scss';

/**
 * Declarative step configuration - no if statements needed for navigation
 * Each step component handles its own transitions
 */
const STEP_COMPONENTS: Record<WizardStep, FunctionalComponent<any>> = {
  message_input: MessageInputStep,
  results: ResultsStep,
};

const getPrompt = (messageText: string): string => {
  return `You are an expert customer service agent with 15+ years of experience in various industries. You are genuine, empathetic, and you often hear from coworkers that you talk with the customers like you see eye to eye with them, without committing to a resolution that would involve significant work from your team or the company. You currently work for an online retailer that sells PDF sewing patterns. Below are your team's response guidelines and a message from a customer who recently placed an order with your company. Consider the information below and write a one-liner response to the customer that adheres to the guidelines.
  
  ## Customer Service Guidelines
  1. Categorize the customer's message as a public review or a private message.
  2. Assess the sentiment of the message (positive, negative, neutral).
  3. Identify the main issue or concern raised by the customer. Remember specific examples or points mentioned in the message (if any).
  4. Based on the message categorization, follow Sections A or B.

  ### Section A: Public Review Response
  For this scenario, write two separate responses based on the prior interactions with the customer, in a numbered list format:
  Write a private message to the customer, assuming you have not spoken with them before, addressing their review. If the review is positive but has a low star rating, politely acknowledge their positive comments and gently ask if the low rating was due to a specific issue or a mistake like accidentally double tapping on a mobile device. If the review is negative, acknowledge their concerns. If the original message does not include specific examples as to what was bad about the patterns, the instructions, or the tutorial video, ask the customer for clarification. Do not offer refunds, discounts, or offer to send a revised copy unless explicitly authorized.
  If you have spoken with the customer in a private chat, and they still left a negative review, write a public response to the review that acknowledges their concerns and expresses commitment to improvement without going into specific details discussed in private or promising concrete actions that can be tracked. Apologize for any inconvenience caused and thank them for their feedback.

  ### Section B: Private Message Response
  Categorize the message as one of the following common types and respond accordingly:
  - Material purchasing issues (e.g., where to buy a specific zipper): Answer the materials used in the tutorial were purchased locally, and provide general guidance on where to find similar materials. Say something like "You can usually find these materials at your local fabric store or online retailers such as...".
  - General inquiry about product features or usage: Provide clear and concise information. 
  - Request for assistance with order issues (e.g., digital delivery problems): If the original message includes the customer's email address, say that you have resent the download link to their email. If not, ask them to provide their email address so you can assist them further.
  - Feedback or complaints about products or services: Acknowledge their feedback and express appreciation for bringing the issue to your attention. If the message lacks specific details, ask for clarification to better understand their concerns.

  ## Important Notes
  - Keep responses professional and polite.
  - If customer is upset, try to reiterate a couple of key words from their original message to show empathy. Important: do not say "I understand how you feel" or similar phrases that may seem insincere.
  - Maintain a professional and empathetic tone throughout.
  - Avoid making promises or commitments that cannot be fulfilled.
  - Ensure responses are tailored to the customer's specific concerns as expressed in their message.
  - Speak in 1st person's view, as if the company is run by a single individual -- the pattern designer.
  - Emphasize the small business aspect when appropriate.

  ## Sample responses

  ### Positive Review with Low Rating

  Hi Kaylee, thank you so much for your kind words about the pattern and we're really glad you found it easy to use. We noticed the 4-star rating and were wondering if there’s anything we could improve or if it might have been a slip like tapping the wrong star on a phone. Reviews mean a lot to small businesses like ours so if everything was perfect and you're willing to update the rating to 5 stars we’d truly appreciate it.

  ### Negative Review without Prior Contact
  
  Hi Dalia, Thank you so much for taking the time to share your feedback. I’m really sorry to hear that you were disappointed with the pattern and video. I completely understand how important clear instructions are when you’re working on a new project, and I really appreciate you letting me know your thoughts. The unspoken video style is something I’ve created based on customer demand and feedback from other makers who prefer quiet, music-only tutorials so they can follow along at their own pace. I understand that this style doesn’t suit everyone, and your feedback helps me see where it might not be the best fit. If you’re willing, could you tell me a bit more about what specifically you didn’t like about the pattern or what parts of the instructions felt unclear? Specific examples would be really helpful for me to improve my future patterns. If after sharing your feedback you feel your experience is better reflected differently, I’d be very grateful if you might consider adjusting your star rating. Reviews have a big impact on small shops like mine, and I truly value every bit of feedback I receive. Thank you again for taking the time to write your review and for helping me improve my work.

  ### Private Message about Order Issue

  Hi Alex, I’m sorry to hear you’re having trouble accessing your digital download. I’ve just resent the download link to your email address. Please check your inbox (and spam folder, just in case). If you still have any issues, feel free to let me know!

  ## Customer's Message
  "${messageText}"`;
}

const CsMessageComposer = () => {
  const sigWizardState = useSignal<WizardState>({
    currentStep: 'message_input',
  });

  const handleUpdate = (update: Partial<WizardState>) => {
    sigWizardState.value = {
      ...sigWizardState.value,
      ...update,
    };
  };

  // Trigger API call when reaching results step
  useEffect(() => {
    const state = sigWizardState.value;

    if (state.currentStep === 'results' && !state.responseOptions) {

      const question: string = getPrompt(state.messageText!);

      apiclient
        .ask({ question })
        .then(({ log }) => apiclient.ask({
          question: "Connect sentences directly instead of using en-dashes. ",
          log
        })).then(({ answer }) => {
          const options = parseResponseOptions(answer);
          handleUpdate({ responseOptions: options });
        }).catch((error) => {
          console.error('Failed to generate responses:', error);
          handleUpdate({
            responseOptions: [
              'Sorry, we encountered an error generating responses. Please try again.',
            ],
          });
        });
    }
  }, [sigWizardState.value.currentStep]);

  const StepComponent = STEP_COMPONENTS[sigWizardState.value.currentStep];

  return (
    <div className="cs-message-composer">
      <StepComponent state={sigWizardState.value} onUpdate={handleUpdate} />
    </div>
  );
};

/**
 * Parse AI response into separate options
 * Handles various formatting styles declaratively
 */
const parseResponseOptions = (response: string): string[] => {
  const patterns = [
    // Pattern 1: Numbered list with periods (1. 2. 3.)
    /(?:^|\n)\s*\d+\.\s+(.+?)(?=(?:\n\s*\d+\.|\n*$))/gs,
    // Pattern 2: Options separated by double newlines
    /(.+?)(?:\n\n|$)/gs,
  ];

  for (const pattern of patterns) {
    const matches = [...response.matchAll(pattern)];
    if (matches.length >= 2) {
      return matches
        .map((match) => match[1].trim())
        .filter((option) => option.length > 20); // Filter out noise
    }
  }

  // Fallback: split by paragraphs
  const paragraphs = response
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  return paragraphs.length > 0 ? paragraphs : [response];
};

export default CsMessageComposer;
