# Aukaæfing — Product Specification

## 1. Purpose

Aukaæfing is an Icelandic-language football training web app for children.

It helps children:
- complete extra individual football practice,
- follow a structured program,
- record measurable results,
- improve their own personal bests,
- build consistent practice habits,
- stay motivated without being compared to other children.

The first training program comes from `docs/training-plan.md`, derived from the supplied 4-week PDF for 10–12-year-old football players.

The PDF is content for the first program. It is not the application architecture.

---

## 2. Core product principle

The main question for every design decision is:

> Can a child open Aukaæfing, tap their profile, tap “HEFJA ÆFINGU”, complete a useful football practice and record progress without needing an adult to explain the app?

If a feature makes that flow harder, simplify it.

---

## 3. Users and account model

### Family account
A single parent/family account can contain multiple player profiles.

Examples:
- one child,
- sibling,
- friend who occasionally trains on the same device.

### Player profile
Each player has independent:
- completed sessions,
- drill results,
- personal bests,
- XP,
- level,
- achievements,
- weekly progress,
- program progress,
- training history.

Suggested player fields:
- `id`
- `family_id`
- `name`
- `avatar`
- `birth_year`
- `preferred_foot`
- `created_at`
- `archived_at`

### Authentication
Authentication is at the family/parent level.

Children do not authenticate individually.

Prefer simple Supabase authentication, ideally passwordless email magic link unless there is a strong reason to do otherwise.

The app should remember the most recently active player where appropriate.

---

## 4. Multi-player design

The app must not use a default competitive ranking between players.

Do not create:
- sibling leaderboards,
- friend rankings,
- “best player” comparisons.

Each child is primarily compared with their own previous performance.

The architecture may later support cooperative challenges, but these are out of scope for v1.

---

## 5. Target devices

Primary:
- phone portrait,
- tablet portrait,
- tablet landscape.

Desktop should work responsively but is not the priority.

The app should be installable as a PWA on:
- iOS/iPadOS,
- Android.

---

## 6. Language

All user-visible UI must be Icelandic.

Code identifiers, database names and developer documentation may be English.

Use proper Icelandic characters:
`á é í ó ú ý þ æ ö ð`

Centralize reusable UI copy where practical.

---

## 7. Visual direction

The visual design should feel:
- modern,
- energetic,
- football-oriented,
- simple,
- age-appropriate for roughly 8–12,
- not preschool-like.

Prefer:
- strong typography,
- large touch targets,
- generous spacing,
- simple icons,
- cards,
- subtle football-pitch cues,
- clear progress indicators.

Avoid:
- corporate dashboard aesthetics,
- cartoon overload,
- tiny controls,
- dense tables,
- excessive gradients,
- excessive animation.

---

## 8. Navigation

Primary child-facing navigation:

- `HEIM`
- `ÆFINGAR`
- `FRAMFARIR`

Profile/avatar control can expose:
- player switching,
- parent/settings area.

Do not put admin features prominently in the child flow.

---

## 9. Player selection

When more than one player exists, show large profile cards.

Example:

> HVER ÆFIR?

- avatar + Guðmundur
- avatar + Björn
- `+ Bæta við leikmanni`

Player selection should require one tap.

---

## 10. Home screen

The player home screen is the most important screen.

It should prominently show:
- player identity/avatar,
- next recommended workout,
- large `HEFJA ÆFINGU` CTA,
- approximate duration,
- required equipment,
- weekly goal progress,
- XP/level,
- latest personal best,
- shortcut to short practice.

Example structure:

> Aukaæfing  
> Guðmundur — Stig 3

> NÆSTA ÆFING  
> Sendingar í vegg  
> 30–40 mín  
> Bolti • Veggur

> [ HEFJA ÆFINGU ]

> Markmið vikunnar  
> ● ● ○  
> 2 af 3 æfingum kláraðar

> Nýjasta met  
> 34 sendingar í röð

