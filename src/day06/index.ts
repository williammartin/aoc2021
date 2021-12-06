import run from "aocrunner"
import * as A from "fp-ts/lib/Array.js"
import * as F from "fp-ts/lib/function.js"
import { splitBy, sum } from "../utils/index.js"

type DaysToLive = number
type NumberOfFish = number

const parseInput = (rawInput: string): DaysToLive[] =>
  F.pipe(rawInput, splitBy(","), A.map(Number))

const incrementFishCounter = (a: number[], i: number) => {
  const copiedState = A.copy(a)
  copiedState[i] = copiedState[i] + 1
  return copiedState
}

// The FP-TS utilities here that I could find didn't seem super ergonomic
// so I fell back to some manual mutating of state with some assumptions
// that the array would contain valid values. At least in this case we aren't
// mutating some global.
const simulateDay = (fishState: NumberOfFish[]) => {
  // Rotate the array 1 to the left
  const newState = A.rotate(-1)(fishState)
  // This is the magic. Since we've rotated the array one step
  // to the left, all fish that were about to reproduce have "reproduced"
  // into [8], and the fish that reproduced need to be added to those at [6].
  newState[6] = newState[6] + newState[8]
  return newState
}

const startingState: NumberOfFish[] = A.makeBy(9, () => 0)
const initialFishState = (daysToLive: number[]): NumberOfFish[] =>
  F.pipe(daysToLive, A.reduce(startingState, incrementFishCounter))

const simulateFishGrowth =
  (days: number) => (startingFishState: NumberOfFish[]) =>
    F.pipe(
      // This kind of seems like maybe a gross way to "repeat"
      // but I'm not sure what a good functional approach really is.
      A.makeBy(days, F.identity),
      A.reduce(startingFishState, (acc, _curr) => simulateDay(acc)),
    )

const solve = (daysToSimulate: number) => (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    initialFishState,
    simulateFishGrowth(daysToSimulate),
    A.reduce(0, sum),
  )

run({
  part1: {
    tests: [{ input: "3,4,3,1,2", expected: 5934 }],
    solution: solve(80),
  },
  part2: {
    tests: [{ input: "3,4,3,1,2", expected: 26984457539 }],
    solution: solve(256),
  },
  trimTestInputs: true,
})
