# Environment Configuration: {{projectName}}

**Stack**: {{stack}}
**Generated**: {{date}}

## Environment Variables

### Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_NAME` | Yes | `{{projectName}}` | Application name |
| `APP_ENV` | Yes | `development` | Environment: development, staging, production |
| `APP_PORT` | Yes | `3000` | Application port |
| `APP_DEBUG` | No | `false` | Enable debug mode (NEVER true in production) |
| `APP_LOG_LEVEL` | No | `info` | Log level: debug, info, warn, error |

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `DB_POOL_SIZE` | No | `5` | Connection pool size |
| `DB_MAX_OVERFLOW` | No | `10` | Max overflow connections |

### Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars) |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | No | `15` | Access token TTL |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | No | `30` | Refresh token TTL |

### CORS

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ORIGINS` | Yes | `http://localhost:5173` | Comma-separated allowed origins |

### Redis (if applicable)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | No | — | Redis connection string |

### External Services

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | No | — | Sentry error tracking DSN |
| `[SERVICE]_API_KEY` | Varies | — | [Description of service] |

---

## .env.example

```bash
# Application
APP_NAME={{projectName}}
APP_ENV=development
APP_PORT=3000
APP_DEBUG=false
APP_LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/{{projectName}}
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10

# Authentication
JWT_SECRET=change-me-to-a-random-string-at-least-32-chars
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS
CORS_ORIGINS=http://localhost:5173

# Redis (uncomment if using caching/queues)
# REDIS_URL=redis://localhost:6379/0

# External Services
# SENTRY_DSN=
```

## Security Rules

1. **NEVER** commit `.env` files to version control
2. **NEVER** log environment variables at startup
3. **ALWAYS** validate all required variables at application boot (fail fast)
4. **ALWAYS** use different secrets per environment
5. **ALWAYS** rotate secrets on team member departure
6. Store production secrets in a vault (AWS Secrets Manager, HashiCorp Vault, etc.)
