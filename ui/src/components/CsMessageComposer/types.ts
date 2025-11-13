/**
 * Type definitions for the Customer Response Wizard
 * Using discriminated unions for type-safe, declarative flow control
 */

import { FunctionalComponent } from 'preact';

export type WizardStep =
  | 'message_input'
  | 'results';

export interface WizardState {
  currentStep: WizardStep;
  messageText?: string;
  responseOptions?: string[];
  error?: {
    message: string;
    statusCode?: number;
  };
}

export interface StepProps {
  state: WizardState;
  onUpdate: (update: Partial<WizardState>) => void;
}

export interface StepConfig {
  component: FunctionalComponent<StepProps>;
  getNextStep: (state: WizardState) => WizardStep | null;
}
