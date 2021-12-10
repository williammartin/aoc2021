import run from "aocrunner"
import * as A from "fp-ts/lib/Array.js"
import { Eq } from "fp-ts/lib/Eq.js"
import * as O from "fp-ts/lib/Ord.js"
import * as F from "fp-ts/lib/function.js"
import { splitBy } from "../utils/index.js"

type Point = { row: number; column: number }

const parseInput = (rawInput: string) =>
  F.pipe(rawInput, splitBy("\n"), A.map(F.flow(splitBy(""), A.map(Number))))

const findLowPoints = (heightMap: number[][]) => {
  const lowPoints: Point[] = []
  for (let i = 0; i < heightMap.length; i++) {
    for (let j = 0; j < heightMap[i].length; j++) {
      const up = { row: i - 1, column: j }
      const right = { row: i, column: j + 1 }
      const down = { row: i + 1, column: j }
      const left = { row: i, column: j - 1 }

      const upValue = heightMap[up.row]?.[up.column] ?? Infinity
      const rightValue = heightMap[right.row]?.[right.column] ?? Infinity
      const downValue = heightMap[down.row]?.[down.column] ?? Infinity
      const leftValue = heightMap[left.row]?.[left.column] ?? Infinity

      const currentValue = heightMap[i][j]

      if (
        [upValue, rightValue, downValue, leftValue].every(
          (v) => v > currentValue,
        )
      ) {
        lowPoints.push({ row: i, column: j })
      }
    }
  }
  return lowPoints
}

const part1 = (rawInput: string) => {
  const heightMap = parseInput(rawInput)

  return F.pipe(
    heightMap,
    findLowPoints,
    A.reduce(0, (acc, curr) => acc + heightMap[curr.row][curr.column] + 1),
  )
}

const eqPoint: Eq<Point> = {
  equals: (x, y) => x.row === y.row && x.column === y.column,
}

const ordBasin: O.Ord<Point[]> = {
  equals: A.getEq(eqPoint).equals,
  compare: (x, y) =>
    x.length - y.length < 0 ? -1 : x.length - y.length > 0 ? 1 : 0,
}

const findAdjacentBasinPoints = (
  currentPoint: Point,
  heightMap: number[][],
): Point[] => {
  const { row, column } = currentPoint
  const up = { row: row - 1, column }
  const right = { row, column: column + 1 }
  const down = { row: row + 1, column }
  const left = { row, column: column - 1 }

  return F.pipe(
    [up, right, down, left],
    A.reduce([currentPoint], (acc, curr) => {
      const neighbouringHeight = heightMap[curr.row]?.[curr.column] ?? -1
      if (
        neighbouringHeight === 9 ||
        neighbouringHeight <= heightMap[row][column]
      ) {
        return acc
      }
      return acc.concat(findAdjacentBasinPoints(curr, heightMap))
    }),
    // We need to remove duplicates because a point may have appeared multiple times
    // since always add it to the array. Gross but whatever I can't be bothered to think
    // of a better solution.
    A.uniq(eqPoint),
  )
}

const part2 = (rawInput: string) => {
  const heightMap = parseInput(rawInput)
  return F.pipe(
    heightMap,
    findLowPoints,
    A.reduce([] as Point[][], (basins, lowPoint) => [
      ...basins,
      findAdjacentBasinPoints(lowPoint, heightMap),
    ]),
    A.sort(O.reverse(ordBasin)),
    A.takeLeft(3),
    A.reduce(1, (total, basin) => total * basin.length),
  )
}

const testInput = `2199943210
3987894921
9856789892
8767896789
9899965678`

run({
  part1: {
    tests: [{ input: testInput, expected: 15 }],
    solution: part1,
  },
  part2: {
    tests: [{ input: testInput, expected: 1134 }],
    solution: part2,
  },
  trimTestInputs: true,
})
