# Pretext

Pure JavaScript/TypeScript library for text measurement & layout. Fast, accurate & supports all the languages you didn't even know about. Allows rendering to DOM, Canvas, SVG and soon, server-side.

Pretext completely side-steps the need for DOM measurements (e.g. `getBoundingClientRect`, `offsetHeight`), which trigger layout reflow, one of the most expensive operations in the browser. See demos for layout out The Great Gatsby & other international books at >1000fps.

## API

YOu can either use the simple `layout()` API, which accurately returns the height of the text block at a given width, then render the text with regular DOM:

```ts
// code here
```

Or use the more advanced `layoutWithLines()` API, which returns <...> that lets you lay out text lines manually for more expressive controls:

```ts
// code here
```
