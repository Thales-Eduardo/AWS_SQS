require('dotenv/config');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
require('express-async-errors');

const listMessage = require('./sqs');

const processId = process.pid;
const app = express();
const port = 3336;

app.use(helmet());
app.use(express.json({ type: ['*/json', 'text/*'] }));
app.use(cors());

const data = [];

app.use((err, req, res, next) => {
  if (err) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

app.get('/', async (req, res) => {
  const ipAddress =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const origin = req.headers.host;

  const obj = {
    host: origin,
    ip: 'seu ip: ' + ipAddress,
  };
  res.send(obj);
});

app.get('/dados', async (req, res) => {
  const dados = await listMessage();
  const { Messages } = dados;
  for (const dadosSQS of Messages) {
    data.push({ body: dadosSQS.Body, MessageId: dadosSQS.MessageId });
  }

  res.json({
    ok: true,
    dados: data,
    num: data.length,
  });
});

const server = app.listen(port, () => {
  console.log(`http://localhost:${port} 🔥🔥🚒 ${processId}`);
});

// ---- Graceful Shutdown
function gracefulShutdown(event) {
  const data = new Date().toLocaleString();
  return code => {
    console.log(`${event} - server ending ${code}`, data);
    server.close(async () => {
      process.exit(0);
    });
  };
}

//disparado no ctrl+c => multiplataforma
process.on('SIGINT', gracefulShutdown('SIGINT'));
//Para aguardar as conexões serem encerradas para só então encerrar a aplicação.
process.on('SIGTERM', gracefulShutdown('SIGTERM'));

// captura erros não tratados
process.on('uncaughtException', (error, origin) => {
  console.log(`${origin} uncaughtException -  signal received ${error}`);
});
process.on('unhandledRejection', error => {
  console.log(`unhandledRejection - signal received ${error}`);
});
process.on('exit', code => {
  console.log(`exit signal received ${code}`);
});

// // simular um erro
// setTimeout(() => {
//   process.exit(1);
// }, Math.random() * 1e4); // 10.000
