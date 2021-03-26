const mongoose = require('mongoose');
const User = require('../../src/models/user');
const jwt = require('jsonwebtoken');
const Task = require('../../src/models/task');

const testUser01Id = new mongoose.Types.ObjectId;
const testUser01Token = jwt.sign({ _id: testUser01Id }, process.env.JWT_SECRET);
const testUser02Id = new mongoose.Types.ObjectId;
const testUser02Token = jwt.sign({ _id: testUser02Id }, process.env.JWT_SECRET);

const testUser01 = {
    _id: testUser01Id,
    name: 'TestUser01',
    email: 'testuser01@example.com',
    password: 'testpass!01',
    tokens: [{
        token: testUser01Token
    }]
};

const testUser02 = {
    _id: testUser02Id,
    name: 'TestUser02',
    email: 'testuser02@example.com',
    password: 'testpass!02',
    tokens: [{
        token: testUser02Token
    }]
};

const testTask01 = {
    _id: new mongoose.Types.ObjectId,
    description: 'Task 01',
    completed: false,
    owner: testUser01Id
};

const testTask02 = {
    _id: new mongoose.Types.ObjectId,
    description: 'Task 02',
    completed: true,
    owner: testUser01Id
};

const testTask03 = {
    _id: new mongoose.Types.ObjectId,
    description: 'Task 03',
    completed: false,
    owner: testUser02Id
};



const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(testUser01).save();
    await new User(testUser02).save();
    await new Task(testTask01).save();
    await new Task(testTask02).save();
    await new Task(testTask03).save();
}


module.exports = {
    testUser01Id,
    testUser01Token,
    testUser01,
    testUser02Id,
    testUser02Token,
    testUser02,
    testTask01,
    testTask02,
    testTask03,
    setupDatabase
}