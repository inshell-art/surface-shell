# State-Aware Help

Branch commands should behave like compact panels. They should show current state before syntax, then show local choices and next actions.

The core provides `renderBranchHelp`, `formatStateLines`, and `formatNextActions`. Apps provide the state, labels, and next-action list.
