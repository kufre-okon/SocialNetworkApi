const express = require('express');
const bodyparser = require('body-parser');
// const cors = require('cors');
const morgan = require('morgan');
const ApiResponse = require('./helpers/apiresponse.helper');
const mongoose = require('mongoose');

const app = express();


if (process.env.NODE_ENV !== 'production') {
    const parsed = require('dotenv').config();
    console.log(parsed);
}



require('./swagger_init')(app);

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }))
app.use(morgan('dev'));
/*
I was getting "Access to XMLHttpRequest at '' from origin '' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource."
when I used Cors above especially when posting FormData
*/
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
    next();
});


mongoose.connect(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    keepAlive: 1
}, (err) => {
    if (!err)
        console.log('Database connection success!')
    else {
        console.log('Database connection error: ')
        console.log(err);
    }
})

// routes
require('./routes/post.routes')(app);
require('./routes/auth.routes')(app);
require('./routes/user.route')(app);

app.get("/", (req, res) => {
    res.send("Welcome to the Social Network API...");
})

app.use((req, res) => {
    ApiResponse.successWithStatus(res, 404, null, "The requested resource not found");
})

app.use((err, req, res, next) => {
    // console.log(err);
    ApiResponse.handleError500(res, "Server error...something went wrong");
})


const PORT = process.env.PORT || 7072;
app.listen(PORT, () => {
    console.info(`Server started on port: ${PORT}. CTRL+C to terminate`);
});

module.exports = app;