# Solution Design Skill

## Purpose

Extend Ultra Deep Digging from discovering the user's underlying objective to deriving a practical solution that moves the user toward the desired state.

The objective is not to sell a product. The objective is to identify the user's desired outcome, understand what prevents it, and determine the most effective way to remove that bottleneck.

> **Sell the outcome, not the product.**

A product purchase is only one possible solution. The optimal outcome may instead be automation, reuse of existing resources, self-build, modification, outsourcing, workflow change, doing nothing, or a combination of these.

---

## Position in Ultra Deep Digging

Solution Design is a downstream stage of the Ultra Deep Digging process:

```text
User Input
    ↓
Underlying Objective / Desired State
    ↓
Current State
    ↓
Gap
    ↓
Bottleneck / Root Cause
    ↓
Required Capability
    ↓
Solution Space
    ├── Buy
    ├── Build
    ├── Modify
    ├── Automate
    ├── Outsource / Delegate
    ├── Change Workflow
    └── Do Nothing
    ↓
Investigate / Compare
    ↓
Optimal Solution
    ↓
Product / Service Selection when required
    ↓
Validation against Desired State
```

Do not start product selection before the desired state and bottleneck are sufficiently understood.

---

## 1. Desired State

Determine the state the user actually wants to reach.

The user's initial request is evidence, not necessarily the complete specification.

Translate surface requests into outcomes when appropriate:

```text
"I want a bike stand"
        ↓
"I want to work on my bike"
        ↓
"I want to reduce the friction of fixing and accessing the bike"
        ↓
"I want to be able to start maintenance immediately when I decide to do it"
```

Desired State may include:

- Function
- Efficiency
- Time
- Cost
- Reliability
- Comfort
- Maintainability
- Flexibility
- Appearance
- Ownership experience
- Motivation / willingness to use
- Reduced cognitive load
- Long-term sustainability

Do not assume that every request requires a product.

---

## 2. Current State

Establish what the user already has and how the task currently works.

Consider:

- Existing products and infrastructure
- Existing workflows
- Existing capabilities
- Time consumption
- Financial cost
- Maintenance burden
- Preparation and cleanup
- Information and decision overhead
- Constraints
- Existing workarounds

If the current state already satisfies the desired state sufficiently, recommend no purchase.

---

## 3. Gap Analysis

Identify the meaningful difference between the current state and desired state.

```text
Desired State - Current State = Gap
```

Do not merely list missing features. Identify which missing capability has the largest effect on the desired outcome.

---

## 4. Bottleneck and Root Cause

Separate symptoms from causes.

Repeatedly ask what is actually consuming resources or preventing progress until the meaningful bottleneck becomes clear.

Example:

```text
Sleep deprivation
    ↓
Insufficient available time
    ↓
Tasks + desired activities consume available time
    ↓
Desired activities also contain preparation, research,
management, setup, and cleanup overhead
    ↓
The user's scarce resource is being spent on peripheral work
```

In this example, the solution may be task automation or workflow reduction rather than a sleep product.

---

## 5. Required Capability

Convert the bottleneck into capabilities that a solution must provide.

Do this before selecting products.

Example:

```text
Bottleneck:
Bike maintenance takes too much preparation.

Required capabilities:
- Stable bike fixation
- Adjustable working height
- Easy access to different parts
- Fast setup
- Tool accessibility
- Low cleanup friction
```

Required capabilities should be concrete enough to evaluate objectively.

---

## 6. Solution Space

Consider the full solution space before choosing a product.

Always consider, where relevant:

- Purchase
- Existing equipment reuse
- Modification
- DIY
- Automation
- AI assistance
- Software
- Outsourcing
- Delegation
- Workflow redesign
- Task elimination
- Standardization
- Rule-based decision reduction
- Doing nothing

Do not constrain the solution space to products sold by a particular company.

---

## 7. Product Selection

Only enter product-selection mode when a product is actually useful to the solution.

Search from required capabilities rather than from a predetermined product or brand.

Bad:

```text
best bike stand
```

Better:

```text
stable bicycle repair stand
height adjustable
rotating clamp
heavy steel base
low cost
```

The product is an implementation detail of the solution, not the definition of the solution.

---

## 8. Evaluation Criteria

Evaluate candidates primarily by their contribution to the desired state.

Default priority:

1. Contribution to Desired State
2. Actual performance / practical usefulness
3. Cost-performance
4. Durability
5. Maintainability
6. Repairability / replaceability
7. Extensibility / modification potential
8. Consumables and replacement-parts availability
9. Standards / interoperability
10. Vendor lock-in
11. Size / weight where relevant
12. Appearance / brand

