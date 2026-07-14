# Version Control & Git Standards

## 1. Branching Strategy
- Use clear prefixes for branches: 
  - `feat/user-auth`
  - `fix/header-alignment`
  - `refactor/api-layer`
  - `chore/update-dependencies`
- Keep branches short-lived to prevent terrifying merge conflicts.

## 2. Conventional Commits
Follow the semantic commit message format to generate predictable histories:
- `feat: add dark mode toggle`
- `fix: resolve crash on null user profile`
- `chore: update eslint rules`
- `docs: update agent execution guide`

## 3. Commit Scoping
- A single commit should represent a single logical change.
- Do not mix unrelated changes (e.g., fixing a bug in the footer and adding a new API endpoint in the same commit).

## 4. History Cleanliness
- Use rebasing for feature branches to keep the main commit history linear.
- Squash "wip" (work in progress) commits before merging back to main.
