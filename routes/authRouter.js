
// External modeuls
const express = require("express");
const authRouter = express.Router();

const authController = require("../controllers/authController");

authRouter.get("/login", authController.getLogin);
authRouter.post("/login",authController.postLogin);

authRouter.post("/logout", authController.postLogout);

authRouter.get("/signup",authController.getSingUp);
authRouter.post("/signup", authController.postSignUp);



module.exports = authRouter;