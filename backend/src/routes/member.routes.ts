import { Router } from "express";
import * as memberController from "../controllers/member.controller.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createInviteSchema,
  inviteIdSchema,
  updateMemberSchema,
} from "../validators/member.validator.js";

const router = Router();

router.use(protect);

// Any signed-in member can see the team
router.get("/", memberController.list);

// Invitations: admins and project managers
router
  .route("/invites")
  .get(authorize("admin", "pm"), memberController.listInvites)
  .post(authorize("admin", "pm"), validate(createInviteSchema), memberController.createInvite);

router.delete(
  "/invites/:id",
  authorize("admin", "pm"),
  validate(inviteIdSchema),
  memberController.revokeInvite
);

// Role changes and (de)activation: admins only. Declared after /invites so it doesn't capture it.
router.patch(
  "/:userId",
  authorize("admin"),
  validate(updateMemberSchema),
  memberController.update
);

export default router;
