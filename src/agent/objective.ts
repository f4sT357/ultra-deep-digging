import { generateObject } from 'ai';
import { z } from 'zod';
import { getModel, trimPrompt } from '../ai/providers';
import { systemPrompt } from '../prompt';
import type { AgentState, ObjectiveModel } from './state';
import { addEvidence, createInitialState, updateModel } from './state';

const objectiveSchema = z.object({
  objective: z.string(),
  requirements: z.array(z.string()),
  constraints: z.array(z.string()),
  preferences: z.array(z.string()),
  unknowns: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

async function inferModel(surfaceRequest: string, evidence: AgentState['evidence'], previous?: ObjectiveModel): Promise<ObjectiveModel> {
  const evidenceText = evidence.length ? evidence.map(item => `[${item.kind}] ${item.content}`).join('\n') : 'none';
  const previousText = previous ? `\nPrevious model:\n${JSON.stringify(previous)}` : '';
  const result = await generateObject({
    model: getModel(),
    system: systemPrompt(),
    prompt: trimPrompt(`Treat the initial request as a hypothesis, not a complete specification. Infer the current best outcome without inventing facts. Separate objective, requirements, constraints, preferences, and unknowns. Unknowns requiring the user must start with "user:"; unknowns resolvable by research must start with "research:". Keep the objective stable unless evidence supports changing the problem framing.\n\nSurface request:\n${surfaceRequest}\n\nEvidence:\n${evidenceText}${previousText}`),
    schema: objectiveSchema,
  });
  return result.object;
}

export async function discoverObjective(surfaceRequest: string): Promise<AgentState> {
  const state = createInitialState(surfaceRequest);
  return updateModel(state, await inferModel(surfaceRequest, []));
}

export async function reviseObjective(state: AgentState, evidence: AgentState['evidence'][number]): Promise<AgentState> {
  const next = addEvidence(state, evidence);
  return updateModel(next, await inferModel(state.surfaceRequest, next.evidence, state.model));
}
