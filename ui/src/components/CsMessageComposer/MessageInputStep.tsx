import { StepProps } from '../../types/CsMessageComposer.types';
import './WizardStep.scss';

const MessageInputStep = ({ state, onUpdate }: StepProps) => {
  const handleTextChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    onUpdate({ messageText: target.value });
  };

  const handleCheckboxChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    onUpdate({ replaceEndashes: target.checked });
  };

  const handleNext = () => {
    onUpdate({ currentStep: 'results' });
  };

  const isValid = state.messageText && state.messageText.trim().length > 0;

  return (
    <div className="wizard-step">
      <div className="wizard-step__header">
        <h2>Customer's Message</h2>
        <p className="wizard-step__label">Paste the customer's private message below:</p>
      </div>
      <textarea
        className="wizard-step__textarea"
        value={state.messageText || ''}
        onChange={handleTextChange}
        placeholder="Paste the customer's message here..."
        rows={10}
      />
      <div className="wizard-step__checkbox">
        <label>
          <input
            type="checkbox"
            checked={state.replaceEndashes || false}
            onChange={handleCheckboxChange}
          />
          <span>Replace endashes with commas</span>
        </label>
      </div>
      <div className="wizard-step__actions">
        <button
          className="wizard-step__button wizard-step__button--secondary"
          onClick={() => onUpdate({ currentStep: 'customer_action' })}
        >
          Back
        </button>
        <button
          className="wizard-step__button wizard-step__button--primary"
          onClick={handleNext}
          disabled={!isValid}
        >
          Generate Responses
        </button>
      </div>
    </div>
  );
};

export default MessageInputStep;
