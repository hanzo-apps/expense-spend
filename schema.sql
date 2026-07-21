-- Hanzo Base schema for Expense Spend (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped — the collection's access rule is `@request.auth.org_id = org`, so
-- a member of your org reads/writes it and other orgs cannot see it.
--
-- Keep this file in lockstep with what the app reads/writes
-- (src/lib/expense.ts, src/views/log.tsx, src/views/summary.tsx).

CREATE TABLE IF NOT EXISTS expenses (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  amount   REAL NOT NULL,          -- spend amount, e.g. 12.50
  category TEXT NOT NULL,          -- category id: food | transport | housing | shopping | health | fun | bills | other
  note     TEXT,                   -- optional free-text memo
  date     TEXT NOT NULL           -- yyyy-mm-dd the money was spent
);
