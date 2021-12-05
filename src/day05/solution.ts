import * as A from "fp-ts/lib/Array.js"
import * as F from "fp-ts/lib/function.js"
import * as M from "fp-ts/lib/Map.js"
import * as S from "fp-ts/lib/string.js"
import * as O from "fp-ts/lib/Option.js"
import { Ord } from "fp-ts/lib/Ord.js"
import { Eq } from "fp-ts/lib/Eq.js"
import { rangeInclusive } from "../utils/index.js"

type Point = { x: number; y: number }
const point = (x: number, y: number): Point => ({ x, y })

type LineEnds = { start: Point; end: Point }
const lineEnds = (start: Point, end: Point): LineEnds => ({ start, end })
const isConnectedHorizontally = ({ start, end }: LineEnds): boolean =>
  start.y === end.y
const isConnectedVertically = ({ start, end }: LineEnds): boolean =>
  start.x === end.x

const splitBy = (separator: string) => (text: string) => text.split(separator)
const parseInput = (rawInput: string): LineEnds[] =>
  // I'm sure there is a simpler regex for this but alas I don't know regexes well
  F.pipe(
    rawInput,
    // Split the input by new lines
    splitBy("\n"),
    // Split each line by ->
    A.map(splitBy("->")),
    A.map(
      F.flow(
        // Remove any -> components
        A.filter((s) => s != "->"),
        // And remove any whitespace that preceeded or trailed ->
        A.map((s) => s.trim()),
        // Convert the [x,y] tuple to a Point
        A.map(F.flow(splitBy(","), ([x, y]) => point(Number(x), Number(y)))),
      ),
    ),
    // convert the [start,end] tuple to a LineEnds
    A.map(([start, end]) => lineEnds(start, end)),
  )

// This function does most of the heavy lifting, producing coordinates.
export const pointsBetweenLineEnds = ({ start, end }: LineEnds) => {
  // The replicate would work well if I had some kind of lazy iterator
  // I guess, where I could keep pulling the same number during a Zip operation.
  if (start.x === end.x) {
    // Produce an inclusive range for our coordinate that is changing
    const yRange = rangeInclusive(start.y, end.y)
    return F.pipe(
      // Produce a range that matches in length all of the other non-changing coordinate
      A.replicate(yRange.length, start.x),
      // Zip them together
      A.zip(yRange),
      A.map(([x, y]) => point(x, y)),
    )
  } else if (start.y === end.y) {
    const xRange = rangeInclusive(start.x, end.x)
    return F.pipe(
      A.replicate(xRange.length, start.y),
      A.zip(xRange),
      A.map(([y, x]) => point(x, y)),
    )
  } else {
    // Zip the two changing coordinate ranges together, since coordinates always change by 1,
    // we can assume every step is 45 degree angle.
    return F.pipe(
      rangeInclusive(start.x, end.x),
      A.zip(rangeInclusive(start.y, end.y)),
      A.map(([x, y]) => point(x, y)),
    )
  }
}

const eqPoint: Eq<Point> = {
  equals: (l: Point, r: Point): boolean => l.x === r.x && l.y === r.y,
}
const ordPoint: Ord<Point> = {
  equals: eqPoint.equals,
  // All points are equal, we're not giving them an ordering
  compare: (l: Point, r: Point) => 0,
}

type Count = number
const insertOrIncrementMapPoint = (
  map: Map<Point, Count>,
  point: Point,
): Map<Point, Count> =>
  F.pipe(
    map,
    M.lookup(eqPoint)(point),
    O.fold(
      () => M.upsertAt(eqPoint)(point, 1)(map),
      (currentCount) => M.upsertAt(eqPoint)(point, currentCount + 1)(map),
    ),
  )

const isNotDiagnonal = (lineEnds: LineEnds): boolean =>
  isConnectedHorizontally(lineEnds) || isConnectedVertically(lineEnds)

const sumPointsWithOverlaps = (
  count: number,
  numberOfOverlappingLinesAtPoint: number,
) => (numberOfOverlappingLinesAtPoint >= 2 ? count + 1 : count)

export const part1 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    // Remove any diagonal lines
    A.filter(isNotDiagnonal),
    // Produce _all_ the Points in a line between two points
    A.map(pointsBetweenLineEnds),
    // Flatten so we have one array of all Points
    A.flatten,
    // For every point we'll insert or update a counter in a map
    // each time we see that point.
    A.reduce(new Map<Point, Count>(), insertOrIncrementMapPoint),
    // Add one to a counter for every point that has more than two lines crossing it
    M.reduce(ordPoint)(0, sumPointsWithOverlaps),
  )

export const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.map(pointsBetweenLineEnds),
    A.flatten,
    A.reduce(new Map<Point, Count>(), insertOrIncrementMapPoint),
    M.reduce(ordPoint)(0, sumPointsWithOverlaps),
  )
