# Aukaæfing — Implementation Plan

## 1. Purpose

This document turns the behavior in [`product-spec.md`](./product-spec.md) and the source content in
[`training-plan.md`](./training-plan.md) into a small, reviewable delivery plan for v1.

The first release succeeds when a child can select a player, start the recommended workout, complete
one drill at a time, record results, see a personal best, finish the workout, and retain that work through
an interrupted connection. Parent administration, richer rewards, and visual polish remain secondary.

## 2. Implementation principles

- Build the child-facing training loop before secondary account and engagement features.
- Treat the supplied four-week, ages 10–12 program as versioned data, not UI code.
- Keep all user-facing copy in Icelandic; keep code, schema names, and technical documentation in English.
- Make phone portrait the baseline, then verify tablet portrait and landscape layouts.
- Persist active workout state and result writes locally before attempting network synchronization.
- Use stable client-generated identifiers and idempotent upserts so retries cannot duplicate sessions.
- Store every result attempt and preserve the content version used by completed sessions.
- Reward completion and consistency with XP; use measured performance only for personal improvement.
- Prefer direct components and small modules over a framework inside the framework.

## 3. Proposed architecture

### Application

- **Next.js App Router, React, and TypeScript** for the application shell and routes.
- **Tailwind CSS** for mobile-first styling and shared design tokens.
- **Server Components by default** for static or server-read views; Client Components only for interaction,
  timers, local persistence, and workout state.
- **Supabase Auth and PostgreSQL** for family authentication and durable cloud data.
- **IndexedDB** for cached content, the active session, completed local sessions, and the pending-write queue.
- **Service worker and web app manifest** for installation, shell caching, and offline route availability.

No global state library is planned. The active workout can use a scoped reducer/context, while server data
and locally persisted records remain behind repository interfaces.

### Boundaries

```text
UI routes and components
  -> application services (start, advance, record, complete, sync)
    -> repositories (content, players, sessions, results)
      -> IndexedDB and Supabase adapters

Versioned training seed data
  -> validation/import
    -> content repository
```

Business rules such as personal-best comparison, XP awards, next-workout selection, and weekly-goal
calculation should be pure TypeScript functions. This keeps them testable and prevents rules from being
split between React components and database queries.

## 4. Information architecture and routes

| Route | Audience | Responsibility |
| --- | --- | --- |
| `/` | Family | Restore the recent player or show player selection. |
| `/leikmenn` | Child/family | Select a player with one large tap target. |
| `/heim` | Child | Recommended workout, weekly goal, XP, latest personal best, short-practice entry. |
| `/aefingar` | Child | Browse the program and repeat unlocked workouts without rankings. |
| `/aefingar/[workoutId]` | Child | Concise equipment and workout preparation. |
| `/aefing/virk` | Child | Resume or run the single active workout, one drill at a time. |
| `/aefing/lokid` | Child | Completion, XP, personal bests, and weekly-goal feedback. |
| `/framfarir` | Child | Personal activity, program progress, and personal-best history. |
| `/stillingar` | Parent | Account, player editing, history corrections, and sync diagnostics. |

The child shell exposes `HEIM`, `ÆFINGAR`, and `FRAMFARIR`. Parent actions live behind the avatar/settings
entry and must not interrupt an active workout.

## 5. Core user flows

### First use and player selection

1. A parent authenticates with a Supabase email magic link.
2. The parent creates at least one player profile.
3. When multiple profiles exist, the app displays `HVER ÆFIR?` with large profile cards.
4. Selecting a profile stores the recent player on the device and opens that player's home screen.

Authentication and complete onboarding can follow the local prototype, but data ownership must always be
family-scoped and enforced by row-level security before production use.

### Main workout

1. Home selects the next incomplete workout in program order and offers `HEFJA ÆFINGU`.
2. Preparation shows equipment, duration, and training focus, then `BYRJA`.
3. Starting creates and locally persists a session before showing the first drill.
4. The active screen shows one drill, short source-derived instructions, progress, and any relevant timer.
5. Advancing persists drill completion and any measurement locally.
6. Completing the last drill finalizes the session locally, calculates XP and personal-best outcomes, and
   enqueues an idempotent sync operation.
