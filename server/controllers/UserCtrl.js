const User = require('../models/User');
const { validationResult } = require('express-validator');

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const getAllUsers = async (req, res) => {
    try {
        if (req.query.pn && req.query.pgn) {
            const paginate = req.query.pgn;
            const pageNumber = req.query.pn;
            const GoalUsers = await User.find().sort({ _id: -1 }).skip((pageNumber - 1) * paginate).limit(paginate).select({ username: 1, displayname: 1, email: 1, viewed: 1, userIsActive: 1, createdAt: 1 });
            const AllUsersNum = await (await User.find()).length;
            res.status(200).json({ GoalUsers, AllUsersNum });
        } else {
            const AllUsers = await User.find().sort({ _id: -1 });
            res.status(200).json(AllUsers);
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
}
module.exports.getAllUsers = getAllUsers;

//Register

const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ msg: errors.errors[0].msg });
        } else {
            // CHECK PASSWORD EQUAL CONFIRM PASSWORD
            if (req.body.password == req.body.rePassword) {
                // CHECK EMAIL EXISTS
                const emailExist = await User.find({ email: req.body.email });
                if (emailExist.length < 1) {
                    //CJECK USERNAME EXISTS
                    const usernameExist = await User.find({ username: req.body.username });
                    if (usernameExist.length < 1) {
                        //MAKING USER
                        const data = req.body;
                        data.username = req.body.username.replace(/\s+/g, '_').toLowerCase();
                        data.displayname = req.body.displayname.replace(/\s+/g, '_').toLowerCase();
                        data.email = req.body.email.replace(/\s+/g, '_').toLowerCase();
                        data.password = req.body.password.replace(/\s+/g, '').toLowerCase();
                        const hashedPassword = await bcrypt.hash(req.body.password, 10);
                        const userActivateCode = Math.floor(Math.random() * (90000000) + 10000000);
                        const newUser = new User({
                            username: data.username,
                            displayname: data.displayname,
                            email: data.email,
                            password: hashedPassword,
                            favoriteProducts: [],
                            userProducts: [],
                            comments: [],
                            payments: [],
                            cart: [],
                            viewed: false,
                            activateCode: userActivateCode,
                            userIsActive: false,
                            emailSend: true,
                            createdAt: new Date().toLocaleDateString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                            updatedAt: new Date().toLocaleDateString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                        });
                        newUser.save()
                            .then(d => {
                                //MAKE AUTH COOKE
                                const token = jwt.sign({ _id: newUser._id, username: newUser.username }, process.env.TOKEN_SECRET);

                                //EMAIL TO USER ACCOUNT
                                const MAIL_HOST = process.env.MAIL_HOST;
                                const MAIL_PORT = process.env.MAIL_PORT;
                                const MAIL_USER = process.env.MAIL_USER;
                                const MAIL_PASSWORD = process.env.MAIL_PASSWORD
                                const MAIL_MAIN_ADDRESS = process.env.MAIL_MAIN_ADDRESS;

                                const transporter = nodemailer.createTransport({
                                    host: MAIL_HOST,
                                    port: MAIL_PORT,
                                    tls: true,
                                    auth: {
                                        user: MAIL_USER,
                                        pass: MAIL_PASSWORD,
                                    }
                                });

                                transporter.sendMail({
                                    from: MAIL_MAIN_ADDRESS,
                                    to: newUser.email,
                                    subject: "احراز هویت فروشگاه فایل مرن فا",
                                    html: `<html><head><style><strong>{color: rgb(0, 119, 255);}<h1>{font-size: large;}</style></head><body><h1>احراز هویت مرن فا</h1><div>کد احراز هویت: <strong>${userActivateCode}</strong></div></body></html>`,
                                    //html: `<html><head><style>strong{color: rgb(0, 119, 255);}h1{font-size: large;}</style></head><body><h1>احراز هویت مرن فا</h1><div>کد احراز هویت: <strong>${userActivateCode}</strong></div></body></html>`,
                                })
                                    .then(d => {
                                        res.status(200).json({ msg: "ثبت نام موفقیت آمیز بود", auth: token });
                                    })
                                    .catch(e => {
                                        console.log(e);
                                        res.status(400).json({ msg: "خطا در ثبت نام", errorMessage: err, })
                                    });

                            })
                            .catch(e => {
                                console.log(err);
                                res.status(400).json(err);
                            })
                    }
                    else {
                        res.status(422).json({ msg: "لطفا نام کاربری دیگری وارد کنید..." })
                    }
                }
                else {
                    res.status(422).json({ msg: "لطفا ایمیل دیگری وارد کنید..." })
                }
            }
            else {
                res.status(422).json({ msg: "تکرار رمز عبور اشتباه است..." })
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
}
module.exports.registerUser = registerUser;




const updateUser = async (req, res) => {
    try {
        // EXPRESS VALIDATOR 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ msg: errors.errors[0].msg });
        } else {
            const data = req.body;
            data.username = req.body.username.replace(/\s+/g, '_').toLowerCase();
            data.displayname = req.body.displayname.replace(/\s+/g, '_').toLowerCase();
            data.email = req.body.email.replace(/\s+/g, '_').toLowerCase();
            data.password = req.body.password.replace(/\s+/g, '_').toLowerCase();
            await User.findByIdAndUpdate(req.params.id, data, {
                new: true
            });
            res.status(200).json({ msg: "کاربر با موفقیت به روز رسانی شد" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
}
module.exports.updateUser = updateUser;


const updateMiniUser = async (req, res) => {
    try {
        // EXPRESS VALIDATOR 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ msg: errors.errors[0].msg });
        } else {
            if (req.body.username || req.body.email || req.body.payments || req.body.activate) {
                res.status(400).json({ msg: "خطا در اطلاعات فرستاده شده..." });
            } else {
                const data = req.body;
                data.displayname = req.body.displayname.replace(/\s+/g, '_').toLowerCase();
                data.password = req.body.password.replace(/\s+/g, '').toLowerCase();
            }
            await User.findByIdAndUpdate(req.params.id, data, {
                new: true
            });
            res.status(200).json({ msg: "اطلاعات شما با موفقیت به روز رسانی شد" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
}
module.exports.updateMiniUser = updateMiniUser;





const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndRemove(req.params.id);
        res.status(200).json({ msg: "کاربر با موفقیت حذف شد." });
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
}
module.exports.deleteUser = deleteUser;



const getOneUserById = async (req, res) => {
    try {
        const goalUser = await User.findById(req.params.id);
        res.status(200).json(goalUser);
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
}
module.exports.getOneUserById = getOneUserById;



const SearchUsers = async (req, res) => {
    try {
        const theUser = await User.find({ email: req.body.email });
        if (theUser.length > 0) {
            res.status(200).json({ userData: theUser[0] });
        } else {
            res.status(200).json({ userData: 0 });
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
}
module.exports.SearchUsers = SearchUsers;