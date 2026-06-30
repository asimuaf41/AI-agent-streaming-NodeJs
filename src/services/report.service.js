import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, '../../data/reports');

function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

export async function saveReport(title, content) {
  ensureReportsDir();

  const safeName = (title || 'report')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 80);
  const filename = `${Date.now()}-${safeName}.md`;
  const filepath = path.join(REPORTS_DIR, filename);

  fs.writeFileSync(filepath, content, 'utf8');

  return {
    success: true,
    filepath,
    savedTo: `data/reports/${filename}`,
    message: `Report saved to data/reports/${filename}`
  };
}
