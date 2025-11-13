import { StepProps, CustomerAction } from '../../types/CsMessageComposer.types';
import './WizardStep.scss';

const CustomerActionStep = ({ onUpdate }: StepProps) => {
  const handleSelection = (action: CustomerAction) => {
    const nextStep = action === 'private_message' ? 'message_input' : 'review_type';
    onUpdate({ 
      customerAction: action,
      currentStep: nextStep
    });
  };

  return (
    <div className="wizard-step">
      <div className="wizard-step__header">
        <h2>Customer Response Builder</h2>
        <p className="wizard-step__label">The Customer ...</p>
      </div>
      <div className="wizard-step__buttons">
        <button
          className="wizard-step__button"
          onClick={() => handleSelection('public_review')}
        >
          Left a public review
        </button>
        <button
          className="wizard-step__button"
          onClick={() => handleSelection('private_message')}
        >
          Sent me a private message
        </button>
      </div>
    </div>
  );
};

export default CustomerActionStep;
