import run from "aocrunner"
import * as F from "fp-ts/lib/function.js"
import * as A from "fp-ts/lib/Array.js"

const parseInput = (rawInput: string) =>
  rawInput.split("\n").map((n) => Number(n))

// function -> something that computes a result from its inputs
// loop -> iterates over a collection of things -> for forEach map filter
// if -> conditionally do something or evaluate an expression
// list -> a sequential collection of items

// previous depth = y
// current depth = x
// if x > y then add 1

// variables -> names that point to other things
// let x = 0
// let i = x
// let depths = [1,2,3,6]
//
// NAME       | VALUE
// -----------|------
//  i         |   x
//  x         |   0
// depths     | [1,2,3,6]
// increasing | ([x,y]) => boolean

// x
// i
// depths[0]

// [1,2,3,4]
// [2,3,4]

// [ [1,2], [2,3], [3,4] ]
const pairwise = <T>(as: T[]): [T, T][] => A.zip(as, as.slice(1))

type DepthComparisonFn = ([x, y]: [number, number]) => boolean
const increasing = ([x, y]: [number, number]) => x < y
// const decreasing = ([x, y]: [number, number]) => x > y

const depthChanges =
  (depthComparisonFunction: DepthComparisonFn) => (rawInput: string) =>
    F.pipe(
      rawInput,
      parseInput,
      pairwise,
      A.filter(depthComparisonFunction),
    ).length.toString()

const part1 = depthChanges(increasing)

// const part1 = (rawInput: string) => {
//   const depths = parseInput(rawInput)

//   PROCESS THE ARRAY INTO THE OTHER ARRAY

//   let countOfIncreasedDepths = 0
//   for (let i = 1; i < depths.length; i++) {
//     let currentDepth = depths[i]
//     let previousDepth = depths[i - 1]

//     if (currentDepth > previousDepth) {
//       countOfIncreasedDepths++
//     }
//   }

//   return countOfIncreasedDepths
// }

const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.chop((depths) => [depths[0] + depths[1] + depths[2], depths.slice(1)]),
    pairwise,
    A.filter(([x, y]) => x < y),
  ).length.toString()

run({
  part1: {
    tests: [{ input: ["1", "2", "1", "3"].join("\n"), expected: "2" }],
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
