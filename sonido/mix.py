import numpy as np, soundfile as sf, soxr, math, random, sys, json, os
SR = 48000
DUR = 40.0
RAW = os.path.join(os.path.dirname(__file__), "raw")
N = int(SR * DUR)
buf = np.zeros((N, 2), dtype=np.float64)
cues = []
_cache = {}

def load(name):
    if name not in _cache:
        x, sr = sf.read(os.path.join(RAW, name + ".wav"), always_2d=True)
        assert sr == SR
        if x.shape[1] == 1:
            x = np.repeat(x, 2, axis=1)
        _cache[name] = x
    return _cache[name]

def peak_time(x):
    m = np.abs(x).max(axis=1)
    w = int(SR * 0.01)
    env = np.convolve(m, np.ones(w) / w, mode="same")
    return int(np.argmax(env)) / SR

def ev(t, name, db=0.0, pan=0.0, pitch=1.0, at="start", trim=None, fade=0.02, tag=None):
    """Place sound `name` so its start (or loudest moment) lands at time t."""
    x = load(name).copy()
    if pitch != 1.0:
        x = soxr.resample(x, SR * pitch, SR)
    if trim is not None:
        n = int(trim * SR)
        x = x[:n]
        f = min(int(fade * SR * 8) if trim > 0.3 else int(fade * SR), len(x))
        x[-f:] *= np.linspace(1, 0, f)[:, None]
    off = t - (peak_time(x) if at == "peak" else 0.0)
    start = int(round(off * SR))
    g = 10 ** (db / 20)
    l = math.cos((pan + 1) * math.pi / 4) * math.sqrt(2)
    r = math.sin((pan + 1) * math.pi / 4) * math.sqrt(2)
    x = x * np.array([l, r]) * g
    a, b = max(start, 0), min(start + len(x), N)
    if b > a:
        buf[a:b] += x[a - start:b - start]
    cues.append((round(off if at == "start" else t, 2), name, db))

rnd = random.Random(48)

# ---------------- Music bed ----------------
bed, _ = sf.read(os.path.join(RAW, "..", "bed_a_dark_low_drone_tha.wav"), always_2d=True)
bed = bed[:N]
fi, fo = int(1.5 * SR), int(1.8 * SR)
bed[:fi] *= np.linspace(0, 1, fi)[:, None]
bed[-fo:] *= np.linspace(1, 0, fo)[:, None]
buf[:len(bed)] += bed * 10 ** (-13 / 20)

# ---------------- Scene transitions + plugin label pops ----------------
for t0 in [4, 9, 14, 19, 24, 29, 34]:
    ev(t0 - 0.02, "swoosh_out", -16, 0)
    ev(t0 + 0.05, "swoosh_in_1", -17, 0.4)
    ev(t0 + 0.2, "pop_soft_1", -17, 0.85, pitch=1.25)
ev(0.0, "pop_soft_2", -17, 0.85, pitch=1.2)

# ---------------- A (0-4): counter, letters ----------------
last = -1
for n in range(1, 49):
    t = 0.2 + 1.5 * (1 - (1 - n / 48) ** (1 / 3))
    if t - last < 0.04 and n != 48:
        continue
    last = t
    ev(t, "tick_key_%d" % (1 + n % 3), -17 + 6 * n / 48, 0, pitch=0.9 + 0.5 * n / 48)
ev(1.78, "sting_reveal", -7, 0, at="peak")
ev(1.78, "boom_deep", -7, 0)
ev(1.78, "gem_sparkle_1", -17, 0.3, pitch=0.75)
ev(1.3, "whoosh_airy_1", -14, 0)
for i in range(15):
    if i in (6, 10):
        continue
    ev(1.32 + i * 0.04, "type_light_%d" % (1 + i % 3), -15, -0.6 + 1.2 * i / 14, pitch=0.9 + 0.02 * i)
ev(2.4, "pop_pluck_1", -18, 0, pitch=1.1)

# ---------------- B (4-9): eye, scramble, blink ----------------
ev(4.3, "magic_cast", -12, 0)
ev(4.35, "pad_glass", -22, 0)
ev(4.8, "swish_fast_1", -22, -0.6)
ev(5.4, "swish_fast_2", -22, 0.6)
ev(6.2, "swish_fast_3", -22, -0.3)
ev(4.7, "type_run_1", -16, -0.35, trim=1.4)
ev(5.2, "type_run_2", -16, 0.35, trim=1.5)
for k, (tt, p) in enumerate([(4.9, -0.4), (5.35, 0.3), (5.8, -0.2), (6.0, 0.4)]):
    ev(tt, ["glitch_chirp", "glitch_data", "glitch_burst", "glitch_dropout"][k], -22, p)
