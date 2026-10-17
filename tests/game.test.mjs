import test from "node:test";
import assert from "node:assert/strict";
import {
  animals, dailyPuzzle, fromKmh, isFinished, judge, MAX_GUESSES,
  parseSavedGame, practiceAnimal, shareResult, toKmh, validateGuess,
} from "../src/game.ts";

test("daily puzzle is shared globally and changes at midnight UTC", () => {
  const first = dailyPuzzle(new Date("2026-10-17T00:00:00Z"));
  const same = dailyPuzzle(new Date("2026-10-17T23:59:59Z"));
  const next = dailyPuzzle(new Date("2026-10-18T00:00:00Z"));
  assert.deepEqual(first, same);
  assert.equal(first.number, 1);
  assert.equal(first.animal.id, "cheetah");
  assert.equal(next.animal.id, "giraffe");
  assert.equal(next.number, 2);
  assert.deepEqual(dailyPuzzle(new Date("2026-10-17T02:00:00+02:00")), first);
  assert.ok(dailyPuzzle(new Date("2026-10-16T00:00:00Z")).animal);
});

test("5 percent tolerance is inclusive at both exact boundaries", () => {
  for (const animal of animals) {
    assert.equal(judge(animal.speed * .95, animal.speed), "correct");
    assert.equal(judge(animal.speed * 1.05, animal.speed), "correct");
    assert.equal(judge(animal.speed * .9499, animal.speed), "faster");
    assert.equal(judge(animal.speed * 1.0501, animal.speed), "slower");
  }
});

test("unit conversion preserves the target and verdict", () => {
  for (const animal of animals) {
    assert.ok(Math.abs(toKmh(fromKmh(animal.speed, "mph"), "mph") - animal.speed) < 1e-10);
    assert.equal(judge(toKmh(Math.round(fromKmh(animal.speed, "mph")), "mph"), animal.speed), "correct");
    assert.equal(toKmh(animal.speed, "km/h"), animal.speed);
  }
});

test("invalid, empty, non-finite, out of range and duplicate guesses are rejected", () => {
  for (const value of ["", " ", "abc", "Infinity", "-5", "0", "301"]) {
    assert.ok(validateGuess(value, "km/h", []), value);
  }
  assert.ok(validateGuess("187", "mph", []));
  assert.ok(validateGuess("60", "km/h", [60]));
  assert.equal(validateGuess("60.5", "km/h", []), null);
  assert.equal(validateGuess("300", "km/h", []), null);
  assert.equal(validateGuess("100", "mph", []), null);
  assert.ok(validateGuess(String(fromKmh(60, "mph")), "mph", [60]));
});

test("game ends on success or the fifth miss, including a fifth-guess win", () => {
  assert.equal(isFinished([20, 40], 114), false);
  assert.equal(isFinished([114], 114), true);
  assert.equal(isFinished([10, 20, 30, 40, 50], 114), true);
  assert.equal(isFinished([10, 20, 30, 40, 114], 114), true);
  assert.equal(MAX_GUESSES, 5);
});

test("saved games restore only valid progress for the correct day and animal", () => {
  const animal = animals[0];
  const save = (guesses, extra = {}) => JSON.stringify({ date: "2026-10-17", animalId: animal.id, guesses, ...extra });
  assert.deepEqual(parseSavedGame(save([50, 100]), "2026-10-17", animal), [50, 100]);
  assert.equal(parseSavedGame(save([50]), "2026-10-18", animal), null);
  for (const raw of [
    "{", "null", "[]", save([0]), save(["50"]), save([301]), save([50, 50]),
    save([114, 50]), save([1, 2, 3, 4, 5, 6]), save([50], { animalId: "giraffe" }),
  ]) assert.throws(() => parseSavedGame(raw, "2026-10-17", animal));
});

test("share results show score and feedback without revealing speed or animal", () => {
  assert.equal(shareResult(1, [50, 150, 114], 114), "Speedle #1 3/5\n⬆️⬇️🟩\nA little wild guess.");
  assert.match(shareResult(1, [10, 20, 30, 40, 50], 114), /X\/5/);
  assert.match(shareResult(1, [10, 20, 30, 40, 114], 114), /5\/5/);
});

test("practice selects a different animal and avoids spoiling today's daily animal", () => {
  for (const daily of animals) {
    for (const current of animals) {
      const choices = new Set();
      for (const random of [0, .25, .5, .75, .999999]) {
        const animal = practiceAnimal(current.id, daily.id, () => random);
        assert.ok(animals.includes(animal));
        assert.notEqual(animal.id, current.id);
        assert.notEqual(animal.id, daily.id);
        choices.add(animal.id);
      }
      assert.equal(choices.size, animals.length - (daily.id === current.id ? 1 : 2));
    }
  }
});

test("practice shares are clearly separated from numbered daily results", () => {
  assert.equal(shareResult(null, [20, 60], 60), "Speedle practice 2/5\n⬆️🟩\nA little wild guess.");
  assert.match(shareResult(null, [1, 2, 3, 4, 5], 60), /^Speedle practice X\/5/);
  assert.doesNotMatch(shareResult(null, [60], 60), /#|Giraffe|60/);
});
