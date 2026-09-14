import * as fs from 'fs/promises';
import * as readline from 'readline';

import { getModel } from './ai/providers';
import {
  deepResearch,
  writeFinalAnswer,
  writeFinalReport,
} from './deep-research';
import { discoverObjective, reviseObjective } from './agent/objective';
import {
  chooseNextAction,
  formatInvestigationContext,
} from './agent/state';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function grill(state: Awaited<ReturnType<typeof discoverObjective>>) {
  const questions = state.model.unknowns
    .filter(unknown => unknown.startsWith('user:'))
    .slice(0, 3)
    .map(unknown => unknown.replace(/^user:\s*/, ''));

  for (const question of questions) {
    const answer = await askQuestion(`\n${question}\nYour answer: `);
    state = await reviseObjective(state, {
      kind: 'user',
      content: `Question: ${question}\nAnswer: ${answer}`,
    });
  }

  return state;
}

async function run() {
  console.log('Using model: ', getModel().modelId);

  const initialQuery = await askQuestion('What would you like to accomplish? ');
  const breadth =
    parseInt(
      await askQuestion('Enter research breadth (default 4): '),
      10,
    ) || 4;
  const depth =
    parseInt(await askQuestion('Enter research depth (default 2): '), 10) || 2;
  const isReport =
    (await askQuestion('Output report or answer? (report/answer, default report): ')) !==
    'answer';

  let state = await discoverObjective(initialQuery);
  let learnings: string[] = [];
  let visitedUrls: string[] = [];

  for (let round = 0; round < 3; round += 1) {
    const action = chooseNextAction(state);

    if (action === 'proceed') break;

    if (action === 'grill') {
      state = await grill(state);
      continue;
    }

    console.log('\nInvestigating...\n');
    const result = await deepResearch({
      query: `${formatInvestigationContext(state)}\n\nSurface request: ${initialQuery}`,
      breadth,
      depth,
      learnings,
      visitedUrls,
    });
    learnings = result.learnings;
    visitedUrls = result.visitedUrls;

    state = await reviseObjective(state, {
      kind: 'research',
      content: learnings.slice(-20).join('\n'),
    });
  }

  const finalPrompt = `${formatInvestigationContext(state)}\n\nSurface request: ${initialQuery}`;

  if (isReport) {
    const report = await writeFinalReport({
      prompt: finalPrompt,
      learnings,
      visitedUrls,
    });
    await fs.writeFile('report.md', report, 'utf-8');
    console.log(`\nFinal Report:\n\n${report}`);
  } else {
    const answer = await writeFinalAnswer({
      prompt: finalPrompt,
      learnings,
    });
    await fs.writeFile('answer.md', answer, 'utf-8');
    console.log(`\nFinal Answer:\n\n${answer}`);
  }

  rl.close();
}

run().catch(error => {
  console.error(error);
  rl.close();
  process.exitCode = 1;
});
