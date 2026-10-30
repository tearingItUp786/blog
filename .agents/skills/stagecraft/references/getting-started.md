# Getting started: a first factory

A walkthrough for someone making their first factory. You guide them from what
they want to a factory they have seen work, one step at a time, and check each
step before the next.

Background for you, not a speech for them: a factory is a process written down
as data: **stages** that each do a piece of work and record what it produced
(**artifacts**, such as a draft or a plan) and what was checked (**evidence**,
such as test results or a sign-off), with **gates** that decide when work may
move from one stage to the next, and stops where a person decides. Each piece of
work that goes through it is a **work item**. Agents can do the work inside a
stage, or a stage can run a swamp model or workflow, or a person can do it. So a
factory fits software changes, and it fits just as well a web post, an incident
review, a swamp extension built from an API spec, or any process that can be
said as stages, products and gates. Explain a term in a sentence when it first
matters to them, not up front.

It is a state machine. Each state gates the next: do not move on until the
state's **Verify** passes. If it fails, do what **On failure** says and verify
again. The steps that build the factory are the states of
[authoring.md](authoring.md); this walkthrough links to them for the work and
adds what a newcomer needs around it. Never skip their rules.

```
start → goal_understood → factory_created → validated → seen_in_studio
      → simulated → first_work_item (optional) → graduated
```

## Contents

