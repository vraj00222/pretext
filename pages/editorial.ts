import gatsbyText from './gatsby.txt' with { type: 'text' }
import {
  layoutNextLine,
  prepareWithSegments,
  type LayoutCursor,
  type LayoutLine,
  type PreparedTextWithSegments,
} from '../src/layout.ts'

const FONT = '20px "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif'
const LINE_HEIGHT = 32
const SHEET_PADDING = 28
const TEXT_LEFT = 26
const TEXT_RIGHT = 26
const FIGURE_TOP = 64

const STORY = gatsbyText
  .split(/\n\s*\n/u)
  .map(paragraph => paragraph.trim())
  .filter(Boolean)
  .slice(0, 16)
  .join(' ')

const prepared: PreparedTextWithSegments = prepareWithSegments(STORY, FONT)

const sheet = document.getElementById('sheet') as HTMLDivElement
const lineStage = document.getElementById('line-stage') as HTMLDivElement
const figure = document.getElementById('figure') as HTMLDivElement
const quoteBox = document.getElementById('quote-box') as HTMLDivElement

const sheetWidthInput = document.getElementById('sheet-width') as HTMLInputElement
const figureSizeInput = document.getElementById('figure-size') as HTMLInputElement
const quoteWidthInput = document.getElementById('quote-width') as HTMLInputElement
const quoteTopInput = document.getElementById('quote-top') as HTMLInputElement

const statWidth = document.getElementById('stat-width')!
const statLines = document.getElementById('stat-lines')!
const statHeight = document.getElementById('stat-height')!
const statLeft = document.getElementById('stat-left')!
const statRight = document.getElementById('stat-right')!
const cursorMeta = document.getElementById('cursor-meta')!

type ShapeBox = {
  x: number
  y: number
  width: number
  height: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function lineOverlaps(box: ShapeBox, lineTop: number): boolean {
  const lineBottom = lineTop + LINE_HEIGHT
  return lineBottom > box.y && lineTop < box.y + box.height
}

function getInsets(lineTop: number, contentWidth: number, figureBox: ShapeBox, quoteShape: ShapeBox): { left: number, right: number } {
  let left = 0
  let right = 0

  if (lineOverlaps(figureBox, lineTop)) {
    right = Math.max(right, contentWidth - figureBox.x)
  }
  if (lineOverlaps(quoteShape, lineTop)) {
    left = Math.max(left, quoteShape.width)
  }

  return { left, right }
}

function setCursorMeta(index: number, line: LayoutLine | null): void {
  if (line === null) {
    cursorMeta.textContent = 'Move over a line to inspect its start/end cursors.'
    return
  }

  cursorMeta.textContent =
    `L${index + 1} • ${line.start.segmentIndex}:${line.start.graphemeIndex} → ` +
    `${line.end.segmentIndex}:${line.end.graphemeIndex} • ${line.width.toFixed(2)}px` +
    (line.trailingDiscretionaryHyphen ? ' • discretionary hyphen' : '')
}

function render(): void {
  const sheetWidth = parseInt(sheetWidthInput.value, 10)
  const figureSize = parseInt(figureSizeInput.value, 10)
  const quoteWidth = parseInt(quoteWidthInput.value, 10)
  const quoteTop = parseInt(quoteTopInput.value, 10)

  sheet.style.width = `${sheetWidth}px`

  const contentWidth = sheetWidth - SHEET_PADDING * 2
  const figureBox: ShapeBox = {
    x: contentWidth - figureSize,
    y: FIGURE_TOP,
    width: figureSize,
    height: Math.round(figureSize * 0.94),
  }
  const quoteShape: ShapeBox = {
    x: 0,
    y: quoteTop,
    width: quoteWidth,
    height: 186,
  }

  figure.style.width = `${figureBox.width}px`
  figure.style.height = `${figureBox.height}px`

  quoteBox.style.width = `${quoteShape.width}px`
  quoteBox.style.top = `${quoteShape.y}px`
  quoteBox.style.height = `${quoteShape.height}px`

  lineStage.replaceChildren()

  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let lineIndex = 0
  let maxLeftInset = 0
  let maxRightInset = 0

  while (true) {
    const lineTop = lineIndex * LINE_HEIGHT + 58
    const insets = getInsets(lineTop, contentWidth - TEXT_LEFT - TEXT_RIGHT, figureBox, quoteShape)
    const availableWidth = Math.max(160, contentWidth - TEXT_LEFT - TEXT_RIGHT - insets.left - insets.right)
    const x = TEXT_LEFT + insets.left
    const line = layoutNextLine(prepared, cursor, availableWidth)

    maxLeftInset = Math.max(maxLeftInset, insets.left)
    maxRightInset = Math.max(maxRightInset, insets.right)

    if (line === null) break

    const currentLineIndex = lineIndex
    const el = document.createElement('div')
    el.className = 'line'
    el.textContent = line.text
    el.style.top = `${lineTop}px`
    el.style.left = `${x}px`
    el.addEventListener('mouseenter', () => setCursorMeta(currentLineIndex, line))
    el.addEventListener('click', () => setCursorMeta(currentLineIndex, line))
    lineStage.appendChild(el)

    cursor = line.end
    lineIndex++
  }

  const totalHeight = lineIndex * LINE_HEIGHT + 120
  sheet.style.minHeight = `${clamp(totalHeight, 760, 2400)}px`

  statWidth.textContent = `${sheetWidth}px`
  statLines.textContent = String(lineIndex)
  statHeight.textContent = `${lineIndex * LINE_HEIGHT}px`
  statLeft.textContent = `${Math.round(maxLeftInset)}px`
  statRight.textContent = `${Math.round(maxRightInset)}px`

  setCursorMeta(-1, null)
}

sheetWidthInput.addEventListener('input', render)
figureSizeInput.addEventListener('input', render)
quoteWidthInput.addEventListener('input', render)
quoteTopInput.addEventListener('input', render)

render()
