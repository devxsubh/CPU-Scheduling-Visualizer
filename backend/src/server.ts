import express from 'express';
import cors from 'cors';
import routes from './routes';
import { logger, requestLogger } from './logger';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cpu-scheduler-api' });
});

app.listen(PORT, () => {
  logger.info('CPU Scheduler API started', { port: PORT, url: `http://localhost:${PORT}` });
});
