import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  addMembersSchema,
} from "../validators/project.validator.js";

const router = Router();

// All project routes require authentication
router.use(protect);

router
  .route("/")
  .post(validate(createProjectSchema), projectController.create)
  .get(projectController.list);

router
  .route("/:id")
  .get(validate(projectIdSchema), projectController.getOne)
  .patch(validate(updateProjectSchema), projectController.update)
  .delete(validate(projectIdSchema), projectController.remove);

router.patch(
  "/:id/members",
  validate(addMembersSchema),
  projectController.addMembers
);

router.delete(
  "/:id/members/:userId",
  projectController.removeMember
);

export default router;