import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  addEvidence,
  chooseNextAction,
  createInitialState,
  formatInvestigationContext,
  updateModel,
} from './state';

describe('agent state', () => {
  it('starts from the surface request without inventing requirements', () => {
    const state = createInitialState('find a good cafe');
    assert.strictEqual(state.model.objective, 'find a good cafe');
    assert.deepStrictEqual(state.model.requirements, []);
    assert.deepStrictEqual(state.evidence, []);
  });

  it('keeps evidence separate from the current model', () => {
    const state = createInitialState('find a good cafe');
    const next = addEvidence(state, { kind: 'user', content: 'quiet seating matters' });
    assert.strictEqual(next.evidence.length, 1);
    assert.deepStrictEqual(next.model.preferences, []);
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
    assert.strictEqual(chooseNextAction(state), 'grill');
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
    assert.strictEqual(chooseNextAction(researchState), 'research');

    const completeState = updateModel(base, {
      objective: 'reach destination',
      requirements: ['arrival'],
      constraints: [],
      preferences: [],
      unknowns: [],
      confidence: 0.9,
    });
    assert.strictEqual(chooseNextAction(completeState), 'proceed');
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
    assert.match(formatInvestigationContext(state), /Objective: reach destination/);
    assert.match(formatInvestigationContext(state), /Unknowns: research: timetable/);
  });
});
