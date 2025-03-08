const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    taskname: { type: String, required: true },
    desc: { type: String, required: true},
    priority: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }  
});

// Correct model name to 'Task'
const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
