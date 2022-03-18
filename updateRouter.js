const jsonServer = require("json-server");
const {updateState, storeFilesThrowPath} = require("./utils");

const blogRouter = jsonServer.router('./db.json')
module.exports = function updateRouter(req, res, next) {
  let state = blogRouter.db.read().__wrapped__;
  switch (true) {
    case req.url === '/updateInfoViews' && req.method === 'PATCH':
      state.info.visitCount++;
      updateState(blogRouter, state)
      res.send();
      return;
    case req.url.includes('/updateBlogMd') && req.method === 'PATCH':
      let {path} = req.query;
      storeFilesThrowPath(req, res, 'blogs', path)
      // updateState(blogRouter, state)
      return;
    case req.url === '/updateBlogViews' && req.method === 'PATCH':
      state.blogs.forEach((item) => {
        if (item.id === parseInt(req.body.id)) {
          item.views++;
        }
      });
      updateState(blogRouter, state)
      res.send();
      return;
    case req.url === '/updateInfoComments' && req.method === 'PATCH':
      state.info.commentCount++;
      updateState(blogRouter, state)
      res.send()
      return;
    case req.url === '/updateInfoLastModified' && req.method === 'PATCH':
      state.info.lastModified = +new Date();
      updateState(blogRouter, state)
      res.send()
      return;
    case req.url === '/updateInfoBlogs' && req.method === 'PATCH':
      if (req.body.type === 'add') {
        state.info.blogCount++;
      } else {
        state.info.blogCount--;
      }
      updateState(blogRouter, state)
      res.send();
      return;
    case req.url === '/updateTags' && req.method === 'PATCH':
      if (!state.tags.includes(req.body.tag)) {
        state.tags.push(req.body.tag);
      }
      updateState(blogRouter, state)
      res.send();
      return;
    default:
      break;
  }
  next();
}
