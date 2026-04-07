# Maxim Broadcast — GitHub Codespaces

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/luisitoys12/maxim-broadcast)

Run a fully interactive **demo** of Maxim Broadcast directly in your browser — no local installation required.

---

## 🚀 Quick Start

1. Click the **"Open in GitHub Codespaces"** button above (or [create a Codespace](https://codespaces.new/luisitoys12/maxim-broadcast) from GitHub).
2. Wait **2–3 minutes** while the environment is set up automatically.
3. Once ready, run in the terminal:
   ```bash
   bash scripts/start-demo.sh
   ```
4. Open the URL shown in the terminal (or the forwarded port `4000` in VS Code).
5. Log in with the demo credentials below.

---

## 🔑 Demo Credentials

| Role          | Email              | Password  |
|---------------|--------------------|-----------|
| Administrator | `admin@demo.com`   | `demo123` |
| User          | `demo@demo.com`    | `demo123` |

---

## 🌐 URLs & Ports

| Service          | Port | URL (Codespaces)                                 |
|------------------|------|--------------------------------------------------|
| App (frontend + API) | 4000 | `https://<codespace-name>-4000.app.github.dev`  |
| Frontend dev server  | 3000 | `https://<codespace-name>-3000.app.github.dev`  |
| Health check         | 4000 | `https://<codespace-name>-4000.app.github.dev/health` |
| REST API             | 4000 | `https://<codespace-name>-4000.app.github.dev/api`    |

---

## ✅ Features Available in Demo

| Feature                                   | Status    |
|-------------------------------------------|-----------|
| Full UI — dashboard, scenes, settings     | ✅ Works  |
| Authentication (JWT, roles)               | ✅ Works  |
| 5 pre-configured demo scenes              | ✅ Works  |
| Scene switching (simulated)               | ✅ Works  |
| RadioSync — demo messages                 | ✅ Works  |
| Media library + file upload               | ✅ Works  |
| Streaming profile configuration           | ✅ Works  |
| WebSocket real-time events                | ✅ Works  |
| News bulletin creation                    | ✅ Works  |

---

## ⚠️ Limitations in Demo Mode

The following features require hardware or external services not available in Codespaces:

- ❌ Real camera / video capture
- ❌ Real streaming to Twitch / YouTube / RTMP servers
- ❌ OBS WebSocket integration (requires OBS Studio installed locally)
- ❌ Statistics are **simulated** (not real encoder data)
- ❌ RadioSync chat shows **pre-built demo messages** (no live listeners)
- ❌ TTS / audio generation (requires external TTS API keys)

---

## 🎬 Pre-configured Demo Scenes

| # | Scene           | Description                                              |
|---|-----------------|----------------------------------------------------------|
| 1 | News Studio     | Professional news broadcast with chroma key background   |
| 2 | Gaming Setup    | Gaming stream with overlays, alerts and webcam frame     |
| 3 | Music Studio    | Music broadcast with audio visualisers                   |
| 4 | Talk Show       | Round-table talk show with multi-camera layout           |
| 5 | Fullscreen      | Simple fullscreen scene — clean canvas                   |

---

## 🛠️ Manual Setup (if `postCreateCommand` didn't run)

```bash
# 1. Install dependencies and build frontend
bash scripts/setup-codespace.sh

# 2. Start the app
bash scripts/start-demo.sh
```

---

## 🐛 Reporting Bugs

Found something that doesn't work?

1. Check [existing issues](https://github.com/luisitoys12/maxim-broadcast/issues).
2. Open a [new issue](https://github.com/luisitoys12/maxim-broadcast/issues/new) and include:
   - Steps to reproduce
   - Expected behaviour
   - Actual behaviour
   - Browser / OS / Codespaces region

---

## 📝 Environment Variables

The Codespace is pre-configured with these variables (set in `devcontainer.json`):

```env
NODE_ENV=production
PORT=4000
JWT_SECRET=demo-secret-key-only-not-for-production
DEMO_MODE=true
CODESPACE_MODE=true
LOG_LEVEL=info
```

> **Note:** `JWT_SECRET` in demo mode is intentionally public. Do not use this value in production.

---

## 🔒 Security Notes

- The demo secret key is **not** suitable for production.
- All data is stored **in-memory** — it resets when the server restarts.
- Uploaded files are stored temporarily and **not** persisted between Codespace rebuilds.
