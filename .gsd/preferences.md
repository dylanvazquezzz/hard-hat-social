---
version: 1
always_use_skills: []
prefer_skills:
  - frontend-design
avoid_skills: []
skill_rules:
  - when: building or modifying any UI component, page, or layout
    use: frontend-design
custom_instructions:
  - >
    At the end of every slice, before marking it complete:
    (1) Verify the slice in the browser against localhost — exercise the full user flow added or changed,
    run browser assertions, check console for errors.
    (2) Run `npm run build` and confirm it passes clean.
    (3) Deploy to production using `./scripts/deploy.sh "<slice-id> <short description>"`.
    (4) Verify the deployed feature at hardhatsocial.net — repeat the key browser assertions against production.
    (5) Apply and verify any new migrations using `./scripts/migrate.sh` before deploying.
    Only mark the slice complete after production verification passes.
    Never skip the deploy step — every slice ships to hardhatsocial.net when done.
models: {}
skill_discovery: auto
auto_supervisor: {}
---
