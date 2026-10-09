// Validate the complete manifest before writing any recovered object to CloudBase.
export function validateBackup(manifest) {
  const invalid = () => { throw new Error('备份结构或图片清单不完整，未执行恢复。'); };
  if (manifest?.schemaVersion !== 1 || typeof manifest.sourceEnv !== 'string' || !Array.isArray(manifest.files) || !Array.isArray(manifest.tables?.quest_state) || !Array.isArray(manifest.tables?.quest_archive)) invalid();
  const state = manifest.tables.quest_state.find(s => s._id === 'main');
  if (!state || state.schemaVersion !== 1 || !Number.isInteger(state.revision) || !Array.isArray(state.artworks) || state.artworks.length > 25 || !Array.isArray(state.rewards) || !Array.isArray(state.letters)) invalid();
  const files = new Map();
  for (const file of manifest.files) {
    if (typeof file.id !== 'string' || !/^[a-f0-9]{64}\.bin$/.test(file.name) || !/^[a-f0-9]{64}$/.test(file.sha256) || !Number.isInteger(file.size) || file.size < 1 || file.size > 10485760 || files.has(file.id)) invalid();
    files.set(file.id, file);
  }
  const ids = new Set();
  state.artworks.forEach((art, i) => {
    if (typeof art.id !== 'string' || ids.has(art.id) || art.node !== i + 1 || !Number.isInteger(art.version)) invalid();
    ids.add(art.id);
  });
  for (const art of [...state.artworks, ...manifest.tables.quest_archive]) if (!files.has(art.fileID) || !files.has(art.thumbnailID)) invalid();
  return state;
}
