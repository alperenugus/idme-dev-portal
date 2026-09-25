import type { ApplicationEnvironment, CreateApplicationInput } from './types';
import {
  validateDescription,
  validateName,
  validateRedirectUris,
  validateScopes,
} from './validation';

export const WIZARD_STEPS = [
  { id: 'details', label: 'Details' },
  { id: 'redirects', label: 'Redirect URIs' },
  { id: 'scopes', label: 'Scopes' },
  { id: 'review', label: 'Review' },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]['id'];

export interface WizardDraft {
  name: string;
  description: string;
  environment: ApplicationEnvironment;
  redirectUris: string[];
  scopes: string[];
}

export interface WizardState {
  stepIndex: number;
  draft: WizardDraft;
}

export type WizardAction =
  | { type: 'setName'; value: string }
  | { type: 'setDescription'; value: string }
  | { type: 'setEnvironment'; value: ApplicationEnvironment }
  | { type: 'addRedirectUri' }
  | { type: 'updateRedirectUri'; index: number; value: string }
  | { type: 'removeRedirectUri'; index: number }
  | { type: 'toggleScope'; id: string }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'goTo'; index: number }
  | { type: 'reset' };

export const initialWizardState: WizardState = {
  stepIndex: 0,
  draft: {
    name: '',
    description: '',
    environment: 'sandbox',
    redirectUris: [''],
    scopes: ['openid'],
  },
};

const LAST_INDEX = WIZARD_STEPS.length - 1;
const clamp = (i: number) => Math.max(0, Math.min(LAST_INDEX, i));

export function wizardReducer(
  state: WizardState,
  action: WizardAction,
): WizardState {
  const { draft } = state;

  switch (action.type) {
    case 'setName':
      return { ...state, draft: { ...draft, name: action.value } };
    case 'setDescription':
      return { ...state, draft: { ...draft, description: action.value } };
    case 'setEnvironment':
      return { ...state, draft: { ...draft, environment: action.value } };

    case 'addRedirectUri':
      return {
        ...state,
        draft: { ...draft, redirectUris: [...draft.redirectUris, ''] },
      };

    case 'updateRedirectUri': {
      const redirectUris = draft.redirectUris.map((uri, i) =>
        i === action.index ? action.value : uri,
      );
      return { ...state, draft: { ...draft, redirectUris } };
    }

    case 'removeRedirectUri': {
      const filtered = draft.redirectUris.filter((_, i) => i !== action.index);
      // Always keep at least one input row so the field is never empty.
      const redirectUris = filtered.length > 0 ? filtered : [''];
      return { ...state, draft: { ...draft, redirectUris } };
    }

    case 'toggleScope': {
      const has = draft.scopes.includes(action.id);
      const scopes = has
        ? draft.scopes.filter((id) => id !== action.id)
        : [...draft.scopes, action.id];
      return { ...state, draft: { ...draft, scopes } };
    }

    case 'next':
      return { ...state, stepIndex: clamp(state.stepIndex + 1) };
    case 'back':
      return { ...state, stepIndex: clamp(state.stepIndex - 1) };
    case 'goTo':
      return { ...state, stepIndex: clamp(action.index) };
    case 'reset':
      return initialWizardState;

    default:
      return state;
  }
}

/** Validation error for a given step, or null when the step is valid. */
export function validateStep(
  draft: WizardDraft,
  stepIndex: number,
): string | null {
  switch (WIZARD_STEPS[stepIndex]?.id) {
    case 'details':
      return validateName(draft.name) ?? validateDescription(draft.description);
    case 'redirects':
      return validateRedirectUris(draft.redirectUris);
    case 'scopes':
      return validateScopes(draft.scopes);
    default:
      return null;
  }
}

/** Normalizes the draft into the API payload (trimmed, empty URIs dropped). */
export function toCreateInput(draft: WizardDraft): CreateApplicationInput {
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    environment: draft.environment,
    redirectUris: draft.redirectUris
      .map((uri) => uri.trim())
      .filter((uri) => uri.length > 0),
    scopes: draft.scopes,
  };
}
