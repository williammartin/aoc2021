import run from "aocrunner"
import * as F from "fp-ts/lib/function.js"
import * as A from "fp-ts/lib/Array.js"

// Part One

type Direction = "forward" | "down" | "up"
const matchDirection = <R>(
  direction: Direction,
  fns: { onForward: () => R; onDown: () => R; onUp: () => R },
): R => {
  switch (direction) {
    case "forward":
      return fns.onForward()
    case "up":
      return fns.onUp()
    case "down":
      return fns.onDown()
    default:
      const exhaustiveCheck: never = direction
      throw new Error(`Unhandled Direction case: ${exhaustiveCheck}`)
  }
}

type Translation = {
  direction: Direction
  distance: number
}

const parseTranslations = (rawInput: string): Translation[] =>
  rawInput
    .split("\n")
    .map((line) => line.split(" "))
    .map((lineComponents) => ({
      direction: lineComponents[0] as Direction,
      distance: Number(lineComponents[1]),
    }))

type Displacement = {
  vertical: number
  horizontal: number
}

const displace = (
  currentDisplacement: Displacement,
  translation: Translation,
): Displacement =>
  matchDirection(translation.direction, {
    onForward: (): Displacement => ({
      vertical: currentDisplacement.vertical,
      horizontal: currentDisplacement.horizontal + translation.distance,
    }),
    onUp: () => ({
      vertical: currentDisplacement.vertical - translation.distance,
      horizontal: currentDisplacement.horizontal,
    }),
    onDown: () => ({
      vertical: currentDisplacement.vertical + translation.distance,
      horizontal: currentDisplacement.horizontal,
    }),
  })

const initialDisplacement: Displacement = { vertical: 0, horizontal: 0 }
const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseTranslations,
    A.reduce(initialDisplacement, displace),
    (finalDisplacement) =>
      finalDisplacement.vertical * finalDisplacement.horizontal,
  ).toString()

// const part1 = (rawInput: string) => {
//   const translations = parseInput(rawInput)
//   let displacement: Displacement = { vertical: 0, horizontal: 0 }

//   for (const translation of translations) {
//     displacement = displace(translation, displacement)
//   }

//   return (displacement.vertical * displacement.horizontal).toString()
// }

// Part 2

type Movement = { _tag: "movement"; direction: "forward"; distance: number }
type AimAdjustment = {
  _tag: "aimAdjustment"
  direction: "up" | "down"
  amount: number
}
type Command = Movement | AimAdjustment

const matchCommand = <R>(
  command: Command,
  fns: {
    onMovement: (movement: Movement) => R
    onAimAdjustment: (aimAdjustment: AimAdjustment) => R
  },
): R => {
  switch (command._tag) {
    case "movement":
      return fns.onMovement(command)
    case "aimAdjustment":
      return fns.onAimAdjustment(command)
    default:
      const exhaustiveCheck: never = command
      throw new Error(`Unhandled Command case: ${exhaustiveCheck}`)
  }
}

const parseCommand = (rawCommand: string[]): Command => {
  switch (rawCommand[0]) {
    case "forward":
      return {
        _tag: "movement",
        direction: "forward",
        distance: Number(rawCommand[1]),
      }
    case "up":
      return {
        _tag: "aimAdjustment",
        direction: "up",
        amount: Number(rawCommand[1]),
      }
    case "down":
      return {
        _tag: "aimAdjustment",
        direction: "down",
        amount: Number(rawCommand[1]),
      }
    default:
      throw new Error("could not parse command")
  }
}

const parseCommands = (rawInput: string): Command[] =>
  rawInput
    .split("\n")
    .map((line) => line.split(" "))
    .map(parseCommand)

type Aim = number
const applyCommand = (
  [currentDisplacement, currentAim]: [Displacement, Aim],
  command: Command,
): [Displacement, Aim] =>
  matchCommand(command, {
    onMovement: (movement): [Displacement, Aim] => [
      {
        vertical: currentDisplacement.vertical + currentAim * movement.distance,
        horizontal: currentDisplacement.horizontal + movement.distance,
      },
      currentAim,
    ],
    onAimAdjustment: (aimAdjustment): [Displacement, Aim] => [
      currentDisplacement,
      aimAdjustment.direction === "up"
        ? currentAim - aimAdjustment.amount
        : currentAim + aimAdjustment.amount,
    ],
  })

const initialAim: Aim = 0
const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseCommands,
    A.reduce([initialDisplacement, initialAim], applyCommand),
    ([finalDisplacement]) =>
      finalDisplacement.vertical * finalDisplacement.horizontal,
  ).toString()

run({
  part1: {
    tests: [
      {
        input: [
          "forward 5",
          "down 5",
          "forward 8",
          "up 3",
          "down 8",
          "forward 2",
        ].join("\n"),
        expected: "150",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: [
          "forward 5",
          "down 5",
          "forward 8",
          "up 3",
          "down 8",
          "forward 2",
        ].join("\n"),
        expected: "900",
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
})
