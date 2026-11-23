import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import {
  registerSchema,
  loginSchema,
  inviteInfoSchema,
  acceptInviteSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", protect, authController.me);

// Public: the invitee is not signed in yet and proves who they are with the emailed token
router.get("/invite/:token", validate(inviteInfoSchema), authController.inviteInfo);
router.post("/accept-invite", validate(acceptInviteSchema), authController.acceptInvite);

export default router;
