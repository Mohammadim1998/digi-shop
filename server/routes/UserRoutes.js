const express = require('express');
const router = express();
const { check } = require('express-validator');

const UserCtrl = require('../controllers/UserCtrl');
const User = require('../models/User');


router.get("/users", UserCtrl.getAllUsers);

router.post("/new-user", [
    check("username", "تعداد کاراکتر نام کاربری باید 8 تا 20 کاراکتر باشد...").isLength({ min: 8, max: 20 }),
    check("email", "لطفا نام کاربری دیگری انتخاب کنید.").custom(value => {
        return User.find({
            username: value
        }).then(user => {
            if (user.length > 1) {
                throw ("لطفا نام کاربری دیگری انتخاب کنید...")
            }
        });
    }),
    check("displayname", "تعداد کاراکتر نام نمایشی باید 8 تا 20 کاراکتر باشد...").isLength({ min: 8, max: 20 }),
    check("password", "تعداد کاراکتر رمز عبور باید 8 تا 20 کاراکتر باشد").isLength({ min: 8, max: 20 }),
    check("email", "فرمت ایمیل  اشتباه است.").isEmail(),
    check("email", "لطفا ایمیل دیگری انتخاب کنید.").custom(value => {
        return User.find({
            email: value
        }).then(user => {
            if (user.length > 1) {
                throw ("لطفا ایمیل دیگری انتخاب کنید...")
            }
        });
    }),

    check("favoriteProducts", "فرمت یکی از ورودی های ثبت نام کاربر اشتباه است...").isArray(),
    check("userProducts", "فرمت یکی از ورودی های ثبت نام کاربر اشتباه است...").isArray(),
    check("comments", "فرمت یکی از ورودی های ثبت نام کاربر اشتباه است...").isArray(),
    check("payments", "فرمت یکی از ورودی های ثبت نام کاربر اشتباه است...").isArray(),
    check("cart", "فرمت یکی از ورودی های ثبت نام کاربر اشتباه است...").isArray(),
    check("viewed", "فرمت یکی از ورودی های ثبت نام کاربر اشتباه است...").isBoolean(),
    check("userIsActive", "فرمت یکی از ورودی های ثبت نام کاربر اشتباه است...").isBoolean(),


], UserCtrl.registerUser);

router.post("/update-user/:id", [
    check("username", "تعداد کاراکتر نام کاربری باید 8 تا 20 کاراکتر باشد...").isLength({ min: 8, max: 20 }),
    check("displayname", "تعداد کاراکتر نام نمایشی باید 8 تا 20 کاراکتر باشد...").isLength({ min: 8, max: 20 }),
    check("password", "تعداد کاراکتر رمز عبور باید 8 تا 20 کاراکتر باشد").isLength({ min: 8, max: 20 }),
    check("email", "فرمت ایمیل  اشتباه است.").isEmail(),
    check("email", "لطفا ایمیل دیگری انتخاب کنید.").custom(value => {
        return User.find({
            email: value
        }).then(user => {
            if (user.length > 1) {
                throw ("لطفا ایمیل دیگری انتخاب کنید...")
            }
        });
    }),
    check("email", "لطفا نام کاربری دیگری انتخاب کنید.").custom(value => {
        return User.find({
            username: value
        }).then(user => {
            if (user.length > 1) {
                throw ("لطفا نام کاربری دیگری انتخاب کنید...")
            }
        });
    }),
], UserCtrl.updateUser);

router.post("/update-mini-user/:id", [
    check("displayname", "تعداد کاراکتر نام نمایشی باید 8 تا 20 کاراکتر باشد...").isLength({ min: 8, max: 20 }),
    check("password", "تعداد کاراکتر رمز عبور باید 8 تا 20 کاراکتر باشد").isLength({ min: 8, max: 20 }),
], UserCtrl.updateMiniUser);

router.post("/delete-user/:id", UserCtrl.deleteUser);
router.get("/get-user/:id", UserCtrl.getOneUserById);
router.post("/search-user", [
    check("email", "فرمت ایمیل اشتباه است...").isEmail(),
], UserCtrl.SearchUsers);

module.exports = router;