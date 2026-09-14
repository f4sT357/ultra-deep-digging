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
