import numpy as np, soundfile as sf, soxr, math, random, json, os
SR = 48000
DUR = 60.0
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
CH = os.path.join(HERE, "..", "chk")
N = int(SR * DUR)
buf = np.zeros((N, 2), dtype=np.float64)
cue_log = []
_cache = {}

def load(name):
    if name not in _cache:
        x, sr = sf.read(os.path.join(RAW, name + ".wav"), always_2d=True)
        assert sr == SR, (name, sr)
        if x.shape[1] == 1:
            x = np.repeat(x, 2, axis=1)
        _cache[name] = x
    return _cache[name]

def peak_time(x):
    m = np.abs(x).max(axis=1)
    w = int(SR * 0.01)
    env = np.convolve(m, np.ones(w) / w, mode="same")
    return int(np.argmax(env)) / SR

def ev(t, name, db=0.0, pan=0.0, pitch=1.0, at="start", trim=None, fade=0.03):
    x = load(name).copy()
    if pitch != 1.0:
        x = soxr.resample(x, SR * pitch, SR)
    if trim is not None:
        n = int(trim * SR)
        x = x[:n]
        f = min(int(max(fade, 0.12) * SR) if trim > 0.4 else int(fade * SR), len(x))
        x[-f:] *= np.linspace(1, 0, f)[:, None]
    off = t - (peak_time(x) if at == "peak" else 0.0)
    start = int(round(off * SR))
    g = 10 ** (db / 20)
    pan = max(-1, min(1, pan))
    l = math.cos((pan + 1) * math.pi / 4) * math.sqrt(2)
    r = math.sin((pan + 1) * math.pi / 4) * math.sqrt(2)
    x = x * np.array([l, r]) * g
    a, b = max(start, 0), min(start + len(x), N)
    if b > a:
        buf[a:b] += x[a - start:b - start]
    cue_log.append((round(t, 2), name, db))

def bed(name, start, db, fade_in=1.5, fade_out=1.5, length=None):
    x, _ = sf.read(os.path.join(RAW, name + ".wav"), always_2d=True) if not name.startswith("/") else sf.read(name, always_2d=True)
    if length:
        x = x[: int(length * SR)]
    x = x.copy()
    fi, fo = min(int(fade_in * SR), len(x)), min(int(fade_out * SR), len(x))
    x[:fi] *= np.linspace(0, 1, fi)[:, None]
    x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    a = int(start * SR); b = min(a + len(x), N)
    buf[a:b] += x[: b - a] * 10 ** (db / 20)

cues = json.load(open(os.path.join(CH, "cues4.json")))
by = {}
for t, n in cues:
    by.setdefault(n, []).append(t)

# ---------------- Music ----------------
drone, _ = sf.read(os.path.join(HERE, "bed_a_dark_low_drone_tha.wav"), always_2d=True)
d = drone[: int(9 * SR)].copy()
d[: int(1 * SR)] *= np.linspace(0, 1, int(SR))[:, None]
d[-int(3 * SR):] *= np.linspace(1, 0, int(3 * SR))[:, None]
buf[: len(d)] += d * 10 ** (-14 / 20)
L = 22.86
for k, st in enumerate([6.2, 6.2 + L, 6.2 + 2 * L]):
    x, _ = sf.read(os.path.join(RAW, "bed_warm.wav"), always_2d=True)
    x = x.copy()
    if k == 0:
        fi = int(2.5 * SR); x[:fi] *= np.linspace(0, 1, fi)[:, None]
    a = int(st * SR); b = min(a + len(x), N)
    seg = x[: b - a]
    buf[a:b] += seg * 10 ** (-13 / 20)
fo = int(2.0 * SR)
buf[-fo:] *= np.linspace(1, 0, fo)[:, None]  # temporary: final master fade applied at the end too

rnd = random.Random(60)

# ---------------- Prologue ----------------
ev(0.3, "pad_strings", -14, 0, trim=3.0)
ev(0.3, "note_tubular_bell", -15, 0, trim=3.5)
ev(0.4, "whoosh_airy_1", -16, 0)
for t in by["step"]:
    x = -150 + (t - 2.7) / 2.7 * 450
    ev(t, "step_grass_%d" % (1 + int(t * 10) % 3), -18, (x - 480) / 480, pitch=0.9)
for k, t in enumerate(by["thud"]):
    ev(t, "hit_drop", -8, -0.1, pitch=1.0 - 0.07 * k)
    ev(t, "step_stone_%d" % (1 + k % 3), -13, -0.1, pitch=0.7)
ev(by["sigh"][0], "swell_air", -15, 0, trim=1.4)
ev(by["sigh"][0], "cloth_rustle_1", -19, -0.2)

# ---------------- Chapters ----------------
for t in by["chapter"]:
    ev(t - 0.05, "swoosh_in_1", -16, 0)
    ev(t, "magic_cast", -13, -0.3)
    ev(t + 0.05, "pop_pluck_1", -15, -0.6, pitch=0.9)
for k, t in enumerate(by["step2"]):
    ev(t, "step_grass_%d" % (1 + k % 3), -22, 0.55, pitch=1.15)

# Chapter 1
ev(by["word_dart"][0] - 0.05, "whoosh_fast_1", -12, 0.2)
ev(by["dart_hit"][0], "hit_wood_1", -9, 0.6)
ev(by["dart_hit"][0], "error_fall", -11, 0.5)
t = by["bird_launch"][0]
ev(t, "note_wind_chime", -15, -0.2, trim=3.0)
ev(t, "whoosh_soft_1", -19, -0.3)
for k in range(11):
    ev(t + 0.1 + 0.135 * k, "swish_fast_%d" % (1 + k % 3), -29, -0.2 + 0.07 * k, pitch=1.4)
