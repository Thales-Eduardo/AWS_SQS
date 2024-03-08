const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const createMessage = async mensagem => {
  const client = new SQSClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const params = {
    QueueUrl: process.env.SQS_URL, // required
    MessageBody: mensagem, // required
  };
  const command = new SendMessageCommand(params);

  try {
    const data = await client.send(command);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

module.exports = createMessage;
