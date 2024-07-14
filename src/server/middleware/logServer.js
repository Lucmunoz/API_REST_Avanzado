import querystring from 'querystring'

export const logServer = (req, res, next) => {
  let log = `=> ${Date(Date.now().toString())}:`

  if (req.method) {
    log += `\n-El servidor recibió una petición del tipo: "${req.method}" `
  }
  if (Object.keys(req.query).length !== 0 && req.method === 'GET') {
    log += `\n-Se incluye una query: "${querystring.stringify(req.query)}" `
  }
  if (Object.keys(req.body).length !== 0 && req.method === 'POST') {
    log += `\n-Se incluye un Body: ${JSON.stringify(req.body)} `
  }

  console.log(log)
  next()
}
