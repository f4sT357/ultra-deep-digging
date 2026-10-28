import assert from 'node:assert';
import { describe, it } from 'node:test';

import { formatIntentHandoff } from './intent';
import {
  addEvidence,
  confirmIntent,
  createInitialState,
  updateModel,
} from './state';

function sample() {
  return updateModel(createInitialState('I want a road bike'), {
    objective: 'Ride comfortably over long distances',
    requirements: ['Low maintenance'],
    constraints: ['Budget under 100,000 yen'],
    preferences: ['Red frame'],
    unknowns: ['research: tire compatibility'],
    confidence: 0.99,
  });
}

describe('intent handoff', () => {
  it('never treats high model confidence as user confirmation', () => {
    const handoff = formatIntentHandoff(sample());
    assert.match(handoff, /目的（ローカルLLMの仮説・未確認）/);
    assert.match(handoff, /要件（ローカルLLMの整理・未確認）/);
    assert.match(handoff, /制約（未確認・推測を含む可能性）/);
    assert.match(handoff, /Red frame/);
  });

  it('only confirms objective and requirements via explicit user action', () => {
    const confirmed = confirmIntent(sample(), 'Enjoy cycling', ['Keep costs low', 'Easy repair']);
    assert.deepStrictEqual(confirmed.confirmation, {
      objective: 'Enjoy cycling',
      requirements: ['Keep costs low', 'Easy repair'],
    });
    const handoff = formatIntentHandoff(confirmed);
    assert.match(handoff, /目的（ユーザー確認済み）/);
    assert.match(handoff, /要件（ユーザー確認済み）/);
    assert.match(handoff, /Enjoy cycling/);
    assert.doesNotMatch(handoff, /目的（ローカルLLMの仮説・未確認）/);
    // Constraints/preferences were not reviewed and must stay unconfirmed.
    assert.match(handoff, /制約（未確認・推測を含む可能性）/);
  });

  it('invalidates prior confirmation whenever new evidence or a new model arrives', () => {
    const confirmed = confirmIntent(sample(), 'Enjoy cycling', ['Easy repair']);
    const withEvidence = addEvidence(confirmed, {
      kind: 'user',
      content: 'Actually I want to commute',
    });
    assert.strictEqual(withEvidence.confirmation, undefined);
    assert.match(formatIntentHandoff(withEvidence), /目的（ローカルLLMの仮説・未確認）/);

    const revised = updateModel(confirmed, { ...confirmed.model, objective: 'Commute' });
    assert.strictEqual(revised.confirmation, undefined);
  });

  it('keeps user statements as original evidence and unknowns explicit', () => {
    const state = addEvidence(sample(), {
      kind: 'user',
      content: 'Question: Is speed important?\nAnswer: Not especially',
    });
    const handoff = formatIntentHandoff(state);
    assert.match(handoff, /元の依頼（ユーザー原文）/);
    assert.match(handoff, /Question: Is speed important\?/);
    assert.match(handoff, /research: tire compatibility/);
  });

  it('does not accept empty confirmation', () => {
    assert.throws(() => confirmIntent(sample(), '  ', []), /Objective cannot be empty/);
  });
});
