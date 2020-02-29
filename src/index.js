const express = require('express');

const multer = require('multer');

require('./db/mongoose');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

const jwt = require('jsonwebtoken'); 

const upload = multer({
  dest: 'images',
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (file.originalname.endsWith('.pdf')) {
      return cb(undefined, true);
    }
    cb(new Error('File must be PDF'));
  }
});

app.post('/upload', upload.single('upload'), (req, res) => {
  res.send(200);
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

app.listen(port, () => {
  console.log(`server is app on port - ${port}`);
});
