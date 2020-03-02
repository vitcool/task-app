const request = require('supertest');
const app = require('../src/app');
const jsw = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../src/models/user');

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  name: 'Teston',
  email: 'vitalikulyk@gmail.com',
  password: 'nkjll12sdasda',
  tokens: [{
    token: jsw.sign({ _id: userOneId }, process.env.JWT_SECRET
  )}]
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

test('Should get user profile', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get user profile for unauth user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
});

test('Should delete user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should delete user for unauth user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});
