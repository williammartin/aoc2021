import run from "aocrunner"
import * as F from "fp-ts/lib/function.js"
import * as A from "fp-ts/lib/Array.js"

const parseInput = (rawInput: string) =>
  rawInput.split("\n").map((line) => line.split("").map(Number))

const transpose = <A>(m: A[][]): A[][] => m[0].map((_, i) => m.map((x) => x[i]))
const mostFrequentDigit = F.flow(
  A.map((n) => (n === 0 ? -1 : 1)),
  A.reduce(0, (acc, curr) => acc + curr),
  (n) => (n > 0 ? 1 : 0),
)

const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    transpose,
    A.map(mostFrequentDigit),
    // GROSS string and number logic here
    // cause I'm bad at maths. There's probably a bitwise complement
    // that I just don't understand but whateverrrr
    (digits) => ({
      epsilon: parseInt(digits.join(""), 2),
      gamma: parseInt(digits.map((d) => (d === 0 ? 1 : 0)).join(""), 2),
    }),
    (rates) => rates.epsilon * rates.gamma,
  ).toString()

const mostFrequentDigitWeighted = (numbers: number[]) =>
  F.pipe(
    numbers,
    A.reduce(0, (acc, curr) => acc + curr),
    (sum) => (sum >= numbers.length / 2 ? 1 : 0),
  )

const leastFrequentDigitWeighted = (numbers: number[]) =>
  F.pipe(
    numbers,
    A.reduce(0, (acc, curr) => acc + curr),
    (sum) => (sum < numbers.length / 2 ? 1 : 0),
  )

const part2 = (rawInput: string) => {
  const diagnostics = parseInput(rawInput)

  let mostFrequentDigitRemainingDiagnostics = diagnostics
  for (let i = 0; i < diagnostics[0].length; i++) {
    const mostFrequentDigit = mostFrequentDigitWeighted(
      transpose(mostFrequentDigitRemainingDiagnostics)[i],
    )

    mostFrequentDigitRemainingDiagnostics =
      mostFrequentDigitRemainingDiagnostics.filter(
        (diagnostic) => diagnostic[i] === mostFrequentDigit,
      )

    if (mostFrequentDigitRemainingDiagnostics.length === 1) {
      break
    }
  }

  let leastFrequentDigitRemainingDiagnostics = diagnostics
  for (let i = 0; i < diagnostics[0].length; i++) {
    const leastFrequentDigit = leastFrequentDigitWeighted(
      transpose(leastFrequentDigitRemainingDiagnostics)[i],
    )

    leastFrequentDigitRemainingDiagnostics =
      leastFrequentDigitRemainingDiagnostics.filter(
        (diagnostic) => diagnostic[i] === leastFrequentDigit,
      )

    if (leastFrequentDigitRemainingDiagnostics.length === 1) {
      break
    }
  }

  const o2generatorRating = parseInt(
    mostFrequentDigitRemainingDiagnostics[0].join(""),
    2,
  )
  const co2ScrubberRating = parseInt(
    leastFrequentDigitRemainingDiagnostics[0].join(""),
    2,
  )

  return (o2generatorRating * co2ScrubberRating).toString()
}

run({
  part1: {
    tests: [
      {
        input: [
          "00100",
          "11110",
          "10110",
          "10111",
          "10101",
          "01111",
          "00111",
          "11100",
          "10000",
          "11001",
          "00010",
          "01010",
        ].join("\n"),
        expected: "198",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: [
          "00100",
          "11110",
          "10110",
          "10111",
          "10101",
          "01111",
          "00111",
          "11100",
          "10000",
          "11001",
          "00010",
          "01010",
        ].join("\n"),
        expected: "230",
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
})
