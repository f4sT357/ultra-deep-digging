import * as fs from 'fs/promises';
import * as readline from 'readline';

import { getModel } from './ai/providers';
import { writeFinalAnswer, writeFinalReport } from './deep-research';
import { runAgent } from './agent/loop';
import { formatInvestigationContext } from './agent/state';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function run() {
  console.log('Using model: ', getModel().modelId);

  const initialQuery = await askQuestion('What would you like to accomplish? ');
  const breadth =
    parseInt(await askQuestion('Enter research breadth (default 4): '), 10) || 4;
  const depth =
    parseInt(await askQuestion('Enter research depth (default 2): '), 10) || 2;
  const isReport =
    (await askQuestion('Output report or answer? (report/answer, default report): ')) !==
    'answer';

  const result = await runAgent(
    initialQuery,
    { breadth, depth },
    {
      onQuestion: question => askQuestion(`\n${question}\nYour answer: `),
    },
  );

  if (result.status === 'needs_user_input') {
    throw new Error(
      `Investigation still needs user input: ${result.questions.join('; ')}`,
    );
  }

  const finalPrompt = `${formatInvestigationContext(result.state)}\n\nSurface request: ${initialQuery}`;

  if (isReport) {
    const report = await writeFinalReport({
      prompt: finalPrompt,
      learnings: result.learnings,
      visitedUrls: result.visitedUrls,
    });
    await fs.writeFile('report.md', report, 'utf-8');
    console.log(`\nFinal Report:\n\n${report}`);
  } else {
    const answer = await writeFinalAnswer({
      prompt: finalPrompt,
      learnings: result.learnings,
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
