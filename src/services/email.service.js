import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTBOX_DIR = path.join(__dirname, '../../data/outbox');

function ensureOutboxDir() {
  if (!fs.existsSync(OUTBOX_DIR)) {
    fs.mkdirSync(OUTBOX_DIR, { recursive: true });
  }
}

/**
 * Sends an email. No SMTP/provider is configured in this learning project,
 * so delivery is simulated: the message is persisted to data/outbox/ and a
 * success receipt is returned. Wire a real provider here later if needed.
 */
export async function sendEmail({ to, subject, body }) {
  const recipient = (to || '').trim() || 'client@example.com';
  ensureOutboxDir();

  const timestamp = Date.now();
  const safeSubject = (subject || 'real-estate-report')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 60);
  const filename = `${timestamp}-${safeSubject}.md`;
  const filepath = path.join(OUTBOX_DIR, filename);

  const message = `To: ${recipient}\nSubject: ${subject}\nDate: ${new Date(timestamp).toISOString()}\n\n${body}`;
  fs.writeFileSync(filepath, message, 'utf8');

  return {
    success: true,
    simulated: true,
    to: recipient,
    subject,
    savedTo: `data/outbox/${filename}`,
    message: `Report emailed to ${recipient} (simulated, saved to data/outbox/${filename}).`
  };
}
