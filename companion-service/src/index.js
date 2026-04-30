require('dotenv').config();

const os = require('os');
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const loudness = require('loudness');
const wol = require('wake_on_lan');

const app = express();
const PORT = Number(process.env.PORT || 8787);
const PAIRING_CODE = (process.env.PAIRING_CODE || '').trim();

app.use(cors({ origin: '*' }));
app.use(express.json());

const pairedDeviceIds = new Set();

const clampPercent = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
};

const run = (command) =>
  new Promise((resolve, reject) => {
    exec(command, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve((stdout || '').trim());
    });
  });

const runPowerShell = async (script) => {
  const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "${script.replace(/"/g, '\\"')}"`;
  return run(cmd);
};

const isWindows = process.platform === 'win32';

const firstLanInterface = () => {
  const map = os.networkInterfaces();
  for (const key of Object.keys(map)) {
    const entries = map[key] || [];
    const ipv4 = entries.find((n) => n.family === 'IPv4' && !n.internal);
    if (!ipv4) continue;
    return {
      host: ipv4.address,
      mac: ipv4.mac && ipv4.mac !== '00:00:00:00:00:00' ? ipv4.mac : undefined,
    };
  }
  return { host: '127.0.0.1', mac: undefined };
};

const getBrightness = async () => {
  if (!isWindows) return null;
  try {
    const output = await runPowerShell('(Get-CimInstance -Namespace root/WMI -ClassName WmiMonitorBrightness).CurrentBrightness');
    const n = Number(output);
    return Number.isFinite(n) ? clampPercent(n) : null;
  } catch {
    return null;
  }
};

const setBrightness = async (value) => {
  if (!isWindows) {
    throw new Error('Brightness control is only implemented for Windows in this MVP.');
  }

  const v = clampPercent(value);
  await runPowerShell(`$m = Get-CimInstance -Namespace root/WMI -ClassName WmiMonitorBrightnessMethods; if ($m) { $m.WmiSetBrightness(1, ${v}) }`);
  return v;
};

const getDeviceSnapshot = async () => {
  const net = firstLanInterface();
  let volume = null;
  let muted = null;

  try {
    volume = clampPercent(await loudness.getVolume());
    muted = await loudness.getMuted();
  } catch {
    // Keep null if audio device API is unavailable.
  }

  const brightness = await getBrightness();

  return {
    id: 'local-pc',
    name: os.hostname(),
    host: net.host,
    os: isWindows ? 'windows' : process.platform === 'darwin' ? 'macos' : process.platform === 'linux' ? 'linux' : 'unknown',
    state: 'online',
    supportsWakeOnLan: Boolean(net.mac),
    macAddress: net.mac,
    volume,
    brightness,
    isMuted: muted,
    isConnected: pairedDeviceIds.has('local-pc'),
    lastSeenAt: new Date().toISOString(),
  };
};

const requireConnected = (req, res, next) => {
  const { deviceId } = req.body || {};
  if (deviceId !== 'local-pc') {
    return res.status(404).json({ error: 'Device not found' });
  }
  if (!pairedDeviceIds.has(deviceId)) {
    return res.status(403).json({ error: 'Device is not connected. Pair first.' });
  }
  next();
};

