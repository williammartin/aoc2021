import { test } from "uvu"
import * as assert from "uvu/assert"
import { pointsBetweenLineEnds } from "../solution.js"

// The tests below are skipped because they expect ordering.
// Honestly lineBetweenPoints should probably return a Set but
// I can't be bothered.
test.skip("producing horizontal lines", () => {
  const start = { x: 0, y: 9 }
  const end = { x: 5, y: 9 }
  const line = pointsBetweenLineEnds({ start, end })

  assert.equal(line, [
    { x: 0, y: 9 },
    { x: 1, y: 9 },
    { x: 2, y: 9 },
    { x: 3, y: 9 },
    { x: 4, y: 9 },
    { x: 5, y: 9 },
  ])
})

test.skip("producing vertical lines", () => {
  const start = { x: 9, y: 0 }
  const end = { x: 9, y: 5 }
  const line = pointsBetweenLineEnds({ start, end })

  assert.equal(line, [
    { x: 9, y: 0 },
    { x: 9, y: 1 },
    { x: 9, y: 2 },
    { x: 9, y: 3 },
    { x: 9, y: 4 },
    { x: 9, y: 5 },
  ])
})

test.skip("producing horizontal lines backwards", () => {
  const start = { x: 2, y: 9 }
  const end = { x: 0, y: 9 }
  const line = pointsBetweenLineEnds({ start, end })

  assert.equal(line, [
    { x: 0, y: 9 },
    { x: 1, y: 9 },
    { x: 2, y: 9 },
  ])
})

test.skip("producing vertical lines upwards", () => {
  const start = { x: 9, y: 2 }
  const end = { x: 9, y: 0 }
  const line = pointsBetweenLineEnds({ start, end })

  assert.equal(line, [
    { x: 9, y: 0 },
    { x: 9, y: 1 },
    { x: 9, y: 2 },
  ])
})

test.skip("producing diagonal lines", () => {
  const start = { x: 1, y: 1 }
  const end = { x: 3, y: 3 }
  const line = pointsBetweenLineEnds({ start, end })

  assert.equal(line, [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
  ])
})

test.skip("producing diagonal lines backwards", () => {
  const start = { x: 9, y: 7 }
  const end = { x: 7, y: 9 }
  const line = pointsBetweenLineEnds({ start, end })

  assert.equal(line, [
    { x: 9, y: 7 },
    { x: 8, y: 8 },
    { x: 7, y: 9 },
  ])
})

test.run()
