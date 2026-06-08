const express = require('express');
const http = require('http');
const authRouter = require('./routes/auth');
const tutorsRouter = require('./routes/tutors');
const lessonsRouter = require('./routes/lessons');
const dailyConversationsRouter = require('./routes/dailyConversations');
const statsRouter = require('./routes/stats');
const conversationsRouter = require('./routes/conversations');
const notificationsRouter = require('./routes/notifications');
const panelRouter = require('./routes/panel');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const VoiceChatServerV2 = require('./realtime/voiceChatServerV2');
const { createLogger } = require('./utils/logger');
require('dotenv').config();

const log = createLogger('SERVER');

require('./config/database');
const { initFirebaseAdmin } = require('./config/firebase');
initFirebaseAdmin();

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT, 10) || 3011;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Timezone-Offset, X-UI-Language, X-Panel-Api-Key'
  );
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'lingola-apis', status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/tutors', tutorsRouter);
app.use('/lessons', lessonsRouter);
app.use('/daily-conversations', dailyConversationsRouter);
app.use('/stats', statsRouter);
app.use('/conversations', conversationsRouter);
app.use('/notifications', notificationsRouter);
app.use('/panel', panelRouter);

app.use(errorHandler);

server.listen(PORT, '0.0.0.0', () => {
  log.info(`Lingola APIs listening on port ${PORT}`);

  const wsPath = process.env.REALTIME_WS_PATH || '/realtime';
  const voiceChatServer = new VoiceChatServerV2();
  voiceChatServer.start({ server, path: wsPath });
  log.info(`Voice Chat v2 ready on path ${wsPath}`);
});
