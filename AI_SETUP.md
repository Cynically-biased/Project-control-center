> AI is OPTIONAL and disabled by default. Install Ollama, Odysseus and a local model yourself. Read the README installation section below. No monitoring feature requires AI.

# Optional local AI assistant — installation guide

This release adds the application-side connection to **Odysseus → Ollama**. It does not install, download, start, or configure those external services or a model. Existing monitoring features work without AI.

## What is implemented

- An AI Assistant tab per project, with local conversation history, new-conversation archives, and separate Odysseus sessions.
- Local connection settings, model availability checks, and a connection-test button.
- Selected context preview and explicit confirmation before sending. Context comes only from monitoring metadata, never source files. Excluded content is not collected; common token, email, and absolute-path patterns are redacted, but this is not a guarantee that arbitrary manually entered secrets can be detected. Review the preview.
- Chat, project summaries, error explanations, and drafts for tasks, suggestions, and overview notes.
- Editable draft review and explicit approval before saving records. Drafts cannot mark tasks completed or edit code. Project changes invalidate stale drafts.
- Cancellation discards the pending response. This first version uses Odysseus's non-streaming `/api/chat`; text appears when complete. Closing the request does not guarantee the upstream model stops computing.
- No web/research, application source access, shell tools, commits, or pushes. These are not agent permissions in this release.

## Installation and connection

1. Install Ollama from its official distribution, then download a model appropriate for the PC. Keep enough disk headroom. The application never downloads models automatically.
2. Install Odysseus using its official curated `main` setup instructions. Its version and interfaces can change; this adapter was reviewed against `/api/session`, `/api/sessions`, and `/api/chat` in the current source.
3. In Odysseus, configure a dedicated local Ollama endpoint and the exact downloaded model. Disable cloud/provider fallback, shared memory, and tool privileges for this integration. Create a token with chat scope only. Do not grant file, shell, memory, email, or other tool access. You manage these permissions in Odysseus.
4. Open a project, then **AI Assistant → Connection settings**. Enter the actual local addresses (examples: Odysseus `http://127.0.0.1:7011`, Ollama `http://127.0.0.1:11434`), model name, token, and optionally the registered Odysseus endpoint ID. Your Odysseus port may differ; consult its startup output. Non-admin Odysseus accounts may require the endpoint ID.
5. Click **Test connection**. This checks installed-model availability and authenticated session access; it does not generate text. Then preview context and send a short chat to verify complete generation.

The adapter currently supports loopback HTTP addresses only. It does not enable LAN/cloud providers. Odysseus must be configured to actually use the local endpoint; the app also rejects a returned model name that differs from the selection.

## Storage and privacy

The token is encrypted by Electron safeStorage (Windows DPAPI) into `ai-connection.json` in application data. The renderer cannot retrieve it. The main process decrypts it only for the local service over process IPC. Saving refuses to fall back to plaintext if encryption is unavailable. Other programs running as the same Windows user may still access DPAPI-protected secrets; this is not protection against a compromised user account.

Chat and drafts are stored separately under application data in `ai-conversations/`, keyed by project-ID hashes. They are not in project folders, Git, or the monitoring backup. Odysseus also keeps its own session history. Unchecking a context item does not erase previously shared information; start a new conversation for a fresh session. No cross-project Odysseus sessions are reused.

The app adds an enforced guide-only instruction recognized by the reviewed Odysseus tool-policy implementation. External service behavior is outside this app's security boundary: use a dedicated chat-only account/token, disable tools and memory, and re-test permissions when upgrading Odysseus. Do not treat a model instruction alone as an authorization boundary.

## Verification status

Automated tests use a local mock that follows the reviewed Odysseus/Ollama contracts. They cover authorization, project isolation, draft approval, replay protection, context hashes, cancellation, and backup exclusions. Electron smoke tests also exercise actual Windows-protected token storage using a synthetic token and an isolated data folder.

No real Odysseus/Ollama installation or model was used on this PC. Live compatibility, actual model quality, performance, and external service settings remain unverified until you configure those services. The optional assistant is included in the standard app; the separately installed AI services remain unverified until configured and tested.


---

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
