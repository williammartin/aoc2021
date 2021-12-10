import run from "aocrunner"
import * as A from "fp-ts/lib/Array.js"
import * as F from "fp-ts/lib/function.js"
import * as S from "fp-ts/lib/Set.js"
import { Eq } from "fp-ts/lib/string.js"
import { splitBy, sum } from "../utils/index.js"

type SignalPattern = string[] // length of 10
type FourDigitOutputValue = string[] // length of 4
type NotebookEntry = [SignalPattern, FourDigitOutputValue]

const parseInput = (rawInput: string): NotebookEntry[] =>
  F.pipe(
    rawInput,
    splitBy("\n"),
    A.map(
      F.flow(
        splitBy(" | "),
        A.filter((text) => text !== " | "),
        A.map(splitBy(" ")),
      ),
    ),
    A.map((components) => [components[0], components[1]] as NotebookEntry),
  )

const countEasyDigits = (value: FourDigitOutputValue) =>
  F.pipe(
    value,
    A.reduce(
      0,
      (acc, curr) =>
        acc +
        (curr.length === 2 ||
        curr.length === 4 ||
        curr.length === 3 ||
        curr.length === 7
          ? 1
          : 0),
    ),
  )
const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.reduce(0, (acc, [_, value]) => acc + countEasyDigits(value)),
  )

const contains = (l: string, r: string): boolean =>
  F.pipe(l, splitBy(""), S.fromArray(Eq), (left) =>
    F.pipe(
      r,
      splitBy(""),
      S.fromArray(Eq),
      S.difference(Eq)(left),
      (diff) => diff.size === 0,
    ),
  )

const overlapsExactly = (l: string, r: string): boolean =>
  r.length === l.length &&
  F.pipe(r, splitBy(""), S.fromArray(Eq), (right) =>
    F.pipe(
      l,
      splitBy(""),
      S.fromArray(Eq),
      S.union(Eq)(right),
      (unionedSet) => unionedSet.size === right.size,
    ),
  )

const decodedValue = ([pattern, value]: NotebookEntry): number => {
  let digits: string[] = []
  digits[1] = pattern.find((s) => s.length === 2)!
  pattern = pattern.filter((s) => s !== digits[1])

  digits[4] = pattern.find((s) => s.length === 4)!
  pattern = pattern.filter((s) => s !== digits[4])

  digits[7] = pattern.find((s) => s.length === 3)!
  pattern = pattern.filter((s) => s !== digits[7])

  digits[8] = pattern.find((s) => s.length === 7)!
  pattern = pattern.filter((s) => s !== digits[8])
  // We should now know 1,4,7,8

  digits[3] = pattern.find((s) => s.length === 5 && contains(s, digits[1]))!
  pattern = pattern.filter((s) => s !== digits[3])
  // We should now 1,3,4,7,8

  digits[9] = pattern.find((s) => contains(s, digits[3]))!
  pattern = pattern.filter((s) => s !== digits[9])
  // We should now have 1,3,4,7,8,9

  digits[0] = pattern.find((s) => contains(s, digits[1]))!
  pattern = pattern.filter((s) => s !== digits[0])
  // We should now have 0,1,3,4,7,8,9

  digits[6] = pattern.find((s) => s.length === 6)!
  pattern = pattern.filter((s) => s !== digits[6])
  // We should now have 0,1,3,4,6,7,8,9

  digits[5] = pattern.find((s) => contains(digits[6], s))!
  pattern = pattern.filter((s) => s !== digits[5])
  // We should now have 0,1,3,4,5,6,7,8,9

  digits[2] = pattern.find((s) => true)!
  pattern = pattern.filter((s) => s !== digits[2])
  // We should now have 0,1,2,3,4,5,6,7,8,9

  // Now we need to look through each of the values on the right side
  // match their string to a number and then concacenate all those
  // numbers together.
  return Number(
    F.pipe(
      value,
      A.map((v) => {
        for (let i = 0; i < digits.length; i++) {
          if (overlapsExactly(v, digits[i])) {
            return i
          }
        }
        throw new Error("OMG WHAT DID WE DO WRONG")
      }),
      A.map((i) => i.toString()),
    ).join(""),
  )
}

const part2 = (rawInput: string) =>
  F.pipe(rawInput, parseInput, A.map(decodedValue), A.reduce(0, sum))

const testInput = `be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce
`

const simplifiedInput = `edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc`

run({
  part1: {
    tests: [{ input: testInput, expected: 26 }],
    solution: part1,
  },
  part2: {
    tests: [
      { input: simplifiedInput, expected: 9781 },
      { input: testInput, expected: 61229 },
    ],
    solution: part2,
  },
  trimTestInputs: true,
})
