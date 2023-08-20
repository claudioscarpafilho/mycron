function sleep(ms) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = async () => {
  console.log('JobTeste1 - Início')
  await sleep(3500)
  throw new Error('Erro no JobTeste1')
  console.log('JobTeste1 - Fim')
}
