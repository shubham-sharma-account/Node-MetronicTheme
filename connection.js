const mongoose = require('mongoose');

const db = mongoose.connect("mongodb://localhost:27017/users", { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
        console.log(`Error: ${err}`);
    } else {
        console.log("connected successfully");
    }
});

module.exports = db;