ev(6.1, "tick_metal_1", -14, -0.3)
ev(6.75, "tick_metal_2", -14, 0.3)
ev(6.9, "pop_pluck_2", -18, 0, pitch=1.0)
ev(7.4, "toggle_shutter_shut", -11, 0)

# ---------------- C (9-14): attention ----------------
ev(9.2, "whoosh_low", -13, 0)
order = [3, 0, 5, 2, 4, 1]
for k, w in enumerate(order):
    ev(9.5 + 0.13 * k + 0.08, "pop_soft_%d" % (1 + k % 4), -10, -0.7 + 0.28 * w, pitch=0.85 + 0.09 * k)
    ev(9.5 + 0.13 * k + 0.1, "pop_pluck_%d" % (1 + k % 3), -17, -0.7 + 0.28 * w, pitch=0.9 + 0.1 * k)
ev(11.2, "coin_bright_1", -11, 0.1)
ev(11.2, "snake_rattle", -17, 0.1, trim=1.2)
ev(11.25, "gem_sparkle_2", -17, 0.2)
ev(11.6, "whoosh_soft_1", -20, -0.6)
ev(12.3, "pop_pluck_3", -18, 0, pitch=1.1)

# ---------------- D (14-19): crush ----------------
ev(14.3, "whoosh_airy_2", -14, 0)
cx, cy = 3.5, 1.5
dists = sorted(((math.hypot(c - cx, r - cy), c, r) for r in range(4) for c in range(8)))
mx = dists[-1][0]
for d, c, r in dists:
    t = 14.6 + 0.7 * d / mx + 0.11
    ev(t, "tick_wood_%d" % (1 + (c + r) % 3), -15, (c - 3.5) / 4.2, pitch=0.85 + 0.05 * ((c * 3 + r) % 5))
ev(15.2, "heartbeat_pulse", -14, 0)
ev(16.0, "rumble_quake", -11, 0, trim=1.2)
ev(16.25, "break_glass", -6, 0, at="peak")
ev(16.25, "boom_wide", -3, 0, trim=3.2)
ev(16.25, "crash_dark", -10, 0, trim=2.0)
ev(16.3, "fall_sub", -9, 0)
for k in range(10):
    tt = 16.6 + rnd.random() * 1.6
    ev(tt, "hit_wood_%d" % (1 + k % 3), -19, rnd.uniform(-0.9, 0.9), pitch=rnd.uniform(0.8, 1.2))
for k in range(5):
    ev(16.7 + 0.35 * k, "tick_glass_%d" % (1 + k % 2), -20, rnd.uniform(-0.9, 0.9), pitch=rnd.uniform(0.9, 1.4))
ev(16.98, "braam_brass", -5, 0, at="peak", trim=2.6)
ev(17.0, "slam_title", -5, 0)
ev(17.0, "impact_slam", -9, 0)
ev(17.6, "pop_pluck_1", -20, 0, pitch=0.8)

# ---------------- E (19-24): reinvent ----------------
ev(19.3, "whoosh_airy_1", -15, 0)
ev(19.6, "cork_pop", -11, 0)
ev(19.62, "pop_pluck_2", -14, 0, pitch=0.9)
ev(20.3, "whoosh_spin", -18, -0.4, trim=2.4)
for k, t0 in enumerate([20.5, 21.5, 22.5]):
    ev(t0, "whoosh_soft_%d" % (1 + k), -15, 0)
    ev(t0 + 0.85, "sparkle_burst_%d" % (1 + k % 2), -15, 0, pitch=0.9 + 0.15 * k)
    ev(t0 + 0.88, "pop_pluck_%d" % (1 + k), -14, 0, pitch=0.8 + 0.2 * k)
ev(23.4, "purchase_chime", -11, 0)
ev(22.9, "pop_soft_3", -20, 0)

# ---------------- F (24-29): plan ----------------
ev(24.3, "swish_fast_1", -17, -0.7)
ev(24.5, "pencil_write", -13, 0, trim=1.5)
easeIO = lambda t: 0.5 * (2 * t) ** 2 if t < 0.5 else 1 - 0.5 * (2 * (1 - t)) ** 2
def inv(f):
    lo, hi = 0, 1
    for _ in range(30):
        m = (lo + hi) / 2
        if easeIO(m) < f: lo = m
        else: hi = m
    return lo
