import { useState, useEffect } from 'preact/hooks';
import { StepProps } from './types';
import './WizardStep.scss';

const ResultsStep = ({ state, onUpdate }: StepProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const options = state.responseOptions || [];
  const error = state.error;

  useEffect(() => {
    if (options.length === 0 && !error) {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [options.length, error]);

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
      currentStep: 'message_input',
      messageText: undefined,
      responseOptions: undefined,
      error: undefined,
    });
  };

  const handleRetry = () => {
    onUpdate({
      responseOptions: undefined,
      error: undefined,
    });
  };

  return (
    <div className="wizard-step">
      <div className="wizard-step__header">
        <h2>Original Message</h2>
        <p>
          {state.messageText}
        </p>
      </div>

      <div className="wizard-step__header">
        <h2>Response Options</h2>
        <p className="wizard-step__label">
          Choose the response that best fits your needs:
        </p>
      </div>

      {error ? (
        <div className="wizard-step__error">
          <p className="wizard-step__error-title">Error Generating Responses</p>
          <p className="wizard-step__error-message">
            {error.statusCode && `Status Code: ${error.statusCode} - `}
            {error.message}
          </p>
          <button
            className="wizard-step__button wizard-step__button--primary"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      ) : options.length === 0 ? (
        <div className="wizard-step__loading">
          <p>Generating response options... This can take up to a minute. ({elapsedTime}s)</p>
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
