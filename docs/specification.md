# Ultra Deep Digging — Specification

> **Status:** Initial specification / active design
>
> This document records the concepts that are currently established. It intentionally does not prescribe implementation details that have not yet been decided.

## 1. Purpose

Ultra Deep Digging exists to guide the user toward what they actually want to achieve.

The core purpose is:

> **Ultra Deep Diggingは、ユーザーの表面的な要求を処理するのではなく、対話・調査・推論を通じてユーザーが本当に達成したいことを明らかにし、その達成へ導く。**

The central premise is that appropriate guidance requires understanding what the user is really seeking.

A user's initial request is not necessarily a complete specification of their actual objective. The system must therefore go beyond the literal wording of the request and build an increasingly accurate understanding of the user's underlying objective before deciding how to guide them.

The objective is not to produce a better prompt for its own sake. Prompts, questions, research, reasoning, and other system capabilities are means toward the user's actual desired result.

## 2. Core Problem

A conventional AI workflow often assumes:

```text
User request
    ↓
Answer the request
```

This can produce a technically correct answer while still failing to solve the user's actual problem.

The fundamental problem Ultra Deep Digging addresses is therefore:

> **How can an AI system determine what the user is actually trying to achieve, and then guide the user toward that objective?**

The system should treat the initial request as evidence about the user's objective, rather than automatically treating it as the complete task specification.

## 3. Objective Is Initially a Hypothesis

The system should not assume that the user's true objective can always be known immediately.

Instead, it should construct one or more **objective hypotheses** from the available information.

Conceptually:

```text
User input
    ↓
Objective hypotheses
    ↓
Evidence / dialogue / research
    ↓
Updated objective hypotheses
    ↓
Further investigation if necessary
```

An objective hypothesis may have an associated confidence level and supporting evidence. The system should be able to revise the hypothesis when new information indicates that its current understanding is incomplete or incorrect.

This means that objective understanding is **iterative**, not necessarily a one-time classification step.

## 4. What Must Be Understood

The system may need to distinguish between at least the following aspects of the user's situation:

- **Explicit request** — what the user directly asked for
- **Underlying objective** — what the user is actually trying to achieve
- **Requirements** — what the desired result needs to satisfy
- **Constraints** — limitations such as budget, time, hardware, environment, or preferences
- **Unknowns** — information that is currently missing or uncertain
- **Assumptions** — beliefs being used without sufficient confirmation
- **Success criteria** — what would make the result useful or satisfactory to the user

These are not necessarily all known at the beginning. They should be progressively refined as the system learns more.

## 5. Grill Me and Research

Ultra Deep Digging requires information from two fundamentally different directions:

### Grill Me

**Grill Me** obtains information from the user through targeted questions.

Its purpose is not simply to collect arbitrary preferences. Questions should be selected because the answers can materially improve the system's understanding of the user's objective, constraints, requirements, or success criteria.

### Research

**Research** obtains information about the external world.

Research may reveal facts, constraints, alternatives, contradictions, trade-offs, or other information that changes what should be considered in pursuit of the user's objective.

### They form one loop

Grill Me and Research should not be treated as isolated features. They are complementary information-gathering mechanisms within the same objective-understanding and guidance loop.

```text
                    ┌─────────────────┐
                    │ Objective Model │
                    │  current        │
                    │  hypothesis     │
                    └────────┬────────┘
                             ↓
                    What is still unclear?
                             ↓
                 ┌───────────┴───────────┐
                 ↓                       ↓
            ┌──────────┐            ┌──────────┐
            │ Grill Me │            │ Research │
            │ User     │            │ World    │
            └────┬─────┘            └────┬─────┘
                 │                       │
                 └───────────┬───────────┘
                             ↓
                    New information
                             ↓
                    Update Objective
                             ↓
                    Continue or Guide
```

The system should choose whether to ask the user, research externally, or potentially do both based on what information is currently missing and which action is most useful for reducing uncertainty or advancing toward the objective.

## 6. The Core Loop

