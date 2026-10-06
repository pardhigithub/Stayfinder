const Home = require('../models/home');
const User = require('../models/user');
const Booking = require('../models/booking');

exports.getIndex = async (req, res, next) => {
  try {
    const registeredHome = await Home.find().sort({ createdAt: -1 }).limit(6);
    res.render('store/index', { registeredHome, pageTitle: 'Stayfinder | Find your place' });
  } catch (err) { next(err); }
};
exports.getHomeList = async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const safeSearch = search.replace(/[.*+?^`${}()|[\]\\]/g, '\\$&');
    const query = search ? { $or: [{ houseName: { $regex: safeSearch, $options: 'i' } }, { Location: { $regex: safeSearch, $options: 'i' } }] } : {};
    const registeredHome = await Home.find(query).sort({ createdAt: -1 });
    res.render('store/home-list', { registeredHome, pageTitle: 'Explore stays', search });
  } catch (err) { next(err); }
};
exports.getBookings = async (req, res, next) => {
  if (!req.isLoggedIn) return res.redirect('/login');
  try {
    const bookings = await Booking.find({ guest: req.user._id }).populate('home').sort({ createdAt: -1 });
    res.render('store/bookings', { bookings, pageTitle: 'Your trips' });
  } catch (err) { next(err); }
};
exports.getFavouriteList = async (req, res, next) => {
  if (!req.isLoggedIn) return res.redirect('/login');
  try {
    const user = await User.findById(req.user._id).populate('favourites');
    res.render('store/favourite-list', { favouriteHomes: user ? user.favourites : [], pageTitle: 'Saved stays' });
  } catch (err) { next(err); }
};
exports.postAddToFavouriteList = async (req, res, next) => {
  if (!req.isLoggedIn) return res.redirect('/login');
  try {
    if (await Home.exists({ _id: req.body.id })) await User.findByIdAndUpdate(req.user._id, { $addToSet: { favourites: req.body.id } });
    res.redirect(req.get('referer') || '/favourite-list');
  } catch (err) { next(err); }
};
exports.postRemoveToFavouriteList = async (req, res, next) => {
  if (!req.isLoggedIn) return res.redirect('/login');
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { favourites: req.params.homeId } });
    res.redirect('/favourite-list');
  } catch (err) { next(err); }
};
exports.getHomeDetails = async (req, res, next) => {
  try {
    const home = await Home.findById(req.params.homeId);
    if (!home) return res.status(404).render('404', { pageTitle: 'Stay not found' });
    res.render('store/home-detail', { home, pageTitle: `${home.houseName} | Stayfinder` });
  } catch (err) { next(err); }
};
exports.postBooking = async (req, res, next) => {
  if (!req.isLoggedIn) return res.redirect('/login');
  try {
    const home = await Home.findById(req.params.homeId);
    const checkIn = new Date(`${req.body.checkIn}T00:00:00`);
    const checkOut = new Date(`${req.body.checkOut}T00:00:00`);
    const guests = Number(req.body.guests);
    if (!home) return res.status(404).render('404', { pageTitle: 'Stay not found' });
    const nights = Math.round((checkOut - checkIn) / 86400000);
    if (!Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime()) || nights < 1 || checkIn < new Date(new Date().toDateString()) || !Number.isInteger(guests) || guests < 1 || guests > 16) {
      return res.status(422).render('store/home-detail', { home, pageTitle: `${home.houseName} | Stayfinder`, bookingError: 'Choose valid dates (at least one night) and 1–16 guests.' });
    }
    const unavailable = await Booking.exists({ home: home._id, checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } });
    if (unavailable) return res.status(422).render('store/home-detail', { home, pageTitle: `${home.houseName} | Stayfinder`, bookingError: 'Those dates are already reserved. Please choose another range.' });
    await Booking.create({ guest: req.user._id, home: home._id, checkIn, checkOut, guests, totalPrice: nights * home.Price });
    res.redirect('/bookings');
  } catch (err) { next(err); }
};



