# slive-server
Simple http server with live reload capability

## Installation
`npm i slive-server`

## Example
```javascript
const SliveServer = require('slive-server')
SliveServer.start({
  port: 1234,
  watch: 'dist'
})
```

## Configuration
```javascript
const config = {
  host: '127.0.0.1', // Set the server address. Default: 0.0.0.0
  port: 3000, // Set the server port. Default: 3000
  root: 'public', // Set root directory that's being served. Default: current directory
  wait: 100, // Waits for all changes, before reloading. Default(ms): 100
  watch: ['dist', 'public'], // Paths to exclusively watch for changes. Default: watch everything
  verbose: true, // Log changed files. Default: true
}

SliveServer.start(config)
```

## Methods
```javascript
SliveServer.reload() // Reload manually
SliveServer.shutdown() // Stop server
```

## Cli
```javascript
npm i slive-server -g

// example
slive-server --port=1234 --watch=public

// cli parameters
--host=127.0.0.1 // Set the server address. Default: 0.0.0.0
--port=3000 // Set the server port. Default: 3000
--root=public // Set root directory that's being served. Default: current directory
--wait=100 // Waits for all changes, before reloading. Default(ms): 100
--watch=dist,public // Paths to exclusively watch for changes. Default: watch everything
--quiet // Hide changed files log.
```
