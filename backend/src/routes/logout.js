import express from "express";
import logoutController from "../controllers/logoutController.js";

const router = express.router();

router.route("/").post(logoutController.logout);

export default router;