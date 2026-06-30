import { app } from './src/app.js';
import { env } from './src/config/env.js';

const host = '0.0.0.0';

app.listen(env.port, host, () => {
  console.log(`Server running on http://${host}:${env.port}`);
});


