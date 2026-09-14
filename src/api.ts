import cors from 'cors';
import express, { Request, Response } from 'express';

import { writeFinalAnswer, writeFinalReport } from './deep-research';
import { runAgent } from './agent/loop';
import { formatInvestigationContext } from './agent/state';
import type { AgentState } from './agent/state';

const app = express();
const port = process.env.PORT || 3051;

app.use(cors());
app.use(express.json());

function log(...args: any[]) {
  console.log(...args);
}

type ResearchBody = {
  query?: string;
  depth?: number;
  breadth?: number;
  state?: AgentState;
  answers?: string[];
  learnings?: string[];
  visitedUrls?: string[];
};

function validateSettings(depth: number, breadth: number) {
  return (
    Number.isInteger(depth) &&
    depth > 0 &&
    Number.isInteger(breadth) &&
    breadth > 0
  );
}

async function runResearch(body: ResearchBody) {
  const depth = body.depth ?? 3;
  const breadth = body.breadth ?? 3;
  const surfaceRequest = body.state?.surfaceRequest ?? body.query;

  if (!surfaceRequest) {
    return { error: 'Query is required' } as const;
  }

  if (!validateSettings(depth, breadth)) {
    return { error: 'Depth and breadth must be positive integers' } as const;
  }

  log('\nStarting UDD investigation...\n');

  const result = await runAgent(
    surfaceRequest,
    { breadth, depth },
    {
      state: body.state,
      answers: body.answers,
      learnings: body.learnings,
      visitedUrls: body.visitedUrls,
    },
  );

  log(`\nStatus: ${result.status}`);
  log(`\n\nLearnings:\n\n${result.learnings.join('\n')}`);
  log(
    `\n\nVisited URLs (${result.visitedUrls.length}):\n\n${result.visitedUrls.join('\n')}`,
  );

  return { result, surfaceRequest } as const;
}

app.post('/api/research', async (req: Request, res: Response) => {
  try {
    const outcome = await runResearch(req.body as ResearchBody);
    if ('error' in outcome) return res.status(400).json(outcome);

    const { result, surfaceRequest } = outcome;
    if (result.status !== 'proceed') {
      return res.json({
        success: true,
        status: result.status,
        questions: result.questions,
        state: result.state,
        learnings: result.learnings,
        visitedUrls: result.visitedUrls,
      });
    }

    const prompt = `${formatInvestigationContext(result.state)}\n\nSurface request: ${surfaceRequest}`;
    const answer = await writeFinalAnswer({
      prompt,
      learnings: result.learnings,
    });

    return res.json({
      success: true,
      status: result.status,
      answer,
      state: result.state,
      learnings: result.learnings,
      visitedUrls: result.visitedUrls,
    });
  } catch (error: unknown) {
    console.error('Error in research API:', error);
    return res.status(500).json({
      error: 'An error occurred during research',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post('/api/generate-report', async (req: Request, res: Response) => {
  try {
    const outcome = await runResearch(req.body as ResearchBody);
    if ('error' in outcome) return res.status(400).json(outcome);

    const { result, surfaceRequest } = outcome;
    if (result.status !== 'proceed') {
      return res.json({
        success: true,
        status: result.status,
        questions: result.questions,
        state: result.state,
        learnings: result.learnings,
        visitedUrls: result.visitedUrls,
      });
    }

    const prompt = `${formatInvestigationContext(result.state)}\n\nSurface request: ${surfaceRequest}`;
    const report = await writeFinalReport({
      prompt,
      learnings: result.learnings,
      visitedUrls: result.visitedUrls,
    });

    return res.json({
      success: true,
      status: result.status,
      report,
      state: result.state,
      learnings: result.learnings,
      visitedUrls: result.visitedUrls,
    });
  } catch (error: unknown) {
    console.error('Error in generate report API:', error);
    return res.status(500).json({
      error: 'An error occurred during report generation',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(port, () => {
  console.log(`Ultra Deep Digging API running on port ${port}`);
});

export default app;
