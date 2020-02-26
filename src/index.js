const express = require('express');

require('./db/mongoose');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

const jwt = require('jsonwebtoken');

const myFunction= async () => {
  const token = jwt.sign({ _id: 'abc' }, 'thisismynewcourse', { expiresIn: '0 second'});

  console.log('token', token);

  const data = jwt.verify(token, 'thisismynewcourse');
  console.log('data', data);
}

myFunction();

app.listen(port, () => {
  console.log(`server is app on port - ${port}`);
});
