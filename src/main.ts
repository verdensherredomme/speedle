import "./style.css";
import { dailyPuzzle, fromKmh, isFinished, judge, MAX_GUESSES, parseSavedGame, practiceAnimal, shareResult, toKmh, validateGuess } from "./game.ts";
import type { Animal, Unit } from "./game.ts";
import { illustration } from "./illustration.ts";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("App root is missing.");

let puzzle = dailyPuzzle();
let dailyGuesses: number[] = [];
let practice: { animal: Animal; guesses: number[] } | null = null;
let unit: Unit = "km/h";
const STORAGE_KEY = "speedle.game.v1";
const UNIT_KEY = "speedle.unit.v1";
let storageNotice = "";

function activeRound() {
  return practice ?? { animal: puzzle.animal, guesses: dailyGuesses };
}

function restore(readUnit = true) {
  dailyGuesses = [];
  try {
    if (readUnit) unit = localStorage.getItem(UNIT_KEY) === "mph" ? "mph" : "km/h";
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) dailyGuesses = parseSavedGame(raw, puzzle.key, puzzle.animal) ?? [];
  } catch (error) {
    console.warn("Speedle could not restore browser progress.", error);
    storageNotice = "Your saved game could not be loaded. You can still play, but progress may not be saved.";
  }
}

restore();

root.innerHTML = `
  <div class="shell">
    <header class="site-header">
      <a class="wordmark" href="./" aria-label="Speedle home"><svg viewBox="0 0 24 32" aria-hidden="true"><path d="M14 1 2 18h9L6 31l17-20H13l6-10Z" fill="currentColor"/></svg>speedle<span class="wordmark-dot">.</span></a>
      <button class="help-button" id="help-open" type="button"><span aria-hidden="true">?</span> How to play</button>
    </header>
    <main>
      <div class="intro"><p class="tagline">A little wild guess.</p><p class="date" id="puzzle-date"></p></div>
      <div class="game-layout">
        <section class="animal-panel" aria-labelledby="animal-name">
          <div class="daily-label"><span class="live-dot" aria-hidden="true"></span><span id="animal-kind">Today's animal</span><span id="puzzle-number"></span></div>
          <div id="animal-illustration"></div>
          <div class="animal-caption"><h1 id="animal-name"></h1><p id="animal-scientific"></p></div>
          <p class="habitat" id="animal-habitat"></p>
          <div class="field-note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18 10 8l4 6 3-4 4 8H4Z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="5" r="2" fill="currentColor"/></svg> On foot. Full speed. Short bursts.</div>
        </section>
        <section class="play-panel" aria-labelledby="game-heading">
          <div class="play-heading"><h2 id="game-heading">How fast can it run?</h2><p>Five guesses. Follow the hints.<br> A little animal instinct helps.</p></div>
          <div class="guess-meta"><span id="remaining"></span><fieldset class="unit-switch"><legend class="sr-only">Speed unit</legend><label><input type="radio" name="unit" value="km/h" checked><span>km/h</span></label><label><input type="radio" name="unit" value="mph"><span>mph</span></label></fieldset></div>
          <form id="guess-form" novalidate>
            <label for="speed-input" class="input-label">Your speed guess</label>
            <div class="input-row"><div class="speed-field"><input id="speed-input" name="speed" type="number" inputmode="decimal" min="0" step="any" autocomplete="off" placeholder="0" aria-describedby="input-error tolerance"><span id="input-unit">km/h</span></div><button class="primary-button" type="submit">Guess <span aria-hidden="true">↗</span></button></div>
            <p id="input-error" class="error" role="alert"></p>
            <p class="tolerance" id="tolerance">Within 5%? Close enough. You're in.</p>
          </form>
          <ol class="guess-list" id="guess-list" aria-label="Your guesses"></ol>
          <section id="result" class="result" aria-labelledby="result-heading" hidden></section>
          <div class="replay-controls">
            <button id="practice-new" class="secondary-button" type="button">Try another animal</button>
            <button id="daily-return" class="text-button" type="button" hidden>Back to daily puzzle</button>
            <p class="small-print" id="mode-note"></p>
          </div>
          <p id="announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
          <p id="storage-notice" class="notice" role="status"></p>
        </section>
      </div>
      <div class="bottom-note"><span aria-hidden="true">☀</span><p><span id="bottom-heading" class="bottom-heading">One animal. Every day.</span><br><span id="bottom-description">A fresh wild guess at midnight UTC.</span></p></div>
    </main>
    <footer><span>Wildly curious. Not scientifically exact.</span><a href="https://github.com/verdensherredomme/speedle" target="_blank" rel="noreferrer">About Speedle</a></footer>
  </div>
  <dialog id="help-dialog" aria-labelledby="help-heading">
    <div class="dialog-top"><span class="dialog-mark" aria-hidden="true">?</span><button id="help-close" class="close-button" aria-label="Close how to play" type="button">×</button></div>
    <h2 id="help-heading">Trust your animal instinct.</h2>
    <p>Guess today's animal's top running speed in five tries. Everyone gets the same animal each day.</p>
    <div class="hint-example"><span>↑ Faster</span><p>The animal runs faster than your guess. Go higher.</p></div>
    <div class="hint-example"><span>↓ Slower</span><p>The animal runs slower than your guess. Go lower.</p></div>
    <div class="hint-example"><span>✓ Got it</span><p>Within 5% of our reference speed counts as a win.</p></div>
    <p>These are approximate short-burst speeds, not a promise about every individual animal. We reveal our reference and source after you finish.</p>
    <p>Want another go? Choose “Try another animal” for practice. Your daily progress stays saved. Practice skips today's animal and isn't saved; reloading returns you to the daily puzzle.</p>
    <p class="small-print">This prototype rotates through four animals. New puzzles arrive at midnight UTC. Progress is saved on this browser.</p>
    <button class="primary-button" id="help-start" type="button">Let's guess</button>
  </dialog>`;

