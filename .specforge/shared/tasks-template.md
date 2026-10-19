---
description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Business-oriented title`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Each task MUST have a details block (indented bullets) explaining *what* to implement (including file paths), *why* it matters, and *how* to know it is done

## Task Title Rules

Task titles MUST describe the **business outcome or capability** being delivered, NOT the technical artifact being created. Think "what value does this unlock?" rather than "what file do I touch?".

| BAD (too technical) | GOOD (business-oriented) |
|---|---|
| Create User model and migration | Enable persistent storage for user accounts |
| Implement JWT authentication middleware | Secure API endpoints with token-based identity verification |
| Set up Redis caching layer | Accelerate read-heavy queries with response caching |
| Create OrderService business logic | Enforce order placement rules and inventory checks |
| Add health check endpoints | Expose service availability for zero-downtime deployments |
| Configure CORS and rate limiting | Protect API from abuse and cross-origin attacks |
| Create project directory structure | Establish project foundation and developer tooling |
| Set up Docker and docker-compose | Guarantee reproducible local development environment |

Technical details (file paths, class names, method signatures) belong in the **What** bullet — NEVER in the title.

## Task Detail Block (Required)

Every task entry must follow this pattern:

```
- [ ] TXXX [P?] [USN] Business-oriented title describing the outcome
  - **What**: Specific classes, functions, fields, or behaviors to create or modify — `path/to/file`
  - **Why**: Which requirement (FR-NNN / NFR-NNN) or user story outcome this satisfies
  - **Acceptance**: Observable signal that the task is complete (test passes, endpoint returns X, migration runs cleanly, etc.)
  - **Depends on**: TXXX (only if there is a hard dependency within the same story)
```

- Keep the headline short (≤ 12 words) and focused on the deliverable, not the implementation
- "What" must name concrete artifacts: class names, method signatures, DB columns, config keys, **and file paths** — never vague verbs like "handle" or "manage"
- "Acceptance" must be verifiable without asking the author — prefer automated checks over manual ones
- Omit "Depends on" when there is no dependency (do not write "none")

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/` or `mobile/src/`
- Paths shown below assume web app layout - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /specforge.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  - Architectural decisions (caching, queues, etc.) from spec.md

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  QUALITY BAR: Every generated task must include the "What / Why / Acceptance"
  detail block described in the Format section above. Vague one-liners like
  "Create model" or "Add endpoint" are NOT acceptable — they must name the
  concrete artifact, the requirement it satisfies, and how completion is verified.

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Establish project foundation and developer tooling
  - **What**: Create all top-level directories (`src/`, `tests/`, `docs/`, `scripts/`, etc.) and placeholder files as specified in plan.md; add `.gitignore`, `README.md` skeleton, and `Makefile` / task runner with `install`, `test`, `lint`, `run` targets — per plan.md layout
  - **Why**: Establishes the agreed directory contract so all subsequent tasks reference consistent paths
  - **Acceptance**: `git status` shows all directories committed; `make install && make lint` exits 0 with an empty codebase

- [ ] T002 Bootstrap runtime with core framework and dependencies
  - **What**: Initialize the package manifest (`package.json` / `pyproject.toml` / `go.mod` / etc.), install the web framework, ORM, test runner, and any other dependencies listed in plan.md; pin all versions
  - **Why**: Provides a reproducible dependency baseline for every subsequent task
  - **Acceptance**: `make install` completes in a clean environment; a "hello world" entry point starts without errors

- [ ] T003 [P] Enforce code quality standards automatically
  - **What**: Add linter config (`eslint.config.js` / `.ruff.toml` / `.golangci.yml`), formatter config (`.prettierrc` / `pyproject.toml [tool.black]`), and a pre-commit hook that blocks commits on lint failure
  - **Why**: Enforces code style automatically so review comments stay focused on logic
  - **Acceptance**: Introducing a deliberate style violation causes `make lint` to fail; `make format` fixes it

- [ ] T004 [P] Secure application secrets and configuration
  - **What**: Create `.env.example` listing every required variable with descriptions and safe defaults; add `.env` to `.gitignore`; wire a config loader (`dotenv`, `pydantic-settings`, `viper`, etc.) that validates required vars at startup and fails fast with a clear error message
  - **Why**: Prevents secrets from leaking into version control and makes onboarding explicit (FR-NNN)
  - **Acceptance**: Starting the app without a required variable prints an actionable error naming the missing key; `.env` is absent from `git ls-files`

