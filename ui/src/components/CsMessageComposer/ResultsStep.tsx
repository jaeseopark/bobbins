import { useState } from 'preact/hooks';
import { StepProps } from '../../types/CsMessageComposer.types';
import './WizardStep.scss';

const ResultsStep = ({ state, onUpdate }: StepProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleStartOver = () => {
    onUpdate({
      currentStep: 'customer_action',
      customerAction: undefined,
      reviewType: undefined,
      messageText: undefined,
      reviewText: undefined,
      replaceEndashes: false,
      responseOptions: undefined,
    });
  };

  const options = state.responseOptions || [];

  return (
    <div className="wizard-step">
      <div className="wizard-step__header">
        <h2>Response Options</h2>
        <p className="wizard-step__label">
          Choose the response that best fits your needs:
        </p>
      </div>

      {options.length === 0 ? (
        <div className="wizard-step__loading">
          <p>Generating response options...</p>
        </div>
      ) : (
        <div className="wizard-step__results-grid">
          {options.map((option: string, index: number) => (
            <div key={index} className="wizard-step__result-card">
              <div className="wizard-step__result-text">{option}</div>
              <button
                className="wizard-step__copy-button"
                onClick={() => handleCopy(option, index)}
              >
                {copiedIndex === index ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="wizard-step__actions">
        <button
          className="wizard-step__button wizard-step__button--secondary"
          onClick={handleStartOver}
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultsStep;
