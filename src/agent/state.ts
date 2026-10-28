export type EvidenceKind = 'user' | 'research';

export type Evidence = {
  kind: EvidenceKind;
  content: string;
};

export type ObjectiveModel = {
  objective: string;
  requirements: string[];
  constraints: string[];
  preferences: string[];
  unknowns: string[];
  confidence: number;
};

export type AgentState = {
  surfaceRequest: string;
  model: ObjectiveModel;
  evidence: Evidence[];
  // Only an explicit user action can set this; model confidence is not confirmation.
  confirmation?: { objective: string; requirements: string[] };
};

export type NextAction = 'grill' | 'research' | 'proceed';

export function createInitialState(surfaceRequest: string): AgentState {
  return {
    surfaceRequest,
    model: {
      objective: surfaceRequest,
      requirements: [],
      constraints: [],
      preferences: [],
      unknowns: [],
      confidence: 0,
    },
    evidence: [],
  };
}

export function addEvidence(state: AgentState, evidence: Evidence): AgentState {
  return {
    ...state,
    evidence: [...state.evidence, evidence],
    confirmation: undefined,
  };
}

export function updateModel(
  state: AgentState,
  model: ObjectiveModel,
): AgentState {
  return {
    ...state,
    model: {
      ...model,
      confidence: Math.max(0, Math.min(1, model.confidence)),
    },
    confirmation: undefined,
  };
}

export function chooseNextAction(state: AgentState): NextAction {
  if (state.model.confidence >= 0.85 && state.model.unknowns.length === 0) {
    return 'proceed';
  }

  if (state.model.unknowns.some(unknown => unknown.startsWith('user:'))) {
    return 'grill';
  }

  return 'research';
}

export function formatInvestigationContext(state: AgentState): string {
  const { model } = state;
  return [
    `Objective: ${model.objective}`,
    `Requirements: ${model.requirements.join('; ') || 'none identified'}`,
    `Constraints: ${model.constraints.join('; ') || 'none identified'}`,
    `Preferences: ${model.preferences.join('; ') || 'none identified'}`,
    `Unknowns: ${model.unknowns.join('; ') || 'none identified'}`,
  ].join('\n');
}

/**
 * Store only what the user explicitly reviewed and accepted.
 * This is not inferred from the model's self-reported confidence.
 */
export function confirmIntent(
  state: AgentState,
  objective: string,
  requirements: string[],
): AgentState {
  const reviewedObjective = objective.trim();
  if (!reviewedObjective) throw new Error('Objective cannot be empty');
  const reviewedRequirements = requirements.map(value => value.trim()).filter(Boolean);
  return {
    ...state,
    model: {
      ...state.model,
      objective: reviewedObjective,
      requirements: reviewedRequirements,
    },
    confirmation: {
      objective: reviewedObjective,
      requirements: [...reviewedRequirements],
    },
  };
}
