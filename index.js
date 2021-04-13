import finalhandler from 'finalhandler'
import serveStatic from 'serve-static'
import WebSocket from 'faye-websocket'
import serveIndex from 'serve-index'
import chokidar from 'chokidar'
import parseurl from 'parseurl'
import colors from 'colors'
import http from 'http'
import fs from 'fs'
import _path from 'path'
const path = _path.posix

let SliveServer = {
  server: null,
  watcher: null,
}

let clients = []
SliveServer.start = function (config = {}) {
  const host = config.host || '0.0.0.0'
  const port = config.port || 3000
  const root = config.root ? path.join(process.cwd(), config.root) : process.cwd()
  const wait = config.wait || 100
  const watch = config.watch || [root]
  const verbose = config.verbose === undefined ? true : config.verbose

  const index = serveIndex(root, { 'icons': true })
  const serve = serveStatic(root)

  const server = http.createServer(function onRequest(req, res) {
    const done = finalhandler(req, res)
    if (req.url.endsWith('.html')) {
      let content = fs.readFileSync(path.join(root, parseurl(req).pathname), 'utf-8')
      // Inject WebSocket for livereload
      content = content.replace('</body>', `  <script>new WebSocket('ws://' + window.location.host).onmessage=o=>{'reload'==o.data&&window.location.reload()}</script>\n</body>`)
      res.writeHeader(200, { 'Content-Type': 'text/html' })
      res.write(content)
      res.end()
    }
    else {
      serve(req, res, function onNext(err) {
        if (err) return done(err)
        index(req, res, done)
      })
    }
  })
    .listen(port, host)
    .on('listening', () => {
      SliveServer.server = server
      const addr = server.address()
      const address = addr.address === '0.0.0.0' ? '127.0.0.1' : addr.address
      console.log(`Serving`, root.yellow, 'at', `http://${address}:${addr.port}/`.cyan)
      verbose && console.log('Ready for changes')
    })
    .on('error', e => {
      if (e.code === 'EADDRINUSE') {
        console.log(`Port`, e.port, 'is already in use. Trying another port.')
        setTimeout(() => server.listen(0, host), 200)
      }
      else {
        SliveServer.shutdown()
      }
    })

  // WebSocket
  server.on('upgrade', (request, socket, body) => {
    const ws = new WebSocket(request, socket, body)
    ws.onclose = () => clients = clients.filter(i => i !== ws)
    clients.push(ws)
  })

  // Watch & reload
  SliveServer.watcher = chokidar.watch(watch, { ignoreInitial: true })
  SliveServer.watcher.on('all', (event, file) => {
    setTimeout(() => {
      verbose && console.log('Change detected'.cyan, file.yellow)
      SliveServer.reload()
    }, wait)
  })
}
SliveServer.reload = function () {
  clients.forEach(ws => ws && ws.send('reload'))
}
SliveServer.shutdown = function () {
  const watcher = SliveServer.watcher
  watcher && watcher.close()

	const server = SliveServer.server
  server && server.close()
}

export default SliveServer
