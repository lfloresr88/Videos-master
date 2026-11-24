#!/usr/bin/env python3
"""Genera public/music.mp3 (120 s, original, libre de derechos).

Ambiental a 72 BPM con la progresión Cmaj7 - Am7 - Fmaj7 - G6:
pads de onda triangular, bajo senoidal, arpegio con delay (0.42 s, feedback 0.35)
y campanita (C6-G6-C7) al inicio de cada escena. Entrada de 2 s y salida de 4 s.
Requiere numpy y ffmpeg.
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 120
N = SR * DUR
BPM = 72
BEAT = 60 / BPM
BAR = BEAT * 4

CHORDS = [  # (notas del pad, fundamental del bajo, notas del arpegio)
    ([60, 64, 67, 71], 36, [60, 64, 67, 71]),  # Cmaj7
    ([57, 60, 64, 67], 45, [57, 60, 64, 67]),  # Am7
    ([53, 57, 60, 64], 41, [53, 57, 60, 64]),  # Fmaj7
    ([55, 59, 62, 64], 43, [55, 59, 62, 64]),  # G6
]
BELL_TIMES = [0, 8, 20, 31, 42, 53, 64, 75, 86, 97, 108]
BELL_NOTES = [1046.50, 1567.98, 2093.00]  # C6 G6 C7


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tri(f, t):
    return (2 / np.pi) * np.arcsin(np.sin(2 * np.pi * f * t))


def add(buf, start_s, sig):
    i = int(round(start_s * SR))
    if i < 0:
        sig = sig[-i:]
        i = 0
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def lowpass(x, fc):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(spec / (1 + (f / fc) ** 4), n=len(x))


def echo(x, delay=0.42, fb=0.35, taps=10):
    d = int(delay * SR)
    y = x.copy()
    for k in range(1, taps + 1):
        g = fb**k
        y[k * d :] += g * x[: len(x) - k * d]
    return y


pad_l, pad_r = np.zeros(N), np.zeros(N)
bass = np.zeros(N)
arp = np.zeros(N)
bells = np.zeros(N)

n_bars = int(DUR / BAR) + 1
for b in range(n_bars):
    t0 = b * BAR
    notes, root, arp_notes = CHORDS[b % 4]
    # Pad: triangulares con ligero detune, ataque y relajación suaves
    L = BAR + 1.6
    t = np.arange(int(L * SR)) / SR
    env = np.minimum(1, t / 1.0) * np.minimum(1, (L - t) / 1.4)
    env = np.sin(env * np.pi / 2) ** 2
    for m in notes:
        add(pad_l, t0 - 0.4, 0.055 * env * (tri(hz(m) * 0.998, t) + 0.5 * tri(hz(m) * 2.003, t) * 0.4))
        add(pad_r, t0 - 0.4, 0.055 * env * (tri(hz(m) * 1.002, t) + 0.5 * tri(hz(m) * 1.997, t) * 0.4))
    # Bajo senoidal: pulso en el tiempo 1 y suave en el 3
    for k, amp in ((0, 0.26), (2, 0.15)):
        tb = np.arange(int(2.2 * SR)) / SR
        e = np.minimum(1, tb / 0.06) * np.exp(-tb / 1.1)
        add(bass, t0 + k * BEAT, amp * e * np.sin(2 * np.pi * hz(root) * tb))
    # Arpegio en corcheas
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]
    for s, idx in enumerate(pattern):
        m = arp_notes[idx] + 12
        ta = np.arange(int(1.2 * SR)) / SR
        e = np.minimum(1, ta / 0.008) * np.exp(-ta / 0.22)
        tone = np.sin(2 * np.pi * hz(m) * ta) + 0.25 * np.sin(2 * np.pi * hz(m) * 2 * ta)
        add(arp, t0 + s * BEAT / 2, 0.075 * e * tone)

# Campanita al inicio de cada escena
for bt in BELL_TIMES:
    for k, f in enumerate(BELL_NOTES):
        tb = np.arange(int(2.6 * SR)) / SR
        e = np.minimum(1, tb / 0.004) * np.exp(-tb / 0.55)
        tone = np.sin(2 * np.pi * f * tb) + 0.18 * np.sin(2 * np.pi * f * 2.76 * tb) * np.exp(-tb / 0.2)
        add(bells, bt + 0.25 + k * 0.22, 0.10 * e * tone)

pad_l, pad_r = lowpass(pad_l, 1400), lowpass(pad_r, 1400)
arp_wet = echo(arp)
bell_wet = echo(bells, fb=0.3, taps=4)

left = pad_l + bass + arp * 1.0 + 0.5 * arp_wet + bell_wet
right = pad_r + bass + arp * 0.7 + 0.8 * arp_wet + bell_wet

# Entrada de 2 s y salida de 4 s
fade = np.ones(N)
fi, fo = 2 * SR, 4 * SR
fade[:fi] = np.sin(np.linspace(0, 1, fi) * np.pi / 2) ** 2
fade[-fo:] = np.cos(np.linspace(0, 1, fo) * np.pi / 2) ** 2
stereo = np.stack([left * fade, right * fade], axis=1)

stereo = np.tanh(stereo * 1.2)  # limitador suave, sin picos bruscos
stereo *= 0.5 / np.max(np.abs(stereo))

out = Path(__file__).resolve().parent.parent / "public"
out.mkdir(exist_ok=True)
wav = out / "_music.wav"
with wave.open(str(wav), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
subprocess.run(
    ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-t", str(DUR),
     "-codec:a", "libmp3lame", "-b:a", "192k", str(out / "music.mp3")],
    check=True,
)
wav.unlink()
print("OK:", out / "music.mp3")
