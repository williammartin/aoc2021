import run from "aocrunner"
import * as F from "fp-ts/lib/function.js"
import * as A from "fp-ts/lib/Array.js"

const splitBy = (separator: string) => (text: string) => text.split(separator)
const notEmpty = (text: string) => text.length !== 0
const transpose = <A>(m: A[][]): A[][] => m[0].map((_, i) => m.map((x) => x[i]))

type BingoInput = { numbers: string[]; cards: Cards }
type Cards = Card[]
type Card = Line[]
type Line = Spot[]
type Spot = { state: "unmarked" | "marked"; n: string }

const isUnmarkedSpot = (spot: Spot) => spot.state === "unmarked"
const isMarkedSpot = (spot: Spot) => spot.state === "marked"
const unmarkedSpot = (n: string): Spot => ({ state: "unmarked", n })
const markedSpot = (n: string): Spot => ({ state: "marked", n })

const parseInput = (rawInput: string): BingoInput =>
  F.pipe(
    rawInput,
    // Split the lines by new line
    splitBy("\n"),
    // Remove any empty lines
    A.filter(notEmpty),
    // Split into a head and tail (there's probably a cleaner functional way like matchLeft)
    A.splitAt(1),
    ([numbers, cards]) => ({
      // Split the first line by comma to get just the bingo numbers
      numbers: F.pipe(numbers[0], splitBy(",")),
      // Split the cards into chunks of 5 lines
      cards: F.pipe(
        cards,
        A.chunksOf(5),
        A.map(
          // Split each line by space and remove empty spaces because sometimes there are multiple
          // then create every Spot as unmarked
          A.map(F.flow(splitBy(" "), A.filter(notEmpty), A.map(unmarkedSpot))),
        ),
      ),
    }),
  )

const isCardWinning = (card: Card) =>
  F.pipe(
    card,
    // We don't care about diagonals so it is fine to transpose
    // and concat the columns as if they were lines.
    A.concat(transpose(card)),
    // Remove any lines that have spots that are unmarked
    A.filter(A.every(isMarkedSpot)),
    // If any lines are left then this must be a winning card
    (winningLines) => winningLines.length >= 1,
  )

const sum = (l: number, r: number) => l + r
const countValueOfUnmarkedSpots = (card: Card) =>
  F.pipe(
    card,
    // Flatten all lines into an array of Spots
    A.flatten,
    // Remove any marked spots
    A.filter(isUnmarkedSpot),
    // Sum up the value of all remaining spots
    A.map((spot) => Number(spot.n)),
    A.reduce(0, sum),
  )

const part1 = (rawInput: string) => {
  const bingoInput = parseInput(rawInput)

  let cards: Cards = bingoInput.cards
  for (const number of bingoInput.numbers) {
    cards = cards.map((lines) =>
      lines.map((line) =>
        line.map((spot) => (spot.n === number ? markedSpot(spot.n) : spot)),
      ),
    )

    for (const card of cards) {
      if (isCardWinning(card)) {
        return countValueOfUnmarkedSpots(card) * Number(number)
      }
    }
  }

  throw new Error("Didn't find a winning card after all numbers")
}

const part2 = (rawInput: string) => {
  const bingoInput = parseInput(rawInput)

  let cards: Cards = bingoInput.cards
  for (const number of bingoInput.numbers) {
    cards = cards.map((lines) =>
      lines.map((line) =>
        line.map((spot) => (spot.n === number ? markedSpot(spot.n) : spot)),
      ),
    )

    let nonWinningCards = []
    for (const card of cards) {
      if (!isCardWinning(card)) {
        nonWinningCards.push(card)
      }
    }

    if (nonWinningCards.length === 0) {
      return countValueOfUnmarkedSpots(cards[0]) * Number(number)
    }

    cards = nonWinningCards
  }

  throw new Error("Didn't find a winning card after all numbers")
}

