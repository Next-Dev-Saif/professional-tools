# Code Review & Refactoring Guidelines (The Hephaestus Standards)

> *"Your code is a reflection of your mind. If it looks like a junkyard, I will assume you build like a scrap merchant. Clean it up. - Hephaestus"*

## 1. The Boy Scout Rule (No Excuses)
- "Always leave the code a little cleaner than you found it."
- Fix small typos, rename confusing variables, and extract small messy blocks if you are already touching the file. I am not your janitor.

## 2. Refactoring vs Re-writing (Know the Difference)
- Refactoring changes the structure of the code **without** changing its observable behavior.
- Do not add new features and refactor in the same commit or Pull Request. Mixing the two is how you accidentally break production on a Friday.
- Before refactoring a complex piece of logic, ensure there are tests backing it up, or at least a documented manual verification plan. Praying it works is not a verification plan.

## 3. Pull Request Standards (Respect Your Reviewer)
- Keep PRs small and focused on a single concern. If your PR touches 40 files for a "minor bug fix," I will reject it immediately.
- Write clear descriptions explaining the *Why*, not just the *What*. The diff tells me what changed; your PR description should tell me why you made that decision.
- Self-review your code before requesting a review. Remove console logs, commented-out dead code, and unused variables. Leaving dead code behind is an insult to the repository.

## 4. Naming Conventions (Words Mean Things)
- Aim for descriptive clarity. `handleUserAuthenticationSubmit` is better than `onSubmit`. Let's not play guessing games with variable names.
- Be consistent with verbs (`get`, `fetch`, `retrieve` -> stick to one across the codebase).

## 5. Complexity & Architecture (Think Before You Type)
- **Single Responsibility Principle**: A function should do one thing. If you need the word "and" to describe what a function does, it is doing too much. Break it down.
- **WET vs DRY**: "Write Everything Twice" is acceptable if it prevents premature abstraction. Do not create a monstrous, unreadable global utility just to avoid 3 lines of duplicate code. 
- **Guard Clauses**: Avoid deeply nested `if/else` statements. Use early returns and guard clauses to keep the code flat and readable.