function element<T extends HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element: ${selector}`);
  return node;
}

const input = element<HTMLInputElement>("#speed-input");
const form = element<HTMLFormElement>("#guess-form");
const dialog = element<HTMLDialogElement>("#help-dialog");
const errorText = element("#input-error");
const announcement = element("#announcement");
const result = element("#result");
const numberFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const speedText = (speed: number) => numberFormat.format(fromKmh(speed, unit));

function save() {
  try {
    if (!practice) localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: puzzle.key, animalId: puzzle.animal.id, guesses: dailyGuesses }));
    localStorage.setItem(UNIT_KEY, unit);
    storageNotice = "";
  } catch (error) {
    console.warn("Speedle could not save browser progress.", error);
    storageNotice = "Progress isn't being saved. Keep this tab open to finish your game.";
  }
  element("#storage-notice").textContent = storageNotice;
}

function render() {
  const { animal, guesses } = activeRound();
  const finished = isFinished(guesses, animal.speed);
  element("#puzzle-date").textContent = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${puzzle.key}T12:00:00Z`));
  element("#animal-kind").textContent = practice ? "Practice animal" : "Today's animal";
  element("#puzzle-number").textContent = practice ? "" : `#${puzzle.number}`;
  element("#puzzle-number").hidden = Boolean(practice);
  element("#animal-name").textContent = animal.name;
  element("#animal-scientific").textContent = animal.scientificName;
  element("#animal-habitat").textContent = animal.habitat;
  element("#animal-illustration").innerHTML = illustration(animal.id);
  element("#remaining").textContent = finished ? (practice ? "Practice round complete" : "Today's run is complete") : `${MAX_GUESSES - guesses.length} ${guesses.length === MAX_GUESSES - 1 ? "guess" : "guesses"} left`;
  element("#daily-return").hidden = !practice;
  element("#mode-note").textContent = practice
    ? "Practice round. Your daily progress is safe. Practice isn't saved."
    : "Keep guessing in practice. Your daily progress stays saved.";
  element("#bottom-heading").textContent = practice ? "A little more animal instinct." : "One animal. Every day.";
  element("#bottom-description").textContent = practice ? "Try another animal whenever you like." : "A fresh wild guess at midnight UTC.";
  element("#input-unit").textContent = unit;
  input.max = String(fromKmh(300, unit));
  document.querySelectorAll<HTMLInputElement>('input[name="unit"]').forEach((radio) => { radio.checked = radio.value === unit; });
  element("#guess-list").innerHTML = Array.from({ length: MAX_GUESSES }, (_, index) => {
    const guess = guesses[index];
    if (guess === undefined) return `<li class="guess-slot empty" aria-label="Guess ${index + 1}, unused"><span class="guess-number">${index + 1}</span><span class="empty-line"></span><span class="empty-dot" aria-hidden="true"></span></li>`;
    const verdict = judge(guess, animal.speed);
    const label = verdict === "correct" ? "Got it!" : verdict === "faster" ? "Faster" : "Slower";
    const icon = verdict === "correct" ? "✓" : verdict === "faster" ? "↑" : "↓";
    return `<li class="guess-slot ${verdict}"><span class="guess-number">${index + 1}</span><span class="guess-speed">${speedText(guess)} <small>${unit}</small></span><span class="guess-hint">${label} <span aria-hidden="true">${icon}</span></span></li>`;
  }).join("");
  form.hidden = finished;
  result.hidden = !finished;
  element("#storage-notice").textContent = storageNotice;

  if (finished) {
    const won = guesses.some((guess) => judge(guess, animal.speed) === "correct");
    result.innerHTML = `
      <p class="result-kicker">${won ? "Good instincts." : "A little wilder than you thought."}</p>
      <h3 id="result-heading">${won ? `Caught in ${guesses.length}!` : "This one got away."}</h3>
      <p class="reveal">Up to <strong>${speedText(animal.speed)} ${unit}</strong></p>
      <p class="animal-fact"></p>
      <a class="source-link" target="_blank" rel="noreferrer">Reference: Encyclopaedia Britannica ↗</a>
      <button id="share-button" class="primary-button" type="button">Share your result <span aria-hidden="true">↗</span></button>
      <p id="share-status" class="small-print" role="status"></p>
      <textarea id="share-fallback" aria-label="Your result — select and copy to share" readonly hidden></textarea>
      <p class="next-puzzle" id="next-puzzle" ${practice ? "hidden" : ""}></p>`;
    element(".animal-fact").textContent = animal.fact;
    element<HTMLAnchorElement>(".source-link").href = animal.source;
    element("#share-button").addEventListener("click", share);
    updateCountdown();
  }
}

