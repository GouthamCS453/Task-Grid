const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://gouthamcs453:alchemist123@cluster0.p00xt.mongodb.net/taskManager?retryWrites=true&w=majority&appName=Cluster0')
    .then((res) => {
        console.log('connected to database')
    })
    .catch((err) => {
        console.log(err)
    });