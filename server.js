const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const dbConfig = require('./config/config');
const ApiResponse = require('./helpers/apiresponse.helper');
const mongoose = require('mongoose');

const router = express.Router();
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

var corsOptions = {
    origin: []
}

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }))
app.use(morgan('dev'));

mongoose.connect(dbConfig.DB_CONNECTION_STRING, {
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

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
    res.send("Welcome to the Social Network API...");
})

app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
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