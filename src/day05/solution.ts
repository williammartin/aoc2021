import { number } from "fp-ts"
import * as A from "fp-ts/lib/Array.js"
import * as F from "fp-ts/lib/function.js"
import * as M from "fp-ts/lib/Map.js"
import * as S from "fp-ts/lib/string.js"
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

type SerialisedPoint = string
type Count = number
const insertOrIncrementMapPoint = (
  map: Map<SerialisedPoint, Count>,
  point: Point,
): Map<SerialisedPoint, Count> => {
  // I tried at one time to make this use a copied map but
  // the runtime was horrendous. There's also probably a smarter
  // way to use an object as a key that I don't know.
  const maybeMapMarking = map.get(JSON.stringify(point))
  if (!maybeMapMarking) {
    return map.set(JSON.stringify(point), 1)
  }

  return map.set(JSON.stringify(point), maybeMapMarking + 1)
}

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
    A.reduce(new Map<SerialisedPoint, Count>(), insertOrIncrementMapPoint),
    // Add one to a counter for every point that has more than two lines crossing it
    M.reduce(S.Ord)(0, sumPointsWithOverlaps),
  )

export const part2 = (rawInput: string) =>
  F.pipe(
    rawInput,
    parseInput,
    A.map(pointsBetweenLineEnds),
    A.flatten,
    A.reduce(new Map<SerialisedPoint, Count>(), insertOrIncrementMapPoint),
    M.reduce(S.Ord)(0, sumPointsWithOverlaps),
  )
