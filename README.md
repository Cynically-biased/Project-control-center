# Project Control Center

A Windows desktop application for managing separate local software projects. Built with Electron and a local Node.js monitoring service. No cloud account or AI integration is required.

## Features

- Add projects with a preview before creating monitoring records; import existing monitoring without overwriting it.
- Git-aware inventory scanning, sensitive-file exclusions, progress, cancellation, and exclusion details.
- PHP, JavaScript, TypeScript/JSX/TSX, Python, and JSON syntax validation.
- Project-specific errors, tasks, changes, validation results, suggestions, activity, and overview notes.
- Searchable, paginated tables; clear history and restore the most recently cleared table.
- Scan snapshots and error comparisons, project settings, backup and previewed restore.

Syntax checks are limited checks, not functional tests, type checking, a security audit, or an overall software-quality rating. AI assistant integration is not implemented.

## Requirements

- Windows 10/11 x64 for the packaged release.
- Node.js 22 or newer and npm for development/builds. The packaged app includes its runtime.
- Git on PATH for ignore-rule evaluation and change comparisons.
- Optional: PHP for PHP validation and Python 3 (`py -3` on Windows) for Python validation.

## Develop

```powershell
npm ci
npm start
```

If Electron's binary download was skipped by your npm configuration, run `node node_modules/electron/install.js` before starting.

## Test and package

```powershell
npm test
npm run build
```

The smoke test uses an isolated temporary registry and synthetic project; it verifies startup, monitoring setup, syntax-error detection, task restoration, and scan history. It does not access your real projects.

Build output is in `dist/Project Control Center-win32-x64`. Distribute that entire folder, not just the EXE. This is an unsigned portable application; no installer or automatic updates are configured. Bundled TypeScript parser source and its license are in `validators/`. The packaged Electron runtime includes its own license notices.

## Use

Launch the app, click **Add project**, enter an existing absolute folder path and unique project identity, preview, then create monitoring. Click **Scan folder** to update its records. For folders already containing monitoring records, use **Import project** instead.

Each project's records live in `.project-monitoring`. The application registry and settings are in Electron's per-user application-data directory, accessible through **Application → Open application data folder**. They are not included in this repository. The desktop service binds to loopback on an available port and shuts down with the application.

PHP can be selected in **Application → Select PHP executable**. Restart to apply that executable setting. PHP on PATH and a conventional XAMPP installation are also detected.

## Backup and restore

**Backup** downloads monitoring and registry metadata as JSON, without copying application source files. Keep it private: your notes and project metadata can be included. **Restore** previews affected projects and requires explicit permission to replace registered projects. Project folders must already exist at their recorded local paths. Unrelated projects are preserved.

## Scope and safety

- Scans do not edit application code, run project builds, run application code, install project dependencies, or push Git commits.
- Git ignore rules, sensitive-data exclusions, symlink exclusions, scan limits, and validation limits apply.
- Scan check scores describe recorded checks only. Unsupported and unavailable validation is displayed explicitly.
- Freshness checks sample up to 2,000 previously inventoried files; new files require a scan. Exclusion history records up to 500 paths. Scan history retains the latest 100 snapshots.
- Apache `.htaccess` protection uses `Require all denied` and requires authorization overrides to be enabled. Other web servers need equivalent protection; PHP's built-in server does not enforce `.htaccess`. Keep monitoring outside the public web root where possible.
- No existing project registry, credentials, local monitoring history, or project source is shipped here.

The root `.gitignore` prevents this application's local runtime data and build output from being committed. It does not edit any registered project's ignore rules or Git tracking.
