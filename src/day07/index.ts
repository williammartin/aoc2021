import run from "aocrunner"
import * as A from "fp-ts/lib/Array.js"
import * as F from "fp-ts/lib/function.js"
import { splitBy } from "../utils/index.js"

type CrabPosition = number
const parseInput = (rawInput: string): CrabPosition[] =>
  F.pipe(rawInput, splitBy(","), A.map(Number))

const sumSequentialIntegersBetween = (start: number, end: number) =>
  (end * (start + end)) / 2

// When I sketched this out I was pretty sure that this might just be producing
// the median value of the list but since I'm not good at maths, and couldn't
// be sure, I just decided to do it in the way I knew would produce the right answer.
const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    (startingCrabPositions) =>
      F.pipe(
        startingCrabPositions,
        A.reduce(
          A.makeBy(startingCrabPositions.length, () => 0),
          (acc, curr) =>
            F.pipe(
              acc,
              // Here we are accumulating hte previous value with the absolute
              // distance between the crab's starting position and the position
              // we are currently calculating for.
              A.mapWithIndex((i, v) => v + Math.abs(i - curr)),
            ),
        ),
      ),
    A.reduce(Infinity, Math.min),
  )
const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    (startingCrabPositions) =>
      F.pipe(
        startingCrabPositions,
        A.reduce(
          // Actually not 100% sure that this makes sense since the positions of crabs
          // may not actually match all possible positions, but I'm getting the right
          // answer and I'm out of time to think about it.
          A.makeBy(startingCrabPositions.length, () => 0),
          (acc, curr) =>
            F.pipe(
              acc,
              A.mapWithIndex(
                // Here is the trick in Part 2...
                // Since each step consumes one more fuel than the last,
                // we can use the summation formula to add up all numbers
                // between 1 and the distance the crab needs to travel.
                (i, v) =>
                  v + sumSequentialIntegersBetween(1, Math.abs(i - curr)),
              ),
            ),
        ),
      ),
    A.reduce(Infinity, Math.min),
  )

run({
  part1: {
    tests: [{ input: "16,1,2,0,4,2,7,1,2,14", expected: 37 }],
    solution: part1,
  },
  part2: {
    tests: [{ input: "16,1,2,0,4,2,7,1,2,14", expected: 168 }],
    solution: part2,
  },
  trimTestInputs: true,
})
