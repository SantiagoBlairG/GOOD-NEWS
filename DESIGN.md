---
name: Bright Side
description: Calm, mobile-first discovery of hopeful demo stories.
colors:
  canvas: "#f8f7f4"
  surface: "#fff"
  text: "#142033"
  muted: "#526176"
  accent: "#00c853"
  green: "#087a35"
  selected: "#eaf8ee"
  border: "#e1e5eb"
  accent-hover: "#00b94d"
  dark-canvas: "#121b19"
  dark-surface: "#1d2925"
  dark-text: "#f0f5f1"
  dark-muted: "#b0c1b8"
  dark-green: "#81e8a9"
  dark-selected: "#183d2a"
  dark-border: "#34473d"
typography:
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(30px, 4vw, 42px)"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    fontWeight: 700
rounded:
  input: "12px"
  search: "16px"
  collection: "20px"
  map: "24px"
  story: "28px"
  pill: "30px"
  circle: "50%"
spacing:
  step-4: "4px"
  step-8: "8px"
  step-12: "12px"
  step-16: "16px"
  step-20: "20px"
  step-24: "24px"
  step-32: "32px"
  step-40: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  story-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.story}"
  collection-card:
    rounded: "{rounded.collection}"
  chip-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.green}"
    rounded: "{rounded.pill}"
    padding: "10px 15px"
---

# Design System: Bright Side

## Overview

The design direction is the written visual contract in plan.md: warm off-white, white editorial surfaces, navy type, vivid green actions, and rounded cards. Reference screenshots and an approved visual comp were unavailable; this record describes implemented code, not a screenshot-approved composition. Bright Side remains a working name. No new metaphor or brand identity is established here.

The interface is calm and intentional, with a portrait discovery deck and visible alternatives to gestures. Hopeful stories retain dates, source context, image credits, and fictional-demo labeling.

Key characteristics: locally hosted Manrope, readable image overlays, restrained depth, generous touch targets, and persistent bottom tabs on primary screens.

## Colors

Primary: vivid green accent identifies Save and primary actions. Labels stay navy, including in dark appearance. The deeper green token supports topic labels, selected controls, focus outlines, and active navigation.

Neutral: canvas is warm off-white; surface is white; text is navy; muted supports secondary copy; border separates settings, rows, and navigation. Selected is the pale green contextual surface.

Appearance uses semantic root CSS variables. Light, dark, and system settings change canvas, surface, text, muted, green, selected, border, and shadow. Accent remains vivid green. Photography uses dark gradients and white labels as contextual treatments.

## Typography

Manrope with sans-serif fallback serves all roles. Latin weights 400, 600, and 700 are locally bundled through Fontsource.

Headings use weight 700, line-height 1.18, balanced wrapping, and -0.035em tracking. General h1 scales from 30px to 42px; Home is 37px desktop and 30px mobile. Article hero is 42px, reducing to 32px. General h2 is 26px; general h3 is 20px, with story-row overrides of 18px desktop and 16px mobile. Body is 16px with 1.6 line-height; article summary is 19px semibold. Metadata and topic labels resolve to 13px. Bottom tabs use compact 11px semibold labels.

## Layout

Primary screens are **Operate mode**: Home, Discover and its map view, Saved and topic collections, and Profile. Bottom navigation stays fixed on these routes with four equal mobile tabs. **Read mode** is /story/:storyId: tabs are absent, article actions occupy the toolbar, and the reading surface is constrained to 68ch inside an 800px article container.

Main content is centered at 1100px maximum; the portrait Home deck is 460px maximum. Profile is 660px maximum. Principal spacing is 4/8/12/16/20/24/32/40px, with observed component-specific values retained. Desktop main gutters are 28px; mobile gutters are 20px and become 16px at 360px. Breakpoints are max-width 767px and 360px. Discovery grids move from three to two to one column. Home's mobile hero resolves to a 270px minimum after later CSS overrides.

