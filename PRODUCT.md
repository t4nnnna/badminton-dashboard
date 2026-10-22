# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: React + Vite chosen for lightweight, SPA-style dashboard with local storage support.

## Users

Club members who are casual to intermediate badminton players, often without continuous internet access. They use the app on desktop or mobile browser to record matches, review history, and analyze performance after playing sessions.

## Product Purpose

Track badminton matches in a lightweight web app that works offline, storing match data locally and providing analysis through head-to-head records, partner statistics, and doubles-specific insights. Success is measured by users reliably capturing their game data without needing an internet connection.

## Positioning

A minimal, browser-based match log for club players who value simplicity and local-first storage over social features or real-time sync. Unlike full-featured sports databases, Badminton Dashboard focuses exclusively on singles/doubles play, format recording, and performance review accessible from any device with a browser.

## Constraints

- **Offline First**: Must store data in localStorage/IndexedDB to function without network access
- **Club Members Focus**: Tailored for group tracking (head-to-head between multiple club members)
- **Lightweight**: No backend required; deployable as static files or from simple hosting
