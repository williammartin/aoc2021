import run from "aocrunner"
import * as A from "fp-ts/lib/Array.js"
import * as F from "fp-ts/lib/function.js"
import { splitBy } from "../utils/index.js"
import { Ord } from "fp-ts/lib/number.js"

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

// Absolutely disgusting no help from the compiler here
// Just messing about with union types and matches in place
// of switch cause I'm a bad person.
type Char = "{" | "(" | "[" | "<" | ">" | "]" | ")" | "}"
const isChar = (c: string): c is Char =>
  ["{", "(", "[", "<", ">", "]", ")", "}"].includes(c)

const parseChar = (c: string): Char => {
  if (!isChar(c)) {
    throw new Error(`Failed to parse input char: ${c}`)
  }
  return c
}

const applyCharPartial =
  <R>(
    fns: Partial<{
      [P in Char]: () => R
    }>,
    otherwise: (char: Char) => R,
  ) =>
  (char: Char): R => {
    for (const [fnName, fn] of Object.entries(fns)) {
      if (fnName === char) {
        return fn()
      }
    }
    return otherwise(char)
  }

const parseInput = (rawInput: string): Char[][] =>
  F.pipe(rawInput, splitBy("\n"), A.map(F.flow(splitBy(""), A.map(parseChar))))

type Failure = { location: number; char: Char }
type Corrupt = { _tag: "corrupt"; chars: Char[]; failure: Failure }
type Incomplete = { _tag: "incomplete"; chars: Char[] }
type Valid = { _tag: "valid"; chars: Char[] }
type ParseResult = Valid | Incomplete | Corrupt

const isIncomplete = (parseResult: ParseResult): parseResult is Incomplete =>
  parseResult._tag === "incomplete"

const isCorrupt = (parseResult: ParseResult): parseResult is Corrupt =>
  parseResult._tag === "corrupt"

const parseChars = (chars: Char[]): ParseResult => {
  const stack = new Stack<Char>()

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

const part1Scores = new Map<Char, number>([
  [")", 3],
  ["]", 57],
  ["}", 1197],
  [">", 25137],
])

const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.map(parseChars),
    A.filter(isCorrupt),
    A.reduce(0, (acc, curr) => acc + part1Scores.get(curr.failure.char)!),
  )

const findClosingChar = applyCharPartial(
  {
    "{": (): Char => "}",
    "(": (): Char => ")",
    "[": (): Char => "]",
    "<": (): Char => ">",
  },
  (char) => {
    throw new Error(`unexpected char ${char}`)
  },
)

const missingChars = (chars: Char[]): Char[] => {
  const stack = new Stack<Char>()
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

  return F.pipe(stack.toArray(), A.reverse, A.map(findClosingChar))
}

const part2Scores = new Map<Char, number>([
  [")", 1],
  ["]", 2],
  ["}", 3],
  [">", 4],
])

// New function I just learned how to write for MAXIMUM POINT FREE
const prop =
  <A, P extends keyof A>(prop: P) =>
  (a: A) =>
    a[prop]

const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.map(parseChars),
    A.filter(isIncomplete),
    A.map(
      F.flow(
        prop("chars"),
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
