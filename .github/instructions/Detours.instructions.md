---
description: Load when handling boyscout cleanups, renames, or organic discoveries during development.
---
# Detours
Handle discoveries as separate commits to keep diffs reviewable.

# Flow
- Make change
- Get approval from all reviewers
- @Feature-Builder has @Committer commit
- Continue Design or Implementation phase as appropriate

## Boyscout rule
When you spot cleanup opportunities (dead code, poor naming, missing extractions), flag them and do the cleanup.

## Refactors
Small refactors discovered during work (♻️, 🛸) follow the detour flow.

## Renames/moves
Keep renames/moves separate from logic changes (🚚). A rename-only commit is easy to skim even if large. Mixing rename + logic change makes review painful, now and in the future.

Batch related renames/moves into a single commit.

## Scope creep
If the discovery is significant (new feature, major refactor), flag it for the user to decide whether to pursue now or defer.
