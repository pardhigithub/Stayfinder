const Home = require('../models/home');
const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/pathUtil');

exports.getAddHome = (_req, res) => res.render('host/edit-home', { pageTitle: 'List your place', editing: false });
exports.getEditHome = async (req, res, next) => {
  try {
    const home = await Home.findOne({ _id: req.params.homeId, host: req.user._id });
    if (!home) return res.status(404).render('404', { pageTitle: 'Listing not found' });
    res.render('host/edit-home', { pageTitle: 'Edit listing', editing: true, home });
  } catch (err) { next(err); }
};
exports.getHostHomeList = async (req, res, next) => {
  try {
    const registeredHome = await Home.find({ host: req.user._id }).sort({ createdAt: -1 });
    res.render('host/host-home-list', { registeredHome, pageTitle: 'Your listings' });
  } catch (err) { next(err); }
};
exports.postAddHome = async (req, res, next) => {
  try {
    const { houseName, Price, Location, rating, description } = req.body;
    if (!req.file) return res.status(422).render('host/edit-home', { pageTitle: 'List your place', editing: false, error: 'Please add a listing photo.' });
    await Home.create({ houseName, Price: Number(Price), Location, rating: Number(rating), photo: `/uploads/${req.file.filename}`, description, host: req.user._id });
    res.redirect('/host/host-home-list');
  } catch (err) { next(err); }
};
exports.postEditHome = async (req, res, next) => {
  try {
    const home = await Home.findOne({ _id: req.body.id, host: req.user._id });
    if (!home) return res.status(404).render('404', { pageTitle: 'Listing not found' });
    Object.assign(home, { houseName: req.body.houseName, Price: Number(req.body.Price), Location: req.body.Location, rating: Number(req.body.rating), description: req.body.description });
    if (req.file) {
      const oldPath = path.join(rootDir, home.photo.replace(/^\//, ''));
      fs.promises.unlink(oldPath).catch(() => {});
      home.photo = `/uploads/${req.file.filename}`;
    }
    await home.save();
    res.redirect('/host/host-home-list');
  } catch (err) { next(err); }
};
exports.postDeleteHome = async (req, res, next) => {
  try {
    const home = await Home.findOneAndDelete({ _id: req.params.homeId, host: req.user._id });
    if (home && home.photo) fs.promises.unlink(path.join(rootDir, home.photo.replace(/^\//, ''))).catch(() => {});
    res.redirect('/host/host-home-list');
  } catch (err) { next(err); }
};