- [ ] T005 [P] Guarantee reproducible local development environment
  - **What**: Write `Dockerfile` (multi-stage: builder + runtime), `docker-compose.yml` with the app service and all required backing services (DB, cache, queue per spec), and a `docker-compose.override.yml` for hot-reload mounts
  - **Why**: Guarantees environment parity between developer machines and CI
  - **Acceptance**: `docker compose up --build` starts all services; app responds to a health probe; `docker compose down -v` cleans up without errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Enable versioned database schema evolution
  - **What**: Install the migration tool (Alembic / Flyway / golang-migrate / Prisma Migrate); create the migrations directory; add an initial baseline migration; wire `make migrate` and `make migrate-rollback` commands; configure the DB connection using the env vars from T004 — `migrations/`
  - **Why**: All entities from data-model.md require a versioned, reproducible schema — no ad-hoc DDL
  - **Acceptance**: `make migrate` runs against an empty DB and exits 0; `make migrate-rollback` reverts cleanly; running migrate twice is idempotent

- [ ] T007 [P] Secure API endpoints with identity verification
  - **What**: Create JWT validation middleware (or session-based per spec) that extracts the caller identity from the `Authorization` header, verifies the token signature and expiry, attaches the decoded principal to the request context, and returns 401 / 403 with a standard error body on failure; wire to the router so all non-public routes are protected by default — `src/middleware/auth`
  - **Why**: NFR-NNN requires all endpoints to enforce authentication; foundational because every user story endpoint depends on it
  - **Acceptance**: A request with a valid token reaches the handler; expired or missing tokens receive `401`; a valid token with insufficient scope receives `403`

- [ ] T008 [P] Establish API gateway with cross-cutting concerns
  - **What**: Instantiate the framework router; register global middleware in order: request ID injection, structured request logging, panic recovery, CORS (T012), rate limiting (T012), auth (T007); define the `/v1` prefix group; expose a route registry helper so each feature module self-registers — `src/router`
  - **Why**: Central routing setup that all user story handlers will mount onto
  - **Acceptance**: Server starts and unknown routes return `404` with a standard JSON body; known routes without auth return `401`

- [ ] T009 Define shared domain language and base data types
  - **What**: Define shared types used across all entities: `BaseModel` (id, created_at, updated_at, deleted_at for soft deletes), `PaginatedResponse<T>`, `ErrorResponse` (code, message, details), and any domain value objects (e.g., `Money`, `Email`) referenced in data-model.md; include ORM mixins where applicable — `src/models/base`
  - **Why**: Prevents duplication and schema divergence across entity models created in Phase 3+
  - **Depends on**: T006
  - **Acceptance**: All fields are present and correctly typed; `BaseModel` roundtrips through the ORM without data loss; `ErrorResponse` matches the schema in contracts/

- [ ] T010 Ensure consistent error reporting and operational visibility
  - **What**: Create a centralized error handler that maps domain exceptions to HTTP status codes and `ErrorResponse` JSON bodies; set up a structured logger (JSON output in production, pretty in development) that includes trace ID, caller, level, and timestamp; ensure unhandled panics are caught, logged, and return `500` without leaking stack traces — `src/middleware/error`, `src/lib/logger`
  - **Why**: NFR-NNN (Observability) — consistent log format required for alerting pipelines; consistent error bodies required for client contract
  - **Acceptance**: A deliberate `panic` in a handler returns `{"code":"INTERNAL","message":"internal server error"}` with no stack trace in the response body; the same event appears in structured logs with trace ID

- [ ] T011 [P] Expose service availability for zero-downtime deployments
  - **What**: Implement `GET /health` (liveness — returns `200 {"status":"ok"}` immediately) and `GET /ready` (readiness — checks DB connection and any other critical dependencies, returns `200` or `503` with a per-dependency status breakdown) — `src/routes/health`
  - **Why**: Required by container orchestrators (Kubernetes, ECS) for traffic routing; verifies foundational connectivity before user story work begins
  - **Acceptance**: Both endpoints return correct codes with no auth required; `/ready` returns `503` when the DB is unreachable

