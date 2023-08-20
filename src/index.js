/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const parser = require('cron-parser')

const { JSONToHTML, tryConvertToJSON } = require('./helpers/json')
const database = require('./config/database')
const sendMail = require('./config/mail')

const jobs = {}

const dynamicallyImportScripts = () => {
  fs
    .readdirSync(path.join(__dirname, 'jobs'))
    .forEach((file) => {
      jobs[file.replace('.js', '')] = require(`./jobs/${file}`)
    })
}

const notifyError = (job, start, end, details) => {
  if(!job.NOTIFY) return

  const to = job.NOTIFY
  const subject = `MyCron - ${job.NAME}`
  const body = `
    <h1>Job - ${job.NAME}</h1>
    <b>Início: </b>${start.toLocaleString('pt-BR').replace(',', '')}
    <br>
    <b>Fim: </b>${end.toLocaleString('pt-BR').replace(',', '')}
    <br><br>
    <b>Detalhes: </b>
    <br>
    ${JSONToHTML(tryConvertToJSON(details))}
  `
  sendMail(to, subject, body)
}

const updateJobSuccess = async (job, details, starttime, attempt) => {
  await database.query(
    'INSERT INTO LOG (JOB, STARTTIME, ENDTIME, EXECUTIONTIME, EXECUTIONSTATUS, DETAILS, ATTEMPT) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [job.ID, starttime, new Date(), new Date().getTime() - starttime.getTime(), 'success', details, attempt],
  )

  await database.query(
    'UPDATE JOBS SET STATUS = ?, LASTEXECUTIONSTATUS = ?, LASTEXECUTIONTIME = NOW(), ATTEMPT = ? WHERE (ID = ?)',
    ['idle', 'success', 0, job.ID],
  )
}

const updateJobError = async (job, details, starttime, attempt) => {
  await database.query(
    'INSERT INTO LOG (JOB, STARTTIME, ENDTIME, EXECUTIONTIME, EXECUTIONSTATUS, DETAILS, ATTEMPT) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [job.ID, starttime, new Date(), new Date().getTime() - starttime.getTime(), 'error', details, attempt],
  )

  await database.query(
    'UPDATE JOBS SET STATUS = ?, LASTEXECUTIONSTATUS = ?, LASTEXECUTIONTIME = NOW(), ATTEMPT = ? WHERE (ID = ?)',
    ['idle', 'error', 0, job.ID],
  )

  notifyError(job, starttime, new Date(), details)
}

const updateJobRetry = async (job, details, starttime, attempt) => {
  const nextExecutionTime = new Date(Date.now() + job.RETRYMINUTES * 60 * 1000)

  await database.query(
    'INSERT INTO LOG (JOB, STARTTIME, ENDTIME, EXECUTIONTIME, EXECUTIONSTATUS, DETAILS, ATTEMPT) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [job.ID, starttime, new Date(), new Date().getTime() - starttime.getTime(), 'error', details, attempt],
  )

  await database.query(
    'UPDATE JOBS SET STATUS = ?, NEXTEXECUTIONTIME = ?, LASTEXECUTIONSTATUS = ?, LASTEXECUTIONTIME = NOW(), ATTEMPT = ? WHERE (ID = ?)',
    ['retrying', nextExecutionTime, 'error', attempt, job.ID],
  )
}

const exec = async (job) => {
  // RETORNA UM OBJETO DATA COM O HORÁRIO QUE ESSE JOB DEVE SER EXECUTADO
  const nextExecutionTime = parser.parseExpression(job.CRON).next().toDate()

  // COLOCA O JOB NO STATUS "RUNNING" E ATUALIZA O HORÁRIO DA PRÓXIMA EXECUÇÃO
  await database.query('UPDATE JOBS SET NEXTEXECUTIONTIME = ?, STATUS = ? WHERE (ID = ?)', [nextExecutionTime, 'running', job.ID])

  // DATA/HORA DO INICIO DA EXECUÇÃO DO JOB
  const starttime = new Date()

  // NÚMERO DA TENTATIVA DE EXECUÇÃO DO JOB
  const attempt = job.ATTEMPT + 1

  // SE O ARQUIVO COM O NOME DO JOB NÃO EXISTE NA PASTA "JOBS", ADICIONA UM SCRIPT QUE LANÇA UM ERRO
  if (jobs[job.NAME] === undefined) {
    jobs[job.NAME] = async () => { throw new Error(`Script ${job.NAME} not found.`) }
  }

  // EXECUTA O SCRIPT DO JOB
  jobs[job.NAME]()
    .then(async (details) => {
      updateJobSuccess(job, details, starttime, attempt)
    }).catch(async (err) => {
      const details = JSON.stringify({
        name: err.name,
        message: err.message,
        stack: err.stack,
      })

      if (attempt >= job.RETRYTIMES) {
        updateJobError(job, details, starttime, attempt)
      } else {
        updateJobRetry(job, details, starttime, attempt)
      }
    })
}

const loop = async () => {
  const [jobsToRun] = await database.query(`
    SELECT 
      JOBS.ID, 
      JOBS.NAME, 
      JOBS.CRON,
      JOBS.NOTIFY,
      JOBS.RETRYMINUTES,
      JOBS.RETRYTIMES,
      JOBS.ATTEMPT
    FROM 
      JOBS 
    WHERE
      (ENABLED = 1) AND 
      (STATUS = 'IDLE' OR STATUS = 'RETRYING') AND
      (NEXTEXECUTIONTIME <= NOW()) 
  `)

  Promise.all(
    jobsToRun.map((job) => exec(job)),
  )

  setTimeout(() => {
    loop()
  }, 1000)
}

const main = async () => {
  // ATUALIZA PARA "IDLE" CASO TENHA ALGUM JOB COM STATUS "RUNNING"
  await database.query('UPDATE JOBS SET STATUS = ? WHERE STATUS = \'running\'', ['idle'])

  // IMPORTA DINAMICAMENTE OS SCRIPTS DA PASTA "JOBS"
  dynamicallyImportScripts()

  // INICIA O LOOP
  loop()
}

main()
