const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const userOne = {
  name: 'Teston',
  email: 'vitalikulyk@gmail.com',
  password: 'nkjll12sdasda',
};

beforeEach(async () => {
  await User.deleteMany();
  const user = new User(userOne);
  await user.save();
});

test('Should signup new user', async () => {
  await request(app).post('/users').send({
    name: 'Testik',
    email: 'vitcool@ukr.net',
    password: 'nkjll12sdasda',
  }).expect(201);
});

test('Should login existed user', async () => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password,
  }).expect(200);
});

test('Should non login nonexist user', async () => {
  await request(app).post('/users/login').send({
    email: 'hui@ukr.net',
    password: '12323123'
  }).expect(400);
});
