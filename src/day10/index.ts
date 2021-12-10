import run from "aocrunner"
import * as A from "fp-ts/lib/Array.js"
import * as F from "fp-ts/lib/function.js"
import { splitBy } from "../utils/index.js"
import { Ord } from "fp-ts/lib/number.js"

const part1Scores = new Map<string, number>([
  [")", 3],
  ["]", 57],
  ["}", 1197],
  [">", 25137],
])

const part2Scores = new Map<string, number>([
  [")", 1],
  ["]", 2],
  ["}", 3],
  [">", 4],
])

// Totally stolen from https://dev.to/glebirovich/typescript-data-structures-stack-and-queue-hld#stack
class Stack<T> {
  private storage: T[] = []

  constructor(private capacity: number = Infinity) {}

  push(item: T): void {
    if (this.size() === this.capacity) {
      throw Error("Stack has reached max capacity, you cannot add more items")
    }
    this.storage.push(item)
  }

  pop(): T | undefined {
    return this.storage.pop()
  }

  peek(): T | undefined {
    return this.storage[this.size() - 1]
  }

  size(): number {
    return this.storage.length
  }

  isEmpty(): boolean {
    return this.size() === 0
  }

  toArray(): T[] {
    return [...this.storage]
  }
}

const parseInput = (rawInput: string) =>
  F.pipe(rawInput, splitBy("\n"), A.map(splitBy("")))

type Failure = { location: number; char: string }
type Corrupt = { _tag: "corrupt"; chars: string[]; failure: Failure }
type Incomplete = { _tag: "incomplete"; chars: string[] }
type Valid = { _tag: "valid"; chars: string[] }
type ParseResult = Valid | Incomplete | Corrupt

const isIncomplete = (parseResult: ParseResult): parseResult is Incomplete =>
  parseResult._tag === "incomplete"

const isCorrupt = (parseResult: ParseResult): parseResult is Corrupt =>
  parseResult._tag === "corrupt"

const parseChars = (chars: string[]): ParseResult => {
  const stack = new Stack<string>()
  for (const [i, char] of chars.entries()) {
    switch (char) {
      case "{":
      case "(":
      case "[":
      case "<":
        stack.push(char)
        break
      case "}":
        if (stack.pop() !== "{") {
          return { _tag: "corrupt", chars, failure: { location: i, char } }
        }
        break
      case ")":
        if (stack.pop() !== "(") {
          return { _tag: "corrupt", chars, failure: { location: i, char } }
        }
        break
      case "]":
        if (stack.pop() !== "[") {
          return { _tag: "corrupt", chars, failure: { location: i, char } }
        }
        break
      case ">":
        if (stack.pop() !== "<") {
          return { _tag: "corrupt", chars, failure: { location: i, char } }
        }
        break
    }
  }

  if (!stack.isEmpty()) {
    return { _tag: "incomplete", chars }
  }

  return { _tag: "valid", chars }
}

const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.map(parseChars),
    A.filter(isCorrupt),
    A.reduce(0, (acc, curr) => acc + part1Scores.get(curr.failure.char)!),
  )

const missingChars = (chars: string[]): string[] => {
  const stack = new Stack<string>()
  for (const char of chars) {
    switch (char) {
      case "{":
      case "(":
      case "[":
      case "<":
        stack.push(char)
        break
      case "}":
      case ")":
      case "]":
      case ">":
        stack.pop()
        break
    }
  }

  return F.pipe(
    stack.toArray(),
    A.reverse,
    A.map((char) => {
      switch (char) {
        case "{":
          return "}"
        case "(":
          return ")"
        case "[":
          return "]"
        case "<":
          return ">"
        default:
          throw new Error(`unexpected char ${char}`)
      }
    }),
  )
}

const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.map(parseChars),
    A.filter(isIncomplete),
    A.map((result) =>
      F.pipe(
        result.chars,
        missingChars,
        A.reduce(0, (acc, curr) => acc * 5 + part2Scores.get(curr)!),
      ),
    ),
    A.sort(Ord),
    (scores) => scores[Math.floor(scores.length / 2)],
  )

const testInput = `[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<{}[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]{}
[[<[([]))<([[{}[[()]]]
[{[{({}]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<{}))><([]([]()
<{([([[(<>()){}]>(<<{{
<{([{{}}[<[[[<>{}]]]>[]]`

run({
  part1: {
    tests: [{ input: testInput, expected: 26397 }],
    solution: part1,
  },
  part2: {
    tests: [{ input: testInput, expected: 288957 }],
    solution: part2,
  },
  trimTestInputs: true,
})
