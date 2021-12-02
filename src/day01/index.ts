import run from "aocrunner"
import * as F from "fp-ts/lib/function.js"
import * as A from "fp-ts/lib/Array.js"

interface Stringable {
  toString(): string
}
const toString = (stringable: Stringable) => stringable.toString()

const parseInput = (rawInput: string) =>
  rawInput.split("\n").map((n) => Number(n))

const pairwise = <A>(as: A[]): [A, A][] => A.zip(as, as.slice(1))

const sumIncreasingNeighbours = (numbers: number[]) =>
  F.pipe(
    numbers,
    pairwise,
    A.filter(([x, y]) => x < y),
    A.size,
  )

const part1 = (rawInput: string) =>
  F.pipe(rawInput, parseInput, sumIncreasingNeighbours, toString)

const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.chop((depths) => [depths[0] + depths[1] + depths[2], depths.slice(1)]),
    sumIncreasingNeighbours,
    toString,
  )

run({
  part1: {
    tests: [
      {
        input: [
          "199",
          "200",
          "208",
          "210",
          "200",
          "207",
          "240",
          "269",
          "260",
          "263",
        ].join("\n"),
        expected: "7",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: [
          "199",
          "200",
          "208",
          "210",
          "200",
          "207",
          "240",
          "269",
          "260",
          "263",
        ].join("\n"),
        expected: "5",
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
})
