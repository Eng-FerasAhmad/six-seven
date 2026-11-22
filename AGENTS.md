# Project guidance

This is a learning app with five subjects (Fächer). Keep the interface consistent across subjects while preserving each subject's identity.

## Subjects, colors, and icons

`src/content/subjects.json` is the source of truth. Use its `color` and `icon` fields rather than separate symbols or hard coded colors.

| Subject         | Color class | Accent    | Icon         |
| --------------- | ----------- | --------- | ------------ |
| Mathematik      | `blue`      | `#0879f5` | `Calculator` |
| Deutsch         | `purple`    | `#9570da` | `BookOpen`   |
| Englisch        | `orange`    | `#df9c4b` | `Languages`  |
| Natur & Technik | `green`     | `#4aa78b` | `Sprout`     |
| Geographie      | `pink`      | `#cc75a8` | `Globe2`     |

Use `subjectIcons` from `src/components/subjects/subjectIcons.ts` for cards, sidebar, mobile subject navigation, and progress rows. Scope subject content with its color class and use `var(--accent)` and `color-mix()` for accents and tints. Do not use generic purple inside another subject. Check both light and dark themes.

## Layout and mobile

- Course, grammar, and test cards should share the same surface, border, radius, padding, and spacing. Keep their content patterns visually aligned.
- Grammar lesson panels and tables should have rounded corners and use the English accent, rather than unrelated yellow or green fills.
- Keep buttons readable and at least 44 px tall. On narrow screens, stack action buttons when side by side labels wrap; the PDF download label should stay on one line.
- Check narrow screens for clipped text, horizontal overflow, cramped progress rows, and dialogs taller than the viewport. Use `src/mobile.css` for mobile overrides and test both themes.
- The Erfolg page shows summary stats and subject progress rows. Do not restore the removed course history or test history sections without a new request.

## Two test flows

- **Course ending practice and grammar topic quizzes:** Use a dialog with 10 questions. No timer or full test navigation. The grammar topic quiz uses `GrammarQuiz`; course practice uses `ExercisePanel` in the course quiz dialog. Some course question banks currently contain fewer than 10 unique questions, so the course dialog repeats them. Add unique content when expanding those banks.
- **Tests tab / big tests:** Use `TestDefinition`, `TestPage`, `FocusedTest`, and `useTestProgress`. These are timed, full page tests with a start screen, a countdown, saved answers, submission, result, and cancellation. The complete English grammar test belongs here; it is not a grammar quiz dialog. Keep the test data connected to valid lesson and exercise IDs.

Keep the visual treatment and behavior of the two flows distinct. Changes to either flow should be checked in desktop and mobile layouts.

## Verification and formatting

After changing UI or test behavior, run `npm test -- --run` and `npm run build`. Run `npm run lint` and `npm run format:check` before finishing. Fix relevant lint and formatting errors; do not hide failures by disabling rules or deleting meaningful assertions. For files you edit, use Prettier (`npx prettier --write <files>`) and keep the diff focused. If a repository wide check fails because of unrelated existing files, report the exact failure and fix it when the task asks for all formatting or lint errors.
