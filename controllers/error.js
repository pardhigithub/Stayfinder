exports.homesError = (req,res, next) => {
//    res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
   res.status(404).render('404', {pageTitle: 'page error', isLoggedIn: req.isLoggedIn,
      user: req.session.user
   });
}