7. The completion screen presents restrained feedback and returns to the player home.

If the browser closes, the app offers to resume the single active session for that player. Starting another
workout requires resuming or explicitly abandoning the existing one.

### Repeat and short practice

- Completed workouts remain repeatable and can produce new result attempts and personal bests.
- Short 5-, 10-, and 15-minute sessions use the exact combinations in the source training plan.
- Short sessions earn participation XP and activity minutes but do not complete a scheduled main workout.

## 6. Training-content model

Content is committed as typed, validated seed data under a dedicated content directory. A build/test step
must reject duplicate IDs, invalid ordering, unsupported measurements, missing Icelandic labels, and broken
workout-to-drill references.

```ts
type MeasurementType =
  | "COUNT_HIGHER_IS_BETTER"
  | "TIME_LOWER_IS_BETTER"
  | "SUCCESS_OUT_OF_TOTAL"
  | "REPETITIONS_WITHOUT_ERROR"
  | "COMPLETED";

interface TrainingProgram {
  id: string;
  version: number;
  slug: string;
  title: string;
  targetAge: { min: number; max: number };
  recommendedSessionsPerWeek: number;
  weeks: ProgramWeek[];
}

interface WorkoutDrill {
  id: string;
  drillId: string;
  order: number;
  durationSeconds?: number;
  repetitions?: number;
  interval?: { workSeconds: number; restSeconds: number; rounds: number };
  measurement?: { type: MeasurementType; total?: number; comparisonKey: string };
}
```

Reusable drill definitions contain Icelandic title, instructions, coaching point, equipment, categories,
and optional future media metadata. Workout-drill records contain the source-specific duration,
repetitions, ordering, and measurement configuration. Source ambiguity is represented explicitly (for
example, optional duration or free-choice measurement) rather than filled with invented coaching detail.

Each released content change increments the program version. Completed sessions retain program version,
workout title, drill title, measurement type, comparison key, and relevant unit snapshots so history stays
readable after later edits.

## 7. Database model

All primary keys use UUIDs. Mutable rows include `created_at` and `updated_at`; locally created activity rows
also carry a stable client ID used as the sync idempotency key.

### Identity and content

- `families`: family/account identity and timestamps.
- `family_members`: authenticated user membership and role, allowing a safe path beyond one login.
- `players`: family ID, name, avatar key, birth year, preferred foot, and optional archive timestamp.
- `training_programs`: stable slug, version, age range, metadata, and active state.
- `program_weeks`: program/version, week number, title, focus, and order.
- `workouts`: program/week, order, titles, duration range, equipment, focus, categories, and short-session flag.
- `drills`: stable drill definition, Icelandic content, categories, and media metadata.
- `workout_drills`: ordered join plus timing, repetitions, rest, interval, and measurement configuration.

### Activity and progress

- `training_sessions`: client ID, player, program/workout/version, status, start/end timestamps, duration,
  short-session flag, XP awarded, and content snapshot.
- `drill_results`: client ID, session/player, workout-drill and comparison key, measurement type, numeric
  value, optional total/unit, attempt timestamp, and measurement snapshot.
- `xp_events`: stable event key, player, session, reason, points, and timestamp; the unique event key prevents
  duplicate rewards during retry.
- `player_achievements`: deferred until Phase 2.

Personal bests and weekly progress are computed from immutable result/session history initially. If query
cost later justifies caches, derived rows can be rebuilt from that history rather than becoming a second
source of truth.

### Authorization

Row-level security must ensure authenticated users can access only families they belong to, their players,
and those players' activity. Published training content is readable by authenticated and offline-caching
clients but writable only through deployment/admin tooling. Client input never selects an arbitrary
`family_id`; ownership derives from authenticated membership.

## 8. Result and personal-best rules

A result is comparable only when `player_id`, `comparison_key`, measurement type, and unit/total semantics
match. The comparison key remains stable across harmless content edits but changes when a drill's conditions
materially change.

