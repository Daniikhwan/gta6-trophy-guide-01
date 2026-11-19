// Sunset Platinum — a GTA VI trophy guide & tracker for make.fun (gta6-trophy-guide-01).
//
// What this entry is: a static, offline web app in app/ (plain HTML + CSS + ES modules,
// no build step, no libraries, no network calls at runtime). It ships the full official
// list of 55 trophies in app/data/trophies.json — every name and description kept exactly
// as PlayStation lists them, each with its grade, hidden flag, kind, roadmap stage,
// progress target, a guide written in our own words, and cited sources — plus a tracker
// that saves progress and notes in localStorage, filters, a spoiler setting, a roadmap,
// a missables page and a Next-up planner.
//
// What this file does: it stages the entry for the judge. It copies app/ and
// screenshots/ from beside this file into the output directory (MAKEFUN_OUTPUT_DIR
// when set, otherwise /output), then writes output/dossier.json using the vendored
// make.fun library in vendor/makefun-frontend.ts — that library must stay untouched,
// because the scorer only accepts a dossier byte-identical to what its own copy writes.
//
// Run it locally:  node serve.ts        (then open http://localhost:8080)
// Package it:        MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Caps from the competition gate: at most 4 screenshots, each at most 256 KiB; app/
// at most 993 files and directories and 48 MiB; the dossier's text budget is 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
console.log(`Sunset Platinum packaged into ${out}`);
