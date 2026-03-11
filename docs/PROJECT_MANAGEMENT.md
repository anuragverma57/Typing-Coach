# Typing Coach — Project Management

## Git Workflow

### Branches

- **main**: Always deployable. Merge only after a feature is complete and tested.
- **feature branches**: `feature/<name>` created from `main`. One branch per phase or sub-feature.

### When to Branch

Before starting a new phase or feature:
```
git checkout main
git pull
git checkout -b feature/<feature-name>
```

### When to Push

After completing a phase or logical sub-feature. Commit messages should be clear:
- `Initial project setup: docs, React frontend, Go backend scaffold`
- `Add typing exercise UI with basic WPM and accuracy`
- etc.

### Merge Flow

1. Ensure feature is complete and tested
2. Merge `feature/<name>` into `main`
3. Push `main` to remote
4. Delete feature branch (optional)

## Phase Checklist

Before marking a phase complete:
- [ ] All features in the phase are implemented
- [ ] Docs updated (ARCHITECTURE, IMPLEMENTATION_LOG)
- [ ] Learnings logged in MISTAKES_AND_LEARNINGS (if any)
- [ ] Ready to push with clear commit message

## Tutor Reminders

The AI tutor will remind you:
- When to create a new branch
- When to push
- What commit message to use

The tutor will **never** push or commit on your behalf.
