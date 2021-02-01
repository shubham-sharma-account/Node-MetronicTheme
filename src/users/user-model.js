const mongoose = require('mongoose');
const schema = mongoose.Schema;
const connection  = require('../../connection');

//creating schema
const detailsSchema = new schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    date: String,
    image: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

//creating collection with specified schema
const Person = new mongoose.model('details', detailsSchema);

//export model to controller
module.exports = Person;