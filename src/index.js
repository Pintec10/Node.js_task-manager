const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user-router');
const taskRouter = require('./routers/task-router');

const app = express();
const port = process.env.port || 3000;



// app.use((req, res, next) => {
//     res.status(503).send('Site currently unavailable');
// })

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


app.listen(port, () => {
    console.log('Server is up on port ' + port);
});



const Task = require('./models/task');
const User = require('./models/user');

// const main = async () => {
//     // const task = await Task.findById('5eb82961648926d6eb221be5');
//     // await task.populate('owner').execPopulate();
//     // console.log(task.owner);

//     const user = await User.findById('5eb82949648926d6eb221be2');
//     await user.populate('userTasks').execPopulate();
//     console.log(user.userTasks);
// }

// main();
