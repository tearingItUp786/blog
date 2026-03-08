# Blog Card Uniform Image Size Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task.

**Goal:** Make all regular grid blog card images render at a uniform size
regardless of source image resolution, using aspect ratio + object-cover.

**Architecture:** Keep the existing `aspect-[8/5]` aspect ratio container on the
image wrapper. Add `relative` positioning to the inner wrapper div and
`absolute inset-0 w-full h-full object-cover` to the `<img>` element inside
`InlineImage` so the image fills the aspect box without distortion. This change
is scoped to the `BlogCard` component by passing `imgDivClassName` with
`relative` and an `imgClassName` prop (or using the existing `className`
imgProps passthrough) — no global change to `InlineImage` defaults.

**Tech Stack:** React 18, Tailwind CSS, `twMerge`

---

### Task 1: Update `InlineImage` to apply `object-cover` when given an absolute-fill image class

**Files:**

- Modify: `app/components/typography.tsx:209`

**Context:**

The `<img>` element inside `InlineImage` currently receives `className` from
`imgProps`. The wrapper `div` at line 229 has `w-full` + the `aspectClasses`. We
need the `<img>` to fill that wrapper box absolutely.

The cleanest approach with zero risk to other `InlineImage` usages: pass
`object-cover w-full h-full` as the `className` prop from `BlogCard` into
`InlineImage`. The `className` already gets merged onto the `<img>` via
`imageProps.className` at line 209. We also need the inner wrapper div
(`line 229`) to be `relative` so the absolute image positions correctly.

The wrapper div already has `w-full` and `aspectClasses`. We need to add
`relative overflow-hidden` to it. But changing this globally could affect other
`InlineImage` usages. Instead, we expose a new optional prop
`imgWrapperClassName` that gets merged onto that div.

**Step 1: Add `imgWrapperClassName` prop to `InlineImage`**

In `app/components/typography.tsx`, add `imgWrapperClassName` to the
destructured props and the type definition:

```tsx
export const InlineImage = ({
  src = '',
  alt,
  children,
  containerClassName,
  imgDivClassName,
  imgWrapperClassName,   // <-- add this
  aspectW = 'aspect-[8/4]',
  aspectH = '',
  lazyLoadImage = false,
  className,
  openInNewTab = false,
  ...imgProps
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  children?: React.ReactNode
  containerClassName?: string
  aspectW?: string
  aspectH?: string
  imgDivClassName?: string
  imgWrapperClassName?: string   // <-- add this
  lazyLoadImage?: boolean
  openInNewTab?: boolean
}) => {
```

**Step 2: Apply `imgWrapperClassName` to the inner wrapper div**

Change line 229 in `app/components/typography.tsx` from:

```tsx
<div className={twMerge('w-full', aspectClasses, containerClass)}>
```

to:

```tsx
<div className={twMerge('w-full', aspectClasses, containerClass, imgWrapperClassName)}>
```

**Step 3: Verify typecheck passes**

Run: `pnpm typecheck` Expected: no errors

---

### Task 2: Update `BlogCard` to use uniform image sizing

**Files:**

- Modify: `app/routes/blog._index/blog-card.tsx:29-36`

**Context:**

The regular grid `BlogCard` instances (not the featured post) need their images
to fill the aspect-ratio box. We do this by:

1. Adding `relative overflow-hidden` to the inner wrapper div via
   `imgWrapperClassName`
2. Adding `absolute inset-0 w-full h-full object-cover` to the `<img>` via
   `className`

The featured post card is rendered separately in `route.tsx` and is
intentionally excluded from this change.

**Step 1: Update the `InlineImage` call in `BlogCard`**

In `app/routes/blog._index/blog-card.tsx`, update the `InlineImage` usage:

```tsx
<InlineImage
	lazyLoadImage={lazyLoadImage}
	fetchpriority={lazyLoadImage ? 'auto' : 'high'}
	imgDivClassName="aspect-[8/5]"
	imgWrapperClassName="relative overflow-hidden"
	className="absolute inset-0 h-full w-full object-cover"
	containerClassName="flex-1 basis-full lg:basis-7/12 mx-0 lg:mx-0 my-0 lg:my-0"
	src={hero}
	alt={title}
/>
```

**Step 2: Verify typecheck passes**

Run: `pnpm typecheck` Expected: no errors

**Step 3: Verify lint passes**

Run:
`pnpm lint -- app/routes/blog._index/blog-card.tsx app/components/typography.tsx`
Expected: no warnings or errors

**Step 4: Verify build**

Run: `pnpm build` Expected: successful build with no errors

---

### Task 3: Manual visual verification

**Context:** Start the dev server and visually verify the blog index page
(`/blog`) shows grid cards with uniform image heights at multiple viewport
widths.

**Step 1: Start dev server**

Run: `pnpm dev`

**Step 2: Open `/blog` in browser**

- Check that grid cards (3-column layout on desktop) all have identical image
  heights
- Resize to tablet/mobile and confirm images remain uniform within their cards
- Confirm featured post card is unaffected
- Confirm images are not distorted (object-cover crops without stretching)
- Confirm lazy-loaded images still load correctly

**Step 3: Commit**

```bash
git add app/components/typography.tsx app/routes/blog._index/blog-card.tsx
git commit -m "fix: uniform image sizing on blog grid cards using aspect ratio + object-cover"
```
