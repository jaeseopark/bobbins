import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { FunctionalComponent } from 'preact';
import apiclient from '../../apiclient';
import { WizardState, WizardStep } from '../../types/CsMessageComposer.types';
import CustomerActionStep from './CustomerActionStep';
import MessageInputStep from './MessageInputStep';
import ReviewTypeStep from './ReviewTypeStep';
import ReviewInputStep from './ReviewInputStep';
import ResultsStep from './ResultsStep';

import './CustomerResponseWizard.scss';

/**
 * Declarative step configuration - no if statements needed for navigation
 * Each step component handles its own transitions
 */
const STEP_COMPONENTS: Record<WizardStep, FunctionalComponent<any>> = {
  customer_action: CustomerActionStep,
  message_input: MessageInputStep,
  review_type: ReviewTypeStep,
  review_input: ReviewInputStep,
  results: ResultsStep,
};

/**
 * Text processing utilities - pure functions
 */
const textProcessors = {
  replaceEndashes: (text: string): string => text.replace(/–/g, ','),
  identity: (text: string): string => text,
};

const processText = (text: string, shouldReplace: boolean): string => {
  const processor = shouldReplace ? textProcessors.replaceEndashes : textProcessors.identity;
  return processor(text);
};

/**
 * Prompt builders - declarative mappings for different scenarios
 */
const promptBuilders = {
  private_message: (state: WizardState): string => {
    const message = processText(state.messageText || '', state.replaceEndashes || false);
    return `A customer sent me the following private message. Please generate 3 different professional and empathetic response options that address their concerns:\n\n"${message}"`;
  },
  
  public_review_good_message_low_rating: (state: WizardState): string => {
    const review = processText(state.reviewText || '', state.replaceEndashes || false);
    return `A customer left a public review with positive feedback but a low star rating (possibly accidental). Please generate 3 different professional response options that politely acknowledge their positive comments and gently inquire about the star rating:\n\n"${review}"`;
  },
  
  public_review_intentional_low_rating: (state: WizardState): string => {
    const review = processText(state.reviewText || '', state.replaceEndashes || false);
    return `A customer left a public review with an intentionally low star rating. Please generate 3 different professional, empathetic response options that acknowledge their concerns and show commitment to improvement:\n\n"${review}"`;
  },
};

/**
 * Determine which prompt builder to use based on state - declarative selection
 */
const getPromptBuilder = (state: WizardState) => {
  const { customerAction, reviewType } = state;
  
  const promptKey = customerAction === 'private_message' 
    ? 'private_message'
    : reviewType === 'good_review_low_rating'
    ? 'public_review_good_message_low_rating'
    : 'public_review_intentional_low_rating';
    
  return promptBuilders[promptKey];
};

const CustomerResponseWizard = () => {
  const sigWizardState = useSignal<WizardState>({
    currentStep: 'customer_action',
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
      const promptBuilder = getPromptBuilder(state);
      const prompt = promptBuilder(state);

      apiclient
        .ask({ question: prompt, log: [] })
        .then(({ answer }) => {
          // Parse the response to extract the 3 options
          // Assuming the API returns numbered options (1., 2., 3.) or separated by newlines
          const options = parseResponseOptions(answer);
          handleUpdate({ responseOptions: options });
        })
        .catch((error) => {
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
    <div className="customer-response-wizard">
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

export default CustomerResponseWizard;
