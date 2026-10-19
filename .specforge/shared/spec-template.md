# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Created**: [DATE]
**Status**: Draft
**Input**: User description: "$ARGUMENTS"

## Business Proposition *(mandatory)*

<!--
  IMPORTANT: This section describes WHAT the feature delivers to the business
  and its users — NOT how it is built. It is the single source of truth for
  feature summaries across all downstream artifacts (plan, estimate, tasks,
  issues, PRs).

  Rules:
  - Write 2-4 sentences from the perspective of the end user or business stakeholder
  - Focus on: who benefits, what they can do, and why it matters
  - Do NOT mention: frameworks, libraries, SDKs, protocols, database engines, queues, caching strategies, or architecture patterns
  - Use domain language that a non-technical stakeholder would understand
  - Include the key payment methods, workflows, or capabilities in business terms

  BAD: "End-to-end payment module via Stripe: PIX, tokenized credit card,
  Apple Pay, and Google Pay. Hybrid pre-authorization at booking, PIX QR
  after completion, provider PIX payouts via Stripe Connect, installments
  (parcelamento), and paginated history."

  GOOD: "Let customers pay for services using their preferred method — PIX,
  credit card, Apple Pay, or Google Pay. Payments are securely held at booking
  and settled automatically after service completion. Service providers receive
  earnings directly to their accounts. Customers can split larger purchases
  into installments and view their full payment history."
-->

[2-4 sentences describing the business value: who benefits, what they can do, and why it matters — NO technical implementation details]

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

> **Regra de escrita das User Stories**: descreva a historia em linguagem de negocio, focada em resultado para o usuario e valor para a operacao. Evite detalhes de implementacao (framework, API, banco, fila, cache, arquitetura, protocolo).
>
> **Regra de aceitacao (Gherkin)**: os cenarios de aceitacao devem seguir formato Gherkin (`Scenario`, `Given`, `When`, `Then`, `And`) com comportamentos observaveis.

### User Story 1 - [Brief Title] (Priority: P1)

**As a** [business actor / user profile]  
**I want** [business capability / objective]  
**So that** [business value / expected outcome]

[Add 1-2 short paragraphs describing the journey in business language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

```gherkin
Scenario: [Happy path title]
  Given [initial business context]
  When [business action]
  Then [expected business outcome]

Scenario: [Alternative or rule variation]
  Given [initial business context]
  And [additional condition]
  When [business action]
  Then [expected business outcome]
```

---

### User Story 2 - [Brief Title] (Priority: P2)

**As a** [business actor / user profile]  
**I want** [business capability / objective]  
**So that** [business value / expected outcome]

[Add 1-2 short paragraphs describing the journey in business language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

```gherkin
Scenario: [Main scenario title]
  Given [initial business context]
  When [business action]
  Then [expected business outcome]
```

---

### User Story 3 - [Brief Title] (Priority: P3)

**As a** [business actor / user profile]  
**I want** [business capability / objective]  
**So that** [business value / expected outcome]

[Add 1-2 short paragraphs describing the journey in business language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

```gherkin
Scenario: [Main scenario title]
  Given [initial business context]
  When [business action]
  Then [expected business outcome]
```

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: Fill out with the right edge cases for this feature.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?
- What if the user has no network connectivity? (mobile)
- What if the request times out?
- What if concurrent users modify the same resource?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [specific capability]
- **FR-002**: System MUST [specific capability]
- **FR-003**: Users MUST be able to [key interaction]
- **FR-004**: System MUST [data requirement]
- **FR-005**: System MUST [behavior]

*Mark unclear requirements explicitly:*

- **FR-006**: System MUST [NEEDS CLARIFICATION: describe what is unclear]

### Non-Functional Requirements

<!--
  IMPORTANT: Always consider these cross-cutting concerns.
  Remove items that are truly not applicable; do not leave them blank.
-->

- **NFR-001 (Performance)**: API response time MUST be < [X]ms at p95 under [Y] concurrent users
- **NFR-002 (Scalability)**: System MUST handle [X] requests/second without degradation
- **NFR-003 (Availability)**: System MUST achieve [X]% uptime SLA
- **NFR-004 (Security)**: All endpoints MUST require authentication via [method]
- **NFR-005 (Data Integrity)**: All write operations MUST be transactional
- **NFR-006 (Observability)**: All critical operations MUST emit structured logs and metrics

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Architectural Considerations *(mandatory)*

<!--
  IMPORTANT: For every feature, explicitly evaluate whether these infrastructure
  components are needed. Do NOT add them by default - justify each one.
  Reference: shared/architectural-decisions-guide.md
-->

### Caching

- **Needed?** [YES / NO / EVALUATE LATER]
- **Justification**: [Why caching is or is not needed for this feature]
- **What to cache**: [Specific data or responses to cache]
- **Invalidation strategy**: [How and when cache entries expire or are invalidated]

### Message Queues / Async Processing

- **Needed?** [YES / NO / EVALUATE LATER]
- **Justification**: [Why async processing is or is not needed]
- **Use cases**: [e.g., email sending, report generation, webhook delivery]
- **Failure handling**: [Dead letter queues, retry policies]

### Event Streaming

- **Needed?** [YES / NO / EVALUATE LATER]
- **Justification**: [Why streaming is or is not needed]
- **Use cases**: [e.g., real-time updates, audit logs, analytics pipeline]

### Background Jobs / Scheduled Tasks

- **Needed?** [YES / NO / EVALUATE LATER]
- **Use cases**: [e.g., cleanup tasks, report generation, data sync]

## Test Scenarios *(mandatory)*

<!--
  IMPORTANT: Test scenarios are generated alongside the spec in a separate file:
  `<feature-dir>/test-scenarios.md`

  The test scenarios file follows these naming conventions:
  - TS-USNN-NNN — linked to User Story NN (e.g., TS-US01-001 for User Story 1, scenario 1)
  - TS-EC-NNN   — Edge Case scenarios
  - TS-NFR-NNN  — Non-Functional Requirement scenarios

  Every user story MUST have at least 3 scenarios: happy path, alternative path, error path.
  Every edge case and measurable NFR MUST have a corresponding test scenario.
  All scenarios map back to FR-NNN or NFR-NNN requirements for full traceability.

  See: test-scenarios.md in the feature directory for the complete test matrix.
-->

> **Test scenarios for this feature are documented in [`test-scenarios.md`](./test-scenarios.md)**.
> Total scenarios: [count] | Per user story: [breakdown] | Edge cases: [count] | NFR: [count]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete the task in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
