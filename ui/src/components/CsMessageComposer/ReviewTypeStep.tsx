import { StepProps, ReviewType } from '../../types/CsMessageComposer.types';
import './WizardStep.scss';

const ReviewTypeStep = ({ onUpdate }: StepProps) => {
  const handleSelection = (type: ReviewType) => {
    onUpdate({ 
      reviewType: type,
      currentStep: 'review_input'
    });
  };

  return (
    <div className="wizard-step">
      <div className="wizard-step__header">
        <h2>Review Type</h2>
        <p className="wizard-step__label">What kind of review did the customer leave?</p>
      </div>
      <div className="wizard-step__buttons wizard-step__buttons--vertical">
        <button
          className="wizard-step__button wizard-step__button--large"
          onClick={() => handleSelection('good_review_low_rating')}
        >
          Good review message, but low star rating (potentially accidental)
        </button>
        <button
          className="wizard-step__button wizard-step__button--large"
          onClick={() => handleSelection('intentional_low_rating')}
        >
          Intentional low star rating
        </button>
      </div>
      <div className="wizard-step__actions">
        <button
          className="wizard-step__button wizard-step__button--secondary"
          onClick={() => onUpdate({ currentStep: 'customer_action' })}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ReviewTypeStep;