> [ ÉG HEF BARA SMÁ TÍMA ]

Do not overload this screen with analytics.

---

## 11. Training content model

Training content must not be hard-coded in React components.

Suggested hierarchy:

```text
TrainingProgram
  -> Week / Phase
      -> Workout
          -> Drill
              -> optional Challenge / Measurement
```

### TrainingProgram
Suggested fields:
- `id`
- `slug`
- `title`
- `description`
- `target_age_min`
- `target_age_max`
- `number_of_weeks`
- `active`
- `version`

### Week / Phase
Suggested fields:
- `id`
- `program_id`
- `week_number`
- `title`
- `focus`
- `order`

### Workout
Suggested fields:
- `id`
- `program_id`
- `week_id`
- `order`
- `title`
- `description`
- `estimated_minutes_min`
- `estimated_minutes_max`
- `required_equipment`
- `coaching_focus`
- `skill_categories`
- `is_short_session`

### Drill
Suggested fields:
- `id`
- `title`
- `instructions`
- `duration_seconds`
- `repetitions`
- `rest_seconds`
- `timer_mode`
- `media`
- `measurement_type`
- `measurement_total`
- `coaching_point`
- `weaker_foot`
- `order`

### Supported measurement types
At minimum:
- `COUNT_HIGHER_IS_BETTER`
- `TIME_LOWER_IS_BETTER`
- `SUCCESS_OUT_OF_TOTAL`
- `REPETITIONS_WITHOUT_ERROR`
- `COMPLETED`

Store all result history, not just the best value.

---

## 12. Program freedom

Use a recommended path but do not hard-lock workouts.

The UI should highlight:
- next recommended workout.

But allow:
- repeating an earlier workout,
- browsing other workouts,
- repeating a challenge to try to beat a personal best.

Repetition should be treated positively.

---

## 13. Workout preparation

Before starting a workout, show a simple setup screen.

Example:

> SENDINGAR Í VEGG

> Þú þarft:
> - Bolta
> - Vegg
> - Um 35 mín

> Í dag æfir þú:
> Sendingar og fyrstu snertingu

> [ BYRJA ]

Keep setup concise.

---

## 14. Active workout experience

Display one drill at a time.

Example:

> 2 af 5

> TVÆR SNERTINGAR

> Sendu í vegg.  
> Fyrsta snerting til hliðar.  
> Sendu aftur.

> 10 mín

> [ BYRJA TÍMA ]

Then:

> [ KLÁRAÐ ]

Requirements:
- one drill per screen,
- large controls,
- short Icelandic instructions,
- visible workout progress,
- minimal scrolling,
- minimal typing,
- strong outdoor readability.

Do not show the full source table during an active workout.

---

## 15. Timers

Timers should support:
- start,
- pause,
- reset where appropriate,
- large numerals,
- clear completion signal,
- orientation changes.

Where a drill uses intervals, support work/rest cycling.

Timers must continue to function offline.

---

## 16. Result entry

The child records their own result.

No adult verification is required.

Prefer:
- large `+ / -` controls,
- preset values,
- simple counters,

over opening the phone keyboard.

Parents can correct accidental entries later.

---

## 17. Personal bests

Personal improvement is the strongest gamification mechanic.

Before a measurable attempt, show the previous best when one exists.

Example:

> ÞITT MET  
> 31 sending

After a better result:

> NÝTT MET!

> Þú bættir metið um 3.

Personal-best logic must be per player and per comparable measurement.

Store:
- attempt history,
- value,
- date/time,
- session,
- drill/challenge identifier,
- measurement type.

Do not delete old results when a new best is created.

---

## 18. XP

XP rewards participation and consistency more than athletic ability.

Award XP for:
- completing drills,
- completing workouts,
- optional challenges,
- weekly consistency,
- weaker-foot work,
- personal bests.

Base workout XP should be similar for two children who complete the same session, even if one performs better.

