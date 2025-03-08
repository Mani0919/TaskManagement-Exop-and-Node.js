const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }  // ✅ Changed 'Password' to 'password'
});

const Users = mongoose.model('User', usersSchema);

module.exports = Users;