- [How to talk](#how-to-talk)
- [Before starting](#before-starting)
- [State 1: goal_understood](#state-1-goal_understood)
- [State 2: factory_created](#state-2-factory_created)
- [State 3: validated](#state-3-validated)
- [State 4: seen_in_studio](#state-4-seen_in_studio)
- [State 5: simulated](#state-5-simulated)
- [State 6: first_work_item](#state-6-first_work_item)
- [State 7: graduated](#state-7-graduated)

## How to talk

This holds in every state:

- **One question or one step per turn.** Never show the person a numbered list
  of questions to answer.
- **Each question carries its default**, so a short answer works: "Who takes
  part? I'll assume an agent drafts and a person approves before it goes out."
- **Say each answer back in a line** before the next question.
- **Keep messages short.** Each turn ends in one question, or one step with
  something the person can see.

## Before starting

Look for factories the repo already has:

```sh
swamp model search stagecraft --json
```

- A factory of type `@swamp/stagecraft/factory` exists: the person is past
  getting started. Say so, and ask what they want: to change that factory
  ([authoring.md](authoring.md#change-an-existing-factory)), to make another
  ([authoring.md](authoring.md)), or to drive work through it
  ([driving.md](driving.md)).
- The command fails, or no `@swamp/stagecraft` type can be created: the
  extension is not installed in this repo. Tell the person and stop.
- Nothing yet: begin State 1. Open with two or three sentences: you will set up
  a factory for their process together, and one line naming the steps ("we'll go
  step by step: your process, then the factory, a look at it, and a test run").
  Then ask State 1's first question, and nothing else.

## State 1: goal_understood

**Gate:** none.

**Action:** learn their process in their words, not in factory terms. Ask one
question per turn, in this order, each with what you will assume if they do not
say. Say each answer back in a line, then ask the next. Stop asking once you
have enough to pick an example; take the defaults for the rest and say which.

1. **What process do you want to run?** What goes in at the start, and what
   comes out at the end ("an incident becomes a published review", "a spec
   becomes swamp models").
2. **Who takes part?** Which steps an agent can do, which a person does, and
   which run a tool or a swamp model or workflow. Default: an agent drafts and a
   person approves before it goes out.
3. **Where must a person decide?** Approving something before it goes out,
   signing off, confirming that work is abandoned. Default: once, before it goes
   out.
4. **What counts as done?** Published, released, merged, signed off. Default:
   the end their first answer named.
5. **What sends work back?** A reviewer's finding, a failed check, a person
   asking for changes. Default: a reviewer's finding sends it back one step.

This list is yours. The person sees one question at a time.

**Early exit:** if they already speak in factory terms ("a factory with a plan
stage and a human-approval gate", "start from starter"), they do not need the
walkthrough. Go to [authoring.md](authoring.md) and work through it from its
first state.

Then map the answers. Each step of their process is a stage; what a step hands
on is an artifact; what proves a step went right is evidence; each place a
person decides is a `human-approval` gate; each "goes back when" is a way back
with a bound. Pick the closest example to start from:

| Their process                                      | Start from              |
| -------------------------------------------------- | ----------------------- |
| One step, or just trying it out                    | `minimal`               |
| A software change: plan, implement, check, release | `starter`               |
| Writing that is reviewed, approved and published   | `content-review`        |
| An incident written up, reviewed and signed off    | `incident-review`       |
| An API's OpenAPI spec turned into swamp models     | `openapi-models`        |
| A swamp extension built and released               | `build-swamp-extension` |

For a process none of these fits, take the one with the closest shape (a review
and an approval before something goes out is `content-review`), and rename its
stages and products.

**Verify:** you can say back, in a few lines and in their words, the stages,
where a person decides, what done means and what sends work back, and name the
example you will start from. They agree. A default you said and they did not
change counts as their answer. These answers stand for the interview in
[authoring.md](authoring.md#state-1-interviewed); ask its tracker and landing
questions only if their answers left them open, one at a time, and default the
tracker to the built-in one. Always ask the built-in tracker's prefix, as its
own question: the short word every ticket id and work-item key starts with
(`docs` gives `docs-1`, `docs-2`), offering the tracker's name as the default.

**On failure:** if they cannot say yet, start from `minimal` or the closest
example's own stops, and say so. The factory can change at any time.

## State 2: factory_created

**Gate:** State 1 passed.

**Action:** do [authoring.md State 2](authoring.md#state-2-drafted) with the
example you picked: create the factory and its tracker, write the example in,
and change it to their process. Name stages and products in their words. Rewrite
the prompts for their work: an incident analysis prompt for an incident review,
not a code reviewer's.

**Verify:** the factory exists, its model definition holds a `definition:` under
`globalArguments:`, and its `description` describes their process, not the
example's.

**On failure:** as [authoring.md State 2](authoring.md#state-2-drafted) says.

## State 3: validated

**Gate:** State 2 passed.

**Action:** do [authoring.md State 3](authoring.md#state-3-validated):

```sh
swamp model method run <factory> validate
```

Explain each warning in plain words, without factory terms where you can ("work
can go back to the analysis without limit" rather than "default-cycle-bound"),
using [Findings in plain words](authoring.md#findings-in-plain-words). Fix it,
or keep it only with their agreement.

**Verify:** `validate` succeeds, and every warning left is one the person agreed
to keep.

**On failure:** as [authoring.md State 3](authoring.md#state-3-validated) says.

## State 4: seen_in_studio

**Gate:** State 3 passed.

**Action:** do [authoring.md State 4](authoring.md#state-4-shown): start the
studio, give the person its URL, and walk them through the drawing, one part per
turn: the path a piece of work takes, where it stops for them, and where it can
go back. Take their change requests, in plain words or as **Copy reference**
lines, and go back to State 3 for each.

**Verify:** the person says the design is right.

**On failure:** as [authoring.md State 4](authoring.md#state-4-shown) says.

## State 5: simulated

**Gate:** State 4 passed.

**Action:** let the person see work move through the factory before any real
work does. Ask which path matters most to them ("a review that finds a problem
sends it back", "nothing is published until I approve"). Write it as a saved
scenario in the factory's `scenarios:` list ([scenarios.md](scenarios.md)), with
`expect` steps that say what must happen, then run:

```sh
swamp model method run <factory> validate
```

Tell them what the scenario showed, in their words. Then offer **Simulate** in
the studio: it plays the saved scenarios step by step, and from any step they
can walk the work on by hand. A walk they copy to you with **Copy as scenario**
is a draft: see
[scenarios.md](scenarios.md#a-walk-the-person-copied-from-the-studio).

**Verify:** `validate` reports the new scenario passed, and the person has seen
the path it walks, in Simulate or as you described it.

**On failure:** a failing scenario means the factory or the scenario is wrong.
Show the person the failing step and ask which; never weaken an `expect` to pass
without their word.

## State 6: first_work_item

**Gate:** State 5 passed. This state is optional: ask whether they want to put a
real piece of work through now.

**Action:** do [authoring.md State 5](authoring.md#state-5-started) on the
built-in tracker: file a ticket for the work, claim it, and start its work item.
Then drive it with [driving.md](driving.md) until it reaches the first stop
where the person decides, and lay that stop out as
[driving.md](driving.md#human-stops) says: what the gate is for, every way on,
and their choice.

```sh
swamp model @swamp/stagecraft/work-item method run status <key>
```

**Verify:** `status` shows the work item waiting on the person at a human stop,
and you have laid it out for them. If the studio is open, point them at its
Board (`/f/<factory>/board` after the studio's URL): the work item's card is in
that stage, marked as waiting on them.

**On failure:** a refused `start` or write is in
[SKILL.md](../SKILL.md#when-something-is-refused). If they would rather not
start real work, skip to State 7.

## State 7: graduated

**Gate:** State 5 passed, and State 6 passed or was skipped.

**Action:** sum up what they have: the factory's name, its stages, where it
stops for them, and the scenario that keeps the path they cared about. Offer two
or three next steps tied to their goal, as one question, and do the one they
pick:

- Change the factory: a new stage, another reviewer, a different stop
  ([authoring.md](authoring.md#change-an-existing-factory)).
- Keep their tickets in Linear instead of the built-in tracker
  ([authoring.md](authoring.md#the-tracker)).
- Save another path as a scenario, so a later change cannot break it
  ([scenarios.md](scenarios.md)).
- Start and drive the next piece of work ([driving.md](driving.md)).
