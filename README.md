# Ultra Deep Digging

**Ultra Deep Digging** is a research-oriented AI system built around a simple idea:

> Don't just turn a user's words into a better prompt. Dig into what the user actually needs, investigate the problem from multiple directions, and work toward the result they genuinely want.

This repository started as a fork of an open deep-research implementation. The original search/research engine is being used as a foundation and is being redesigned into a broader **intent-to-result investigation system**.

> **Status:** Active development. The repository is currently transitioning from the forked deep-research architecture toward the Ultra Deep Digging architecture. Some implementation details and interfaces will change as this redesign progresses.

## What Ultra Deep Digging Is

Many AI systems treat the user's initial prompt as the specification of the task:

```text
User prompt
    ↓
Generate a better prompt
    ↓
LLM answer
```

Ultra Deep Digging takes a different approach:

```text
Initial user request
        ↓
Understand the actual objective
        ↓
Identify ambiguity, hidden requirements, constraints, and unknowns
        ↓
Determine what must be investigated
        ↓
Search and investigate from multiple directions
        ↓
Evaluate what was learned and what is still missing
        ↓
Dig deeper where necessary
        ↓
Produce the result that best satisfies the underlying objective
```

The objective is therefore **not prompt optimization for its own sake**. Prompting is an implementation mechanism; the actual objective is reaching a useful and correct result.

## Core Principles

### 1. Optimize for the result, not the prompt

A polished prompt is not useful if it causes the system to solve the wrong problem.

Ultra Deep Digging treats the user's desired outcome as the target and uses prompts, queries, research plans, and intermediate reasoning only as means toward that target.

### 2. The initial request is evidence, not necessarily the full specification

Users often know what they want to ask before they know exactly what they need to know.

The system should therefore be able to distinguish between:

- what the user explicitly asked for
- what they are actually trying to accomplish
- requirements that are implied by the task
- information that is missing
- assumptions that may be wrong
- questions that need investigation before a reliable answer is possible

### 3. Research should change direction when the evidence changes

Research is iterative rather than a fixed list of searches.

Findings from one stage should determine what deserves investigation next. New information can reveal better questions, contradictions, missing evidence, or entirely different research directions.

### 4. Do not spend intelligence where deterministic work is sufficient

LLM calls should be used where interpretation, synthesis, judgment, or generation is actually required.

Search orchestration, state management, deduplication, progress tracking, and other deterministic operations should remain explicit system responsibilities whenever possible.

### 5. Stop when the objective is satisfied

More searches do not automatically mean better research. The system should ultimately optimize for sufficient evidence and useful results rather than arbitrary depth or output length.

## Current Research Engine

The current implementation provides the foundation for iterative web research.

At a high level it currently:

1. Accepts an initial research request.
2. Generates multiple search queries based on the request and previous learnings.
3. Searches the web through Firecrawl.
4. Extracts information from search results.
5. Produces structured learnings and follow-up research questions.
6. Uses those follow-ups to recursively continue the investigation.
7. Deduplicates accumulated learnings and visited URLs.
8. Generates either a detailed report or a concise final answer.

The research loop is breadth/depth based today, with each recursive stage using the previous research goal, follow-up directions, and accumulated learnings as context.

The current implementation is intentionally treated as a **research engine foundation**, not as the final definition of Ultra Deep Digging.

## Architecture Direction

The long-term architecture is centered around separating the following responsibilities:

```text
User Intent
    │
    ▼
Objective / Desired Outcome
    │
    ├── Constraints
    ├── Requirements
    ├── Unknowns
    └── Success Criteria
    │
    ▼
Investigation Planning
    │
    ▼
Search / Retrieval / Evidence Collection
    │
    ▼
Evidence Processing
    │
    ▼
Gap Detection / Contradiction Detection
    │
    └───────────────┐
                    │
                    ▼
             Further Investigation
                    │
                    └───────→ ...
                    │
                    ▼
              Result Synthesis
                    │
                    ▼
             User's Desired Result
```

The current implementation now has an explicit investigation orchestration layer around the research engine:

```text
Surface Request
      ↓
Objective Discovery
      ↓
Choose Action ──→ Grill / Research / Proceed
      ↓
Evidence
      ↓
Objective / Requirement Update
      └──────────────→ loop
```

