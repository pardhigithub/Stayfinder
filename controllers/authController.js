const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
exports.getLogin = (_req, res) => res.render('auth/login', { pageTitle: 'Welcome back', errors: [], oldInput: { email: '' } });
exports.postLogin = async (req, res, next) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(422).render('auth/login', { pageTitle: 'Welcome back', errors: ['Email or password is incorrect.'], oldInput: { email } });
    req.session.isLoggedIn = true;
    req.session.user = { _id: user._id.toString(), firstName: user.firstName, userType: user.userType };
    await req.session.save();
    res.redirect('/');
  } catch (err) { next(err); }
};
exports.postLogout = (req, res, next) => req.session.destroy(err => err ? next(err) : res.redirect('/'));
exports.getSingUp = (_req, res) => res.render('auth/signup', { pageTitle: 'Create your account', errors: [], oldInput: {} });
exports.postSignUp = [
  check('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('Enter a name with at least 2 characters.'),
  check('lastName').trim().isLength({ max: 50 }).withMessage('Last name must be 50 characters or fewer.'),
  check('email').isEmail().normalizeEmail().withMessage('Enter a valid email address.'),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  check('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.'),
  check('userType').isIn(['guest', 'host']).withMessage('Choose guest or host.'),
  check('terms').equals('on').withMessage('Please accept the terms to continue.'),
  async (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).render('auth/signup', { pageTitle: 'Create your account', errors: errors.array().map(e => e.msg), oldInput: { firstName, lastName, email, userType } });
    try {
      await User.create({ firstName, lastName, email, password: await bcrypt.hash(password, 12), userType });
      res.redirect('/login');
    } catch (err) {
      const message = err.code === 11000 ? 'An account with that email already exists.' : 'Could not create your account. Please try again.';
      res.status(422).render('auth/signup', { pageTitle: 'Create your account', errors: [message], oldInput: { firstName, lastName, email, userType } });
    }
  }
];
