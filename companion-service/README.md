# Agnector Companion Service

A local bridge that runs on your laptop/PC and accepts remote-control commands from the mobile app.

## Features (MVP)

- Device discovery
- Pairing via optional code
- Power actions: shutdown, restart, sleep, lock
- Volume control: up/down/set/mute (via `loudness`)
- Brightness control on Windows (via PowerShell/WMI)
- Wake-on-LAN packet sender
- Accessibility quick actions (open OS tools/settings)

## Requirements

- Node.js 18+
- Windows 10/11 (best support in this MVP)
- Mobile and laptop on the same LAN

## Setup

```bash
cd companion-service
npm install
copy .env.example .env
npm run dev
```

Service starts on `http://0.0.0.0:8787` by default.

## Endpoints

- `GET /health`
- `GET /api/pc/devices`
- `POST /api/pc/connect`
- `POST /api/pc/command`
- `POST /api/pc/wake`

## Notes

- `PAIRING_CODE` in `.env` is optional. If set, mobile must send matching `pairingCode` when connecting.
- Wake-on-LAN depends on BIOS/UEFI and NIC settings.
- Some accessibility commands in this MVP open related Windows tools/settings pages instead of toggling hidden OS flags.
