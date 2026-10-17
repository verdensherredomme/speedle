# Speedle

A little wild guess. Guess an animal's top running speed in five tries, with
faster/slower hints after each guess. One shared puzzle per day.

## Run locally

Requires Node.js 22.18+ (or Node.js 24+) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm test` runs the game-logic tests.
`npm run build` type-checks and builds the site into `dist/`.
`npm run preview` serves the production build.

## The rules

- Five guesses, with success within 5% of the reference speed (inclusive).
- Switch between km/h and mph without changing the underlying guesses.
- A new animal at midnight UTC, the same for everyone.
- Progress and preferred units are saved in the current browser.
- Finished games reveal the reference speed, a fact, and a source.
- "Try another animal" starts a practice round with five fresh guesses. It
  excludes the current animal and today's daily animal.
- Practice never overwrites daily progress. "Back to daily puzzle" restores it;
  reloading also returns to the daily puzzle. Practice rounds are not saved.
- Practice continues uninterrupted at midnight; the daily puzzle updates in the
  background. Practice shares are labelled separately from daily results.
- Copy a spoiler-free result to share; manual copying is available if clipboard
  access is blocked.

## Prototype scope

This is a static TypeScript/Vite app with no backend, account, or analytics.
It currently rotates through **four animals**, so animals repeat every four
days. The schedule starts on 17 October 2026. Keep the animal array order stable
to preserve existing puzzle assignments; a growing dataset will need a dated,
explicit schedule rather than changing the modulo rotation.

Reference speeds are approximate reported short-burst running speeds, not exact
biological constants. Sources vary by observation, animal, and conditions.
Encyclopaedia Britannica is the current reference for
[cheetah (114 km/h)](https://www.britannica.com/animal/cheetah-mammal),
[giraffe (60 km/h)](https://www.britannica.com/animal/giraffe),
[ostrich (72.5 km/h)](https://www.britannica.com/animal/ostrich), and
[pronghorn (70 km/h)](https://www.britannica.com/animal/pronghorn).
The small dataset and approximate speeds are intentional prototype limitations.

All animal artwork is original inline SVG. The interface uses local system fonts
and makes no third-party asset requests.

## Deploy

### GitHub Pages

In the repository's **Settings > Pages**, set **Build and deployment > Source**
to **GitHub Actions**. Pages is not enabled automatically by the workflow.

Push the app, lockfile, and `.github/workflows/pages.yml` to `main`. The workflow
installs dependencies with Node.js 24, runs tests and type-checking, builds with
the base path reported by GitHub Pages, and deploys `dist/`. It also supports a
manual run from the Actions tab; only `main` can deploy.

The default site URL is <https://verdensherredomme.github.io/speedle/>.
No personal access token or repository secrets are required.

### Other static hosts

Build with `npm ci && npm run build` and publish `dist/` to any static host.
The app requires no environment variables. For deployment under a subpath, pass
that path to Vite's `--base` build option.