async function share() {
  const { animal, guesses } = activeRound();
  const text = `${shareResult(practice ? null : puzzle.number, guesses, animal.speed)}\n${window.location.origin}${window.location.pathname}`;
  const status = element("#share-status");
  const fallback = element<HTMLTextAreaElement>("#share-fallback");
  try {
    if (!navigator.clipboard) throw new Error("Clipboard API unavailable.");
    await navigator.clipboard.writeText(text);
    status.textContent = "Copied! Your result is ready to share.";
  } catch (error) {
    console.info("Speedle clipboard unavailable; showing manual copy.", error);
    status.textContent = "Couldn't copy automatically. Select and copy your result below.";
    fallback.hidden = false;
    fallback.value = text;
    fallback.focus();
    fallback.select();
  }
}

function refreshDay(): boolean {
  const next = dailyPuzzle();
  if (next.key === puzzle.key) return false;
  puzzle = next;
  restore(false);
  if (practice) {
    element("#storage-notice").textContent = storageNotice;
    return true;
  }
  resetInput();
  render();
  announcement.textContent = "A new day, a new animal. Today's puzzle is ready.";
  return true;
}

function resetInput() {
  input.value = "";
  input.removeAttribute("aria-invalid");
  errorText.textContent = "";
}

function focusRound() {
  if (!form.hidden) input.focus();
  else {
    element<HTMLHeadingElement>("#result-heading").tabIndex = -1;
    element("#result-heading").focus();
  }
}

function updateCountdown() {
  if (practice) return;
  const target = document.querySelector("#next-puzzle");
  if (!target) return;
  const now = Date.now();
  const remaining = 86_400_000 - (now % 86_400_000);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  target.textContent = `Next animal in ${hours}h ${minutes}m`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (refreshDay() && !practice) {
    announcement.textContent = "Midnight! There's a new animal. Make a fresh guess.";
    return;
  }
  const { animal, guesses } = activeRound();
  if (isFinished(guesses, animal.speed)) return;
  const error = validateGuess(input.value, unit, guesses);
  errorText.textContent = error ?? "";
  input.setAttribute("aria-invalid", String(Boolean(error)));
  if (error) { input.focus(); return; }
  const speed = toKmh(Number(input.value), unit);
  guesses.push(speed);
  save();
  input.value = "";
  render();
  const verdict = judge(speed, animal.speed);
  announcement.textContent = verdict === "correct"
    ? `Got it! ${animal.name}: ${speedText(animal.speed)} ${unit}. Caught in ${guesses.length} guesses.`
    : isFinished(guesses, animal.speed)
      ? `No guesses left. ${animal.name} runs up to ${speedText(animal.speed)} ${unit}.`
      : `${speedText(speed)} ${unit}. Go ${verdict}. ${MAX_GUESSES - guesses.length} guesses left.`;
  focusRound();
});

element("#practice-new").addEventListener("click", () => {
  refreshDay();
  practice = { animal: practiceAnimal(activeRound().animal.id, puzzle.animal.id), guesses: [] };
  resetInput();
  render();
  announcement.textContent = `Practice round: ${practice.animal.name}. Five fresh guesses. Your daily progress is safe.`;
  focusRound();
});

element("#daily-return").addEventListener("click", () => {
  practice = null;
  refreshDay();
  resetInput();
  render();
  announcement.textContent = "Back to your daily puzzle. Your progress is restored.";
  focusRound();
});

document.querySelectorAll<HTMLInputElement>('input[name="unit"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const previousUnit = unit;
    unit = radio.value === "mph" ? "mph" : "km/h";
    if (input.value && Number.isFinite(Number(input.value))) {
      input.value = String(Number(fromKmh(toKmh(Number(input.value), previousUnit), unit).toFixed(2)));
    }
    errorText.textContent = "";
    input.removeAttribute("aria-invalid");
    save();
    render();
  });
});

element("#help-open").addEventListener("click", () => dialog.showModal());
element("#help-close").addEventListener("click", () => dialog.close());
element("#help-start").addEventListener("click", () => { dialog.close(); if (!form.hidden) input.focus(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshDay(); });
window.setInterval(() => { if (!refreshDay()) updateCountdown(); }, 1000);
render();
