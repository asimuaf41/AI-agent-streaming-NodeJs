import { pipeline } from '@xenova/transformers';

let embedderPromise = null;

async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }

  return embedderPromise;
}

export async function generateEmbedding(text) {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}