- [ ] T012 [P] Protect API from abuse and cross-origin attacks
  - **What**: CORS — allow origins, methods, and headers as specified in spec.md; reject preflight requests from unlisted origins. Rate limiting — implement a sliding-window limiter (per IP by default, per user-ID when authenticated) at the limits defined in spec.md; return `429` with `Retry-After` header on breach — `src/middleware/cors`, `src/middleware/ratelimit`
  - **Why**: NFR-NNN (Security) — prevents abuse and cross-origin data leakage
  - **Acceptance**: A preflight from an unlisted origin returns `403`; exceeding the rate limit returns `429` with `Retry-After`; legitimate requests pass through unaffected

### Infrastructure Components (include only if required by spec)

<!--
  Only add the tasks below when the architectural decision in spec.md
  explicitly calls for the component. Do NOT include by default.
-->

- [ ] T013 [P] Accelerate read-heavy queries with response caching
  - **What**: Install the cache client (Redis / Memcached / in-process per spec); create a `Cache` interface with `Get`, `Set`, `Delete`, `Invalidate` methods; configure connection pooling and timeouts via env vars; add a `make cache-flush` convenience command — `src/lib/cache`
  - **Why**: spec.md architectural decision: [paste the specific caching justification here]
  - **Acceptance**: `Cache.Set` followed by `Cache.Get` returns the same value; TTL expiry is respected; a cache miss returns a typed sentinel (not `nil` error)

- [ ] T014 [P] Enable reliable asynchronous processing for background work
  - **What**: Install the broker client (RabbitMQ / SQS / Redis Streams per spec); create a `Publisher` and `Consumer` abstraction; implement at-least-once delivery with configurable retry and a dead-letter queue; add a worker entrypoint that registers all job handlers — `src/lib/queue`, `src/workers`
  - **Why**: spec.md architectural decision: [paste the specific queue justification here]
  - **Acceptance**: A published message is consumed exactly once under normal conditions; a consumer failure after max retries routes the message to the DLQ without data loss

- [ ] T015 [P] Enable real-time event propagation between services
  - **What**: Install the streaming client (Kafka / Kinesis / Pulsar per spec); create typed `EventProducer` and `EventConsumer` wrappers; define the event schema registry and serialization format (Avro / Protobuf / JSON Schema per spec); add idempotency key handling for consumers — `src/lib/streaming`
  - **Why**: spec.md architectural decision: [paste the specific streaming justification here]
  - **Acceptance**: Produced events appear in the topic within the latency SLA; consumers process events in order within a partition; duplicate events are deduplicated by key

- [ ] T016 [P] Automate recurring business operations on schedule
  - **What**: Install the job scheduler (APScheduler / cron / Temporal / Sidekiq per spec); register each background job listed in spec.md with its cron expression and timeout; add distributed lock to prevent concurrent runs across replicas; expose `/admin/jobs` status endpoint — `src/jobs`
  - **Why**: spec.md architectural decision: [paste the specific background job justification here]
  - **Acceptance**: Each job fires on schedule (verify with a 1-minute interval in dev); duplicate execution is prevented when two replicas run simultaneously; a failed job is logged with full context

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - [Title] (Priority: P1) - MVP

**Goal**: [Brief description of what this story delivers to the end user]

**Linked requirements**: FR-NNN, FR-NNN, NFR-NNN

**Independent Test**: [Concrete action that proves the story works end-to-end — e.g., "POST /orders returns 201 and the order appears in GET /orders/{id}"]

### Tests for User Story 1 (OPTIONAL — only if tests requested)

> **NOTE: Write these tests FIRST, run them, and confirm they FAIL before writing any implementation code**

- [ ] T017 [P] [US1] Validate API contract compliance for [capability]
  - **What**: Verify that the request/response schema of `[METHOD] /path` matches the OpenAPI contract in `contracts/[name].yaml`; cover happy path, validation errors (400), and auth failure (401) — `tests/contract/test_[name]`
  - **Why**: Catches schema drift between implementation and published contract before it reaches consumers
  - **Acceptance**: Test suite runs with `make test-contract`; all assertions pass after implementation; the test fails now (red phase)

- [ ] T018 [P] [US1] Verify end-to-end [user journey] with real data
  - **What**: Drive the full [user journey described in US1] against a real DB (test container); assert on DB state after each step, not just HTTP responses; cover the happy path and at least one error path — `tests/integration/test_[name]`
  - **Why**: FR-NNN — verifies the end-to-end flow including persistence and business rules
  - **Acceptance**: Test runs with `make test-integration`; fails now; passes after full story implementation