- `COUNT_HIGHER_IS_BETTER` and `REPETITIONS_WITHOUT_ERROR`: largest value wins.
- `TIME_LOWER_IS_BETTER`: smallest positive completed value wins.
- `SUCCESS_OUT_OF_TOTAL`: compare only equal totals in v1; largest success count wins.
- `COMPLETED`: recorded for history but never produces a numeric personal best.
- Equal values match the best but do not trigger `NÝTT MET!`.
- A first valid measurable result establishes the initial best without claiming an improvement amount.
- Corrected/deleted results trigger recalculation from remaining history.

The application records the attempt before calculating the response shown to the child. Pure comparison
tests must cover first attempts, equality, invalid values, lower-is-better timing, differing totals, player
separation, repeats, and corrections.

## 9. XP, levels, and weekly goals

Keep v1 rewards explicit and centrally configured. Suggested values are product defaults to validate during
implementation, not coaching judgments:

- fixed XP per completed drill,
- fixed bonus for a completed main workout,
- smaller completion bonus for a short session,
- small bonus for an optional measurable attempt or weaker-foot drill,
- fixed weekly-goal bonus awarded once per player and ISO week,
- small personal-best bonus with no scaling based on athletic result.

An XP event ledger prevents double awards and makes adjustments auditable. Levels derive from total XP using
a short threshold table. The weekly goal counts distinct completed main sessions in the player's local
calendar week; short sessions remain visible activity but do not satisfy the three-workout program target.
There is no daily streak and no comparison between players.

## 10. Offline and synchronization design

### Local storage

IndexedDB stores:

- the published program/version required by the selected player,
- player summaries needed for device-level selection,
- one active-session state machine per player,
- locally completed sessions and result attempts,
- an append-only queue of pending mutations with attempt metadata.

Every important transition writes to IndexedDB before navigation or celebration. Timers store their state
and reference timestamps rather than writing every second, allowing correct recovery after suspension and
orientation changes.

### Queue protocol

1. Create session/result/XP IDs on the client.
2. Commit the complete local transaction and enqueue an operation.
3. Sync when online, at app startup, after completion, and on a conservative retry schedule.
4. Upsert through a server transaction/RPC with unique client IDs and event keys.
5. Mark the operation acknowledged only after the server confirms the complete write.
6. Retain acknowledged local history until normal cache cleanup; never delete data merely because a request
   was sent.

Retries use bounded exponential backoff. Dependency order is player, session, results, then derived XP
events. v1 avoids collaborative editing: parent corrections made online use `updated_at` conflict checks;
an unresolved conflict is surfaced in parent settings without blocking the child's next workout.

The service worker caches versioned static assets, offline-safe application routes, and published training
content. It does not cache private API responses indiscriminately. Background Sync may improve delivery where
supported, but foreground synchronization remains the required cross-browser path, especially on iOS.

## 11. Suggested project structure

```text
src/
  app/
    (child)/
    (parent)/
    api/
  components/
    child/
    workout/
    ui/
  content/
    programs/
    schema.ts
    validate.ts
  domain/
    personal-bests.ts
    progression.ts
    sessions.ts
  lib/
    db/
    offline/
    supabase/
  repositories/
    local/
    remote/
  copy/
    is.ts
supabase/
  migrations/
  seed.sql
public/
  icons/
tests/
  e2e/
```

Route groups maintain a clear child/parent separation without changing public URLs. The content schema is
independent of route components so future programs can be added as data.

## 12. Delivery phases

### Phase 0 — decisions and acceptance fixtures

- Confirm the content schema, comparison-key convention, session state machine, XP defaults, and ISO-week
  interpretation.
- Transcribe the 12 main workouts and three short sessions from `training-plan.md` without additions.
- Write representative acceptance fixtures for one count result, one timed result, one success/total result,
  one interval drill, and an offline completion.

**Exit:** schemas and fixtures are reviewed; every source workout maps without embedding content in UI code.

### Phase 1A — foundation and local vertical slice

- Scaffold Next.js, TypeScript, Tailwind, linting, tests, manifest, and responsive child shell.
- Add validated program seed data and repository contracts.
- Implement local player selection, home, workout preparation, one-drill-at-a-time flow, and timer primitives.
- Complete one representative workout entirely against IndexedDB.

**Exit:** on a phone-sized viewport, a child can select a fixture player, finish a workout, refresh midway,
resume it, and still see the locally completed session.

### Phase 1B — persistence and the complete core loop

