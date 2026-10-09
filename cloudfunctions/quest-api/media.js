const sharp = require('sharp');
const { QuestError, config, hash } = require('./domain');
async function validateImage(bytes, ticket) {
  if (!Buffer.isBuffer(bytes) || bytes.length !== ticket.size || bytes.length > config.maxImageBytes || hash(bytes) !== ticket.sha256) throw new QuestError('图片与本次上传不一致，请重新选择图片。');
  try {
    const image = sharp(bytes, { limitInputPixels: 40000000, failOn: 'warning' });
    const metadata = await image.metadata();
    if (!['png', 'jpeg', 'webp'].includes(metadata.format) || (metadata.pages ?? 1) !== 1 || `image/${metadata.format}` !== ticket.type) throw new Error('unsupported image');
    const thumbnail = await image.rotate().resize({ width: 720, height: 720, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    return { thumbnail, extension: metadata.format === 'jpeg' ? 'jpg' : metadata.format };
  } catch { throw new QuestError('图片无法读取，请使用静态 JPG、PNG 或 WebP 图片（不超过 4000 万像素）。'); }
}
module.exports = { validateImage };
