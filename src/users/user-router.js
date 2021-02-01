const express = require('express');
const router = express.Router();
const user = require('./user-controller');
const obj = new user;
const Person = require('./user-model');
const passport = require('passport');
const localstrategy = require('passport-local').Strategy;
const multer = require('multer');
var path = require('path');

const chechAuthenticate = function(req,res,next){
    if(req.isAuthenticated()){
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
    }else{
        res.redirect('/login');
    }
}

router.route('/adduser').get((req, res) => {
    res.render('add-user');
})

var Storage = multer.diskStorage({
    destination: "public/upload",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

//file upload 
var upload = multer({
    storage: Storage
}).single('file');

router.post('/adduser', upload, async (req, res) => {
    try {
        let data = await obj.insert(req.body, req.file);
        res.redirect(`/section`);
        //sending mail to registered user
        //obj.mail(email);
    } catch (error) {
        res.status(400).send('Email already exist');
    }
});

router.route('/').get(chechAuthenticate,(req, res) => {
    let totalUsers;
    Person.countDocuments({}, function (err, count) {
        if (err) throw err;
        totalUsers = count;
        res.render('dashboard', {
            total: totalUsers
        });
    });
})


router.route('/list').get(async (req, res) => {

    const [data, itemCount] = await Promise.all([
        Person.find({}).limit(req.query.limit).skip(req.skip).lean().exec(),
        Person.countDocuments({})
    ]);
    console.log(data);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    console.log(pageCount);
    res.render('section', {
        details: data,
        pageCount,
        itemCount,
        page: req.query.page,
        limit: 4,
        //pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)
    });
})

router.route('/profile').get((req, res) => {
    let id = req.session.passport.user;
    console.log(id);
    Person.findOne({
        _id: id
    }, (err, data) => {
        res.render('profile', {
            info: data
        });
    });
});

passport.use(new localstrategy({
    usernameField: 'email'
}, (email, password, done) => {
    try {
        Person.findOne({
            email: email
        }, (err, data) => {
            if (err) throw err;
            if (!data) {
                return done(null, false, {
                    message: "User doesn't exist"
                });
            }
            if (password == password) {
                return done(null, data);
            } else {
                return done(null, false, {
                    message: "Password doesn't match"
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}));

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    Person.findById(id, (err, user) => {
        cb(err, user);
    })
})

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

router.route('/login').get((req, res) => {
    res.render('login');
})

//load user data in edit-user form
router.get('/edit/:email', function (req, res) {
    let email = req.params.email; //getting user email from url for render his data
    Person.findOne({
        email: email
    }, function (err, data) {
        res.render('edit-user', {
            data
        });
    });
});

//save new users details
router.post('/edit/:email', async function (req, res) {
    try {
        let email = req.params.email;
        Person.findOneAndUpdate({
            email: email
        }, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            date: req.body.date,
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        }, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.redirect('/list');
            }
        });
    } catch (err) {
        console.log(err);
    }
});

//delete user
router.get('/delete/:email', function (req, res) {
    let email = req.params.email;
    Person.deleteOne({
        email: email
    }, function (err) {
        if (err) console.log(err);
        res.redirect('/list');
    });
})

router.route('/forget_password').get((req, res) => {
    res.render('forget_password', {
        msg: 'Enter your email below to reset your password'
    });
})

router.route('/forget_password').post((req, res) => {
    try {
        let email = req.body.email;
        obj.mail(email);
        res.render('forget_password', {
            msg: 'Check your email please'
        });
    } catch (error) {
        console.log(error);
    }
})

router.route('/reset_password/:email').get((req, res) => {
    res.render('reset_pass_form', {
        email: req.params.email
    });
})

router.route('/reset_password/:email').post((req, res) => {
    try {
        let email = req.params.email;
        let password = req.body.password;
        Person.findOneAndUpdate({
            email
        }, {
            password: password
        }, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.render('reset_pass_form', {
                    email: req.params.email,
                    msg: 'Password updated successfully'
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
})

router.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/login');
})

module.exports = router;