The currently established conceptual loop is:

```text
Initial user request
        ↓
Understand / hypothesize objective
        ↓
Identify what is unknown or unclear
        ↓
Choose an information-gathering action
        ├── Grill Me
        └── Research
        ↓
Evaluate new information
        ↓
Update understanding of the objective
        ↓
Determine what still prevents appropriate guidance
        ↓
Repeat as necessary
        ↓
Guide the user toward the desired result
```

The loop is not required to follow a fixed number of iterations. Its direction should depend on the current state of understanding.

## 7. Guidance Is the Actual Goal

The purpose of questioning and research is not to maximize the amount of information collected.

They exist to enable **appropriate guidance toward the user's actual objective**.

The system should therefore ultimately answer:

> **Given what we now understand about the user's real objective, what guidance will best help lead them toward achieving it?**

This guidance may take different forms depending on the task, including:

- a recommendation
- a decision framework
- a concrete plan
- a researched answer
- a comparison
- identification of risks or trade-offs
- a next action
- or another result appropriate to the user's objective

The output format should therefore be determined by the objective rather than by a fixed research-report template.

## 8. Research Is Not the Objective

Deep research is a capability used by Ultra Deep Digging, not the definition of the system.

Likewise:

- prompt optimization is not the objective
- asking more questions is not the objective
- searching more sources is not the objective
- producing longer answers is not the objective
- increasing reasoning effort is not the objective

The system should use these capabilities only when they contribute to understanding or achieving the user's objective.

## 9. Result-Oriented Stopping Condition

The system should stop the investigation when additional questioning or research is no longer necessary to appropriately guide the user toward the understood objective.

The exact stopping criteria are **not yet fully specified**.

Future design must determine how the system evaluates whether:

- the objective is sufficiently understood
- important unknowns have been resolved
- remaining uncertainty is acceptable
- additional investigation is worth its cost
- the system has enough information to provide useful guidance

## 10. Current Design Principles

The following principles are currently established:

1. **Understand before guiding.**
2. **The user's literal request is not necessarily the complete objective.**
3. **Objective understanding begins as a hypothesis.**
4. **Objective hypotheses can be updated as new information becomes available.**
5. **Grill Me and Research are complementary parts of the same loop.**
6. **Questions should be purposeful rather than exhaustive.**
7. **Research should be driven by what is necessary to understand or achieve the objective.**
8. **The system should optimize for the user's desired result, not for prompt quality, search volume, or output length.**
9. **The system must be able to change direction when new information changes the understanding of the problem.**

## 11. Not Yet Specified

The following areas remain intentionally open and should be designed later rather than assumed prematurely:

- exact objective-model schema
- objective hypothesis scoring / confidence model
- question-selection algorithm
- research-planning algorithm
- how Grill Me and Research are scheduled against each other
- evidence representation
- contradiction handling
- exact completion / stopping criteria
- result-generation architecture
- UI / interaction model
- LLM boundaries versus deterministic system responsibilities
- mapping of the current research-engine implementation onto this architecture

These are implementation and architecture questions that should be derived from the core purpose rather than allowed to redefine it.

## 12. Relationship to the Existing Repository

The repository originally started from an open deep-research implementation. That existing research engine remains a foundation for external investigation, but it is not the definition of Ultra Deep Digging.

The target architecture is broader:

```text
User
  ↓
Objective Understanding
  ↕
Grill Me / Research
  ↓
Guidance
  ↓
Desired Result
```

The existing search/research implementation should therefore be evaluated according to how well it can serve this architecture, rather than assuming that its current workflow should remain the central abstraction.

## 13. Non-Goals

At the current stage, Ultra Deep Digging is explicitly **not** defined as:

- a conventional prompt enhancer
- a system that merely rewrites user prompts
- a conventional fixed-depth Deep Research wrapper
- a system that asks questions for their own sake
- a system that performs exhaustive research regardless of usefulness

The defining goal remains **understanding what the user actually wants and providing appropriate guidance toward it**.