`src/agent/loop.ts` owns this control flow. `src/deep-research.ts` remains responsible for web research and final answer/report generation. The CLI owns interactive user input, while the API transports serializable state and user answers between requests.

This is deliberately different from treating the application as a conventional prompt enhancer.

## Repository Status

This project is a fork and is being substantially repurposed.

The upstream README and parts of the repository still reflect the original deep-research project. This README replaces that description and documents the direction of this repository instead.

When determining the current behavior of the system, **the implementation under `src/` is authoritative; this document describes the intended project direction and the currently exposed foundation.**

## Attribution

Ultra Deep Digging is based on **Open Deep Research**, an open-source deep research implementation by **Duet**.

The original project is available at:

https://github.com/dzhng/deep-research

Ultra Deep Digging uses the original project's research/search architecture as a starting point and is being substantially modified and extended toward a different goal: understanding the user's underlying objective and conducting the investigation necessary to produce the result they actually need.

This repository is an independent fork and is **not affiliated with or endorsed by Duet or the original Open Deep Research project**.

The original project's copyright notice and MIT License are retained in `LICENSE`. Changes and additions in this repository are made under the terms of that license.

## Project Structure

The current codebase is TypeScript-based and includes the following major components:

- `src/agent/state.ts` — objective model, evidence state, action selection, and investigation context formatting
- `src/agent/objective.ts` — LLM-based objective discovery and evidence-driven model updates
- `src/agent/loop.ts` — shared UDD investigation orchestration used by the CLI and API
- `src/deep-research.ts` — iterative research/search engine and final result generation
- `src/prompt.ts` — system-level research behavior
- `src/feedback.ts` — initial follow-up question generation
- `src/ai/providers.ts` — model/provider configuration
- `src/api.ts` — HTTP API entry point and serialization of UDD state/questions
- `src/run.ts` — interactive CLI entry point
- `src/ai/text-splitter.ts` — text processing utilities

The implementation is expected to evolve significantly as the intent, investigation, and evaluation layers are introduced.

## Requirements

- Node.js 22.x
- SearXNG, or Vane / Perplexica when configured explicitly
- An OpenAI-compatible LLM endpoint, or another supported provider

The current dependency stack includes TypeScript, the Vercel AI SDK, Express, Zod, and related utilities.

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example` and configure the required providers. The default search provider is a direct SearXNG connection; it does not need a second LLM or embedding model.

Example:

```env
SEARCH_PROVIDER="searxng"
SEARXNG_BASE_URL="http://localhost:8080"
SEARCH_LANGUAGE="ja-JP"
OPENAI_KEY="lm-studio"
OPENAI_ENDPOINT="http://127.0.0.1:1234/v1"
CUSTOM_MODEL="your-loaded-model-id"
CONTEXT_SIZE="128000"
```

Enable JSON in the SearXNG `search.formats` setting for its API to return results. For this service the endpoint is `/search?q=...&format=json`.

This repository includes a local-only SearXNG container configuration. Copy `searxng/env.example` to `searxng/.env`, replace the example secret, then start it from the repository root:

```bash
docker compose -f searxng/docker-compose.yml up -d
```

The search provider uses SearXNG result snippets directly. This keeps the search path small and fast, while page-by-page extraction can be added later if deeper source text is needed.

### Quick start on Windows

Prerequisites: Node.js 22, Docker Desktop, and LM Studio. Start LM Studio's local server at `http://127.0.0.1:1234`, then download and load the chat model you want UDD to use. The model must be loaded in LM Studio when you run an investigation.

Open PowerShell in the repository folder and create the local environment file:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Confirm the LM Studio and SearXNG values in `.env.local`. Replace `your-loaded-model-id` with the model ID shown at `http://127.0.0.1:1234/v1/models`:

```env
OPENAI_KEY="lm-studio"
OPENAI_ENDPOINT="http://127.0.0.1:1234/v1"
CUSTOM_MODEL="your-loaded-model-id"
SEARCH_PROVIDER="searxng"
SEARXNG_BASE_URL="http://localhost:8080"
SEARCH_LANGUAGE="ja-JP"
```

Set up the local SearXNG secret once. Copy the example file, replace its placeholder with a private random string, then save it:

```powershell
Copy-Item .\searxng\env.example .\searxng\.env
notepad .\searxng\.env
```

Start SearXNG from the repository folder:

```powershell
docker compose -f .\searxng\docker-compose.yml up -d
```

Install UDD dependencies and start the web app:

```powershell
npm install
npm run web
```

Open [http://localhost:3051](http://localhost:3051). UDD fetches model IDs from LM Studio when the server starts and again when the page opens. Choose a model from **使用するLLM**; use **再読込** after changing the models available in LM Studio. Keep the LM Studio server and selected model running while UDD investigates.

To stop UDD, press `Ctrl+C` in its PowerShell window. To stop SearXNG:

```powershell
docker compose -f .\searxng\docker-compose.yml down
```

To keep using Vane / Perplexica, set the provider explicitly and provide its model IDs:

```env
SEARCH_PROVIDER="vane"
PERPLEXICA_BASE_URL="http://localhost:3000"
PERPLEXICA_PROVIDER_ID="your-provider-id"
PERPLEXICA_CHAT_MODEL="your-chat-model"
PERPLEXICA_EMBEDDING_PROVIDER_ID="your-embedding-provider-id"
PERPLEXICA_EMBEDDING_MODEL="your-embedding-model"
```

The exact provider/model configuration is defined by `src/ai/providers.ts` and may change during development.

## Intent clarification and copy handoff

The web app now offers **意図を整理（コピペ用）** as an output mode. It runs the existing Grill Me / Research loop, then returns an intent summary instead of asking the local model to solve the user's task.

- The objective and requirements are initially **model hypotheses**, even if the model reports high confidence.
- Review or edit the objective and requirements in the web UI, then click **この目的・要件を確認して反映**. Only this explicit action marks those fields as user-confirmed.
- Constraints and preferences remain unconfirmed extracts; no personal preferences or hidden constraints should be invented.
- Click **意図テキストをコピー** and paste the plain text into a frontier LLM. No account integration or export format is required.
- **Research remains enabled** to fill domain-knowledge gaps when the model identifies a relevant research unknown.
- Any new research or question-response update invalidates an earlier confirmation, requiring a fresh review.
- The intent mode does not call `writeFinalAnswer` or `writeFinalReport`. Existing answer/report modes remain available.

The app exposes `POST /api/intent` and `POST /api/confirm-intent` for the review flow. Neither endpoint automatically claims that a high model-confidence score equals human confirmation.

## Running

Run the current CLI implementation with:

```bash
npm start
```

The current CLI asks for:

- the initial research request
- research breadth
- research depth
- whether the desired output is a report or a specific answer

After objective discovery, the UDD loop may ask additional user questions when the current model contains `user:` unknowns. Research-only unknowns are investigated automatically.

The current engine writes:

- `report.md` for report mode
- `answer.md` for answer mode

These interfaces are part of the current foundation and are not necessarily the final Ultra Deep Digging UX.

The API exposes the same investigation loop. When user input is required, the response contains the current `state`, `questions`, `learnings`, and `visitedUrls`; a subsequent request can send that state together with `answers` to continue the investigation.

## Development

Format the TypeScript source with:

```bash
npm run format
```

Run the API entry point with:

```bash
npm run api
```

Run the web interface and API together with:

```bash
npm run web
```

Then open `http://localhost:3051`. The interface supports answer and report output, breadth/depth settings, follow-up questions, findings, and source links. It is served by the existing Express API and uses plain HTML, CSS, and browser JavaScript without an additional frontend framework.

At startup, the API requests the available models from the configured OpenAI-compatible endpoint's `/models` route. The web interface lets you choose a model for each investigation, remembers that choice in the browser, and offers a refresh button. `CUSTOM_MODEL` is used as the initial selection (and remains available if the endpoint is temporarily unreachable).

Run the CLI directly with:

```bash
npm start
```

## Design Goal

Ultra Deep Digging aims to move the AI workflow one abstraction level above prompt generation.

The central question is not:

> **"How can we make this prompt better?"**

It is:

> **"What is this user actually trying to achieve, what prevents us from achieving it reliably, and what investigation or processing is necessary to get there?"**

That distinction is the foundation of the project.

## License

This repository retains the MIT license of the original project unless and until the project license is explicitly changed.