for k, f in enumerate([0.17, 0.38, 0.6, 0.8]):
    ev(24.5 + 1.4 * inv(f), "pop_bubble_%d" % (1 + k % 3), -11, -0.5 + 0.4 * k, pitch=0.9 + 0.12 * k)
    ev(26.0 + 2.5 * inv(f), "tick_metal_%d" % (1 + k % 2), -13, -0.3 + 0.3 * k, pitch=0.9 + 0.1 * k)
    ev(26.0 + 2.5 * inv(f), "coin_bright_%d" % (1 + k % 2), -18, -0.3 + 0.3 * k)
ev(25.7, "pop_pluck_3", -13, -0.5, pitch=0.9)
for k in range(8):
    tt = 26.1 + 0.3 * k
    ev(tt, "step_stone_%d" % (1 + k % 3), -19, -0.6 + 1.2 * k / 7, pitch=0.9 + 0.03 * k)
ev(28.4, "checkpoint_chime", -9, 0.3)
ev(28.45, "sparkle_burst_1", -15, 0.4)

# ---------------- G (29-34): flip ----------------
ev(29.3, "whoosh_airy_2", -15, 0)
ev(29.5, "cards_shuffle", -10, 0)
for k in range(6):
    col = k % 3
    ev(30.2 + 0.28 * k + 0.05, ["toggle_up_1", "glass_tap_1", "toggle_up_2", "glass_tap_2", "toggle_up_1", "glass_tap_1"][k],
       -12, -0.6 + 0.6 * col, pitch=0.9 + 0.08 * k)
ev(31.7, "swell_air", -14, 0, at="peak")
ev(32.0, "whoosh_heavy", -9, 0)
ev(32.1, "swoosh_in_2", -14, 0, pitch=0.8)
ev(33.1, "boom_short", -5, 0)
ev(33.1, "slam_title", -9, 0)
ev(33.05, "heartbeat_pulse", -11, 0)
ev(33.95, "heartbeat_pulse", -14, 0)
ev(33.1, "pad_strings", -17, 0)

# ---------------- H (34-38): formless ----------------
ev(34.3, "swell_air", -15, 0, trim=1.8)
ev(34.8, "riser_tone", -13, 0, trim=2.5)
ev(35.0, "swell_gong", -15, 0, trim=3.0)
for tt, nm, p in [(35.2, "bubble_rise", -0.6), (35.8, "drip_bloop_1", 0.5), (36.1, "drip_drop_1", -0.4), (36.5, "drip_bloop_2", 0.6)]:
    ev(tt, nm, -16, p)
for tt, nm in [(35.5, "glitch_burst"), (36.2, "glitch_data"), (36.7, "glitch_dropout"), (37.0, "glitch_chirp")]:
    ev(tt, nm, -19, rnd.uniform(-0.7, 0.7))
ev(37.15, "fall_sub", -7, 0)
ev(37.1, "swoosh_out", -13, 0)

# ---------------- I (38-40): finale ----------------
ev(38.2, "gong_hit", -6, 0, trim=1.9, fade=0.05)
ev(38.2, "boom_heavy", -6, 0, trim=1.7)
ev(38.2, "sting_soft", -13, 0)
ev(38.2, "swoosh_in_1", -15, 0, pitch=0.7)
for k in range(8):
    ev(38.5 + 0.06 * k + 0.1, "pop_soft_%d" % (1 + k % 4), -15, -0.7 + 1.4 * k / 7, pitch=0.9 + 0.07 * k)
ev(38.9, "sparkle_burst_2", -17, 0)

# final fade
fo = int(0.7 * SR)
buf[-fo:] *= np.linspace(1, 0, fo)[:, None]

# soft limiter + peak normalise
pk = np.abs(buf).max()
print("raw peak", pk)
y = np.tanh(buf * (0.9 / pk) * 1.15) / np.tanh(1.15)
sf.write(os.path.join(os.path.dirname(__file__), "mix_raw.wav"), y.astype(np.float32), SR, subtype="FLOAT")
json.dump(cues, open(os.path.join(os.path.dirname(__file__), "cues.json"), "w"))
print(len(cues), "cues")
