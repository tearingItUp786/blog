# Worked example: build-swamp-extension

One work item driven from start to `done` on
[build-swamp-extension.yaml](build-swamp-extension.yaml), by the pull-request
route:

```
plan → plan-review → implement → check → code-review → release → done
```

Along the way:

- a plan is rejected by its schema and recorded again;
- the person declines the plan, and their feedback sends the work back by the
  manual `revise`;
- the person waives the quality score (the extension has no manifest yet);
- the person approves the plan and the release.

Every command here is run, in this order and as written, by
`integration/extension/skill_test.ts` against a real swamp repo. Output is from
such a run, trimmed to the lines that matter. `<key>` stands for the key `claim`
gives the work item (`team-1`, the ticket's id) and `<era>` for its era,
`<result-dir>` for a scratch directory and `<result-path>` for the result file
the latest dispatch named; everything else is literal. The test cannot run a
subagent, so at the two review stages a reviewer's result file is shown as a
`json result` block, and the test writes it where the reviewer would.

A block can list several commands, in order. Run each write as its own command
and read its whole output before the next: a write ends with the status that
follows it, so no `status` call is needed after one, except after a write that
was refused.

## Set up

In a swamp repo, add stagecraft as an extension source, create the built-in
tracker, create a factory bound to that tracker, and write this example into it:

```sh
swamp extension source add <stagecraft>
swamp model create @swamp/stagecraft/tracker board \
  --global-arg prefix=team --json
swamp model create @swamp/stagecraft/factory team \
  --global-arg tracker=board --json
# agent: write build-swamp-extension into team
```

The agent writes the `definition:` and `scenarios:` blocks of
[build-swamp-extension.yaml](build-swamp-extension.yaml), beside this file,
under `globalArguments:` in the factory's model definition,
`models/@swamp/stagecraft/factory/team.yaml`. That is the one copy of the
definition: edit it there. Then check it, file a ticket for the work on the
tracker, claim the ticket, and run the `start` command `claim` prints:

```sh
swamp model method run team validate
swamp model method run board create --input 'title=Add a list method' \
  --input 'body=Add a list method to the extension.' --input type=feature
swamp model method run board claim --input issue=team-1 --input factory=team
swamp model @swamp/stagecraft/work-item method run start <key> \
  --input factory=team --input 'title=Add a list method' \
  --input 'externalRefs={"builtin":"team-1","builtin.display":"team-1"}'
```

```text
definition 'build-swamp-extension' in factory 'team' is valid: 8 stages (plan, plan-review, implement, check, code-review, release, done, abandoned)
created team-1 (team-1): Add a list method [open]
team-1 (team-1) is claimed as 'team-1'. Start it: swamp model @swamp/stagecraft/work-item method run start 'team-1' --input 'factory=team' --input 'title:json="Add a list method"' --input 'externalRefs={"builtin":"team-1","builtin.display":"team-1"}'
started 'team-1' at stage 'plan' (definition 'build-swamp-extension' from 'team'; tracker 'board')
team-1 (Add a list method): active at stage 'plan' cycle 1
  expect: --input expectedStage=plan --input expectedCycle=1 --input expectedEra=88f57628-58ac-4ed2-be4c-e377568741e8
  ...
```

## plan (cycle 1)

The loop starts with `status`:

```sh
swamp model @swamp/stagecraft/work-item method run status <key>
```

```text
team-1 (Add a list method): active at stage 'plan' cycle 1
  expect: --input expectedStage=plan --input expectedCycle=1 --input expectedEra=88f57628-58ac-4ed2-be4c-e377568741e8
  exit submit -> plan-review: not ready: artifact-exists: artifact 'plan' has not been recorded
  exit abandon -> abandoned [human: abandon-confirmation]: not ready: human-approval: awaiting approval 'abandon-confirmation' (0/1) for stage 'plan' cycle 1
  work: interactive; dispatches this cycle 0 of 2
```

The stage's work is interactive: the driving agent plans. Dispatch first, so the
resolved inputs and prompt are recorded:

```sh
swamp model @swamp/stagecraft/work-item method run dispatch <key> \
  --input expectedStage=plan --input expectedCycle=1 --input expectedEra=<era>
```

```text
dispatch 1 for stage 'plan' cycle 1
Plan the change. Name the files each step touches, how it will be
tested, and whether the manifest version needs a bump (any behaviour
change to a published extension does).
packet: {
  "stage": "plan",
  "cycle": 1,
  "mode": "interactive",
  "skills": [],
  "subagents": 0,
  "values": {},
  "inject": [],
  "problems": [],
  "ready": true
}
```

A first plan that leaves out fields its schema requires is refused, and kept as
feedback:

```sh
# fails: the plan schema requires testingStrategy and versionBump
swamp model @swamp/stagecraft/work-item method run record_artifact <key> \
  --input name=plan \
  --input payload='{"summary":"Add a list method","steps":[{"description":"Add list to the model","files":["extensions/models/thing.ts"]}]}' \
  --input expectedStage=plan --input expectedCycle=1 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run status <key>
```

```text
Error: artifact 'plan' was rejected and kept as retry feedback:
(root): Instance does not have required property "testingStrategy".
(root): Instance does not have required property "versionBump".

team-1 (Add a list method): active at stage 'plan' cycle 1
  ...
  work: interactive; dispatches this cycle 1 of 2
  rejected artifact 'plan' (stage 'plan' cycle 1): (root): Instance does not have required property "testingStrategy".; (root): Instance does not have required property "versionBump".
```

Fix the payload and record it again. `submit` is then the one ready exit, with
no human gate and not manual, so advance without asking:

```sh
swamp model @swamp/stagecraft/work-item method run record_artifact <key> \
  --input name=plan \
  --input payload='{"summary":"Add a list method","steps":[{"description":"Add list to the model","files":["extensions/models/thing.ts","extensions/models/thing_test.ts"]}],"testingStrategy":"Unit tests for list against a fake client","versionBump":{"needed":true,"reason":"A new method"}}' \
  --input expectedStage=plan --input expectedCycle=1 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run advance <key> \
  --input transition=submit \
  --input expectedStage=plan --input expectedCycle=1 --input expectedEra=<era>
```

```text
recorded artifact 'plan' version 1
team-1 (Add a list method): active at stage 'plan' cycle 1
  expect: --input expectedStage=plan --input expectedCycle=1 --input expectedEra=88f57628-58ac-4ed2-be4c-e377568741e8
  exit submit -> plan-review: ready
  exit abandon -> abandoned [human: abandon-confirmation]: not ready: ...
  work: interactive; dispatches this cycle 1 of 2

took 'submit' to stage 'plan-review' cycle 1
team-1 (Add a list method): active at stage 'plan-review' cycle 1
  ...
```

## plan-review (cycle 1): the person declines

A dispatch stage: dispatch with a scratch directory, send the printed subagent
prompt to one reviewer subagent as it is, record the result file it writes, and
attach the token count the harness reports for it (the task notification's
`<usage>` block) to the dispatch id.

```sh
swamp model @swamp/stagecraft/work-item method run dispatch <key> \
  --input resultDir=<result-dir> \
  --input expectedStage=plan-review --input expectedCycle=1 --input expectedEra=<era>
```

```text
dispatch 2 for stage 'plan-review' cycle 1
packet: {
  "stage": "plan-review",
  "cycle": 1,
  "mode": "dispatch",
  "skills": [],
  "subagents": 1,
  "values": {
    "planSummary": "Add a list method"
  },
  "inject": [
    "plan"
  ],
  "products": [
    {
      "kind": "artifact",
      "name": "plan-review",
      "reviews": "plan"
    }
  ],
  "problems": [],
  "ready": true
}
--- subagent 1 of 1 prompt; send it as it is ---
You are an adversarial reviewer. Try to refute this plan:
Add a list method
Check its steps against the code, its testing strategy against the
risks, and whether the version bump call is right.
Rate a finding critical or high only if the plan would ship a
defect, lose data, break a stated rule, or make the declared checks
meaningless. Gaps in process, logistics or manual verification that
the automated checks already cover are medium at most. Judge the
plan against the size of the change: do not ask for verification
machinery bigger than the change, and give the smallest adequate fix
for each finding. Report findings with severities, and do not soften
the severity of a real defect.

---

Read these products fresh from the store. Each command prints
the product's payload as one JSON object. If it exits non-zero
with an error (the record is missing or not alone), stop and
report that; never guess the product.
- plan: swamp data query 'modelName == "<key>" && name == "artifact-plan"' --select content --single --json

Write your result as JSON, one file per product, holding the
payload and nothing else. These files are the only thing you may
write.
- artifact plan-review: write it to <result-dir>/<key>-d2-1-plan-review.json
  Its schema:
    {
      "type": "object",
      "required": [
        "findings"
      ],
      ...
    }
--- end subagent 1 prompt ---
```

The reviewer writes its result file:

```json result
{
	"findings": [
		{
			"id": "F1",
			"severity": "medium",
			"description": "The plan does not update the README for the new method"
		}
	]
}
```

Record it from the file, as written:

```sh
swamp model @swamp/stagecraft/work-item method run record_artifact <key> \
  --input name=plan-review \
  --input payload=@<result-path> \
  --input expectedStage=plan-review --input expectedCycle=1 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run record_usage <key> \
  --input dispatchId=2 --input totalTokens=65155 --input toolUses=12 --input durationMs=94000 \
  --input model=claude-opus-5-5
```

```text
recorded usage for dispatch 2
team-1 (Add a list method): active at stage 'plan-review' cycle 1
  expect: --input expectedStage=plan-review --input expectedCycle=1 --input expectedEra=88f57628-58ac-4ed2-be4c-e377568741e8
  exit approve -> implement [human: plan-approval]: not ready: human-approval: awaiting approval 'plan-approval' (0/1) for stage 'plan-review' cycle 1
  exit rework -> plan: not ready: cel: rework needs an open critical or high finding
  exit revise -> plan (manual): not ready: evidence-recorded: evidence 'plan-feedback' has not been recorded
  exit abandon -> abandoned [human: abandon-confirmation]: not ready: ...
  a person records: plan-feedback
  work: dispatch; dispatches this cycle 1 of 2
```

No finding blocks, so `rework` is not ready. `approve` needs the person
(`[human: plan-approval]`). `revise` is manual and needs `plan-feedback`, which
a person records: their feedback on the plan, never the agent's own. Stop and
ask, showing the plan and the review read fresh from the store:

```sh
swamp data query 'modelName == "<key>" && name == "artifact-plan"' --select content --single --json
swamp data query 'modelName == "<key>" && name == "artifact-plan-review"' --select content --single --json
```

> Plan-review found one medium finding (README not updated). Your options:
>
> - **Approve** and move to implement. Implement receives plan-review, so the
>   finding is carried into implementation.
> - **Decline and `revise`** with your feedback, which the next plan is handed:
>   the plan itself changes, at the cost of a new version and a full new review.
> - **Abandon** the work item.
>
> Which do you want?

The person (`sam`) answers: "Decline. The README must be in the plan. Send it
back." Record the decline with their reason, record their feedback in their
words, then take the manual exit they asked for, each on their behalf:

```sh
swamp model @swamp/stagecraft/work-item method run decline <key> \
  --input gateId=plan-approval \
  --input note="The README must be in the plan." \
  --input onBehalfOf=sam \
  --input expectedStage=plan-review --input expectedCycle=1 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run record_evidence <key> \
  --input name=plan-feedback \
  --input payload='{"feedback":"The README must be in the plan."}' \
  --input onBehalfOf=sam \
  --input expectedStage=plan-review --input expectedCycle=1 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run advance <key> \
  --input transition=revise --input confirm=true \
  --input onBehalfOf=sam \
  --input expectedStage=plan-review --input expectedCycle=1 --input expectedEra=<era>
```

```text
declined 'plan-approval' (decision 1)
team-1 (Add a list method): active at stage 'plan-review' cycle 1
  ...
recorded evidence 'plan-feedback' version 1
team-1 (Add a list method): active at stage 'plan-review' cycle 1
  ...
  exit revise -> plan (manual): ready
  ...
took 'revise' to stage 'plan' cycle 2
team-1 (Add a list method): active at stage 'plan' cycle 2
  expect: --input expectedStage=plan --input expectedCycle=2 --input expectedEra=88f57628-58ac-4ed2-be4c-e377568741e8
  ...
```

## plan (cycle 2) and plan-review (cycle 2): the person approves

The expectation now names cycle 2. The dispatch injects the last plan, its
review and the feedback; the new plan answers the feedback and lists it in
`feedbackIncorporated`.

```sh
swamp model @swamp/stagecraft/work-item method run dispatch <key> \
  --input expectedStage=plan --input expectedCycle=2 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run record_artifact <key> \
  --input name=plan \
  --input payload='{"summary":"Add a list method","steps":[{"description":"Add list to the model","files":["extensions/models/thing.ts","extensions/models/thing_test.ts"]},{"description":"Document list","files":["README.md"]}],"testingStrategy":"Unit tests for list against a fake client","versionBump":{"needed":true,"reason":"A new method"},"feedbackIncorporated":["The README must be in the plan."]}' \
  --input expectedStage=plan --input expectedCycle=2 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run advance <key> \
  --input transition=submit \
  --input expectedStage=plan --input expectedCycle=2 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run dispatch <key> \
  --input resultDir=<result-dir> \
  --input expectedStage=plan-review --input expectedCycle=2 --input expectedEra=<era>
```

The reviewer writes its result file:

```json result
{
	"findings": []
}
```

Record it from the file, as written:

```sh
swamp model @swamp/stagecraft/work-item method run record_artifact <key> \
  --input name=plan-review \
  --input payload=@<result-path> \
  --input expectedStage=plan-review --input expectedCycle=2 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run record_usage <key> \
  --input dispatchId=4 --input totalTokens=49659 --input toolUses=8 --input durationMs=61000 \
  --input model=claude-opus-5-5
```

> Plan-review found nothing. Approve the plan and move to implement? (Or
> `revise` it for another round, or abandon.)

The person answers: "Approved, go." Their approval carries their go, so approve
on their behalf, then advance; the advance is yours and names no one:

```sh
swamp model @swamp/stagecraft/work-item method run approve <key> \
  --input gateId=plan-approval --input note="Approved, go." \
  --input onBehalfOf=sam \
  --input expectedStage=plan-review --input expectedCycle=2 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run advance <key> \
  --input transition=approve \
  --input expectedStage=plan-review --input expectedCycle=2 --input expectedEra=<era>
```

```text
approved 'plan-approval' (decision 2)
team-1 (Add a list method): active at stage 'plan-review' cycle 2
  ...
took 'approve' to stage 'implement' cycle 1
team-1 (Add a list method): active at stage 'implement' cycle 1
  ...
```

## implement

Implement and commit, then record `change-summary` with the commit's full SHA.

```sh
swamp model @swamp/stagecraft/work-item method run dispatch <key> \
  --input expectedStage=implement --input expectedCycle=1 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run record_artifact <key> \
  --input name=change-summary \
  --input payload='{"summary":"Add list and document it","commit":"c5aaad329c9ceb4edc0504a98ff5d6e5528ac8fd","files":["extensions/models/thing.ts","extensions/models/thing_test.ts","README.md"]}' \
  --input expectedStage=implement --input expectedCycle=1 --input expectedEra=<era>
```

```text
recorded artifact 'change-summary' version 1
team-1 (Add a list method): active at stage 'implement' cycle 1
  expect: --input expectedStage=implement --input expectedCycle=1 --input expectedEra=88f57628-58ac-4ed2-be4c-e377568741e8
  exit submit -> check: ready
  exit recheck -> check (manual): ready
  exit abandon -> abandoned [human: abandon-confirmation]: not ready: ...
  work: interactive; dispatches this cycle 1 of 2
```

Two exits are ready, but `recheck` is manual: a way back for the person, which
does not count. `submit` is the one exit that is yours, so advance without
asking:

```sh
swamp model @swamp/stagecraft/work-item method run advance <key> \
  --input transition=submit \
  --input expectedStage=implement --input expectedCycle=1 --input expectedEra=<era>
```

## check: the person waives the quality score

Run the checks on the change-summary commit and record them. This extension has
no manifest yet, so `swamp extension quality` cannot score it:

```sh
swamp model @swamp/stagecraft/work-item method run dispatch <key> \
  --input expectedStage=check --input expectedCycle=1 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run record_evidence <key> \
  --input name=checks \
  --input payload='{"commit":"c5aaad329c9ceb4edc0504a98ff5d6e5528ac8fd","status":"passed","results":[{"name":"fmt","status":"passed"},{"name":"check","status":"passed"},{"name":"lint","status":"passed"},{"name":"test","status":"passed"}]}' \
  --input expectedStage=check --input expectedCycle=1 --input expectedEra=<era>
```

```text
recorded evidence 'checks' version 1
team-1 (Add a list method): active at stage 'check' cycle 1
  expect: --input expectedStage=check --input expectedCycle=1 --input expectedEra=88f57628-58ac-4ed2-be4c-e377568741e8
  exit passed -> code-review: not ready: evidence-recorded: evidence 'quality' has not been recorded; cel: checks and quality must be for the change-summary commit
  exit passed-with-quality-waiver -> code-review [human: quality-waiver]: not ready: human-approval: awaiting approval 'quality-waiver' (0/1) for stage 'check' cycle 1
  exit failed -> implement: not ready: evidence-recorded: evidence 'checks': field 'status' is "passed", expected "failed"
  exit quality-failed -> implement: not ready: evidence-recorded: evidence 'quality' has not been recorded
```

> Checks passed. The extension has no manifest, so it cannot be scored. Waive
> the quality score and move to code review? (Or abandon the work item.)

The person answers: "Waive it, go on."

```sh
swamp model @swamp/stagecraft/work-item method run approve <key> \
  --input gateId=quality-waiver --input note="No manifest yet; waive it, go on." \
  --input onBehalfOf=sam \
  --input expectedStage=check --input expectedCycle=1 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run advance <key> \
  --input transition=passed-with-quality-waiver \
  --input expectedStage=check --input expectedCycle=1 --input expectedEra=<era>
```

## code-review: the person approves the release

```sh
swamp model @swamp/stagecraft/work-item method run dispatch <key> \
  --input resultDir=<result-dir> \
  --input expectedStage=code-review --input expectedCycle=1 --input expectedEra=<era>
```

The reviewer writes its result file:

```json result
{
	"findings": [
		{
			"id": "F1",
			"severity": "low",
			"description": "list could page lazily",
			"resolved": false
		}
	]
}
```

Record it from the file, as written:

```sh
swamp model @swamp/stagecraft/work-item method run record_artifact <key> \
  --input name=code-review \
  --input payload=@<result-path> \
  --input expectedStage=code-review --input expectedCycle=1 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run record_usage <key> \
  --input dispatchId=7 --input totalTokens=80523 --input toolUses=15 --input durationMs=122000 \
  --input model=claude-opus-5-5
```

> Code review found one low finding (list could page lazily). Approve the
> release and move to release, with the finding left open? (Or `revise` to go
> back to implement and a new review, or abandon.)

The person answers: "Approve the release."

```sh
swamp model @swamp/stagecraft/work-item method run approve <key> \
  --input gateId=release-approval --input note="Approve the release." \
  --input onBehalfOf=sam \
  --input expectedStage=code-review --input expectedCycle=1 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run advance <key> \
  --input transition=accept \
  --input expectedStage=code-review --input expectedCycle=1 --input expectedEra=<era>
```

## release

Open the pull request, post the verification attestation, and once it merges
record the release with the merge commit:

```sh
swamp model @swamp/stagecraft/work-item method run dispatch <key> \
  --input expectedStage=release --input expectedCycle=1 --input expectedEra=<era>
swamp model @swamp/stagecraft/work-item method run record_evidence <key> \
  --input name=release \
  --input payload='{"via":"pull-request","commit":"c5aaad329c9ceb4edc0504a98ff5d6e5528ac8fd","mergeCommit":"9e1f0c7b3a5d2e4f6a8b0c1d3e5f7a9b1c3d5e7f","url":"https://git.example.com/me/thing/pulls/400","pullRequest":"https://git.example.com/me/thing/pulls/400","attestationId":"att-0001"}' \
  --input expectedStage=release --input expectedCycle=1 --input expectedEra=<era>
```

`released` is the one exit that is yours (`rework` is manual), so advance:

```sh
swamp model @swamp/stagecraft/work-item method run advance <key> \
  --input transition=released \
  --input expectedStage=release --input expectedCycle=1 --input expectedEra=<era>
```

```text
took 'released' to stage 'done' cycle 1 (finished)
team-1 (Add a list method): terminal at stage 'done' cycle 1
```
