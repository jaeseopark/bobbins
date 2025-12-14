import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { FunctionalComponent } from 'preact';
import apiclient from '../../apiclient';
import { WizardState, WizardStep } from './types';
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

    if (state.currentStep === 'results' && !state.responseOptions && !state.error) {
      apiclient
        .generateCsMessageResponses(state.messageText!)
        .then(({ responseOptions }) => {
          handleUpdate({ responseOptions, error: undefined });
        })
        .catch((error) => {
          console.error('Failed to generate responses:', error);
          
          // Extract error details
          let errorMessage = 'Failed to generate responses. Please try again.';
          let statusCode: number | undefined;

          if (error instanceof Response) {
            statusCode = error.status;
            errorMessage = `HTTP ${error.status}: ${error.statusText}`;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }

          handleUpdate({
            error: {
              message: errorMessage,
              statusCode,
            },
          });
        });
    }
  }, [sigWizardState.value.currentStep]);

  const StepComponent = STEP_COMPONENTS[sigWizardState.value.currentStep];

  // note: 20 px padding all around and the nav bar is 60 px tall.
  const height = "calc(100vh - 100px)";

  return (
    <div className="cs-message-composer" style={{ height }}>
      <StepComponent state={sigWizardState.value} onUpdate={handleUpdate} />
    </div>
  );
};

export default CsMessageComposer;
