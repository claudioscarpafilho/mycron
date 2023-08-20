const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')

const sesClient = new SESClient(
  {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  },
)

module.exports = async (to, subject, body) => {
  const params = {
    Source: process.env.AWS_MAIL_FROM,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Data: body,
          Charset: 'UTF-8',
        },
      },
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
    },
  }

  sesClient.send(new SendEmailCommand(params))
}
