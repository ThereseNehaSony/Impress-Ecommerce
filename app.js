const express = require('express');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const session = require("express-session");
const nocache = require("nocache");
const connectdb = require('../impress-project/config/database')


// Router
const userrouter = require('./routes/userrouter');
const adminrouter = require('./routes/adminrouter');
const errorHandlingMiddleware = require('./middleware/errorHandlingMiddleware');

dotenv.config();

const app = express();

// View engine
app.set('view engine', 'ejs');

// Middleware
app.use(morgan('dev'));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(nocache());
app.use(morgan('tiny'));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));



app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));




connectdb();




app.use('/admin', adminrouter)
app.use('/', userrouter);

app.use(errorHandlingMiddleware);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "user", "404.html"));
});



//Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