Performance is rewarded mainly through personal-best celebration, not through large XP gaps.

Avoid multiple currencies.

---

## 19. Levels

Use a simple XP-based level system.

Example:
- Level 1
- Level 2
- Level 3
- etc.

Levels provide visible long-term progress without dominating the product.

Do not build complicated progression trees in v1.

---

## 20. Weekly goals

Use forgiving weekly goals rather than daily streaks.

Default concept:

> MARKMIÐ VIKUNNAR

> ● ● ○

> 2 af 3 æfingum kláraðar

Missing one day must not erase progress.

Completing the weekly goal can award XP and a small celebration.

The exact number of recommended weekly sessions may come from program metadata.

---

## 21. Achievements

Achievements are Phase 2, not required for the first functional loop.

Suggested initial achievements:
- Fyrsta aukaæfingin
- 3 æfingar kláraðar
- 5 æfingar kláraðar
- 10 æfingar kláraðar
- Fyrsta persónulega metið
- 5 persónuleg met
- Veikari fóturinn
- Heil vika kláruð
- 100 góðar sendingar
- 10 skot á mark

Achievements should be data-driven/configurable.

Avoid large numbers of meaningless badges.

---

## 22. Short practice

The source plan includes 5-, 10- and 15-minute short practices.

Expose them prominently.

CTA:

> ÉG HEF BARA SMÁ TÍMA

Then:

> Hvað hefurðu mikinn tíma?

> [ 5 MÍN ]  
> [ 10 MÍN ]  
> [ 15 MÍN ]

Short sessions:
- earn XP,
- count toward general training statistics,
- do not automatically count as completing a scheduled main workout.

---

## 23. Workout completion

Completion should feel rewarding but restrained.

Example:

> VEL GERT!

> Æfingu lokið

> +80 XP

> NÝTT MET  
> 34 sendingar

> Markmið vikunnar  
> ● ● ●  
> 3 af 3 æfingum kláraðar

Then:

> [ KLÁRA ]

Optionally show:
- next recommended workout,
- new achievement,
- new personal best.

Use confetti/animation sparingly for meaningful moments only.

---

## 24. Progress screen

Progress is player-specific.

Show real information such as:
- workouts completed,
- minutes practiced,
- program progress,
- weekly progress,
- XP and level,
- personal-best history,
- activity by skill category,
- achievements when implemented.

Suggested skill categories:
- Boltastjórn
- Fyrsta snerting
- Sendingar
- Gabb
- Skot
- Veikari fótur

Do not generate fake ability ratings such as:
- `Sendingar: 82/100`

unless there is a real, defensible calculation.

Prefer:

> SENDINGAR  
> 7 æfingar  
> 3 persónuleg met

---

## 25. Parent/settings area

Keep parent functionality separate from the child's main flow.

Parents should be able to:
- add player,
- edit player,
- archive/delete player,
- switch player,
- inspect practice history,
- correct/delete incorrect results,
- manage basic account settings.

Do not build extensive parental controls in v1.

---

## 26. Offline requirements

Offline workout execution is required.

At minimum, offline mode must allow:
- application shell to load,
- cached program/workout content,
- active workout execution,
- timers,
- result entry,
- workout completion,
- durable local storage of unsynced session data.

When connectivity returns:
- sync pending writes,
- avoid duplicates,
- preserve local data until the server confirms success,
- expose sync state internally,
- do not allow connectivity loss to erase progress.

Prefer a simple robust sync queue rather than complex real-time behavior.

---

## 27. PWA requirements

The app must include:
- web app manifest,
- installable PWA behavior,
- standalone display mode,
- theme/background metadata,
- app icon placeholders,
- service worker/offline support,
- iOS/iPadOS home-screen compatibility,
- Android home-screen compatibility.

---

## 28. Media architecture

Drills should support future:
- image,
- illustration,
- short animation,
- instructional video.

