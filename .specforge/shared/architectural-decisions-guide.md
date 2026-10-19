# Architectural Decisions Guide

**Purpose**: This guide helps teams make informed decisions about when to introduce infrastructure components like caching, message queues, event streaming, and background jobs. Every feature spec MUST reference this guide and explicitly justify the inclusion or exclusion of each component.

**Golden Rule**: Do NOT add infrastructure complexity unless there is a measurable, documented need. Start simple. Add complexity only when the cost of not having it exceeds the cost of maintaining it.

---

## Table of Contents

- [1. Caching](#1-caching)
- [2. Message Queues / Async Processing](#2-message-queues--async-processing)
- [3. Event Streaming](#3-event-streaming)
- [4. Background Jobs / Scheduled Tasks](#4-background-jobs--scheduled-tasks)
- [5. Database Read Replicas](#5-database-read-replicas)
- [6. CDN / Static Asset Caching](#6-cdn--static-asset-caching)
- [7. API Gateway / Load Balancing](#7-api-gateway--load-balancing)
- [8. Search Engine (Elasticsearch / Meilisearch)](#8-search-engine)
- [9. File Storage (Object Storage)](#9-file-storage-object-storage)
- [10. Decision Matrix](#10-decision-matrix)

---

## 1. Caching

### When to Use

- **Read-heavy endpoints** where the same data is requested frequently and rarely changes (e.g., product catalogs, user profiles, configuration)
- **Expensive computations** that produce the same result for the same input (e.g., aggregation reports, recommendation scores)
- **Rate-limited external API calls** where you need to reduce outbound requests
- **Session/token data** that is read on every request
- **Database query results** when queries are slow (> 100ms) and data staleness of seconds/minutes is acceptable

### When NOT to Use

- **Write-heavy data** that changes on every request (cache invalidation cost exceeds benefit)
- **User-specific data with strict freshness requirements** (e.g., bank balances, real-time inventory counts)
- **Small datasets** that fit in memory and are fast to query directly
- **Data with complex invalidation dependencies** where a single write invalidates many cache keys
- **Early-stage features** with < 100 concurrent users (premature optimization)

### Cache Layers (choose the simplest that meets your need)

| Layer | Use Case | TTL Range | Complexity |
|-------|----------|-----------|------------|
| **In-memory (app-level)** | Config, feature flags, static lookups | Minutes to hours | Low |
| **HTTP caching (Cache-Control, ETag)** | Static assets, paginated lists, public API responses | Minutes to days | Low |
| **Distributed cache (Redis/Memcached)** | Session data, computed results, cross-instance shared state | Seconds to hours | Medium |
| **CDN edge cache** | Static assets, images, public pages | Hours to days | Medium |
| **Database query cache** | Repeated complex queries | Seconds to minutes | Low |

### Invalidation Strategies

| Strategy | Best For | Pitfall |
|----------|----------|---------|
| **TTL (Time-to-Live)** | Data that can be slightly stale (catalogs, configs) | Stale reads during TTL window |
| **Write-through** | Data that must be fresh after writes (user profiles) | Write latency increases |
| **Write-behind (async)** | High write throughput (analytics counters) | Data loss if cache crashes before flush |
| **Event-based invalidation** | Complex dependencies (product price affects cart, search index) | Requires event infrastructure |
| **Manual / on-demand** | Rare updates (CMS content, feature flags) | Human error, forgotten invalidations |

### Best Practices

- Always set a TTL, even for event-invalidated caches (safety net against missed events)
- Monitor cache hit rate; if < 80%, re-evaluate what you are caching
- Use cache key prefixes with version numbers to enable safe deployments: `v2:users:{id}`
- Never cache error responses
- Log cache misses in development to identify optimization opportunities
- Implement graceful degradation: if cache is down, fall back to database (never fail the request)

### Red Flags (you are misusing caching if...)

- You are caching data that changes every second
- Your cache invalidation logic is more complex than your business logic
- You have cache stampede issues (many requests hitting DB simultaneously when cache expires)
- You are using cache as a primary data store instead of a performance layer

---

## 2. Message Queues / Async Processing

### When to Use

- **Fire-and-forget operations** that the user does not need to wait for (e.g., sending emails, push notifications, webhooks)
- **Rate-sensitive external integrations** where you need to control throughput (e.g., third-party API calls with rate limits)
- **Long-running operations** that would cause HTTP request timeouts (e.g., PDF generation, video processing, report compilation)
- **Decoupling services** where the producer should not know or care if the consumer is available
- **Retry-required operations** where transient failures should not fail the user request
- **Fan-out patterns** where one event triggers multiple independent side effects

### When NOT to Use

- **Synchronous user-facing operations** where the user needs an immediate response (e.g., "create user and return the user object")
- **Simple CRUD operations** with no side effects beyond database writes
- **Low-volume operations** (< 100/day) where a simple synchronous call is sufficient
- **Operations where ordering matters critically** and you cannot tolerate out-of-order processing (unless using FIFO queues with ordering guarantees)
- **When you do not have monitoring/alerting** for queue depth and processing failures

### Queue Technologies

| Technology | Best For | Ordering | Complexity |
|------------|----------|----------|------------|
| **In-process (async task)** | Simple fire-and-forget within the same process | N/A | Very Low |
| **Database-backed queue (pg_boss, Celery + DB)** | Low-to-medium volume, transactional guarantees | FIFO per queue | Low |
| **Redis (BullMQ, Celery + Redis)** | Medium volume, job scheduling, retries | FIFO per queue | Medium |
| **RabbitMQ** | Complex routing, multiple consumers, high reliability | FIFO per queue | Medium-High |
| **Amazon SQS / Google Cloud Tasks** | Managed, high volume, no infrastructure to maintain | FIFO (optional) | Low (managed) |
| **Apache Kafka** | High throughput streaming + queue hybrid | Per partition | High |

### Error Handling Patterns

| Pattern | Use When |
|---------|----------|
| **Retry with exponential backoff** | Transient errors (network timeouts, rate limits) |
| **Dead Letter Queue (DLQ)** | Messages that fail after max retries (investigate manually) |
| **Circuit breaker** | Downstream service is consistently failing (stop sending messages temporarily) |
| **Idempotency keys** | Messages may be delivered more than once (at-least-once delivery) |

### Best Practices

- Always implement idempotency: assume every message will be delivered at least once
- Always configure a Dead Letter Queue; never silently drop failed messages
- Set reasonable retry limits (3-5 attempts with exponential backoff)
- Monitor queue depth: if it is growing, consumers are not keeping up
- Log every message processed and every failure with correlation IDs
- Design consumers to be stateless and horizontally scalable
- Test failure scenarios: what happens when the queue is down? When a consumer crashes mid-processing?

### Red Flags (you are misusing queues if...)

- You are using a queue to defer a database INSERT that takes 5ms
- Your queue depth is always 0 (the queue adds complexity but no value)
- You have no monitoring or alerting on queue failures
- You are using queues to "eventually" write critical data that the user expects to see immediately

---

## 3. Event Streaming

### When to Use

- **Real-time data pipelines** where multiple consumers need the same events (e.g., order placed -> update inventory, send email, update analytics)
- **Event sourcing / audit trails** where you need a complete, ordered history of state changes
- **Real-time notifications** to connected clients (via WebSocket/SSE backed by a stream)
- **Cross-service communication** in microservices where services need to react to events without direct coupling
- **Analytics and metrics** where you need to process high volumes of events in real time
- **Change Data Capture (CDC)** to replicate database changes to other systems

### When NOT to Use

- **Simple request-response patterns** where one service calls another and waits for a response
- **Low-event-volume systems** (< 1000 events/day) where a simple database table or queue suffices
- **When you only have one consumer** (a message queue is simpler)
- **When strong ordering across all events is required** (streams order per partition, not globally)
- **When your team does not have operational experience** with stream infrastructure (Kafka, Pulsar, etc.)
- **Monolithic applications** where components communicate in-process

### Stream Technologies

| Technology | Best For | Complexity |
|------------|----------|------------|
| **Server-Sent Events (SSE)** | Simple real-time updates to browser clients | Low |
| **WebSockets** | Bidirectional real-time communication | Medium |
| **Redis Streams** | Lightweight event streaming, small-to-medium scale | Medium |
| **Apache Kafka** | High-throughput, durable event streaming, event sourcing | High |
| **Amazon Kinesis / Google Pub/Sub** | Managed streaming, no infrastructure to maintain | Medium (managed) |
| **NATS JetStream** | Lightweight, high-performance streaming | Medium |

### Best Practices

- Define a clear event schema (use versioned schemas, e.g., CloudEvents spec)
- Include correlation IDs in every event for traceability
- Design consumers to handle out-of-order events gracefully
- Implement consumer lag monitoring; alert when consumers fall behind
- Set retention policies: how long should events be stored?
- Never put sensitive data (passwords, tokens) in events; use references instead
- Plan for schema evolution: how will you handle adding/removing fields?

### Red Flags (you are misusing streaming if...)

- You have a single producer and a single consumer (use a queue instead)
- Events contain entire entity snapshots instead of deltas (bloated events)
- You have no schema registry or versioning strategy
- Consumers are stateful and cannot be restarted without data loss

---

## 4. Background Jobs / Scheduled Tasks

### When to Use

- **Periodic maintenance** (database cleanup, expired token purge, log rotation)
- **Scheduled reports** (daily summary emails, weekly analytics reports)
- **Data synchronization** (sync with external APIs on a schedule)
- **Health monitoring** (periodic health checks of external dependencies)
- **Batch processing** (process accumulated data at regular intervals)

### When NOT to Use

- **Real-time operations** where the user expects immediate processing (use queues instead)
- **High-frequency tasks** (more often than every minute - use a dedicated service/queue)
- **Tasks that require request context** (user session, HTTP headers)
- **When the same task can be triggered by an event** (prefer event-driven over time-driven)

### Technologies

| Technology | Best For | Complexity |
|------------|----------|------------|
| **Cron + scripts** | Simple, infrequent tasks on a single server | Very Low |
| **NestJS `@Cron()` / APScheduler** | In-process scheduling, moderate frequency | Low |
| **BullMQ repeatable jobs / Celery Beat** | Distributed scheduling, needs reliability | Medium |
| **Cloud Scheduler (AWS EventBridge, GCP Cloud Scheduler)** | Managed, no infrastructure, triggers cloud functions | Low (managed) |
| **Kubernetes CronJobs** | Container-orchestrated, isolated task execution | Medium |

### Best Practices

- Ensure jobs are idempotent: running the same job twice should produce the same result
- Implement distributed locks if running multiple instances (prevent duplicate execution)
- Log job start, completion, and duration; alert on failures
- Set timeouts: a job that runs forever blocks the next scheduled run
- Design jobs to be interruptible and resumable for long-running tasks
- Keep job execution times predictable; move variable-length work to queues

### Red Flags (you are misusing background jobs if...)

- Your job runs every second (it is a service, not a job)
- Jobs are failing silently with no alerting
- Multiple instances are executing the same job simultaneously
- A job failure causes data corruption (jobs should be safe to retry)

---

## 5. Database Read Replicas

### When to Use

- **Read-heavy workloads** where reads outnumber writes > 10:1
- **Reporting/analytics queries** that are slow and would impact the primary database
- **Geographic distribution** where read replicas in different regions reduce latency
- **Scale beyond single-node capacity** when vertical scaling is no longer cost-effective

### When NOT to Use

- **Write-heavy workloads** (replicas do not help with write throughput)
- **When strong consistency is required** for every read (replicas have replication lag)
- **Small datasets** that fit comfortably on a single node
- **When you have < 1000 concurrent users** (usually unnecessary at this scale)

### Best Practices

- Design your application to tolerate replication lag (eventual consistency)
- Use read replicas for read-only operations only
- Route writes to primary, reads to replicas (configure at ORM/connection level)
- Monitor replication lag and alert when it exceeds acceptable thresholds

---

## 6. CDN / Static Asset Caching

### When to Use

- **Static assets** (JS bundles, CSS, images, fonts) served to end users
- **Globally distributed users** where latency to origin server matters
- **High-traffic public pages** that do not change per user
- **Media-heavy applications** (images, videos, downloads)

### When NOT to Use

- **Dynamic, personalized content** that changes per user per request
- **Internal tools** with a small, localized user base
- **Development/staging environments** (adds complexity with no benefit)

### Best Practices

- Use content-hashed filenames for cache busting (e.g., `app.a1b2c3.js`)
- Set long cache TTLs for immutable assets (1 year)
- Set short or no-cache for HTML entry points
- Configure proper CORS headers at CDN level
- Monitor CDN cache hit ratio; target > 90% for static assets

---

## 7. API Gateway / Load Balancing

### When to Use

- **Multiple backend services** that need a single entry point
- **Rate limiting and throttling** at the edge
- **SSL termination** to offload TLS from application servers
- **Request routing** based on path, headers, or other criteria
- **Authentication at the edge** to reject unauthorized requests early

### When NOT to Use

- **Single backend service** with a simple deployment (a reverse proxy suffices)
- **Internal service-to-service communication** (use service mesh or direct calls)
- **When your cloud provider's load balancer already handles your needs**

---

## 8. Search Engine

### When to Use

- **Full-text search** across large text bodies (articles, product descriptions, documents)
- **Faceted search / filtering** with complex criteria (price ranges, categories, tags)
- **Fuzzy matching and typo tolerance** (user searches "iphne" and finds "iPhone")
- **Autocomplete / search suggestions** with low latency (< 50ms)
- **Geospatial queries** (find stores within 10km)

### When NOT to Use

- **Simple LIKE queries** on a small dataset (< 100K rows) that PostgreSQL handles fine
- **Exact match lookups** (use database indexes)
- **When you cannot afford to maintain a search index** (data sync, schema changes, monitoring)
- **When search is not a core feature** (a database `WHERE` clause is sufficient)

### Technologies

| Technology | Best For | Complexity |
|------------|----------|------------|
| **PostgreSQL full-text search** | Simple search, small-to-medium datasets | Very Low |
| **Meilisearch** | Fast, easy-to-deploy, typo-tolerant search | Low |
| **Typesense** | Real-time search, easy to operate | Low |
| **Elasticsearch / OpenSearch** | Large-scale, complex queries, analytics | High |
| **Algolia** | Managed, instant search, great DX | Low (managed) |

---

## 9. File Storage (Object Storage)

### When to Use

- **User-uploaded files** (avatars, documents, images)
- **Generated files** (reports, exports, invoices)
- **Media content** (images, videos, audio)
- **Backups and archives**

### When NOT to Use

- **Small metadata** that fits in a database column
- **Temporary files** that exist only during request processing (use /tmp)

### Best Practices

- Never store files in the application server filesystem (not scalable, not persistent across deployments)
- Use pre-signed URLs for direct client-to-storage uploads (reduce server load)
- Implement virus scanning for user-uploaded files
- Set lifecycle policies for automatic cleanup of temporary/expired files
- Use separate buckets for public and private content

---

## 10. Decision Matrix

Use this matrix during feature specification to quickly evaluate each component:

| Component | Add if... | Skip if... | Cost of Adding | Cost of NOT Adding |
|-----------|-----------|------------|----------------|-------------------|
| **Caching** | Read-heavy, > 100ms queries, > 500 concurrent users | Write-heavy, strict freshness, < 100 users | Cache invalidation complexity, stale data risk | Slow responses, DB overload |
| **Message Queue** | Fire-and-forget side effects, long operations, retries needed | Simple CRUD, < 100 ops/day, user needs immediate result | Operational overhead, message monitoring | Timeouts, coupled services, lost retries |
| **Event Streaming** | Multiple consumers, audit trail, real-time pipelines | Single consumer, low volume, monolith | Schema management, consumer lag monitoring | Tight coupling, missed events, no audit |
| **Background Jobs** | Periodic maintenance, scheduled reports, batch processing | Real-time needs, event-driven alternative exists | Job monitoring, distributed locking | Manual operations, stale data, no cleanup |
| **Read Replicas** | Reads > 10x writes, reporting workloads, geo-distribution | Write-heavy, strong consistency needed, < 1K users | Replication lag handling, connection routing | Slow reads, DB bottleneck |
| **CDN** | Static assets, global users, media-heavy | Internal tools, dynamic content, local users | Cache configuration, purging strategy | Slow asset delivery, high origin load |
| **Search Engine** | Full-text, facets, fuzzy matching, > 100K records | Simple LIKE, exact match, < 100K records | Index sync, schema maintenance | Poor search UX, slow queries |
| **Object Storage** | User uploads, generated files, media | Small metadata, temporary files | Storage costs, lifecycle management | Scalability limits, data loss risk |

---

## How to Use This Guide in Feature Specs

In every feature specification (`spec-template.md`), the **Architectural Considerations** section MUST:

1. **List each component** from this guide
2. **State YES, NO, or EVALUATE LATER** for each
3. **Provide justification** referencing specific criteria from this guide
4. **If YES**, specify the chosen technology and pattern from the options above
5. **If NO**, briefly state why the criteria are not met

Example:

```markdown
### Caching
- **Needed?** YES
- **Justification**: Product catalog endpoint serves 2000 req/s, data changes < 1x/hour.
  Per architectural guide: read-heavy, > 500 concurrent users, acceptable staleness.
- **Technology**: Redis with 5-minute TTL
- **Invalidation**: Event-based (product update event) + TTL safety net

### Message Queues
- **Needed?** NO
- **Justification**: All operations are synchronous CRUD with no side effects.
  Per architectural guide: simple CRUD, < 100 ops/day threshold.
```
