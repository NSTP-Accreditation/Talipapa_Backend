# Health Check Endpoint

This repository exposes a light-weight health endpoint to check service status and DB connectivity.

Endpoint:

There are two variants of the check:

- GET /health — returns a lightweight status useful for uptime bots and orchestrators that only wants the service to be reachable. By default this endpoint will not query the DB. The returned JSON includes "db": "not-checked" to indicate DB was not examined.
- GET /health?db=true — will include the MongoDB connection state (`connected`|`disconnected`|`connecting`|`disconnecting`).

You can also set an environment variable to make DB checks the default for all requests:

- Set `HEALTH_CHECK_DB=true` in `.env` to include DB status by default.

Example response:

{
"status": "ok",
"uptime": 123.45,
"env": "development",
"db": "connected",
"memory": { "rss": 12345678, ... },
"timestamp": "2025-11-19T00:00:00.000Z"
}

Use this in your monitoring/alerting checks. The endpoint is deliberately unauthenticated because it is used by orchestrators like Kubernetes or load balancers for quick liveness/readiness checks.

If you don't want the endpoint to check DB (for uptime bots to avoid touching the DB), keep `HEALTH_CHECK_DB` unset or `false` and call `/health` without `db=true`.
