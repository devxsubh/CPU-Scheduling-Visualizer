import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cpu-scheduler-api' });
});

app.listen(PORT, () => {
  console.log(`CPU Scheduler API running at http://localhost:${PORT}`);
});
