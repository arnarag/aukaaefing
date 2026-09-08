# AGENTS.md

## Project
Aukaæfing is a mobile-first Icelandic football training PWA for children.

The primary user is the child during practice. Parent/admin features are secondary.

## Product rules
- All user-facing UI text must be Icelandic.
- Optimize first for phone and tablet use.
- A child should be able to select their profile, start a workout, complete drills, record results and finish without adult help.
- Keep active-workout screens simple: one drill at a time, short text, large controls, minimal typing.
- Multiple children or friends are separate player profiles under one family account.
- Children do not have individual logins.
- Never create player leaderboards or sibling rankings.
- Personal improvement is the primary gamification mechanic.
- XP rewards effort, completion and consistency more than athletic performance.
- Use forgiving weekly goals instead of fragile daily streaks.
- Personal-best history must be stored per player.
- Do not invent or materially alter football coaching content from the source training plan.
- The initial program is for ages 10–12. Do not silently adapt it for younger or older players.
- Future training programs must be addable without rewriting UI components.
- Active workouts and result recording must work offline.
- Keep v1 small enough to ship.

## Source of truth
- `docs/product-spec.md` defines product behavior and scope.
- `docs/training-plan.md` is the structured source for the initial football program.
- If the original PDF is also present in the repo, treat it as the ultimate source for the training-plan content.
- Do not silently fill gaps in source training content with coaching advice.

## Preferred stack
- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase / PostgreSQL
- Vercel
- PWA/service-worker support

Do not add Redux or other heavyweight state libraries without a concrete need.

## Architecture rules
- Keep training content separate from UI code.
- Prefer structured seed data for programs/workouts/drills.
- Design data models before building complex UI.
- Avoid premature abstraction.
- Preserve enough historical session/result data so progress remains meaningful if content changes later.
- Separate child-facing flows from parent/settings flows.
- Offline writes must be durable and sync safely when connectivity returns.

## UX rules
- Mobile-first.
- Large touch targets.
- Strong readability outdoors.
- One primary action per screen where practical.
- Use timers with large numerals.
- Avoid dense tables in child-facing views.
- Avoid fake FIFA-style skill ratings.
- Show real activity and personal progress instead.
- Use celebration sparingly for meaningful moments: personal best, achievement, completed week, completed program.

## Out of scope for v1
Do not implement unless explicitly requested:
- public leaderboards
- child-versus-child rankings
- social feed
- chat or messaging
- coach portal
- team management
- AI coaching
- video analysis
- computer vision
- automatic ball tracking
- payments/subscriptions
- push notifications
- complex permissions

## Development process
For substantial work:
1. Read this file and relevant docs first.
2. State the implementation plan before making broad changes.
3. Prefer small, reviewable phases.
4. Run lint, typecheck and relevant tests before finishing.
5. Report what changed, what was tested, and known limitations.
6. Push back on unnecessary complexity.

## Pull request requirements

Every pull request created by Codex must contain a non-technical summary intended for the product owner.

Use this structure:

### What changed
Explain in plain language what the user will notice.

### Why
Explain which requested behavior this implements or fixes.

### User-facing impact
Describe exactly what changes for a child or parent using Aukaæfing.

### Regression risk
Rate LOW / MEDIUM / HIGH.

Explain:
- existing behavior touched by the change,
- what could plausibly break,
- what was done to check for regressions.

Never claim that regressions are impossible.

### Verification
Report actual results for:
- lint
- typecheck
- tests
- production build
- relevant browser/UI testing

Do not say a check passed unless it was actually run successfully.

### Deployment impact
State whether the change affects:
- Cloudflare configuration
- environment variables
- database/schema
- PWA/service worker
- dependencies

Call out any manual deployment step explicitly.

## Code review priorities

When reviewing Aukaæfing pull requests, prioritize:

1. Regression bugs in existing child-facing flows.
2. Loss or corruption of player progress.
3. Offline/resume failures.
4. Incorrect personal-best calculations.
5. Player data leaking between profiles.
6. Broken mobile/touch behavior.
7. English text appearing in user-facing UI.
8. Training content being altered from the approved source.
9. PWA/install regressions.
10. Cloudflare deployment incompatibilities.

Distinguish:
- confirmed bug,
- credible regression risk,
- suggestion.

Do not block a PR for stylistic preferences.
