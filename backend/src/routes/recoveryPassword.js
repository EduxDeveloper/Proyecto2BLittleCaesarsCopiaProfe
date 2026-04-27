import express from "express";
import recoveryPasswordController from "../controllers/recoveryPassword.js";

const router = express.Router();

router.route("/requestCode").post(recoveryPasswordController.requestCode)
router.route("/veryCode").post(recoveryPasswordController.verfyCode)
router.route("/newPassword").post(recoveryPasswordController.newPassword)

export default router;