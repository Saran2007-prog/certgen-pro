import React from 'react';
import { useApp } from '../context/AppContext';
import { StepEventDetails } from '../components/wizard/StepEventDetails';
import { StepDataUpload } from '../components/wizard/StepDataUpload';
import { StepValidationPreview } from '../components/wizard/StepValidationPreview';
import { StepTemplateMapping } from '../components/wizard/StepTemplateMapping';
import { StepOutputStatus } from '../components/wizard/StepOutputStatus';
import { Check } from 'lucide-react';

export const WizardView = () => {
  const { wizardState, setStep } = useApp();
  const { step } = wizardState;

  const stepsMeta = [
    { number: 1, title: "Event Details" },
    { number: 2, title: "Upload Data" },
    { number: 3, title: "Validation Preview" },
    { number: 4, title: "Template Mapping" },
    { number: 5, title: "Generation & Output" }
  ];

  const fillPercentage = ((Math.min(step, 5) - 1) / 4) * 100;

  return (
    <div className="container-fluid px-4 py-4 max-w-6xl">
      {/* Wizard Step Progression Indicator */}
      <div className="mb-5 position-relative px-3 px-md-5">
        <div className="wizard-step-line"></div>
        <div className="wizard-step-line-fill" style={{ width: `${fillPercentage}%` }}></div>

        <div className="d-flex justify-content-between position-relative z-2">
          {stepsMeta.map((s) => {
            const isCompleted = step > s.number;
            const isActive = step === s.number;
            const isPending = step < s.number;

            return (
              <div
                key={s.number}
                className="d-flex flex-column align-items-center"
                style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                onClick={() => {
                  if (isCompleted && step !== 5) {
                    setStep(s.number);
                  }
                }}
              >
                <div
                  className={`wizard-step-node ${
                    isCompleted ? 'completed' : isActive ? 'active' : 'pending'
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : s.number}
                </div>
                <div
                  className={`mt-2 small fw-semibold text-center d-none d-md-block ${
                    isActive ? 'text-primary' : isCompleted ? 'text-dark' : 'text-muted'
                  }`}
                >
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Step View Rendering */}
      <div>
        {step === 1 && <StepEventDetails onNext={() => setStep(2)} />}
        {step === 2 && <StepDataUpload onNext={() => setStep(3)} onPrev={() => setStep(1)} />}
        {step === 3 && <StepValidationPreview onNext={() => setStep(4)} onPrev={() => setStep(2)} />}
        {step === 4 && <StepTemplateMapping onPrev={() => setStep(3)} />}
        {step === 5 && <StepOutputStatus />}
      </div>
    </div>
  );
};
