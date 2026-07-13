"use client";

import { Check } from 'lucide-react';

interface StepperStep {
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  const currentLabel = steps[currentStep - 1]?.label ?? '';
  const progress = steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 100;

  return (
    <div className="mb-5">
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-foreground">{currentLabel}</span>
          <span className="text-xs text-muted-foreground">{currentStep} / {steps.length}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="hidden sm:flex items-center justify-center gap-1 flex-wrap">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div key={step.label} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <span
                  className={`text-[10px] font-medium max-w-[4.5rem] text-center leading-tight ${
                    isCurrent ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mb-5 transition-colors ${
                    currentStep > stepNumber ? 'bg-accent' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