Do not make media production part of v1.

Use placeholders only where needed.

---

## 29. Initial technical stack

Preferred:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL via Supabase
- Vercel
- PWA/service worker support

Prefer simple state management.

Do not introduce Redux or equivalent unless justified by a concrete requirement.

---

## 30. Suggested data entities

At minimum consider:

### Identity
- `families`
- `players`

### Training content
- `training_programs`
- `program_weeks`
- `workouts`
- `drills`
- `workout_drills`

### Activity
- `training_sessions`
- `drill_results`

### Progress
- `personal_bests` or computed/cached equivalent
- `achievements`
- `player_achievements`

Weekly goal state may be calculated from sessions unless a dedicated table is clearly useful.

Avoid needless database complexity.

---

## 31. Historical integrity

Training history should remain understandable if content is edited later.

For completed sessions, preserve enough snapshot data or version references to know:
- which program version was used,
- which workout was completed,
- which drill/result definition applied.

Do not build an elaborate event-sourcing system.

---

## 32. Initial training program

The first program is:
- 4 weeks,
- 12 main workouts,
- 3 workouts per week,
- intended for ages 10–12,
- mostly 30–45 minutes,
- plus optional 5/10/15-minute short practices.

See:
- `docs/training-plan.md`

Do not automatically adjust the training content based on player age.

The data model must allow future programs such as:
- 7–9 years,
- 10–12 years,
- ball-control focus,
- shooting focus,
- goalkeeper-specific programs.

---

## 33. Out of scope for v1

Do not implement:
- public leaderboards,
- player-versus-player rankings,
- chat,
- messaging,
- social feed,
- team management,
- coach portal,
- AI coaching,
- video analysis,
- computer vision,
- automatic ball tracking,
- payments,
- subscriptions,
- push notifications,
- complex permissions.

---

## 34. Delivery phases

### Phase 0 — planning
Before broad implementation:
1. review this spec,
2. review `docs/training-plan.md`,
3. propose application architecture,
4. propose information architecture,
5. define main user flows,
6. propose database schema,
7. propose training-content schema,
8. define personal-best/result logic,
9. define offline/sync approach,
10. define PWA approach,
11. propose directory structure,
12. propose test strategy,
13. identify unnecessary MVP complexity,
14. produce implementation phases.

Do not ask about minor UI choices that are easy to change later.

### Phase 1A — foundation
Implement:
- Next.js/TypeScript/Tailwind project,
- basic PWA shell,
- mobile layout/navigation,
- training content types,
- initial structured seed data,
- player selection,
- basic player home screen.

Do not yet implement:
- full Supabase auth,
- offline sync,
- achievements,
- detailed progress,
- full XP logic.

### Phase 1B — core training loop
Implement:
- family/player persistence,
- workout browsing,
- workout preparation,
- drill-by-drill workout flow,
- timers,
- result entry,
- session completion,
- personal-best detection/history,
- basic XP,
- weekly goal,
- basic progress screen.

### Phase 1C — offline + reliability
Implement:
- PWA install behavior,
- cached training content,
- durable local session/result writes,
- sync queue,
- conflict/duplicate protection,
- test offline workout completion.

### Phase 2 — engagement
Implement:
- achievements,
- level polish,
- better PB celebrations,
- short-session UX,
- richer progress views,
- tablet layout improvements.

### Phase 3 — polish / expansion
Later:
- exercise illustrations/media,
- additional programs,
- cooperative family challenges,
- richer training history,
- onboarding/install polish.

---

## 35. MVP success criteria

The MVP is successful if a child can:

1. open the app,
2. select their profile,
3. see the next recommended workout,
4. start it,
5. follow drills one at a time,
6. use timers where needed,
7. record a result,
8. see whether it is a personal best,
9. complete the workout,
10. retain progress even if connectivity is poor,
11. return later and continue.

Everything else is secondary.
