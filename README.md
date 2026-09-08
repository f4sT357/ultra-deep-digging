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

This is deliberately different from treating the application as a conventional prompt enhancer.

## Repository Status

This project is a fork and is being substantially repurposed.

The upstream README and parts of the repository still reflect the original deep-research project. This README replaces that description and documents the direction of this repository instead.

When determining the current behavior of the system, **the implementation under `src/` is authoritative; this document describes the intended project direction and the currently exposed foundation.**

## Project Structure

The current codebase is TypeScript-based and includes the following major components:

- `src/deep-research.ts` — iterative research/search engine and final result generation
- `src/prompt.ts` — system-level research behavior
- `src/feedback.ts` — initial follow-up question generation
- `src/ai/providers.ts` — model/provider configuration
- `src/api.ts` — API entry point
- `src/run.ts` — CLI execution flow
- `src/ai/text-splitter.ts` — text processing utilities

The implementation is expected to evolve significantly as the intent, investigation, and evaluation layers are introduced.

## Requirements

- Node.js 22.x
- A Firecrawl-compatible search/content extraction service
- An OpenAI-compatible LLM endpoint, or another supported provider

The current dependency stack includes TypeScript, the Vercel AI SDK, Firecrawl, Express, Zod, and related utilities.

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example` and configure the required providers.

Example:

```env
FIRECRAWL_KEY="YOUR_KEY"
OPENAI_KEY="YOUR_KEY"
CONTEXT_SIZE="128000"
```

For a self-hosted Firecrawl instance:

```env
FIRECRAWL_BASE_URL="http://localhost:3002"
```

For an OpenAI-compatible local or alternative endpoint:

```env
OPENAI_ENDPOINT="http://localhost:11434/v1"
CUSTOM_MODEL="your-model"
```

The exact provider/model configuration is defined by `src/ai/providers.ts` and may change during development.

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

For report mode, the current implementation also asks follow-up questions before beginning the research loop.

The current engine writes:

- `report.md` for report mode
- `answer.md` for answer mode

These interfaces are part of the current foundation and are not necessarily the final Ultra Deep Digging UX.

## Development

Format the TypeScript source with:

```bash
npm run format
```

Run the API entry point with:

```bash
npm run api
```

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