### Implementation for User Story 1

- [ ] T019 [P] [US1] Enable persistent storage for [Entity1] data
  - **What**: Define the `[Entity1]` ORM model with fields: [list exact fields from data-model.md with types and constraints]; write the corresponding DB migration; include indexes for [specific columns used in queries] — `src/models/[entity1]`, `migrations/`
  - **Why**: FR-NNN — persistence layer for the core entity of this story
  - **Depends on**: T006, T009
  - **Acceptance**: `make migrate` applies the new migration cleanly; the model roundtrips (insert → select) without data loss; adding the same migration twice is a no-op

- [ ] T020 [P] [US1] Enable persistent storage for [Entity2] data
  - **What**: Define the `[Entity2]` ORM model with fields: [list exact fields]; add foreign key to `[Entity1]`; create index on `[column]` for the query pattern used in [Service] — `src/models/[entity2]`, `migrations/`
  - **Why**: FR-NNN — secondary entity required by this story's data model
  - **Depends on**: T006, T009
  - **Acceptance**: Migration applies; FK constraint is enforced (inserting an orphan row raises a DB error)

- [ ] T021 [US1] Enforce [domain] business rules and constraints
  - **What**: Create `[ServiceName]` with methods: `[method1(args) → (ReturnType, error)]` — [describe the business rule it enforces]; `[method2]` — [describe]; include input validation, transactional writes, and domain error types (`ErrNotFound`, `ErrConflict`, etc.) — `src/services/[service]`
  - **Why**: FR-NNN, FR-NNN — encapsulates all business rules for US1 so the handler layer stays thin
  - **Depends on**: T019, T020
  - **Acceptance**: Unit tests cover happy path and each domain error variant; no raw SQL in the service; all writes are wrapped in a transaction

- [ ] T022 [US1] Expose [capability] to API consumers
  - **What**: Register `[METHOD] /v1/[path]` on the router; parse and validate the request body against the schema in `contracts/[name].yaml`; call `[Service].[method]`; map domain errors to HTTP status codes; return the response body defined in the contract — `src/[location]/[file]`
  - **Why**: FR-NNN — exposes the US1 capability via the API
  - **Depends on**: T021
  - **Acceptance**: `curl` (or contract test T017) returns the exact response schema; invalid input returns `400` with field-level error details; unauthenticated call returns `401`

- [ ] T023 [US1] Guarantee data integrity at the API boundary
  - **What**: Define the request DTO for `[endpoint]` with field-level validation rules (required, min/max length, regex, enum) matching the spec; create an error mapper that converts `ErrNotFound → 404`, `ErrConflict → 409`, `ErrValidation → 400` with structured details — `src/[location]/validators`
  - **Why**: FR-NNN — enforces data integrity at the API boundary; NFR-NNN — consistent error format required by clients
  - **Depends on**: T022
  - **Acceptance**: Submitting each invalid field variant returns `400` with the offending field named in the error details

- [ ] T024 [US1] Enable production monitoring and alerting for [domain]
  - **What**: Emit a structured log entry at INFO level for each successful operation and ERROR level for each failure, including: trace ID, user ID, entity ID, operation name, and duration; register a counter metric `[feature]_[operation]_total{status}` and a histogram `[feature]_[operation]_duration_seconds` — `src/services/[service]`, `src/[location]/[file]`
  - **Why**: NFR-NNN (Observability) — required for production alerting and SLA monitoring
  - **Acceptance**: A successful request produces a log line with all required fields; metrics are visible on `GET /metrics`; error path increments the `status="error"` counter

**Checkpoint**: User Story 1 is fully functional and independently testable — demo it before moving on

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers to the end user]

**Linked requirements**: FR-NNN, FR-NNN

**Independent Test**: [Concrete action that proves the story works end-to-end]

### Tests for User Story 2 (OPTIONAL — only if tests requested)

- [ ] T025 [P] [US2] Validate API contract compliance for [capability]
  - **What**: Schema and status-code assertions for `[METHOD] /path`; cover happy path, validation errors, and auth failure — `tests/contract/test_[name]`
  - **Why**: Catches schema drift for US2 endpoints before reaching consumers
  - **Acceptance**: Fails now; passes after full story implementation