t = by["bird_land"][0]
ev(t, "heal_chime", -9, 0.5)
ev(t, "gem_sparkle_1", -15, 0.5)
ev(t + 0.05, "pop_bubble_1", -17, 0.5)

# Freed stones and stars
for k, t in enumerate(by["free"]):
    ev(t - 0.1, "hit_wood_%d" % (1 + k % 3), -15, -0.3, pitch=0.8)
    ev(t + 0.05, "riser_tone", -17, 0, trim=1.2)
    ev(t + 0.2, "whoosh_low", -17, 0.3, trim=1.5)
for k, t in enumerate(by["star"]):
    p = [0.9, 1.0, 1.12, 1.26][k]
    ev(t, "checkpoint_chime", -8, 0.3 + 0.2 * k, pitch=p)
    ev(t, "sparkle_burst_%d" % (1 + k % 2), -13, 0.3 + 0.2 * k, pitch=p)
    ev(t, "gem_sparkle_%d" % (1 + k % 2), -17, 0.4, pitch=p)

# Chapter 2
t = by["shield"][0]
ev(t, "pad_glass", -13, 0, trim=3.0)
ev(t, "magic_cast", -13, 0)
ev(t + 0.1, "bubble_rise", -16, 0)
for k, t in enumerate(by["arrow"]):
    ev(t + 0.1, "whoosh_fast_%d" % (1 + k % 2), -15, 0.8, trim=0.7)
for k, t in enumerate(by["shield_hit"]):
    ev(t, "glass_tap_%d" % (1 + k % 2), -8, -0.2, pitch=0.9 + 0.1 * k)
    ev(t, "coin_bright_%d" % (1 + k % 2), -15, -0.2, pitch=0.7 + 0.08 * k)
    ev(t + 0.05, "hit_slap", -16, 0, pitch=0.8)
    ev(t + 0.15, "tick_metal_%d" % (1 + k % 2), -16, 0.3, pitch=1.2)

# Chapter 3
t = by["whisper"][0]
ev(t, "cloth_rustle_2", -16, 0.45)
ev(t + 0.5, "cloth_rustle_1", -17, 0.55)
ev(t + 1.2, "cloth_rustle_2", -18, 0.5, pitch=1.1)
ev(t + 2.0, "cloth_rustle_1", -18, 0.6)
t = by["cloth"] if "cloth" in by else by["cloud"]
t = by["cloud"][0]
ev(t, "pad_strings", -17, 0, trim=3.0, pitch=0.7)
ev(t, "rumble_quake", -14, -0.3, trim=1.6)
ev(t, "drone_dark", -17, 0, trim=3.0)
t = by["thunder"][0]
ev(t, "explosion_distant", -7, 0, trim=2.0)
ev(t, "crash_dark", -13, 0, trim=1.4)
ev(t, "boom_short", -10, 0)
ev(by["ask"][0], "pop_soft_1", -12, -0.2)
ev(by["ask"][0], "whoosh_soft_1", -18, -0.3)
ev(by["reply"][0], "pop_pluck_2", -12, 0.5)
ev(by["reply"][0], "bell_shop", -13, 0.5, trim=1.6)
t = by["confetti"][0]
ev(t, "cork_pop", -8, 0.5)
ev(t + 0.05, "sparkle_burst_1", -13, 0.5)
ev(t + 0.1, "gem_sparkle_2", -15, 0.2)
for k in range(7):
    ev(t + 0.4 + 0.18 * k, "tick_glass_%d" % (1 + k % 2), -22, rnd.uniform(0.2, 0.8), pitch=rnd.uniform(1.0, 1.5))
t = by["sun"][0]
ev(t, "heal_chime", -9, 0, pitch=0.9)
ev(t, "pad_warm", -14, 0, trim=3.0)
ev(t + 0.2, "sparkle_burst_2", -16, -0.1)

# Chapter 4
t = by["draw"][0]
ev(t, "pencil_write", -12, 0.2, trim=1.7)
for k, t in enumerate(by["hop"]):
    ev(t, "whoosh_fast_%d" % (1 + k % 2), -20, -0.4 + 0.2 * k, pitch=0.9)
for k, t in enumerate(by["land"][:5]):
    ev(t, "step_stone_%d" % (1 + k % 3), -13, -0.3 + 0.2 * k, pitch=1.0 - 0.02 * k)
    ev(t, "tick_wood_%d" % (1 + k % 3), -19, -0.3 + 0.2 * k)

# Final
t = by["gather"][0]
ev(t - 0.2, "riser_tone", -15, 0, trim=1.8)
ev(t, "pad_strings", -12, 0, trim=3.2)
ev(t + 0.2, "swell_air", -16, 0, trim=1.6)
ev(by["final1"][0], "gem_sparkle_1", -12, -0.3)
ev(by["final2"][0], "sting_soft", -9, 0)
ev(by["final2"][0], "checkpoint_chime", -10, 0.2, pitch=1.26)
t = by["land"][-1]
ev(t, "step_stone_2", -15, 0.4, pitch=0.9)
ev(t, "sparkle_burst_2", -14, 0.4)
ev(58.8, "note_tubular_bell", -14, 0, pitch=0.89, trim=1.5)

# master fade-out and soft limiter
fo = int(1.2 * SR)
buf[-fo:] *= np.linspace(1, 0, fo)[:, None]
pk = np.abs(buf).max()
print("raw peak", pk)
y = np.tanh(buf * (0.9 / pk) * 1.15) / np.tanh(1.15)
sf.write(os.path.join(HERE, "mix4_raw.wav"), y.astype(np.float32), SR, subtype="FLOAT")
json.dump(cue_log, open(os.path.join(HERE, "cues4_log.json"), "w"))
print(len(cue_log), "events")
