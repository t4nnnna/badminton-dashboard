---
name: Badminton Dashboard
description: A lightweight, offline-first web app for tracking badminton matches with head-to-head stats, partner tracking, and doubles analysis for club members.
style: shadcn/ui zinc dark
colors:
  background: "#09090b"
  foreground: "#f4f4f5"
  card: "#09090b"
  card-foreground: "#f4f4f5"
  surface: "#0c0c0e"
  surface-2: "#141417"
  border: "#27272a"
  muted: "#18181b"
  muted-foreground: "#a1a1aa"
  primary: "#fafafa"
  primary-foreground: "#18181b"
  secondary: "#18181b"
  secondary-foreground: "#fafafa"
  destructive: "#ef4444"
  destructive-foreground: "#fafafa"
  ring: "#52525b"
  win: "#10b981"
  loss: "#ef4444"
typography:
  fontFamily: "Geist, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  fontMono: "Geist Mono, monospace"
  headings:
    letterSpacing: "-0.025em"
    fontWeight: 600
  body:
    fontSize: "14px"
    lineHeight: 1.5
layout:
  containerMaxWidth: "1100px"
  radius: "0.5rem"
  radius-sm: "6px"
  radius-lg: "12px"
components:
  buttons:
    primary: "High-contrast zinc-50 background with dark zinc-950 text and subtle shadow"
    secondary: "Zinc-900 background with zinc-800 border and zinc-100 text"
    ghost: "Transparent with muted text, subtle zinc-800 hover"
    danger: "Soft rose tint background with red-400 text"
  cards:
    background: "#0c0c0e"
    border: "1px solid #27272a"
    borderRadius: "8px"
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.25)"
  tabs:
    background: "#141417"
    border: "1px solid #27272a"
    active: "#27272a with subtle shadow"
  dialogs:
    backdrop: "rgba(0, 0, 0, 0.75) blur(8px)"
    box: "#09090b with 1px solid #27272a border and heavy shadow"
---

## Overview

Badminton Dashboard has been updated to use a **shadcn/ui-inspired interface** built on the signature Zinc dark theme. The design prioritizes visual hierarchy, crisp typographic details, high contrast action elements, and minimal borders.

## Colors & Tokens

All tokens follow the standard shadcn/ui naming conventions:
- **`--background`** (`#09090b`): Deep zinc black background.
- **`--foreground`** (`#f4f4f5`): Crisp zinc light text.
- **`--card` / `--surface`** (`#0c0c0e`): Subtle elevated container background with 1px zinc-800 border.
- **`--primary`** (`#fafafa`): High-contrast primary action button color with dark ink text.
- **`--secondary`** (`#18181b`): Subtle dark fill for chips, pills, and secondary controls.
- **`--border`** (`#27272a`): 1px border separator standard across all cards, tables, and inputs.
- **`--muted-foreground`** (`#a1a1aa`): Secondary labels, timestamps, and subtitles.
- **`--win-color`** (`#10b981`) & **`--loss-color`** (`#ef4444`): Soft badge and score highlights.

## Typography

The application uses **Geist** with seamless fallbacks to **Inter** and system sans-serif:
- Headings feature tight letter spacing (`-0.025em`) for modern editorial polish.
- Numbers and match scores utilize tabular figures for numerical alignment.
- Labels are clean, understated, and maintain comfortable reading contrast.

## Icons

Components utilize **Lucide React** (`lucide-react`) for clean, consistent line iconography across navigation, metrics, actions, and dialogs.
