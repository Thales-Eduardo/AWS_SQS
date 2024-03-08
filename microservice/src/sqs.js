const { SQSClient, ReceiveMessageCommand } = require('@aws-sdk/client-sqs');

const listMessage = async () => {
  const client = new SQSClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const params = {
    QueueUrl: process.env.SQS_URL,
    // O número máximo de mensagens a serem retornadas de 1 a 10
    MaxNumberOfMessages: 10,
    //A duração (em segundos) durante a qual a chamada aguarda a chegada de uma mensagem na fila antes de retornar.
    WaitTimeSeconds: 5,
  };
  const command = new ReceiveMessageCommand(params);

  try {
    const data = await client.send(command);
    return data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = listMessage;
