import assert from 'node:assert';
import { describe, it } from 'node:test';

import { runAgent, userQuestions } from './loop';
import type { AgentState } from './state';

function modelState(
  surfaceRequest: string,
  unknowns: string[],
  confidence: number,
): AgentState {
  return {
    surfaceRequest,
    model: {
      objective: 'desired outcome',
      requirements: [],
      constraints: [],
      preferences: [],
      unknowns,
      confidence,
    },
    evidence: [],
  };
}

describe('UDD investigation loop', () => {
  it('returns user questions instead of silently treating them as research', async () => {
    const state = modelState('trip', ['user: travel date'], 0.5);
    const result = await runAgent(
      'trip',
      { breadth: 2, depth: 1 },
      {
        state,
        dependencies: {
          discover: async () => state,
          revise: async current => current,
          research: async () => ({ learnings: [], visitedUrls: [] }),
        },
      },
    );

    assert.strictEqual(result.status, 'needs_user_input');
    assert.deepStrictEqual(result.questions, ['travel date']);
  });

  it('uses user answers as evidence and continues to convergence', async () => {
    const initial = modelState('trip', ['user: travel date'], 0.5);
    const complete = modelState('trip', [], 0.9);
    const seenEvidence: string[] = [];

    const result = await runAgent(
      'trip',
      { breadth: 2, depth: 1 },
      {
        state: initial,
        answers: ['2026-10-01'],
        dependencies: {
          discover: async () => initial,
          revise: async (state, evidence) => {
            seenEvidence.push(evidence.content);
            return complete;
          },
          research: async () => ({ learnings: [], visitedUrls: [] }),
        },
      },
    );

    assert.strictEqual(result.status, 'proceed');
    assert.deepStrictEqual(seenEvidence, [
      'Question: travel date\nAnswer: 2026-10-01',
    ]);
  });

  it('researches research-unknowns and feeds the evidence back into the model', async () => {
    const initial = modelState('trip', ['research: timetable'], 0.5);
    const complete = modelState('trip', [], 0.9);
    const researchQueries: string[] = [];

    const result = await runAgent(
      'trip',
      { breadth: 2, depth: 1 },
      {
        state: initial,
        dependencies: {
          discover: async () => initial,
          research: async input => {
            researchQueries.push(input.query);
            return {
              learnings: ['train departs at 09:00'],
              visitedUrls: ['https://example.com/timetable'],
            };
          },
          revise: async (state, evidence) => {
            assert.strictEqual(evidence.kind, 'research');
            assert.strictEqual(evidence.content, 'train departs at 09:00');
            return complete;
          },
        },
      },
    );

    assert.strictEqual(result.status, 'proceed');
    assert.strictEqual(researchQueries.length, 1);
    assert.match(researchQueries[0], /Surface request: trip/);
    assert.deepStrictEqual(result.learnings, ['train departs at 09:00']);
    assert.deepStrictEqual(result.visitedUrls, ['https://example.com/timetable']);
  });

  it('limits user questions to the first three', () => {
    const state = modelState(
      'request',
      ['user: one', 'research: two', 'user: three', 'user: four', 'user: five'],
      0.5,
    );

    assert.deepStrictEqual(userQuestions(state), ['one', 'three', 'four']);
  });
});