Adjust priorities when the user's desired state requires it.

Do not treat brand prestige, price, popularity, or manufacturer status as substitutes for actual quality.

A generic or inexpensive product is preferable when it achieves the required state adequately and offers better overall value.

A premium product is preferable when its actual additional capability materially improves the desired outcome.

---

## 9. Evidence and Uncertainty

Separate:

- Fact
- Estimate
- Hypothesis
- Unknown

Never invent specifications or infer unverified performance from marketing claims.

Pay particular attention to claims involving:

- Strength
- Load capacity
- Durability
- Battery life
- Thermal behavior
- Repairability
- Replacement parts
- Long-term reliability
- Real-world performance

When important information cannot be verified, explicitly state the uncertainty and incorporate it into the recommendation.

---

## 10. Cost and Resource Efficiency

Evaluate more than purchase price when appropriate.

```text
Initial Cost
+ Consumables
+ Maintenance
+ Replacement
+ Required Accessories
+ Time Cost
+ Cognitive Cost
+ Lock-in Cost
= Effective Cost
```

The relevant optimization target is the user's scarce resources, not merely money.

Consider:

- Money
- Time
- Attention
- Cognitive effort
- Physical effort
- Space
- Maintenance effort

A more expensive solution may be better if it removes a recurring high-cost bottleneck. A cheaper solution is better when it achieves the same desired state with no meaningful downside.

---

## 11. Existing Environment

Always compare the proposed solution against the user's existing environment.

Ask:

- What does the new solution actually add?
- Does it duplicate an existing capability?
- Can an existing component be modified instead?
- Does the new solution create new maintenance or management work?
- Does it introduce vendor lock-in?

Do not recommend additional complexity unless the resulting state is materially better.

---

## 12. Appearance as Part of the Desired State

Appearance is not inherently superficial.

When relevant, treat it as part of the desired state through effects such as:

- Willingness to use the system
- Visual noise
- Environmental harmony
- Ownership satisfaction
- Self-image
- Impression on others

However, appearance must not be used to hide a failure to meet essential functional requirements unless appearance itself is a primary user requirement.

---

## 13. Recommendation

A solution recommendation should explain the causal chain:

```text
Desired State
    ↓
Bottleneck
    ↓
Required Capability
    ↓
Solution
    ↓
Candidate
    ↓
Expected Improvement
```

When recommending a concrete product or service, include where useful:

### Why
Why it addresses the actual bottleneck.

### Strengths
What it does particularly well for this user.

### Weaknesses
What it does poorly or what trade-offs it introduces.

### Unknowns
What has not been verified.

### Purchase Condition
The conditions under which buying it makes sense.

### Don't Buy Condition
The conditions under which buying it does not make sense.

---

## 14. Anti-Sales Rules

Never:

- Start from a product and reverse-engineer a justification.
- Prefer a company's own product merely because it is the product being sold.
- Equate high price with high quality.
- Equate brand reputation with suitability.
- Treat popularity as evidence of fit.
- Ignore non-product solutions.
- Recommend something merely because it is convenient.
- Hide weaknesses or uncertainties.
- Upsell without a corresponding improvement in the desired state.
- Ignore the user's existing environment.
- Optimize sales volume instead of the user's outcome.

The system must be willing to conclude:

> **Do not buy this.**

---

## 15. Optimal Outcome

The final objective is not product ownership.

It is:

> **Move the user toward the desired state with the least unnecessary expenditure of scarce resources.**

Therefore the optimal result may be:

```text
Premium product
Generic low-cost product
Combination of products
Software
Automation
DIY
Modification
Outsourcing
Workflow change
Existing setup
Nothing
```

The solution is successful only if it materially improves the user's actual situation.

---

## Integration with Ultra Deep Digging

Ultra Deep Digging should treat solution derivation as a natural continuation of intent discovery and investigation.

The system should be able to move from:

```text
What did the user ask?
```

to:

```text
What are they actually trying to achieve?
```

to:

```text
What prevents that outcome?
```

to:

```text
What capability removes the bottleneck?
```

to:

```text
What is the best way to provide that capability?
```

to:

```text
What concrete action should the user take?
```

This makes Ultra Deep Digging an **intent-to-result system**, rather than merely a prompt optimizer or research engine.

The system should stop once it has sufficient confidence that the proposed solution materially satisfies the user's actual objective. More investigation is not inherently better.
