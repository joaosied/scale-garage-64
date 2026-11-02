// Prepara a foto no navegador antes de enviar: corta a borda transparente,
// diminui pra no maximo `max` px de largura e converte pra WEBP (ou PNG se o navegador nao suportar).

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não deu pra abrir essa imagem.'));
    };
    img.src = url;
  });
}

function alphaBounds(ctx, w, h) {
  const data = ctx.getImageData(0, 0, w, h).data;
  let top = h, left = w, right = -1, bottom = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return null;
  return { x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
}

function toBlob(canvas, type, q) {
  return new Promise(res => canvas.toBlob(res, type, q));
}

export async function prepImage(file, { max = 1600, trim = true } = {}) {
  if (file.type === 'image/svg+xml') return file;
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) throw new Error('Use uma foto PNG, JPG ou WEBP.');
  const { img, url } = await loadImage(file);
  try {
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    const c1 = document.createElement('canvas');
    c1.width = w;
    c1.height = h;
    const x1 = c1.getContext('2d', { willReadFrequently: true });
    x1.drawImage(img, 0, 0);

    let box = { x: 0, y: 0, w, h };
    if (trim && file.type !== 'image/jpeg' && w * h <= 25e6) {
      const b = alphaBounds(x1, w, h);
      if (b) {
        const pad = Math.round(Math.max(b.w, b.h) * 0.02);
        box = {
          x: Math.max(0, b.x - pad),
          y: Math.max(0, b.y - pad),
          w: Math.min(w, b.x + b.w + pad) - Math.max(0, b.x - pad),
          h: Math.min(h, b.y + b.h + pad) - Math.max(0, b.y - pad)
        };
      }
    }
    const scale = Math.min(1, max / box.w);
    const c2 = document.createElement('canvas');
    c2.width = Math.round(box.w * scale);
    c2.height = Math.round(box.h * scale);
    const x2 = c2.getContext('2d');
    x2.imageSmoothingQuality = 'high';
    x2.drawImage(c1, box.x, box.y, box.w, box.h, 0, 0, c2.width, c2.height);

    let blob = await toBlob(c2, 'image/webp', 0.9);
    if (!blob || blob.type !== 'image/webp') blob = await toBlob(c2, 'image/png');
    if (!blob) throw new Error('Não deu pra preparar a foto.');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
