#!/usr/bin/env node
/**
 * Generates SkillUp Android launcher PNGs for all mipmap densities.
 * Design: three ascending white bars + upward arrow on green #58CC02.
 * Uses only Node.js built-ins — no external dependencies.
 *
 * Run: node generate-icons.js
 */

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ─── PNG encoder ─────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([tb, data]);
  const out = Buffer.alloc(4 + 4 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  tb.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(crcInput), 8 + data.length);
  return out;
}

function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit depth, RGBA color type

  const stride = 1 + w * 4;
  const raw = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0; // filter byte: None
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4)
          .copy(raw, y * stride + 1);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Drawing primitives ───────────────────────────────────────────────────────

function setPixel(rgba, w, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= w || y >= w) return;
  const i = (y * w + x) * 4;
  rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = a;
}

// Rectangle with only the two top corners rounded
function fillRoundedTopBar(rgba, w, x1, y1, x2, y2, cr, R, G, B) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      let draw = true;
      if (y < y1 + cr) {
        if (x < x1 + cr)      draw = (x-(x1+cr))**2+(y-(y1+cr))**2 <= cr*cr; // top-left
        else if (x > x2 - cr) draw = (x-(x2-cr))**2+(y-(y1+cr))**2 <= cr*cr; // top-right
      }
      if (draw) setPixel(rgba, w, x, y, R, G, B);
    }
  }
}

// Triangle filled with scanline algorithm
function fillTriangle(rgba, w, pts, R, G, B) {
  const [p0, p1, p2] = [...pts].sort((a, b) => a[1] - b[1]);
  const [x0,y0] = p0, [x1,y1] = p1, [x2,y2] = p2;

  function xi(y, ax, ay, bx, by) {
    if (ay === by) return ax;
    return ax + (y - ay) * (bx - ax) / (by - ay);
  }

  for (let y = Math.ceil(y0); y <= Math.floor(y2); y++) {
    const lx = xi(y, x0, y0, x2, y2);
    const rx = y < y1 ? xi(y, x0, y0, x1, y1) : xi(y, x1, y1, x2, y2);
    for (let x = Math.ceil(Math.min(lx, rx)); x <= Math.floor(Math.max(lx, rx)); x++) {
      setPixel(rgba, w, x, y, R, G, B);
    }
  }
}

// ─── Icon renderer ────────────────────────────────────────────────────────────
// All coordinates are in a 108dp logical space; `s` scales them to pixels.

function drawIcon(size, round) {
  const rgba = new Uint8Array(size * size * 4);
  const s  = size / 108;
  const sc = v => Math.round(v * s);

  const [bgR, bgG, bgB] = [0x58, 0xCC, 0x02]; // #58CC02
  const [fgR, fgG, fgB] = [255, 255, 255];

  // Fill background (full square or circle for round variant)
  if (round) {
    const cx = size / 2, cy = size / 2, r2 = (size / 2) ** 2;
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r2)
          setPixel(rgba, size, x, y, bgR, bgG, bgB);
  } else {
    for (let i = 0; i < rgba.length; i += 4) {
      rgba[i] = bgR; rgba[i+1] = bgG; rgba[i+2] = bgB; rgba[i+3] = 255;
    }
  }

  const cr = Math.max(1, sc(4)); // corner radius

  // Three ascending bars
  fillRoundedTopBar(rgba, size, sc(22), sc(70), sc(38), sc(84), cr, fgR, fgG, fgB); // short
  fillRoundedTopBar(rgba, size, sc(46), sc(52), sc(62), sc(84), cr, fgR, fgG, fgB); // medium
  fillRoundedTopBar(rgba, size, sc(70), sc(38), sc(86), sc(84), cr, fgR, fgG, fgB); // tall

  // Upward-pointing arrow above tallest bar (tip=78,20  base=70,34–86,34)
  fillTriangle(rgba, size,
    [[sc(78), sc(20)], [sc(70), sc(34)], [sc(86), sc(34)]],
    fgR, fgG, fgB
  );

  return rgba;
}

// ─── Generate all densities ───────────────────────────────────────────────────

const DENSITIES = [
  { name: 'mdpi',    size: 48  },
  { name: 'hdpi',    size: 72  },
  { name: 'xhdpi',   size: 96  },
  { name: 'xxhdpi',  size: 144 },
  { name: 'xxxhdpi', size: 192 },
];

const RES_DIR = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

for (const { name, size } of DENSITIES) {
  const dir = path.join(RES_DIR, `mipmap-${name}`);

  fs.writeFileSync(path.join(dir, 'ic_launcher.png'),
    encodePNG(size, size, drawIcon(size, false)));

  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'),
    encodePNG(size, size, drawIcon(size, true)));

  console.log(`Generated mipmap-${name}  (${size}x${size}px)`);
}

console.log('\nDone! All Android launcher icons generated.');
