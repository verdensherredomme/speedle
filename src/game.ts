export type Unit = "km/h" | "mph";
export type Verdict = "faster" | "slower" | "correct";
export type AnimalId = "cheetah" | "giraffe" | "ostrich" | "pronghorn";

export interface Animal {
  id: AnimalId;
  name: string;
  scientificName: string;
  habitat: string;
  speed: number;
  fact: string;
  source: string;
}

// Keep this order stable: changing it changes the daily schedule.
export const animals: readonly Animal[] = [
  {
    id: "cheetah",
    name: "Cheetah",
    scientificName: "Acinonyx jubatus",
    habitat: "The African grasslands",
    speed: 114,
    fact: "Built for short bursts, not marathons. A cheetah uses its long tail for balance when changing direction.",
    source: "https://www.britannica.com/animal/cheetah-mammal",
  },
  {
    id: "giraffe",
    name: "Giraffe",
    scientificName: "Giraffa",
    habitat: "The African savanna",
    speed: 60,
    fact: "Those long legs cover serious ground. A giraffe can sustain about 50 km/h for several kilometres.",
    source: "https://www.britannica.com/animal/giraffe",
  },
  {
    id: "ostrich",
    name: "Ostrich",
    scientificName: "Struthio camelus",
    habitat: "Africa's open country",
    speed: 72.5,
    fact: "No flight needed. The world's largest living bird runs on powerful legs with just two toes on each foot.",
    source: "https://www.britannica.com/animal/ostrich",
  },
  {
    id: "pronghorn",
    name: "Pronghorn",
    scientificName: "Antilocapra americana",
    habitat: "The North American plains",
    speed: 70,
    fact: "Not actually an antelope! The pronghorn is the only living member of its family, Antilocapridae.",
    source: "https://www.britannica.com/animal/pronghorn",
  },
];

export const MAX_GUESSES = 5;
export const TOLERANCE = 0.05;
export const MAX_SPEED = 300;
export const MILES_TO_KM = 1.609344;
const DAY_MS = 86_400_000;
const EPOCH = Date.UTC(2026, 9, 17);

export function dailyPuzzle(date = new Date()) {
  const day = Math.floor(date.getTime() / DAY_MS);
  const index = day - Math.floor(EPOCH / DAY_MS);
  return {
    key: new Date(day * DAY_MS).toISOString().slice(0, 10),
    number: index + 1,
    animal: animals[((index % animals.length) + animals.length) % animals.length],
  };
}

export function practiceAnimal(currentId: AnimalId, dailyId: AnimalId, random = Math.random): Animal {
  const candidates = animals.filter((animal) => animal.id !== currentId && animal.id !== dailyId);
  return candidates[Math.floor(random() * candidates.length)];
}

export function toKmh(value: number, unit: Unit): number {
  return unit === "mph" ? value * MILES_TO_KM : value;
}

export function fromKmh(value: number, unit: Unit): number {
  return unit === "mph" ? value / MILES_TO_KM : value;
}

export function judge(guess: number, target: number): Verdict {
  if (Math.abs(guess - target) <= target * TOLERANCE + 1e-9) return "correct";
  return guess < target ? "faster" : "slower";
}

export function isFinished(guesses: readonly number[], target: number): boolean {
  return guesses.length >= MAX_GUESSES || guesses.some((guess) => judge(guess, target) === "correct");
}

export function validateGuess(raw: string, unit: Unit, previous: readonly number[]): string | null {
  if (!raw.trim()) return "Enter a speed to make your first move.";
  const value = Number(raw);
  const speed = toKmh(value, unit);
  if (!Number.isFinite(speed) || speed <= 0 || speed > MAX_SPEED) {
    return `Enter a speed above 0 and up to ${Math.floor(fromKmh(MAX_SPEED, unit))} ${unit}.`;
  }
  if (previous.some((guess) => Math.abs(guess - speed) < 0.01)) {
    return "You've tried that speed. Pick a different one.";
  }
  return null;
}

export interface SavedGame {
  date: string;
  animalId: AnimalId;
  guesses: number[];
}

export function parseSavedGame(raw: string, date: string, animal: Animal): number[] | null {
  const value: unknown = JSON.parse(raw);
  if (typeof value !== "object" || value === null) throw new Error("Saved game is not an object.");
  if (!("date" in value) || typeof value.date !== "string") throw new Error("Saved game has no date.");
  if (value.date !== date) return null;
  if (!("animalId" in value) || value.animalId !== animal.id) throw new Error("Saved animal does not match today's puzzle.");
  if (!("guesses" in value) || !Array.isArray(value.guesses) || value.guesses.length > MAX_GUESSES) {
    throw new Error("Saved guesses are invalid.");
  }
  const guesses: number[] = [];
  for (const guess of value.guesses) {
    if (
      typeof guess !== "number" || !Number.isFinite(guess) || guess <= 0 || guess > MAX_SPEED ||
      isFinished(guesses, animal.speed) || guesses.some((previous) => Math.abs(previous - guess) < 0.01)
    ) throw new Error("Saved guess is invalid.");
    guesses.push(guess);
  }
  return guesses;
}

export function shareResult(number: number | null, guesses: readonly number[], target: number): string {
  const won = guesses.some((guess) => judge(guess, target) === "correct");
  const symbols = guesses.map((guess) => {
    const verdict = judge(guess, target);
    return verdict === "correct" ? "🟩" : verdict === "faster" ? "⬆️" : "⬇️";
  });
  const title = number === null ? "Speedle practice" : `Speedle #${number}`;
  return `${title} ${won ? guesses.length : "X"}/${MAX_GUESSES}\n${symbols.join("")}\nA little wild guess.`;
}
