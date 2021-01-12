'use strict';
const operator = require('../utils/operator');

const Instn = require('../models/instn-schema');

exports.register = async (req, res) => {
    console.log('In institution register', req.body);
    if (req.body.orgname && req.body.username && req.body.password) {
        let result = await operator.enrollUser(req.body.orgname, req.body.username);
        console.log('result', result);
        if (result.status == 0) {
            console.log(result.msg);
            return res.status(409).json({ status: 1, msg: result.msg });
        } else if (result.status == 1) {
            let newInstn = new Instn({
                username: req.body.username,
                organization: req.body.orgname,
                password: req.body.password
            });
            newInstn.save((err, usr) => {
                if (err) {
                    console.log(err.msg);
                    return res.status(500).json({ status: 0, msg: err.msg });
                } else {
                    console.log('Institution saved successfully', usr);
                    return res.status(200).json({ status: 1, msg: req.body.username + ` enrolled and saved successfully` });
                }
            });
        } else {
            console.log(result.msg);
            return res.status(500).json({ status: 0, msg: result.msg });
        }
    } else {
        console.log('Invalid format');
        return res.status(403).json({ status: 0, msg: 'Invalid Data Format' });
    }
};

exports.login = async (req, res) => {
    console.log('In institution login', req.body);
    if (req.body.username && req.body.password) {
        Instn.findOne({ username: req.body.username }, (err, inst) => {
            if (err) {
                console.log(err.msg);
                return res.status(500).json({ status: 0, msg: err.msg });
            } else {
                if (inst) {
                    console.log('institution', inst);
                    inst.comparePassword(req.body.password, (err, isMatch) => {
                        if (err) {
                            console.log('Something went wrong');
                            req.session.loginErr = true;
                            return res.render('instn/login', { status: 0, loginErr: req.session.loginErr });
                        } else {
                            if (isMatch) {
                                console.log('<< Login Success >>');
                                req.session.username = inst.username;
                                console.log('session !!', req.session);

                                req.session.save(err => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        // res.redirect('/instn/home');
                                    }
                                });
                            } else {
                                console.log('Password incorrect');
                                req.session.loginErr = true
                                return res.render('instn/login', { status: 0, loginErr: req.session.loginErr });
                            }
                        }
                    });
                } else {
                    console.log(req.username + ' doesnot exists');
                    req.session.loginErr = true;
                    return res.render('instn/login', { status: 0, loginErr: req.session.loginErr });
                }
            }
        });
    } else {
        console.log('Invalid format');
        req.session.loginErr = true
        return res.render('instn/login', { status: 0, loginErr: req.session.loginErr })
    }
};