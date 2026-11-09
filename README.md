# six seeeven

A friendly German learning platform for Klasse 5 at a Gymnasium in Bayern. Built with React, TypeScript and Vite, with ESLint and Vitest / Testing Library.

## Run locally

Use Node.js 22.13 or newer (Node.js 24 LTS recommended).

```sh
npm install
npm run dev
```

Other commands: `npm run build`, `npm run preview`, `npm run lint`, `npm test`, `npm run test:watch`, `npm run format:check`.

## Add content

`src/content/` contains a folder for each subject: `mathematik`, `deutsch`, `englisch`, `natur-technik`, and `geographie`. Each currently has two sample lessons and two separate exercise files. These are illustrative starter topics, not a verified complete curriculum.

Add files using these suffixes; Vite automatically discovers them at build time:

- `03-lesson.json`: one lesson object with a unique `id`, `subjectId`, `title`, `description`, `number`, `date` (YYYY-MM-DD), `minutes`, and `sections` array. Each section has `title`, `text` and an optional `example`.
- `02-test.json`: one test with a unique `id`, `subjectId`, `title`, `description`, positive `durationMinutes`, and an `exerciseIds` array pointing to question IDs in exercise JSON files. Use new IDs when changing a published test so historical attempts remain comparable. The initial five tests are examples, one per subject, marked with `isSample: true`. Omit that flag for real tests.
- `03-exercises.json`: an array of exercises. Each exercise has a unique `id`, a matching `lessonId`, `question`, `options`, a zero-based `answerIndex`, and `explanation`.

Types are defined in `src/types.ts`. Subject labels, icons and colors are in `src/content/subjects.json`. Follow an existing file as a template. Run `npm test` after changing content to check references and correct-answer indices.

Courses present their lesson first, then the exercises in sequence. Restart the dev server after adding new files if they do not appear immediately.

## Features

- Mobile bottom navigation, a modal subject picker, full-width readable content and larger touch targets; desktop keeps the sidebar.
- Subject pages with separate courses and tests, dated course cards, lessons, exercises and achievements.
- Timed tests with saved answers, automatic submission, result review and repeat attempts.
- Active tests fill the screen and hide app navigation, including after reload. Tests fill the browser viewport without activating browser fullscreen. A native beforeunload warning is registered for active tests; browsers control whether it appears and its wording.
- Tests can be cancelled after confirmation. Cancellation discards the current attempt without changing earlier results.
- Dates use dd.mm.yyyy.
- The English subject uses English throughout its navigation, courses, exercise feedback, test controls and results. Other subjects use German. Language follows the active subject, including resumed fullscreen tests.
- Dated test score history, comparisons between attempts at the same test, and course exercise history.
- Interactive maths courses: place-value blocks, digit controls, number-building tasks, and addition with sliders and a number line. Activity configuration lives in each lesson JSON under `activity`.
- Supportive feedback and retries without penalties.
- Ten learning stars for each uniquely completed exercise.
- Light/dark mode and exercise progress saved in localStorage on the current browser/device.
- Original supplied branding in `brand/`, with the favicon in `public/favicon.svg`.
- Keyboard-accessible controls, labeled answers and reduced-motion support.

Progress, answers, test deadlines and attempt history are stored in this browser only. A test deadline continues while you leave the page or close the app; an expired test is finalized when the app runs again. Clearing browser storage removes the history. No account, backend, tracking, or cloud synchronization is configured. Google Fonts provides Outfit and DM Sans with local system fallbacks.

## Checks

Tests cover content integrity, subject navigation, course feedback, progress persistence, font controls, test scoring, resume after reload, deadline expiry while open or closed, late-answer rejection, repeated attempts and result history.

A minimatch override selects a patched release for the lint toolchain. Recheck this override when upgrading typescript-eslint.

## Code structure

- `src/App.tsx`: application shell and typed page navigation.
- `src/components/layout/`: sidebar and top bar.
- `src/components/subjects/`: subject cards, lesson lists and shared icon mapping.
- `src/features/overview/`: dashboard, welcome banner and learning statistics.
- `src/features/learning/`: lesson reading and interactive exercise feedback.
- `src/features/progress/`: achievements, dated test results and course attempt history.
- `src/features/tests/`: timed test screens, scoring and session lifecycle.
- `src/i18n/`: subject-based language context and translated subject names.
- `src/hooks/`: validated local storage state, display preferences and learning progress.
- `src/content/`: JSON learning material, independent of presentation.

Lesson and answer state stays within the learning feature. App navigation uses a discriminated union so progress, overview and lesson pages cannot be active together.

## GitHub Pages

The GitHub Actions workflow in `.github/workflows/deploy.yml` checks, builds and deploys on pushes to `master`. It builds with `--base=/six-seven/`, including the favicon. In the repository's Settings → Pages, use **GitHub Actions** as the source.

Expected URL: https://eng-ferasahmad.github.io/six-seven/

This version supports one child per browser profile. Progress remains in localStorage across normal deployments on the same domain. It is not uploaded to GitHub or shared between devices. Clearing site data or using another browser will not preserve it automatically.

Under **Reber erlog → Fortschritt sichern**, download a JSON backup and load it on another browser/device. Loading merges valid progress with existing progress. Keep backups outside the repository. To move progress from localhost to the published site, download it locally, open the published site, and load that file there. Imported active tests retain their original deadline.
