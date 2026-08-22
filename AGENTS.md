# eidos-ui — Agent Rules

## Git

**NEVER run `git commit`, `git push`, or any command that writes to git history.**
Staging files with `git add` is allowed for inspection, but the commit itself
must always be performed by the user. If a task is complete, summarise what
changed and stop — do not commit on the user's behalf under any circumstances.
