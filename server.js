const {storeFiles, init} = require('./utils')
init();
const jsonServer = require('json-server')
const localConfig = require('./localConfig.json')
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const middlewares = jsonServer.defaults({static: localConfig.publicPath})
const blogRouter = jsonServer.router('./db.json')
const updateRouter = require("./updateRouter");

if (cluster.isMaster) {

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', function (worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' restart');
    cluster.fork();
  });
  console.log('JSON Servers is running')
} else {
  cluster.on('exit', function (worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' restart');
    cluster.fork();
  });
  // 这里放入口文件的东西并且直接使用express监听端口
  const server = jsonServer.create()
  server.use(middlewares)
  server.use(jsonServer.bodyParser)
  server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blogs/*': '/blogs/$1',
    '/albums/*': '/albums/$1',
    '/info/*': '/info/$1',
    '/my/*': '/my/$1',
    // '/img/*': '/img/$1'
  }))
  server.use(updateRouter(blogRouter));
  server.use((req, res, next) => {
    switch (true) {
      case req.url === '/blogImages':
        storeFiles(req, res, 'blogs');
        return;
      case req.url === '/albumImages':
        storeFiles(req, res, 'albums');
        return;
      case req.url === '/blogMd':
        storeFiles(req, res, 'blogs')
        return;
      case "q" in req.query:
        req.query.q = decodeURIComponent(req.query.q);
        break;
      default:
        break;
    }
    next();
  })
  server.use(blogRouter)
  server.listen(parseInt(localConfig.url.split(':')[2]), () => {
  })
}