- [ ] T026 [P] [US2] Verify end-to-end [user journey] with real data
  - **What**: Drive the full [US2 user journey] against a real DB; assert on DB state; cover happy path and primary error path — `tests/integration/test_[name]`
  - **Why**: FR-NNN — end-to-end verification of US2 persistence and business rules
  - **Acceptance**: Fails now; passes after full story implementation

### Implementation for User Story 2

- [ ] T027 [P] [US2] Enable persistent storage for [Entity] data
  - **What**: Define `[Entity]` with fields: [list exact fields, types, constraints]; write migration; add indexes for [query pattern]; note any FK relationships to US1 entities — `src/models/[entity]`, `migrations/`
  - **Why**: FR-NNN — persistence for US2 core entity
  - **Depends on**: T006, T009
  - **Acceptance**: Migration applies cleanly; model roundtrips without data loss

- [ ] T028 [US2] Enforce [domain] business rules and constraints
  - **What**: Create `[ServiceName]` with methods: [method signatures and business rules]; reuse US1 services where needed (read-only calls only — do not create hidden cross-story write dependencies) — `src/services/[service]`
  - **Why**: FR-NNN — business rules for US2 isolated in service layer
  - **Depends on**: T027
  - **Acceptance**: Unit tests cover happy path and each domain error; all writes transactional

- [ ] T029 [US2] Expose [capability] to API consumers
  - **What**: Register `[METHOD] /v1/[path]`; validate request body; call `[Service].[method]`; map errors; return contract-compliant response — `src/[location]/[file]`
  - **Why**: FR-NNN — exposes US2 capability via API
  - **Depends on**: T028
  - **Acceptance**: Contract test T025 passes; invalid input → `400`; unauthenticated → `401`

- [ ] T030 [US2] Reuse existing [US1 domain] data without duplication
  - **What**: If US2 reads US1 entities, inject the US1 repository/service as a dependency (do not duplicate queries); document the integration point with a comment; ensure US2 still has an independent test path that does not require US1 data — `src/services/[service]`
  - **Why**: Reuses validated US1 data access without creating a hidden write dependency that breaks story independence
  - **Acceptance**: US2 integration test passes with and without US1 data seeded; no direct DB queries for US1 tables from US2 service

**Checkpoint**: User Stories 1 AND 2 both work independently — verify before moving on

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers to the end user]

**Linked requirements**: FR-NNN, FR-NNN

**Independent Test**: [Concrete action that proves the story works end-to-end]

### Tests for User Story 3 (OPTIONAL — only if tests requested)

- [ ] T031 [P] [US3] Validate API contract compliance for [capability]
  - **What**: Schema and status-code assertions for `[METHOD] /path`; happy path, validation errors, auth failure — `tests/contract/test_[name]`
  - **Why**: Schema drift prevention for US3 endpoints
  - **Acceptance**: Fails now; passes after full story implementation

- [ ] T032 [P] [US3] Verify end-to-end [user journey] with real data
  - **What**: Drive the full [US3 user journey] against a real DB; assert on DB state; happy path and primary error path — `tests/integration/test_[name]`
  - **Why**: FR-NNN — end-to-end verification of US3
  - **Acceptance**: Fails now; passes after full story implementation

### Implementation for User Story 3

- [ ] T033 [P] [US3] Enable persistent storage for [Entity] data
  - **What**: Define `[Entity]` with fields: [list exact fields, types, constraints]; write migration; add indexes for [query pattern] — `src/models/[entity]`, `migrations/`
  - **Why**: FR-NNN — persistence for US3 core entity
  - **Depends on**: T006, T009
  - **Acceptance**: Migration applies; model roundtrips without data loss

- [ ] T034 [US3] Enforce [domain] business rules and constraints
  - **What**: Create `[ServiceName]` with methods: [method signatures and business rules] — `src/services/[service]`
  - **Why**: FR-NNN — business rules for US3 isolated in service layer
  - **Depends on**: T033
  - **Acceptance**: Unit tests cover happy path and each domain error; all writes transactional

- [ ] T035 [US3] Expose [capability] to API consumers
  - **What**: Register `[METHOD] /v1/[path]`; validate request body; call `[Service].[method]`; map errors; return contract-compliant response — `src/[location]/[file]`
  - **Why**: FR-NNN — exposes US3 capability via API
  - **Depends on**: T034
  - **Acceptance**: Contract test T031 passes; invalid input → `400`; unauthenticated → `401`

