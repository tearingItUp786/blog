# Authoring a stagecraft factory

A factory is made and changed by you, the agent, never by hand: the person says
what their process is, and you write the factory definition, check it, show it,
and start the first work item. This is the only way anyone gets a factory, so
work through it in order. For someone making their first factory, walk them
through [getting-started.md](getting-started.md) instead; it runs these states
with them.

It is a state machine. Each state gates the next: do not move on until the
state's **Verify** passes. If it fails, do what **On failure** says and verify
again.

```
start → interviewed → drafted → validated → shown → started
```

## Contents

- [Before starting](#before-starting)
- [State 1: interviewed](#state-1-interviewed)
- [State 2: drafted](#state-2-drafted)
- [State 3: validated](#state-3-validated)
- [State 4: shown](#state-4-shown)
- [State 5: started](#state-5-started)
- [The tracker](#the-tracker)
- [Authoring rules](#authoring-rules)
- [Findings in plain words](#findings-in-plain-words)
- [Change an existing factory](#change-an-existing-factory)

## Before starting

Look for factories and trackers the repo already has:

```sh
swamp model search stagecraft --json
```

- No factory of type `@swamp/stagecraft/factory` exists yet: this is the
  person's first. Go to [getting-started.md](getting-started.md) instead, unless
  they already describe the factory in its own terms (stages, gates, an example
  by name).
- A factory of type `@swamp/stagecraft/factory` exists and the person wants to
  change it: go to [Change an existing factory](#change-an-existing-factory).
- A tracker exists (`@swamp/stagecraft/tracker` or `.../linear`): the new
  factory uses it, so skip the tracker question.
- A studio exists (`@swamp/stagecraft/studio`): State 4 uses it as `<studio>`,
  so skip creating one there.
- The command fails, or no `@swamp/stagecraft` type can be created: the
  extension is not installed in this repo. Tell the person and stop.

## State 1: interviewed

**Action:** ask one question per turn, in this order, and say what you will
assume for each, so a short answer ("the default is fine") is enough. Say each
answer back in a line before the next. Someone who knows the terms can go
faster: skip what they have already answered. Never show the person a numbered
list of questions; this list is yours.

1. **What is the factory for?** The work it carries, in their words ("docs
   changes", "bug fixes to the API"). This names the factory (a short lowercase
   name, such as `docs`) and picks the example to start from.
2. **Which tracker?** Where the work's tickets live. The default is the built-in
   tracker, which keeps tickets in this repo. The other choice is Linear. With
   no tickets at all, work items start under a key chosen by hand, which is fine
   for a trial.
3. **Which prefix?** For the built-in tracker: a short word that leads every
   ticket id and work-item key, such as `docs` for `docs-12`. Lowercase letters,
   digits and `-`, at most 12 characters. The default is the tracker's name. A
   Linear tracker's keys are its issue ids as-is (`ABC-12` gives `abc-12`), so
   this question is only for the built-in one.
4. **Where must a person decide?** Each human stop: approving a plan, approving
   a release, confirming that work is abandoned. The default is the starting
   example's stops. Ask which to add or remove.
5. **What counts as done?** The last thing that happens: merged, released,
   deployed, published, or just reviewed.
6. **How does work land?** Pull request, direct commit, release command, publish
   step. Name the command or place, since a stage records it.

Last, and only if they want to: ask for any path they want kept ("a plan always
waits for me", "a failed check always goes back to implement"). Each becomes a
saved scenario in State 3.

**Verify:** you have an answer, or a default you said and they did not change,
for all six. Say back what you understood in a few lines before you write
anything.

**On failure:** if they cannot say yet, take the defaults and say which ones.
The factory can change later.

## State 2: drafted

**Gate:** State 1 passed.

**Action:** never write a factory definition from scratch. Copy the example
closest to the interview, then change it:

| Their process                                     | Start from              |
| ------------------------------------------------- | ----------------------- |
| One step, or trying stagecraft out                | `minimal`               |
| A change: plan, implement, check, review, release | `starter`               |
| Writing reviewed, approved and published          | `content-review`        |
| An incident written up and signed off             | `incident-review`       |
| An OpenAPI spec turned into swamp models          | `openapi-models`        |
| A swamp extension                                 | `build-swamp-extension` |

`starter` fits most software changes; for another process, start from the
example with the closest shape and rename its stages and products. Create the
factory with its tracker instance (`<tracker>`, set up in step 5) as its only
argument, then write the example into it:

```sh
swamp model create @swamp/stagecraft/factory <factory> \
  --global-arg tracker=<tracker> --json
# agent: write <starter> into <factory>
```

The factory's model definition is
`models/@swamp/stagecraft/factory/<factory>.yaml`. It is the one copy of the
factory definition. Open it and put the example's two blocks, `definition:` and
`scenarios:` from `references/examples/<starter>.yaml`, under its
`globalArguments:`, right after its `tracker:` line and before `methods:`, each
indented two more spaces. Leave every other line of the file as swamp wrote it.
Never replace a `definition:` that is already there: that factory exists, so go
to [Change an existing factory](#change-an-existing-factory). Then edit the
definition in that file:

1. Do what the example's `description` says under "Change first".
2. Rewrite `description` for this process: what it is for, where a person
   decides, what done means. Keep its "Change first" line only if something is
   still left to change.
3. Apply the interview. Add or remove `human-approval` gates for the human
   stops, make the last stage before done do what "done" means, and put the
   landing command in the stage that lands the work (its `command` or
   `systemPrompt`).
4. Follow the [authoring rules](#authoring-rules).
5. Set up the tracker the person chose: see [The tracker](#the-tracker).

**Verify:** the factory's model definition holds a `definition:` under
`globalArguments:`, and its `description` is about this process, not the
example.

**On failure:** if `model create` fails because the name is taken, pick another
name or go to [Change an existing factory](#change-an-existing-factory).

## State 3: validated

**Gate:** State 2 passed.

**Action:** write a saved scenario for each path the person asked to keep (in
the factory's `scenarios:` list, format in [scenarios.md](scenarios.md)), then
check the whole factory:

```sh
swamp model method run <factory> validate
```

`validate` checks the definition's schema and references, analyses its stage
graph, and runs its saved scenarios. swamp checks the schema first, before any
factory method runs: a schema error stops `validate` with
`Global arguments validation failed: <message> at "definition.<path>"` (or
`scenarios.<path>`), and `swamp model validate <factory>` shows the same. Read
every line it prints. For each problem, tell the person what it means in plain
words (see [Findings in plain words](#findings-in-plain-words)), fix the
definition, and run `validate` again.

**Verify:** `validate` succeeds, and every warning left is one the person has
heard in plain words and agreed to keep. An error never stays.

**On failure:** a problem you cannot fix without changing what the person asked
for goes back to them as a question, with the choices. Never weaken a scenario's
`expect` to make `validate` pass without their word.

## State 4: shown

**Gate:** State 3 passed.

**Action:** show the person the design in the studio, a local page that draws
every factory in the repo and redraws it as you save. Create the studio unless
[Before starting](#before-starting) found one, then start it in the background,
since `serve` runs until Ctrl-C:

```sh
swamp model create @swamp/stagecraft/studio <studio> --json
# background: runs until Ctrl-C, and logs its URL
swamp model method run <studio> serve
```

`serve` logs a line such as `studio: http://127.0.0.1:38813/`. Give the person
that URL to open in a browser, and leave the studio running. When the factory
lives on a deployed swamp serve instead of this repo, start `serve` with that
serve's URL as `server`; see
[driving.md](driving.md#the-studio-on-a-deployed-serve).

Walk them through Design mode: the path a work item takes, where it stops for
them (the gold gates), where it can loop back, and any findings `validate` left,
each of which they can select to see its trace on the graph.

Then tell them how to change the factory while the page is open:

- The page is read-only. Every change goes through you: they ask for it in plain
  words, or select a stage, exit, gate or finding, use **Copy reference**, and
  paste you the line (read it as [driving.md](driving.md#set-up-a-factory)
  says).
- You edit the factory's model definition and run `validate`. The studio redraws
  and checks the definition again on each save, and marks the stages that
  changed until they select them, so they see each change land.
- **Simulate** is there if they want to explore: it plays the saved scenarios
  from State 3 on the engine, and from any frame they can walk the work item on
  by hand. A walk they paste you from **Copy as scenario** is a draft: see
  [scenarios.md](scenarios.md#a-walk-the-person-copied-from-the-studio).

Apply each change request as an edit to the definition, or to its scenarios,
then go back to State 3. The page is already showing the result.

**Verify:** the person says the design is right.

**On failure:** if `serve` logs no URL, another `serve` of the same studio is
already running and holds its lock: ask the person for its URL. If you cannot
run a command in the background, ask the person to run `serve` and paste you the
URL. If they cannot open the page, describe the stages, the human stops and the
loops in a short list instead.

## State 5: started

**Gate:** State 4 passed.

**Action:** start the first work item, with a title the person gives: file a
ticket for it on the factory's tracker, claim the ticket, and run the `start`
command `claim` prints ([driving.md](driving.md#start-from-a-ticket)). On the
built-in tracker:

```sh
swamp workflow run @swamp/stagecraft/create --input tracker=<tracker> \
  --input 'title=<title>' --input 'body=<body>' --input 'type=<type>'
swamp workflow run @swamp/stagecraft/claim --input tracker=<tracker> \
  --input issue=<ticket> --input factory=<factory>
swamp model @swamp/stagecraft/work-item method run start <key> \
  --input factory=<factory> --input 'title=<title>' \
  --input 'externalRefs=<external-refs>'
swamp model @swamp/stagecraft/work-item method run status <key>
```

`create` prints the ticket's id, the prefix and a number (`docs-1`). `claim`
names the work item after it (the first work item on `docs-1` is `docs-1`) and
prints the `start` command, with the ticket's ids in `externalRefs`; run it as
printed. Never start a ticket's work item under a key you chose.

**Verify:** `status` prints the initial stage.

**On failure:** `start` checks the definition's schema again, so a refusal there
means the file changed after State 3: validate again.

Then drive the work item with [driving.md](driving.md), or tell the person how
to start the next one.

## The tracker

Offer the built-in tracker and Linear, and a tracker written as a separate
extension when the person has one (see "Another tracker" below). Never offer or
set up the swamp-club Lab tracker (`@swamp/stagecraft/swamp-club`): it is for
the swamp-club team's own repositories and needs a swamp-club team account, so
it is not an option for anyone else.

Create the tracker's adapter instance once per project, next to the factory. The
factory names it (its `tracker` argument), and `validate` refuses the factory
until an instance of that name exists with the type the definition's
`tracker.kind` needs. A work item finds its ticket through its `externalRefs`,
which `claim` sets.

**Built-in** (the default, when the definition names no `tracker.kind`): tickets
kept in swamp data, with ids like `docs-12`: the prefix the person chose, then a
number counted per prefix:

```sh
swamp model create @swamp/stagecraft/tracker <tracker> \
  --global-arg prefix=<prefix> --json
```

Without `prefix`, the tracker's name, cut to 12 characters, is the prefix.
Changing it later affects only new tickets: existing ids and keys never change.

Its statuses default to `open`, `in_progress`, `shipped` and `closed`, the keys
the examples use. Every `tracker: { status: <key> }` in the definition must be
one of them, or `publish` refuses that stage. To use other keys, add a
`statuses` list to the tracker's global arguments that has every key the
definition uses.

**Linear**: add `tracker: { kind: linear }` at the top of the definition, create
the instance, then set its global arguments in the model file that
`model create` prints. Put the API key in a vault first and refer to it from
`apiToken`; never write the key into the file. `statuses` maps each status key
the definition uses to a Linear state, `teamId` is the team new issues go to,
and `types` maps ticket types to label names. A work item's key is its issue's
id as-is (`ABC-12` gives `abc-12`); `prefix`, the team's short name, does not
rename it:

```sh
swamp model create @swamp/stagecraft/linear <tracker> --json
```

**Another tracker**: a tracker written as a separate extension (the person's
own, for Jira, GitHub Issues or an in-house system) is reached through a
publisher. Install the tracker's extension, create its instance and set it up as
its README says, then have it describe itself once:

```sh
swamp model method run <their-tracker> describe
```

Create a publisher in front of it, naming the tracker instance, and set its
`statuses` (each status key the definition uses, mapped to the tracker's status
name) in the model file `model create` prints:

```sh
swamp model create @swamp/stagecraft/publisher <tracker> \
  --global-arg tracker=<their-tracker> --json
```

Add `tracker: { kind: <name> }` at the top of the definition, where `<name>` is
the name the tracker described itself by
(`swamp data get <their-tracker> description` shows it), and bind the factory to
the publisher, `<tracker>`. `validate` refuses the factory until the tracker has
described itself under that name. Every tracker workflow then takes
`--input tracker=<tracker>`, as for the trackers stagecraft ships. To check a
tracker the person is writing, run `@swamp/stagecraft/conformance` on a
publisher in front of a test instance of it (the writing-a-tracker guide,
`TRACKERS.md` in the stagecraft extension, says what it checks).

## Authoring rules

These carry the lessons of the 2026-09-29 trial, where a one-character change
went through five rounds of plan review.

1. **Every loop has a reason and a bound.** A way back is either gated on data
   (a `findings-open` gate on a blocking finding, a failed check) or `manual`,
   so a person chooses it. Give each one a `description` saying why it goes
   back. Bound it with `maxCycles` on one of the loop's stages, or route on the
   count with a `max-cycles` gate. `validate` warns about a loop left on the
   default limit, and about a way back with no `description`.
2. **Review prompts carry a severity rubric and a sense of proportion.** A
   reviewer told only to "not soften" findings rates every concern as high, and
   with an automatic `rework`, each costs a full round. The prompt must say what
   each severity means: high or critical only for something that would ship a
   defect or cannot work, not for how a test is run or how a step is worded. It
   must also say that findings scale with the change, so a small change gets a
   short review. Start from the review prompts in the examples.
3. **Decide what each reviewer sees, through `inject`.** `work.context.inject`
   names the products handed to the stage's work. Give a reviewer what it
   reviews (the plan, the change summary) and what it checks against, not
   everything recorded so far.
4. **Say why in `description` fields, not comments.** You will rewrite this
   file, and comments do not survive that; the studio shows descriptions, not
   comments. Every stage, gate and way back that needs a reason has a
   `description`, and the definition's own `description` says what the factory
   is for.
5. **Declare every product with a schema.** An artifact or evidence without a
   `schema` accepts anything, so a wrong payload goes through. With one, a
   payload that does not fit is refused and kept as retry feedback. Findings
   products use `kind: findings`, which brings its own schema.
6. **Let long work resume after a restart.** A stage whose work can be cut short
   by a restart (a long agent session in a `method` stage on a remote worker)
   keeps `maxInterruptionsPerCycle` (default 3) unless there is a reason to
   change it: interrupted dispatches count against it, not against
   `maxDispatchesPerCycle`. For the method to checkpoint and resume, it needs
   the work item, its dispatch id and the checkpoint to resume from. Declare a
   `_stagecraft` argument on the method, and declare the same property in the
   stage's `inputsSchema`. Declare only that property, and leave the others open
   (no `additionalProperties: false`), so opting in checks nothing else:

   ```yaml
   work:
     mode: method
     method: { modelIdOrName: agent, methodName: run }
     inputsSchema:
       type: object
       properties:
         _stagecraft:
           type: object
           required: [workItem, dispatchId, resume]
           properties:
             workItem: { type: string }
             dispatchId: { type: integer }
             resume: { type: [object, 'null'] }
   ```

   Without the declaration nothing is added: swamp refuses an input a method
   does not declare. REFERENCE.md gives the input's full shape.

7. **Name run data under `let`, and send only what a call takes.** Each value
   from run data is a bare CEL expression under `work.let`, used in text as
   `{{name}}`: the prompts, and a workflow or method call's target
   (`modelIdOrName: "agent-{{workItem}}"`). A call sends only the let values its
   `passAsInputs` lists, so list exactly the method's or workflow's arguments:
   swamp refuses an input a method does not declare. A value from run data that
   fills a target must be a name swamp accepts, or the dispatch is refused.

## Findings in plain words

`validate` prints each problem with its path in the file (`stages.2` is the
third stage). Schema and reference errors name the field that is wrong. The
graph analysis names stages and transitions. What each graph finding means, and
the usual fix:

| Finding                 | The message says                                         | In plain words                                                        | Usual fix                                                                  |
| ----------------------- | -------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| unreachable-stage       | "can never be entered from initial stage"                | No path leads to this stage.                                          | Add a transition to it, or remove it.                                      |
| dead-end                | "no transition that can pass leads ... to a terminal"    | Work that reaches this stage can never finish.                        | Add a way on, or a gate that can pass.                                     |
| gate-never-passes       | "can never pass from stage"                              | A transition waits for something that never happens on the way there. | Record the product in an earlier stage, or change the gate.                |
| ambiguous-exit          | "can both pass with no person choosing"                  | Two ways out can open at once, and nothing picks one.                 | Make one `manual`, give it a `human-approval` gate, or make gates exclude. |
| escape-only             | "only through a global transition"                       | The loop's only way out is `abandon`.                                 | Add a real way forward out of the loop.                                    |
| default-cycle-bound     | "bounded only by the default cycle limit"                | The loop may run five times before anything stops it.                 | Set `maxCycles` on one of its stages, or gate it with `max-cycles`.        |
| undescribed-way-back    | "goes back with no description"                          | A transition back to this or an earlier stage does not say why.       | Give it a `description` saying why it goes back.                           |
| product-missing-on-path | "which this path to it does not produce" / "no path ..." | A stage injects, gates on or reads in CEL a product a route lacks.    | Record it on every route, gate where it exists, or guard with `has()`.     |
| needs-cycle-override    | the transition, then why the cycle limits close it       | A transition opens only if a person grants an override.               | Raise `maxCycles`, or accept it: it is the loop limit working.             |
| exploration-truncated   | "stopped at ... states"                                  | The graph was too big to check fully, so some checks were skipped.    | Simplify the loops, or accept the warning.                                 |
| target-name             | "a name swamp would not create today"                    | A call names a model or workflow in a form swamp no longer creates.   | Fix the name, or keep it if it is an older model that still exists.        |

The first three are errors and fail `validate`. The rest are warnings: fix them
unless the person agrees to keep one, since each is a real way a work item can
get stuck or loop.

A saved scenario that fails is printed as
`scenarios.<index> (<name>) step <n> (<label>): <message>`. Either the scenario
or the definition is wrong: read the message, and if it is not clear which, ask
the person.

## Change an existing factory

Work items already running are not affected by an edit. Each work item pinned a
copy of the definition when it started, and works on that copy to the end.

Never change `schemaVersion` by hand. A definition at an older version is
upgraded by stagecraft itself when it is read, and `validate` writes the upgrade
into the factory's file; a newer one needs a newer @swamp/stagecraft
(`swamp extension pull @swamp/stagecraft`).

1. **Edit in place** by default: change the definition in
   `models/@swamp/stagecraft/factory/<factory>.yaml`, update or add saved
   scenarios for what changed, and go through State 3 and State 4 again. New
   work items start on the edited definition.
2. **Move a running work item** to the edited definition only on the person's
   word. `reset` with `repin=true` does it, and starts the item over at the
   initial stage ([driving.md](driving.md#ways-back-so-nothing-wedges)).
3. **Use a new name** (a new factory with its own definition, made through State
   2 to State 5) instead, when either is true:
   - work items that are running could not reach done under the new definition;
   - a stage, product or schema is renamed or removed that a tracker, a saved
     scenario or another tool depends on.

   Keep the old factory until its running work items finish.

Never weaken a scenario's `expect` to make the changed definition pass without
the person's word: the scenario may be catching a real break.
