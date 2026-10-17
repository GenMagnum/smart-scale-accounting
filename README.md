# Smart Scale Accounting

Accounting Support That Scales With You.

A static website for Smart Scale Accounting with service pages, a guided Accounting Workload Check, a capacity and cost calculator, fictional sample working papers, pilot and enquiry planners, and optional browser installation.

## Hosting

This folder is the complete site. It needs static HTTPS hosting with JavaScript modules; no build step, paid API, database or account sign-in is required for visitors.

For Cloudflare Pages, connect this repository, choose no framework, leave the build command empty and use the repository root as the output directory. Select the free plan. Update canonical and Open Graph URLs in index.html, plus robots.txt and sitemap.xml, when a new public hosting URL is confirmed.

The installed web app uses the same hosting. Its pages and tools can be cached after a successful online visit. Email drafts are sent only by the visitor through their email app. Answers remain in page memory and clear on refresh or close. Download a summary to keep a copy.

## Features

- Four core workflows in the workload check, with separate catch-up scoping.
- Editable review and coordination assumptions; unknown and negative scenarios.
- Hourly and fixed-fee cost comparisons with one-off setup costs.
- Fictional supplier and bank reconciliations, exception log and close checklist.
- A defined two-week pilot, subject to agreed scope and fixed fee.
- Contact: smartscale2026@gmail.com.

## Maintenance

Change the cache version in sw.js when releasing updated app assets. Do not store client records or credentials in this repository. Sample work is fictional; calculator figures are assumptions rather than a fee quote or guarantee.
