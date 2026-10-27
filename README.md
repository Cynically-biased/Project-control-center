# Project Control Center

A Windows desktop application for managing separate local software projects. Built with Electron and a local Node.js monitoring service. No cloud account is required. AI features are optional.

## Features

- Add projects with a preview before creating monitoring records; import existing monitoring without overwriting it.
- Git-aware inventory scanning, sensitive-file exclusions, progress, cancellation, and exclusion details.
- PHP, JavaScript, TypeScript/JSX/TSX, Python, and JSON syntax validation.
- Project-specific errors, tasks, changes, validation results, suggestions, activity, and overview notes.
- Searchable, paginated tables; clear history and restore the most recently cleared table.
- Scan snapshots and error comparisons, project settings, backup and previewed restore.

Syntax checks are limited checks, not functional tests, type checking, a security audit, or an overall software-quality rating. An optional local AI assistant is included; see [AI setup](AI_SETUP.md). External Odysseus and Ollama services are not installed or bundled.

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

## Optional local AI assistant

**AI is included in the standard desktop app, but disabled by default. You must install Ollama, Odysseus and a local model yourself to use it. Monitoring, tasks, scanning, backup and every non-AI feature work without them.** Nothing is installed or downloaded by enabling AI.

The AI Assistant tab has a setup checklist, a built-in copy of the installation guide, an enable/disable switch, connection settings and a connection test. It supports project chat and drafts for tasks, suggestions and overview notes. Drafts need review and approval before saving. No code-editing, shell, web-research or Git permissions are provided.

### Install the optional AI components on Windows

1. Install [Ollama for Windows](https://ollama.com/download/windows) and leave it running. Its normal local address is `http://127.0.0.1:11434`. Allow several GB for the software and additional space for the model. [Official Windows instructions](https://docs.ollama.com/windows) explain moving model storage to another drive with `OLLAMA_MODELS`.
2. Download a local model that fits the PC. One example is [qwen2.5-coder:7b](https://ollama.com/library/qwen2.5-coder:7b), approximately 4.7 GB for the listed compressed model, plus working memory and software. It is an example, not a performance guarantee. In a new terminal:

   ```powershell
   ollama pull qwen2.5-coder:7b
   ollama list
   ```

3. Install **Python 3.11** and Git for the native Odysseus setup. In a separate directory outside your monitored projects, use the curated main branch:

   ```powershell
   git clone --branch main https://github.com/odysseus-dev/odysseus.git
   cd odysseus
   py -3.11 -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   .\.venv\Scripts\python.exe setup.py
   .\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 7000
   ```

   Follow the interactive setup and keep the service running. Refer to the [official Odysseus setup guide](https://github.com/odysseus-dev/odysseus/blob/main/website/setup.md#native-windows) if its dependencies or installation steps change. Docker is another installation option, but the host-model connection differs; see AI_SETUP.md.
4. Open Odysseus at the address printed during startup, sign in, and configure its local model endpoint as `http://127.0.0.1:11434/v1` with the exact downloaded model name. Use a dedicated endpoint/account; disable tools, shared memory and cloud/model fallback. Create a **chat-scoped API token** in its settings. Keep the token private. Record the registered model endpoint ID if your account requires it.
5. In this app, select a project → **AI Assistant**. Read the installation guide, turn on **Enable optional AI**, then open **Connection settings**. For the native example above use:

   | Field | Value |
   |---|---|
   | Odysseus | `http://127.0.0.1:7000` |
   | Ollama | `http://127.0.0.1:11434` |
   | Model | `qwen2.5-coder:7b`, or the exact name you downloaded |
   | Token | Your chat-only Odysseus API token |
   | Endpoint ID | The saved Odysseus local endpoint ID, if required |

6. Save, click **Test connection**, then preview and approve the selected project context before sending a short chat. The connection test checks service access/model availability; the first chat tests real generation. Both services must be running whenever AI is used. Turning AI off leaves monitoring operational and does not uninstall or stop your separately managed services.

### Privacy, requirements and troubleshooting

- The token uses Windows-protected encryption and is excluded from project records and backups. AI conversations live in application data separately from monitoring; Odysseus also stores its own sessions.
- The app sends only the selected, previewed monitoring context and your message. It does not read project source for the assistant. Review the preview and never enter secrets or private customer data.
- No response? Check that both services are running, the model appears in `ollama list`, the actual service ports match, and the token permits chat. HTTP 401/403 usually indicates authorization/configuration. A failed JSON draft can be retried or discussed in chat.
- Local addresses only; this connector does not support LAN/cloud endpoints. Default service ports can differ across Odysseus installations.
- This release returns the answer when generation completes. Stop waiting discards the pending answer; upstream computation may finish separately.
- Integration tests use mock services; actual model behavior, speed and live Odysseus compatibility still need testing on the user's setup. The optional feature is included, but bundling it does not install or certify those external services.

See [AI_SETUP.md](AI_SETUP.md) for the detailed privacy boundary, API contract and troubleshooting guide. A readable copy is included inside the app through **Read README / installation guide**.

## Desktop and browser feature parity

Both editions use the same interface and monitoring/AI feature modules. Browser AI settings on Windows use DPAPI-protected storage; the desktop edition uses Electron safeStorage. Tokens are never returned by settings APIs. Each installation keeps its own registry and AI data: matching features does not merge or synchronize project records. Do not copy encrypted credential files between editions. AI remains optional and external services are still required.

## AI Suggestions

The AI Suggestions tab has a Generate suggestions button. Each successful click explicitly requests and saves exactly five distinct AI suggestions for the selected project. Scanning does not create preset suggestions. The button is available only after monitoring is set up, the project has been scanned, optional AI is enabled, and the configured Ollama model and Odysseus service are reachable. Install and configure the services using the AI setup instructions above; AI remains optional.

Generation uses the latest saved scan, overview, findings, tasks, recent changes, validation summary, existing suggestions, and up to 150 safe inventoried file paths. It does not read application source or secrets. Context collections are bounded; this is not a complete code review. Rescan after changing files. AI advice can be wrong. Invalid or incomplete batches are rejected without adding partial suggestions. The Suggestions context checkbox has been removed from AI Assistant; existing suggestions are included automatically for this dedicated action to discourage repetition. Regular assistant drafts still require individual approval.