**Checkpoint**: All user stories are independently functional — full end-to-end demo before polish phase

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Quality improvements that affect multiple user stories

- [ ] TXXX [P] Ensure seamless developer onboarding experience
  - **What**: Update `README.md` with final quickstart steps; regenerate OpenAPI HTML from contracts/; update `docs/architecture.md` to reflect any decisions that changed during implementation — `docs/`
  - **Why**: Ensures new contributors can onboard from docs alone
  - **Acceptance**: `make docs` generates without errors; a developer following README from scratch reaches a running app in < 15 minutes

- [ ] TXXX Eliminate technical debt before release
  - **What**: Remove dead code, consolidate duplicate utility functions, ensure naming is consistent with the ubiquitous language in spec.md, resolve all TODO/FIXME comments
  - **Why**: Technical debt reduction before the feature is declared shipped
  - **Acceptance**: `make lint` exits 0; no TODO/FIXME comments remain in production code paths

- [ ] TXXX Meet performance SLAs under production load
  - **What**: Profile the P1 critical path against the NFR-NNN latency target; add DB indexes where query plans show seq scans on large tables; add response caching for any read-heavy endpoints identified in spec.md
  - **Why**: NFR-NNN — p95 latency must be < [X]ms; validates the architectural decisions made in spec.md
  - **Acceptance**: Load test at [Y] concurrent users shows p95 ≤ [X]ms; no N+1 query patterns remain

- [ ] TXXX [P] Strengthen regression safety net with edge-case coverage
  - **What**: Achieve the coverage target stated in spec.md (or 80% line coverage if unspecified) for all service and domain logic; focus on edge cases not covered by integration tests — `tests/unit/`
  - **Why**: Regression safety net for future refactors
  - **Acceptance**: `make test-unit --coverage` reports ≥ target%; no test relies on external I/O

- [ ] TXXX Harden all user-facing inputs against security threats
  - **What**: Audit all user-supplied inputs for injection vectors (SQL, NoSQL, LDAP, OS command); ensure all file uploads are validated for type and size; add security headers (`Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`) to all responses; run `make audit` (dependency vulnerability scan)
  - **Why**: NFR-NNN (Security) — prevents OWASP Top 10 vulnerabilities
  - **Acceptance**: `make audit` reports no critical CVEs; OWASP ZAP passive scan returns no high-severity findings

- [ ] TXXX Validate frictionless first-run experience
  - **What**: Follow every step in `quickstart.md` from a clean environment (no pre-installed dependencies, no existing `.env`); record and fix any step that fails or requires undocumented knowledge
  - **Why**: The onboarding experience is a first-class deliverable; broken quickstarts erode trust
  - **Acceptance**: A team member unfamiliar with the codebase completes quickstart in < 15 minutes without asking questions

- [ ] TXXX Confirm all architectural decisions are delivered
  - **What**: Cross-check every decision in the "Architectural Considerations" section of spec.md against the implementation; for each "YES" decision confirm the component is wired end-to-end; document any "EVALUATE LATER" decisions that were resolved during implementation
  - **Why**: Prevents silent drift between the approved architecture and the shipped code
  - **Acceptance**: A checklist comment in spec.md (or a separate ADR file) marks each decision as "implemented" or "deferred with justification"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Each story adds value without breaking previous stories

---

## Notes

- **[P]** = can run in parallel (touches different files, no intra-phase dependency)
- **[Story]** label maps every task to a specific user story for full traceability
- **Task titles** must describe the business outcome, not the technical artifact — file paths and class names go in the **What** bullet
- **What / Why / Acceptance** detail block is mandatory on every generated task — one-liners are not acceptable
- **FR-NNN / NFR-NNN** references in "Why" provide bidirectional traceability to spec.md requirements
- **Depends on** is only written when there is a hard intra-story dependency; omit it otherwise
- Verify tests fail (red) before writing implementation (green)
- Commit after each task or logical group of parallel tasks
- Stop at every Checkpoint to validate the story independently before proceeding
- Avoid: purely technical titles (e.g. "Create X file", "Implement Y class"), vague task titles, two tasks touching the same file without a dependency, cross-story write dependencies that break story independence