- Add Supabase migrations, family authentication, membership/player row-level security, and player CRUD.
- Implement all source workouts, result controls, history, personal-best detection, XP events, weekly goals,
  next-workout selection, repeat behavior, and a basic progress screen.
- Add parent correction/deletion of accidental results.

**Exit:** two players under one family have isolated progress, all 12 workouts run from data, repeated
attempts calculate the correct personal best, and the primary loop meets keyboard and touch requirements.

### Phase 1C — offline reliability and PWA release gate

- Implement the durable mutation queue, idempotent remote transaction, retry visibility, content caching,
  service worker updates, install metadata, and safe cache migrations.
- Exercise offline start/resume/result/completion, reconnect, duplicate requests, browser termination, and
  service-worker upgrade scenarios on iOS/iPadOS and Android targets.

**Exit:** a completed offline session survives reload/device suspension, synchronizes exactly once after
reconnection, and remains visible locally until server acknowledgement.

### Phase 2 — deferred engagement and polish

- Add achievements, richer progress, restrained meaningful celebrations, short-session UX polish, media
  placeholders where useful, and tablet-specific refinements.
- Validate reward values and Icelandic copy with children/parents before expanding the system.

Achievements and richer analytics must not delay the reliable v1 training loop.

## 13. Test strategy and release checks

### Automated

- **Unit:** content validation, session reducer, timer restoration, result validation, PB comparison, XP
  idempotency, weekly boundaries, next-workout selection, and queue backoff.
- **Component:** large result controls, preparation screen, active drill states, pause/resume, completion, and
  Icelandic empty/error states.
- **Integration:** IndexedDB transactions, session/result persistence, sync ordering, duplicate retries,
  content-version snapshots, row-level security, and parent corrections.
- **End-to-end:** multi-player selection, full workout, refresh/resume, repeat/PB, short session, offline
  completion/reconnect, and installable PWA smoke paths.
- **Static checks:** formatting, ESLint, TypeScript, seed validation, migration checks, and production build.

### Manual device matrix

- iPhone Safari in browser and installed mode.
- iPad Safari portrait and landscape.
- Representative Android Chrome phone and tablet in browser and installed mode.
- Bright/outdoor readability, 44-pixel-or-larger targets, screen-reader names, reduced motion, orientation
  changes, timer suspension, and accidental double taps.

## 14. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| iOS suspends timers or lacks reliable background sync. | Derive timers from timestamps and require foreground queue processing. |
| A retry duplicates a session or XP award. | Client UUIDs, unique constraints, and one transactional idempotent server operation. |
| Program edits make history misleading. | Version content and snapshot identifying labels and measurement semantics. |
| Ambiguous source material invites invented coaching. | Flag ambiguity for content review and model it explicitly; do not silently fill gaps. |
| Offline schema changes strand pending writes. | Version IndexedDB records and test migrations with queued operations before service-worker rollout. |
| Child and parent flows become mixed. | Separate route groups, navigation, components, and acceptance tests. |
| Gamification rewards athletic advantage. | Fixed effort/completion XP and player-only PB comparisons. |

## 15. Explicit v1 exclusions

Do not add leaderboards, player rankings, social features, chat, coaching/team portals, AI coaching, video
analysis, ball tracking, payments, subscriptions, push notifications, complex permissions, elaborate event
sourcing, Redux, or an achievement engine before the core loop is reliable.

## 16. Decisions requested during review

These are the few choices that materially affect implementation and should be resolved before or during
Phase 0:

1. **Authentication:** confirm email magic link as the v1 family sign-in method.
2. **Player deletion:** prefer archive by default; define whether permanent deletion requires deleting or
   anonymizing dependent history.
3. **Calendar semantics:** confirm Icelandic local time and ISO weeks (Monday through Sunday) for weekly goals.
4. **XP values and level thresholds:** approve initial constants after a lightweight product review; they do
   not require database redesign.
5. **Content ambiguities:** approve how source ranges and free-choice measurements are represented without
   changing the underlying drills.
6. **Privacy/retention:** define production retention and account-deletion requirements before collecting
   children's profile/activity data.

All other reversible UI details should be decided during implementation rather than blocking the first
vertical slice.
