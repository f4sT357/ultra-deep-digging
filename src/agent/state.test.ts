import { describe, expect, it } from 'node:test';
import { addEvidence, chooseNextAction, createInitialState, formatInvestigationContext, updateModel } from './state';

describe('agent state', () => {
  it('starts from the surface request without inventing requirements', () => {
    const state = createInitialState('find a good cafe');
    expect(state.model.objective).toBe('find a good cafe');
    expect(state.model.requirements).toEqual([]);
    expect(state.evidence).toEqual([]);
  });

  it('keeps evidence separate from the current model', () => {
    const state = createInitialState('find a good cafe');
    const next = addEvidence(state, { kind: 'user', content: 'quiet seating matters' });
    expect(next.evidence).toHaveLength(1);
    expect(next.model.preferences).toEqual([]);
  });

  it('routes unresolved user unknowns to grilling', () => {
    const state = updateModel(createInitialState('trip'), {
      objective: 'have a useful trip',
      requirements: [],
      constraints: [],
      preferences: [],
      unknowns: ['user: destination date'],
      confidence: 0.5,
    });
    expect(chooseNextAction(state)).toBe('grill');
  });

  it('routes research unknowns to research and complete models to proceed', () => {
    const base = createInitialState('trip');
    const researchState = updateModel(base, {
      objective: 'reach destination',
      requirements: [],
      constraints: [],
      preferences: [],
      unknowns: ['research: bus timetable'],
      confidence: 0.7,
    });
    expect(chooseNextAction(researchState)).toBe('research');

    const completeState = updateModel(base, {
      objective: 'reach destination',
      requirements: ['arrival'],
      constraints: [],
      preferences: [],
      unknowns: [],
      confidence: 0.9,
    });
    expect(chooseNextAction(completeState)).toBe('proceed');
  });

  it('formats the model as explicit investigation context', () => {
    const state = updateModel(createInitialState('trip'), {
      objective: 'reach destination',
      requirements: ['arrival time'],
      constraints: ['budget'],
      preferences: ['coffee afterwards'],
      unknowns: ['research: timetable'],
      confidence: 0.5,
    });
    expect(formatInvestigationContext(state)).toContain('Objective: reach destination');
    expect(formatInvestigationContext(state)).toContain('Unknowns: research: timetable');
  });
});