Controls provide at least 44px touch targets; bottom links have a 48px minimum height. Safe-area inset padding belongs to bottom navigation and sheets. ResizeObserver measures actual navigation height into --nav-height; primary content and toast placement use it to prevent overlap. Sheets use at most 80dvh and scroll internally.

Route scroll positions are held in memory: browser history restores location-key positions, primary routes restore pathname plus query positions, and fresh article navigation starts at the top. Discover query state is remembered when returning via its tab. Saved stories, preferences, and deck progress persist through validated device-local storage; failures preserve in-memory changes and show a status warning. There are no accounts or sync.

## Elevation & Depth

White surfaces and pale green layers supply most hierarchy. Story/deck cards and toast use 0 16px 40px -15px #14203326; dark appearance substitutes 0 16px 40px -15px #0008. Secondary buttons use 0 3px 14px -6px #14203330; circular swipe controls use 0 6px 22px -9px #14203330. Deck layers offset 8px and 16px with small rotations and scale changes. Modal overlay is #14203388 above navigation.

## Shapes

Large editorial story cards, reading surfaces, and dialogs have 28px corners. Collections and small story cards use 20px; map surfaces use 24px; search fields use 16px; regular fields use 12px. Pills use 30px and icon controls are circular. Images clip within cards; gradients support text over photography.

## Components

Buttons are green pills with navy labels, 12px 20px padding, 14px bold type, and 44px minimum height. Hover deepens green; active state scales to 0.98. Secondary buttons are white with restrained shadow, and ghost actions use muted text. Focus-visible outlines are 3px green with 4px offset; disabled buttons use 0.4 opacity.

Topic chips are white with muted labels and a border; selected chips use pale green, deeper green labels and border, and bold weight. The Discover topic strip scrolls horizontally on phones. Search has a visible label, 16px input type, and 50px minimum input height. Settings selects and dialog inputs maintain 44px minimum height.

The deck exposes Skip, Save, Undo, and Read alongside swipe input. Saves happen immediately. Collection cards are horizontal photographic tiles with 20px corners and dark lower gradients. Saved rows separate save controls from reading links. Empty, missing, image-fallback, storage-warning, and map loading/error states use the same semantic palette.

Map markers coexist with a story-list alternative. Effective reduced motion is the OR of OS setting and app preference: CSS transitions and animations stop, deck exits reduce to opacity over 0.08s with no translation or rotation, and map cluster navigation uses duration 0 instead of 250ms. Normal deck exit is 0.28s. Map reads the live effective preference through a ref without remounting. Button/settings transitions normally use 0.18s cubic-bezier(0.2, 0.8, 0.2, 1).

## Do's and Don'ts

- Do preserve the written plan's palette, Manrope weights, editorial radii, portrait deck, and mobile bottom navigation.
- Do retain source/date/image-credit/demo context and visible gesture alternatives.
- Do use semantic theme variables and honor both reduced-motion settings.
- Do keep Read mode focused on the article and return navigation.
- Don't invent screenshot approval, verified real news, accounts, sync, or deployment status.
- Don't replace the approved direction with decorative landing-page sections, urgency, autoplay, streaks, or consumption rewards.

## Article presentation update

Owner-requested refinement: article routes omit the app header, logo, and demo pill. The cover starts at page top and spans the viewport with square upper corners. Back, Save, and Share overlay the image with safe-area spacing. Hero top padding is 96px; body measure remains 68ch, with a rounded reading surface and fictional-content notice in the body. This supersedes the earlier 800px article container and 80px hero top padding.

## Map visual update

The owner's supplied map is the visual reference: white oceans, green country fills ranging from pale chartreuse to deep forest green, and fine pale country borders. No multicolor geography, background place labels, or graticules. Both map surfaces use the shared greenMapStyle transformation; country colors are decorative and encode no data. Story markers and clusters remain interactive overlays.