const applyCommand = async (command, payload = {}) => {
  switch (command) {
    case 'power_on':
      return { ok: true, note: 'Use /api/pc/wake with target MAC to wake powered-off machines.' };

    case 'power_off':
      if (!isWindows) throw new Error('Shutdown command currently supports Windows only in this MVP.');
      await run('shutdown /s /t 0');
      return { ok: true };

    case 'restart':
      if (!isWindows) throw new Error('Restart command currently supports Windows only in this MVP.');
      await run('shutdown /r /t 0');
      return { ok: true };

    case 'sleep':
      if (!isWindows) throw new Error('Sleep command currently supports Windows only in this MVP.');
      await run('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');
      return { ok: true };

    case 'lock':
      if (!isWindows) throw new Error('Lock command currently supports Windows only in this MVP.');
      await run('rundll32.exe user32.dll,LockWorkStation');
      return { ok: true };

    case 'volume_up': {
      const current = clampPercent(await loudness.getVolume());
      const next = clampPercent(current + 10);
      await loudness.setVolume(next);
      return { ok: true, volume: next };
    }

    case 'volume_down': {
      const current = clampPercent(await loudness.getVolume());
      const next = clampPercent(current - 10);
      await loudness.setVolume(next);
      return { ok: true, volume: next };
    }

    case 'volume_set': {
      const next = clampPercent(payload.value);
      await loudness.setVolume(next);
      return { ok: true, volume: next };
    }

    case 'mute_toggle': {
      const current = await loudness.getMuted();
      await loudness.setMuted(!current);
      return { ok: true, muted: !current };
    }

    case 'brightness_up': {
      const current = (await getBrightness()) ?? 50;
      const next = clampPercent(current + 10);
      await setBrightness(next);
      return { ok: true, brightness: next };
    }

    case 'brightness_down': {
      const current = (await getBrightness()) ?? 50;
      const next = clampPercent(current - 10);
      await setBrightness(next);
      return { ok: true, brightness: next };
    }

    case 'brightness_set': {
      const next = await setBrightness(payload.value);
      return { ok: true, brightness: next };
    }

    case 'night_light_toggle':
      if (!isWindows) throw new Error('Night Light quick action is only mapped on Windows in this MVP.');
      await run('start ms-settings:nightlight');
      return { ok: true, note: 'Opened Night Light settings.' };

    case 'high_contrast_toggle':
      if (!isWindows) throw new Error('High Contrast quick action is only mapped on Windows in this MVP.');
      await run('start ms-settings:easeofaccess-highcontrast');
      return { ok: true, note: 'Opened High Contrast settings.' };

    case 'magnifier_toggle':
      if (!isWindows) throw new Error('Magnifier quick action is only mapped on Windows in this MVP.');
      await run('start magnify');
      return { ok: true, note: 'Opened Magnifier.' };

    case 'screen_reader_toggle':
      if (!isWindows) throw new Error('Screen Reader quick action is only mapped on Windows in this MVP.');
      await run('start narrator');
      return { ok: true, note: 'Opened Narrator.' };

    default:
      throw new Error(`Unsupported command: ${command}`);
  }
};

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'companion-service',
    host: os.hostname(),
    platform: process.platform,
    pairedDevices: Array.from(pairedDeviceIds),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/pc/devices', async (_req, res) => {
  try {
    const device = await getDeviceSnapshot();
    res.json({ devices: [device] });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to discover local device.' });
  }
});

app.post('/api/pc/connect', async (req, res) => {
  try {
    const { deviceId, pairingCode } = req.body || {};
    if (deviceId !== 'local-pc') {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (PAIRING_CODE && pairingCode !== PAIRING_CODE) {
      return res.status(401).json({ error: 'Invalid pairing code' });
    }

    pairedDeviceIds.add(deviceId);
    const device = await getDeviceSnapshot();
    res.json({ connected: true, device });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to connect device.' });
  }
});

app.post('/api/pc/command', requireConnected, async (req, res) => {
  try {
    const { command, payload } = req.body || {};
    if (!command) {
      return res.status(400).json({ error: 'command is required' });
    }

    const result = await applyCommand(command, payload || {});
    const device = await getDeviceSnapshot();
    res.json({ ok: true, result, device });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to execute command.' });
  }
});

app.post('/api/pc/wake', async (req, res) => {
  try {
    const { macAddress, deviceId } = req.body || {};
    if (!macAddress) {
      return res.status(400).json({ error: 'macAddress is required' });
    }

    await new Promise((resolve, reject) => {
      wol.wake(macAddress, { address: '255.255.255.255' }, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    if (deviceId) {
      pairedDeviceIds.add(deviceId);
    }

    res.json({ ok: true, message: 'Wake packet sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to send wake packet.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`[Companion Service] Running on http://0.0.0.0:${PORT}`);
});
