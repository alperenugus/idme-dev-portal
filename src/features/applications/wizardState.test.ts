import { describe, expect, it } from 'vitest';
import {
  initialWizardState,
  toCreateInput,
  validateStep,
  wizardReducer,
  WIZARD_STEPS,
  type WizardState,
} from './wizardState';

const at = (index: number): WizardState => ({ ...initialWizardState, stepIndex: index });

describe('wizardReducer field updates', () => {
  it('sets name, description, environment', () => {
    let state = wizardReducer(initialWizardState, { type: 'setName', value: 'A' });
    state = wizardReducer(state, { type: 'setDescription', value: 'desc' });
    state = wizardReducer(state, { type: 'setEnvironment', value: 'production' });
    expect(state.draft.name).toBe('A');
    expect(state.draft.description).toBe('desc');
    expect(state.draft.environment).toBe('production');
  });
});

describe('wizardReducer redirect URIs', () => {
  it('adds, updates, and removes rows', () => {
    let state = wizardReducer(initialWizardState, { type: 'addRedirectUri' });
    expect(state.draft.redirectUris).toHaveLength(2);
    state = wizardReducer(state, {
      type: 'updateRedirectUri',
      index: 1,
      value: 'https://x.com/cb',
    });
    expect(state.draft.redirectUris[1]).toBe('https://x.com/cb');
    state = wizardReducer(state, { type: 'removeRedirectUri', index: 0 });
    expect(state.draft.redirectUris).toEqual(['https://x.com/cb']);
  });

  it('keeps one empty row when the last is removed', () => {
    const state = wizardReducer(initialWizardState, {
      type: 'removeRedirectUri',
      index: 0,
    });
    expect(state.draft.redirectUris).toEqual(['']);
  });
});

describe('wizardReducer scopes', () => {
  it('toggles scopes on and off', () => {
    let state = wizardReducer(initialWizardState, {
      type: 'toggleScope',
      id: 'email',
    });
    expect(state.draft.scopes).toContain('email');
    state = wizardReducer(state, { type: 'toggleScope', id: 'email' });
    expect(state.draft.scopes).not.toContain('email');
  });
});

describe('wizardReducer navigation', () => {
  it('advances and retreats, clamped to bounds', () => {
    let state = wizardReducer(initialWizardState, { type: 'next' });
    expect(state.stepIndex).toBe(1);
    state = wizardReducer(state, { type: 'back' });
    expect(state.stepIndex).toBe(0);
    // clamp lower
    state = wizardReducer(state, { type: 'back' });
    expect(state.stepIndex).toBe(0);
    // goTo clamps upper
    state = wizardReducer(state, { type: 'goTo', index: 99 });
    expect(state.stepIndex).toBe(WIZARD_STEPS.length - 1);
  });

  it('resets to the initial state', () => {
    const dirty = wizardReducer(at(3), { type: 'setName', value: 'z' });
    expect(wizardReducer(dirty, { type: 'reset' })).toEqual(initialWizardState);
  });

  it('ignores unknown actions', () => {
    // @ts-expect-error — exercising the default branch
    expect(wizardReducer(initialWizardState, { type: 'nope' })).toBe(
      initialWizardState,
    );
  });
});

describe('validateStep', () => {
  it('validates the details step', () => {
    expect(validateStep({ ...initialWizardState.draft, name: '' }, 0)).toMatch(
      /required/,
    );
  });
  it('validates the redirects step', () => {
    expect(
      validateStep({ ...initialWizardState.draft, redirectUris: [''] }, 1),
    ).toMatch(/at least one/);
  });
  it('validates the scopes step', () => {
    expect(
      validateStep({ ...initialWizardState.draft, scopes: [] }, 2),
    ).toMatch(/at least one/);
  });
  it('returns null for the review step', () => {
    expect(validateStep(initialWizardState.draft, 3)).toBeNull();
  });
});

describe('toCreateInput', () => {
  it('trims fields and drops empty redirect URIs', () => {
    const input = toCreateInput({
      name: '  Acme  ',
      description: '  hi  ',
      environment: 'sandbox',
      redirectUris: ['https://a.com/cb', '   ', ''],
      scopes: ['openid'],
    });
    expect(input).toEqual({
      name: 'Acme',
      description: 'hi',
      environment: 'sandbox',
      redirectUris: ['https://a.com/cb'],
      scopes: ['openid'],
    });
  });
});