const testInput = `7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1

22 13 17 11 0
8 2 23 4 24
21 9 14 16 7
6 10 3 18 5
1 12 20 15 19

3 15 0 2 22
9 18 13 17 5
19 8 7 25 23
20 11 10 24 4
14 21 16 12 6

14 21 17 24 4
10 16 15 9 19
18 8 23 26 20
22 11 13 6 5
2 0 12 3 7
`

run({
  part1: {
    tests: [{ input: testInput, expected: 4512 }],
    solution: part1,
  },
  part2: {
    tests: [{ input: testInput, expected: 1924 }],
    solution: part2,
  },
  trimTestInputs: true,
})

// Useful test cases for checking if a card is winning
// Row / Column / Both

// const card: Card = [
//   [
//     { state: "unmarked", n: "22" },
//     { state: "unmarked", n: "13" },
//     { state: "unmarked", n: "17" },
//     { state: "unmarked", n: "11" },
//     { state: "unmarked", n: "0" },
//   ],
//   [
//     { state: "unmarked", n: "22" },
//     { state: "unmarked", n: "13" },
//     { state: "unmarked", n: "17" },
//     { state: "unmarked", n: "11" },
//     { state: "unmarked", n: "0" },
//   ],
//   [
//     { state: "unmarked", n: "22" },
//     { state: "unmarked", n: "13" },
//     { state: "unmarked", n: "17" },
//     { state: "unmarked", n: "11" },
//     { state: "unmarked", n: "0" },
//   ],
// ]

// const card: Card = [
//   [
//     { state: "marked", n: "22" },
//     { state: "marked", n: "13" },
//     { state: "marked", n: "17" },
//     { state: "marked", n: "11" },
//     { state: "marked", n: "0" },
//   ],
//   [
//     { state: "marked", n: "22" },
//     { state: "unmarked", n: "13" },
//     { state: "unmarked", n: "17" },
//     { state: "unmarked", n: "11" },
//     { state: "unmarked", n: "0" },
//   ],
//   [
//     { state: "unmarked", n: "22" },
//     { state: "unmarked", n: "13" },
//     { state: "unmarked", n: "17" },
//     { state: "marked", n: "11" },
//     { state: "unmarked", n: "0" },
//   ],
// ]

// const card: Card = [
//   [
//     { state: "marked", n: "22" },
//     { state: "unmarked", n: "13" },
//     { state: "unmarked", n: "17" },
//     { state: "unmarked", n: "11" },
//     { state: "marked", n: "0" },
//   ],
//   [
//     { state: "marked", n: "22" },
//     { state: "unmarked", n: "13" },
//     { state: "unmarked", n: "17" },
//     { state: "unmarked", n: "11" },
//     { state: "marked", n: "0" },
//   ],
//   [
//     { state: "unmarked", n: "22" },
//     { state: "unmarked", n: "13" },
//     { state: "unmarked", n: "17" },
//     { state: "unmarked", n: "11" },
//     { state: "marked", n: "0" },
//   ],
// ]

// const card: Card = [
//   [
//     { state: "marked", n: "77" },
//     { state: "marked", n: "44" },
//     { state: "marked", n: "23" },
//     { state: "marked", n: "12" },
//     { state: "marked", n: "1" },
//   ],
//   [
//     { state: "marked", n: "18" },
//     { state: "marked", n: "52" },
//     { state: "marked", n: "31" },
//     { state: "marked", n: "75" },
//     { state: "marked", n: "70" },
//   ],
//   [
//     { state: "marked", n: "5" },
//     { state: "marked", n: "85" },
//     { state: "marked", n: "28" },
//     { state: "marked", n: "89" },
//     { state: "marked", n: "6" },
//   ],
//   [
//     { state: "marked", n: "42" },
//     { state: "marked", n: "58" },
//     { state: "marked", n: "88" },
//     { state: "marked", n: "9" },
//     { state: "marked", n: "87" },
//   ],
//   [
//     { state: "marked", n: "38" },
//     { state: "marked", n: "99" },
//     { state: "marked", n: "57" },
//     { state: "marked", n: "78" },
//     { state: "marked", n: "72" },
//   ],
// ]
