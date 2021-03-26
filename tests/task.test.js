const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {
    testUser01Token,
    testUser02Token,
    testTask01,
    setupDatabase
} = require('./fixtures/db');


beforeEach(setupDatabase);

afterAll(async () => {
    await mongoose.connection.close()
});


test('Should create new task for user', async () => {
    const response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${testUser01Token}`)
        .send({ description: 'Task for testing' })
        .expect(201);
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
    expect(task).toMatchObject({ description: 'Task for testing' });
});

test('Should get user own tasks', async () => {
    const response = await request(app).get('/tasks')
        .set('Authorization', `Bearer ${testUser01Token}`)
        .send()
        .expect(200);
    expect(response.body.length).toBe(2);
});

test('Should not delete other user\'s task', async () => {
    await request(app).delete(`/tasks/${testTask01._id}`)
        .set('Authorization', `Bearer ${testUser02Token}`)
        .send()
        .expect(404);

    const task = await Task.findById(testTask01._id);
    expect(task).not.toBe(null);
})