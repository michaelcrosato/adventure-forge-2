# Repository instructions

- Read `AGENT.md` for the engine and verification contracts.
- After **every commit**, push the current branch to this repository's GitHub
  remote (`origin`). This includes documentation, triage, and quarantine commits.
- `npm ci` / `npm install` installs the tracked post-commit hook. Use
  `npm run hooks:install` if dependencies were installed with scripts disabled.
- Confirm the push succeeded before starting the next cycle or declaring work
  finished. A hook error does not undo a Git commit; resolve the failure and run
  `npm run push`. Preserve the local commit and remote history; never force-push
  to work around a rejection.
- Keep pre-existing user edits separate from your commits.
