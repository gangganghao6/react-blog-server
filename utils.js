const fs = require("fs");
const crypto = require("crypto");
const dayjs = require("dayjs");
const path = require("path");
const formidable = require("formidable");
const localConfig = require('./localConfig.json')


function createFileHash256(fileName) {
  //从文件创建一个可读流
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(fileName);
    const fsHash = crypto.createHash('sha256');

    stream.on('data', function (d) {
      fsHash.update(d);
    });
    stream.on('end', function () {
      const md5 = fsHash.digest('hex');
      resolve(md5);
    });
  })
}


function createMkdr(type) {
  let date = dayjs(new Date()).format('YYYY-MM-DD');
  let mkdr = fs.readdirSync(path.join(localConfig.publicPath, type));
  if (mkdr.includes(date)) {
  } else {
    fs.mkdirSync(path.join(path.join(localConfig.publicPath, type), date))
  }
  return date;
}

function createMkdrThrowPath(type, date) {
  let mkdr = fs.readdirSync(path.join(localConfig.publicPath, type));
  if (mkdr.includes(date)) {
  } else {
    fs.mkdirSync(path.join(path.join(localConfig.publicPath, type), date))
  }
  return date;
}

function storeFiles(req, res, type) {
  let date = createMkdr(type)
  let filePath = path.join(path.join(localConfig.publicPath, type), date)
  let form = new formidable.IncomingForm()
  let fileNames = []
  form.encoding = 'utf-8'
  form.uploadDir = filePath
  form.keepExtensions = true
  form.maxFieldsSize = 100 * 1024 * 1024;
  form.multiples = true;
  form.parse(req, async (err, fields, files) => {
    let length = Object.keys(files).length;
    let fileKeyNames = Object.keys(files)
    console.log(fileKeyNames)
    for (let i = 0; i < length; i++) {
      let username = fileKeyNames[i]
      // console.log(files[username].mimetype)
      // let fileName = await createFileHash256(files[username].filepath) + "." + files[username].mimetype.split('/')[1]
      let fileName = fileKeyNames[i];
      fs.rename(files[username].filepath, path.join(filePath, fileName), function (err) {
        if (err) {
          throw Error("改名失败");
        }
      })
      fileNames.push(`/${type}/${date}/${fileName}`)
    }
    res.json(fileNames)
  })
}

function storeFilesThrowPath(req, res, type, date) {
  createMkdr(type,date)
  let filePath = path.join(path.join(localConfig.publicPath, type), date)
  let form = new formidable.IncomingForm()
  let fileNames = []
  form.encoding = 'utf-8'
  form.uploadDir = filePath
  form.keepExtensions = true
  form.maxFieldsSize = 100 * 1024 * 1024;
  form.multiples = true;
  form.parse(req, async (err, fields, files) => {
    let length = Object.keys(files).length;
    let fileKeyNames = Object.keys(files)
    console.log(fileKeyNames)
    for (let i = 0; i < length; i++) {
      let username = fileKeyNames[i]
      let fileName = fileKeyNames[i];
      fs.rename(files[username].filepath, path.join(filePath, fileName), function (err) {
        if (err) {
          throw Error("改名失败");
        }
      })
      fileNames.push(`/${type}/${date}/${fileName}`)
    }
    res.json(fileNames)
  })
}

function updateState(blogRouter, state) {
  blogRouter.db.write(state)
  blogRouter.db.setState(state)
}

// function postImages(req, res, type) {
//   let fileName = req.query.id;
//   let mkdr = req.query.time;
//   let data = fs.readFileSync(path.join(localConfig.publicPath + `\\${type}\\` + mkdr, fileName), 'binary');
//   res.send(data)
//   // const buffer = new Buffer(data, 'binary');
//   // let type = fileName.match(/\.(png|jpg|gif|jpeg|webp)$/)[1];
//   // let src = 'data: image/' + type + ';base64,' + buffer.toString('base64');
//   // res.send(src)
// }

module.exports = {
  storeFiles,
  updateState,
  storeFilesThrowPath
}
