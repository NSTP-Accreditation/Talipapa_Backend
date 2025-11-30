# Public Points Lookup API

To support the public-facing "Check Your Points" page we added a lightweight, unauthenticated endpoint:

- GET /api/records/public/find?lastName=SMITH
  - Optional: &record_id=BT-0001

Behavior:
- Returns minimal public data only: `_id`, `firstName`, `lastName`, `points`.
- If multiple matches -> 409 with `requiresDisambiguation: true` and list of matching records (minimal fields only).
- Protected by a rate limiter to prevent abuse and brute-force.

Security & Privacy:
- This endpoint intentionally does NOT return contact or address. It only exposes minimal fields necessary for the public UI to show points.
- If you need stricter privacy: we can remove `firstName` from results and only return `_id` and `points`.

Example:
GET /api/records/public/find?lastName=Doe

200 Response:
{
  "_id": "BT-0001",
  "firstName": "Juan",
  "lastName": "Doe",
  "points": 230,
  "requiresDisambiguation": false
}

409 Response:
{
  "error": "Multiple records found with the same last name",
  "requiresDisambiguation": true,
  "matchingRecords": [ { "_id": "BT-0001", "firstName": "Juan", "lastName": "Doe", "points": 230 }, ... ]
}
