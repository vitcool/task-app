const request = require("supertest");
const jwt = require('jsonwebtoken');

const app = require("../src/app");
const User = require("../src/models/user");

const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test("Should signup new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Testik",
      email: "vitcool@ukr.net",
      password: "nkjll12sdasda"
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      name: "Testik",
      email: "vitcool@ukr.net"
    },
    token: user.tokens[0].token
  });

  expect(user.password).not.toBe("nkjll12sdasda");
});

test("Should login existed user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);

  const user = await User.findById(response.body.user._id);

  expect(response.body).toMatchObject({
    user: {
      name: userOne.name,
      email: userOne.email
    },
    token: user.tokens[1].token
  });
});

test("Should non login nonexist user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "hui@ukr.net",
      password: "12323123"
    })
    .expect(400);
});

test("Should get user profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get user profile for unauth user", async () => {
  await request(app)
    .get("/users/me")
    .send()
    .expect(401);
});

test("Should delete user", async () => {
  const response = await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(response.body._id);
  expect(user).toBeNull();
});

test("Should delete user for unauth user", async () => {
  await request(app)
    .delete("/users/me")
    .send()
    .expect(401);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
  const response = await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      age: 22,
    })
    .expect(200);
  
  const user = await User.findById(response.body._id);
  expect(user.age).toBe(22);
});

test("Should not update invalid user fields", async () => {
  const response = await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'toronto',
    })
    .expect(400);
});
