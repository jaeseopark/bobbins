/**
 * Type definitions for the Customer Response Wizard
 * Using discriminated unions for type-safe, declarative flow control
 */

import { FunctionalComponent } from 'preact';

export type CustomerAction = 'public_review' | 'private_message';

export type ReviewType = 'good_review_low_rating' | 'intentional_low_rating';

export type WizardStep = 
  | 'customer_action'
  | 'message_input'
  | 'review_type'
  | 'review_input'
  | 'results';

export interface WizardState {
  currentStep: WizardStep;
  customerAction?: CustomerAction;
  reviewType?: ReviewType;
  messageText?: string;
  reviewText?: string;
  replaceEndashes?: boolean;
  responseOptions?: string[];
}

export interface StepProps {
  state: WizardState;
  onUpdate: (update: Partial<WizardState>) => void;
}

export interface StepConfig {
  component: FunctionalComponent<StepProps>;
  getNextStep: (state: WizardState) => WizardStep | null;
}
