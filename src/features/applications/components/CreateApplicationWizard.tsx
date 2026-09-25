import { useReducer, useState } from 'react';
import { Button, Card, Stepper } from '../../../design-system';
import { useCreateApplication } from '../hooks';
import type { ApplicationWithSecret } from '../types';
import {
  initialWizardState,
  toCreateInput,
  validateStep,
  wizardReducer,
  WIZARD_STEPS,
} from '../wizardState';
import { CredentialsPanel } from './CredentialsPanel';
import { DetailsStep } from './steps/DetailsStep';
import { RedirectUrisStep } from './steps/RedirectUrisStep';
import { ScopesStep } from './steps/ScopesStep';
import { ReviewStep } from './steps/ReviewStep';
import styles from './CreateApplicationWizard.module.css';

export function CreateApplicationWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);
  const [showErrors, setShowErrors] = useState(false);
  const [created, setCreated] = useState<ApplicationWithSecret | null>(null);

  const createMutation = useCreateApplication();
  const { stepIndex, draft } = state;
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;
  const stepError = validateStep(draft, stepIndex);

  const handleNext = () => {
    if (stepError) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    dispatch({ type: 'next' });
  };

  const handleBack = () => {
    setShowErrors(false);
    dispatch({ type: 'back' });
  };

  const handleSubmit = () => {
    if (stepError) {
      setShowErrors(true);
      return;
    }
    createMutation.mutate(toCreateInput(draft), {
      onSuccess: (application) => setCreated(application),
    });
  };

  const handleCreateAnother = () => {
    setCreated(null);
    setShowErrors(false);
    createMutation.reset();
    dispatch({ type: 'reset' });
  };

  if (created) {
    return (
      <Card>
        <CredentialsPanel
          application={created}
          onCreateAnother={handleCreateAnother}
        />
      </Card>
    );
  }

  const currentStepId = WIZARD_STEPS[stepIndex]?.id;

  return (
    <Card
      title="Create application"
      description="Register an OAuth 2.0 / OpenID Connect application with ID.me."
      footer={
        <div className={styles.footer}>
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={stepIndex === 0 || createMutation.isPending}
          >
            Back
          </Button>
          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              loading={createMutation.isPending}
            >
              Create application
            </Button>
          ) : (
            <Button onClick={handleNext}>Continue</Button>
          )}
        </div>
      }
    >
      <div className={styles.body}>
        <Stepper
          steps={WIZARD_STEPS.map((s) => ({ id: s.id, label: s.label }))}
          activeIndex={stepIndex}
          className={styles.stepper}
        />

        <div className={styles.stepContent}>
          {currentStepId === 'details' && (
            <DetailsStep draft={draft} dispatch={dispatch} showErrors={showErrors} />
          )}
          {currentStepId === 'redirects' && (
            <RedirectUrisStep
              draft={draft}
              dispatch={dispatch}
              showErrors={showErrors}
            />
          )}
          {currentStepId === 'scopes' && (
            <ScopesStep draft={draft} dispatch={dispatch} showErrors={showErrors} />
          )}
          {currentStepId === 'review' && <ReviewStep draft={draft} />}
        </div>
      </div>
    </Card>
  );
}
