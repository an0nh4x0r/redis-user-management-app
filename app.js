const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create redis client
let client = redis.createClient();

client.on('connect', () => {
    console.log('Connected to Redis ... ');
});

// Set port
const port = 3000;

// Init app
const app = express();

// View engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// body-parse
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// method-override
app.use(methodOverride('_method'));

// Search Page
app.get('/', (req, res, next) => {
    res.render('searchusers');
});

// Search processing
app.post('/user/search', (req, res, next) => {
    let id = req.body.id;

    client.hgetall(id, (err, obj) => {
        if (!obj) {
            res.render('searchusers', {
                error: 'User does not exist!'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            })
        }
    });
});

// Add user page
app.get('/user/add', (req, res, next) => {
    res.render('adduser');
});

// Process user page
app.post('/user/add', (req, res, next) => {
    let id = req.body.id;
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id, [
        'first_name', firstName,
        'last_name', lastName,
        'email', email,
        'phone', phone
    ], (err, reply) => {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    });
});

app.delete('/user/delete/:id', (req, res, next) => {
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log('Server started on port ' + port);
});
