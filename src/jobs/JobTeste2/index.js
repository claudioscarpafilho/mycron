function sleep(ms) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = async () => {
  console.log('JobTeste2 - Início')
  await sleep(3500)
  console.log('JobTeste2 - Fim')
}
