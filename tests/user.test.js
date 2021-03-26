const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/user');
const {
    testUser01Id,
    testUser01Token,
    testUser01,
    setupDatabase
} = require('./fixtures/db');


beforeEach(setupDatabase);

afterAll(async () => {
    await mongoose.connection.close()
});


test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'NewUser',
        email: 'newuser@example.com',
        password: 'sjdnfir!555'
    }).expect(201);

    //assert user was added to db
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    //assert response content
    expect(response.body).toMatchObject({
        user: {
            name: 'NewUser',
            email: 'newuser@example.com'
        },
        token: user.tokens[0].token
    });
    expect(user.password).not.toBe('sjdnfir!555');
});

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: testUser01.email,
        password: testUser01.password
    }).expect(200);

    //assert new token is saved in DB
    const user = await User.findById(response.body.user._id);
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login with wrong credentials', async () => {
    await request(app).post('/users/login').send({
        email: testUser01.email,
        password: 'aaaaaaa'
    }).expect(400);
});

test('Should retrieve user own profile', async () => {
    await request(app).get('/users/me')
        .set('Authorization', `Bearer ${testUser01Token}`)
        .send()
        .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
    await request(app).get('/users/me')
        .send()
        .expect(401);
});

test('Should delete user own account', async () => {
    await request(app).delete('/users/me')
        .set('Authorization', `Bearer ${testUser01Token}`)
        .send()
        .expect(200);

    //assert user is removed
    const user = await User.findById(testUser01Id);
    expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
    await request(app).delete('/users/me')
        .send()
        .expect(401);
});

test('Should upload own avatar image', async () => {
    await request(app).post('/users/me/avatar')
        .set('Authorization', `Bearer ${testUser01Token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

    //assert a buffer is saved in DB
    const user = await User.findById(testUser01Id);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${testUser01Token}`)
        .send({ name: 'John' })
        .expect(200);

    //assert data was updated in DB
    const user = await User.findById(testUser01Id);
    expect(user.name).toBe('John');
});

test('Should not update invalid user fields', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${testUser01Token}`)
        .send({ location: 'Barcelona' })
        .expect(400);
});