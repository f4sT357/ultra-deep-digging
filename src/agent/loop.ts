import { discoverObjective, reviseObjective } from './objective';
import type { deepResearch } from '../deep-research';
import {
  chooseNextAction,
  formatInvestigationContext,
  type AgentState,
} from './state';

export type ResearchSettings = {
  breadth: number;
  depth: number;
};

export type AgentStatus = 'proceed' | 'needs_user_input' | 'max_iterations';

export type AgentResult = {
  state: AgentState;
  learnings: string[];
  visitedUrls: string[];
  status: AgentStatus;
  questions: string[];
};

export type AgentDependencies = {
  discover: typeof discoverObjective;
  revise: typeof reviseObjective;
  research: typeof deepResearch;
};

const defaultDependencies: AgentDependencies = {
  discover: discoverObjective,
  revise: reviseObjective,
  research: async input => {
    const { deepResearch } = await import('../deep-research');
    return deepResearch(input);
  },
};

function userQuestions(state: AgentState): string[] {
  return state.model.unknowns
    .filter(unknown => unknown.startsWith('user:'))
    .map(unknown => unknown.replace(/^user:\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3);
}

export async function runAgent(
  surfaceRequest: string,
  settings: ResearchSettings,
  options: {
    state?: AgentState;
    learnings?: string[];
    visitedUrls?: string[];
    answers?: string[];
    maxIterations?: number;
    onQuestion?: (question: string) => Promise<string>;
    dependencies?: Partial<AgentDependencies>;
  } = {},
): Promise<AgentResult> {
  const deps = { ...defaultDependencies, ...options.dependencies };
  let state = options.state ?? (await deps.discover(surfaceRequest));
  let learnings = [...(options.learnings ?? [])];
  let visitedUrls = [...(options.visitedUrls ?? [])];
  let answers = [...(options.answers ?? [])];
  const maxIterations = options.maxIterations ?? 8;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const action = chooseNextAction(state);

    if (action === 'proceed') {
      return {
        state,
        learnings,
        visitedUrls,
        status: 'proceed',
        questions: [],
      };
    }

    if (action === 'grill') {
      const questions = userQuestions(state);

      if (!options.onQuestion && answers.length === 0) {
        return {
          state,
          learnings,
          visitedUrls,
          status: 'needs_user_input',
          questions,
        };
      }

      for (const question of questions) {
        const answer = options.onQuestion
          ? await options.onQuestion(question)
          : answers.shift() ?? '';
        if (!answer.trim()) continue;
        state = await deps.revise(state, {
          kind: 'user',
          content: `Question: ${question}\nAnswer: ${answer}`,
        });
      }
      continue;
    }

    const result = await deps.research({
      query: `${formatInvestigationContext(state)}\n\nSurface request: ${surfaceRequest}`,
      breadth: settings.breadth,
      depth: settings.depth,
      learnings,
      visitedUrls,
    });

    learnings = result.learnings;
    visitedUrls = result.visitedUrls;

    state = await deps.revise(state, {
      kind: 'research',
      content: learnings.slice(-20).join('\n'),
    });
  }

  const questions = userQuestions(state);
  return {
    state,
    learnings,
    visitedUrls,
    status: questions.length ? 'needs_user_input' : 'max_iterations',
    questions,
  };
}

export { userQuestions };
