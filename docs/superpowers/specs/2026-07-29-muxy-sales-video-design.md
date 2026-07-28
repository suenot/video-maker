# Muxy sales video and Short design

Date: 2026-07-29
Channel: @suenot
Language: English

## Goal

Sell the usefulness of Muxy to developers who run several projects and AI coding
agents at the same time. The video should make the viewer recognize the focus
problem first, then see Muxy as a lightweight macOS solution.

This is a product pitch, not a complete feature tour or technical review.

## Audience

Developers and vibecoders who:

- keep four or more projects active at once;
- switch between Claude Code, Codex, or other harness agents;
- maintain separate active and parked projects;
- use remote servers or local Ubuntu Docker environments for additional agent
  accounts and subscriptions.

## Core promise

Muxy gives a developer one lightweight native terminal workspace for many
projects, agent sessions, and remote environments. It reduces workspace chaos
and preserves focus while the developer moves between tasks. Muxy organizes and
launches workspaces; the selected local or remote environment runs the terminal
and harness.

The macOS-only limitation is stated early enough to qualify the pitch. No claim
is made that Muxy replaces an IDE, manages agents itself, or supports every
remote workflow.

## Desktop video

Target duration: 90-120 seconds.

### Narrative beats

1. Hook, 0-10s

   On-screen copy: `Four projects. Three coding agents. One terminal window
   disaster.`

   Show the developer's project list and the density of concurrent work. State
   that this is for Mac developers running multiple AI coding agents.

2. Problem, 10-35s

   Show the cost of switching: active projects mixed with parked projects,
   multiple harness sessions, and context scattered across windows. The point
   is lost focus, not lack of terminal features.

3. Solution, 35-70s

   Show Muxy's project navigation and the active/parked separation. Present it
   as a control surface for work, not as another heavy IDE.

4. Remote leverage, 70-95s

   Show the Remote menu and the connection to a remote device. Explain that the
   workspace can open a project on an SSH host or in a local Ubuntu Docker
   environment, when those environments are configured by the developer. This
   is useful when separate harness accounts need different environments; Muxy
   does not provide the accounts or the server itself.

5. Trust and limitation, 95-108s

   State that Muxy is macOS-only early enough that the audience is not
   misled. Mention the open-source build path only if it is visible in the
   source material and phrased as an option, not a guarantee.

6. CTA, 108-120s

   `If you work across multiple coding projects on a Mac, try Muxy.`

### Visual direction

- Use the user-provided Muxy screenshots as source-of-truth references for the
  project list and Remote menu.
- Capture the installed `/Applications/Muxy.app` for the main demonstration when
  possible.
- Use the existing Muxy hero image only as a transition or title card.
- Prefer readable UI states and deliberate cursor movement over a feature dump.
- Keep the visual hierarchy: pain first, Muxy second, remote capability third.

## English Short

Target duration: 30-45 seconds.

This topic gets exactly one Short. It has one independent problem-solution arc:
many projects and harness agents require isolated remote environments, and Muxy
keeps those environments reachable from one lightweight workspace.

Suggested voiceover:

`Working on several projects with different AI coding agents?`

`The hard part is not starting another session. It is keeping all of them
organized without losing your focus.`

`Muxy gives you one lightweight macOS terminal workspace for active projects,
parked projects, and remote environments — including a local Ubuntu Docker setup
when you configure one for another harness account.`

`Muxy for Mac. If you work this way, it is worth trying.`

The Short must feel like a useful recommendation, not a trailer for the desktop
video.

## Production flow

1. Use the English Muxy article as the source document and add a concise sales
   brief with the problem, the remote-workspace example, and the macOS caveat.
2. Generate the desktop narration and slides in NotebookLM.
3. Build the landscape MP4 with `video_maker`.
4. Generate one English Short from the same topic after the desktop video is
   complete.
5. Inspect the desktop video and Short for readable Muxy UI, factual claims,
   hook clarity, and CTA presence before publishing.
6. Prepare both assets and metadata for `@suenot`, but do not publish. Record
   publication only after the user approves the rendered files.

## Shorts policy change

The content pipeline must not require a fixed number of Shorts per video. Create
only as many Shorts as the topic supports. Every Short must contain one
independent, interesting problem-solution moment. A narrow topic may produce one
Short; a broader topic may produce several.

## Acceptance criteria

- The first ten seconds show a recognizable multi-project focus problem.
- Muxy is presented as a lightweight macOS solution, not as a generic terminal.
- The desktop video shows project navigation and the Remote workflow.
- The remote example is framed as a developer-configured SSH or Docker
  environment for other harness accounts, without claiming that Muxy provides
  the server, account, or agent.
- Exactly one English Short is generated for this topic.
- Both assets have a clear CTA and the macOS limitation is visible.
- No invented Muxy features appear in narration, captions, metadata, or slides.
