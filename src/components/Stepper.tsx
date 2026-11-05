import React, { useState, Children, useImperativeHandle, forwardRef, ReactNode } from 'react'
import { Check } from 'lucide-react'

export interface StepperProps {
  children: ReactNode
  initialStep?: number
  onStepChange?: (step: number) => void
  onFinalStepCompleted?: () => void
  beforeStepChange?: (currentStep: number, nextStep: number) => boolean | Promise<boolean>
  stepCircleContainerClassName?: string
  stepContainerClassName?: string
  contentClassName?: string
  footerClassName?: string
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
  backButtonText?: string
  nextButtonText?: string
  disableStepIndicators?: boolean
}

export interface StepperRef {
  next: () => void
  back: () => void
}

export const Step: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`w-full ${className}`}>{children}</div>
}

export const Stepper = forwardRef<StepperRef, StepperProps>(({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  beforeStepChange,
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = true,
}, ref) => {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const stepsArray = Children.toArray(children)
  const totalSteps = stepsArray.length
  const isCompleted = currentStep > totalSteps
  const isLastStep = currentStep === totalSteps

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep)
    if (newStep > totalSteps) {
      onFinalStepCompleted()
    } else {
      onStepChange(newStep)
    }
  }

  useImperativeHandle(ref, () => ({
    next: () => {
      if (!isLastStep) updateStep(currentStep + 1)
    },
    back: () => {
      if (currentStep > 1) updateStep(currentStep - 1)
    }
  }))

  const handleBack = () => {
    if (currentStep > 1) updateStep(currentStep - 1)
  }

  const handleNext = async () => {
    if (!isLastStep) {
      if (beforeStepChange) {
        const canProceed = await beforeStepChange(currentStep, currentStep + 1)
        if (!canProceed) return
      }
      updateStep(currentStep + 1)
    }
  }

  const handleComplete = async () => {
    if (beforeStepChange) {
      const canProceed = await beforeStepChange(currentStep, totalSteps + 1)
      if (!canProceed) return
    }
    updateStep(totalSteps + 1)
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto px-4">
        {stepsArray.map((_, index) => {
          const stepNumber = index + 1
          const isDone = currentStep > stepNumber
          const isCurrent = currentStep === stepNumber
          const isNotLast = index < totalSteps - 1

          return (
            <React.Fragment key={stepNumber}>
              <button
                type="button"
                disabled={disableStepIndicators}
                onClick={() => !disableStepIndicators && updateStep(stepNumber)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-[#8B4513] text-[#FFFBEB] border-2 border-[#8B4513]'
                    : isCurrent
                    ? 'bg-[#FFDE59] text-[#4A3F00] border-2 border-[#8B4513] shadow-xs'
                    : 'bg-[#FFFBEB] text-[#8C7B00] border-2 border-[#E6C747]'
                } ${disableStepIndicators ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : stepNumber}
              </button>

              {isNotLast && (
                <div className="flex-1 h-0.5 mx-2 bg-[#FFF5CC] overflow-hidden">
                  <div
                    className={`h-full bg-[#8B4513] transition-all duration-300 ${
                      isDone ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Active Step Content */}
      <div className={`w-full ${contentClassName}`}>
        {!isCompleted && stepsArray[currentStep - 1]}
      </div>

      {/* Footer Navigation */}
      {!isCompleted && (
        <div className={`flex items-center justify-between pt-4 border-t border-[#FFF5CC] ${footerClassName}`}>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2 rounded-full border border-[#E6C747] bg-[#FFFBEB] text-xs font-bold text-[#4A3F00] hover:bg-[#FFF5CC] transition-colors"
              {...backButtonProps}
            >
              {backButtonText}
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={isLastStep ? handleComplete : handleNext}
            className="px-6 py-2 rounded-full bg-[#FFDE59] text-xs font-bold text-[#4A3F00] hover:bg-[#e6c747] shadow-xs transition-colors"
            {...nextButtonProps}
          >
            {isLastStep ? 'Complete' : nextButtonText}
          </button>
        </div>
      )}
    </div>
  )
})

export default Stepper
