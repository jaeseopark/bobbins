/**
 * Type definitions for the Customer Response Wizard
 * Using discriminated unions for type-safe, declarative flow control
 */

import { FunctionalComponent } from 'preact';

export type ActionVisibility = 'public' | 'private';

export type WizardStep = {
  component: FunctionalComponent<StepProps>;
  getNextStep: (state: WizardState) => string;
}

export interface WizardState {
  currentStep: WizardStep;
  customerAction?: ActionVisibility;
  customerText?: string;
  responseOptions?: string[];
}

export interface StepProps {
  state: WizardState;
  onUpdate: (update: Partial<WizardState>) => void;
}

export type PromptGenerator = (customerMessage: string) => string;

export type PromptBuilder = {
  promptGenerators: PromptGenerator[];
}
