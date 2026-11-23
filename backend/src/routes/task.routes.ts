import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  listTasksSchema,
} from "../validators/task.validator.js";


// ---------- Nested under a project ----------
export const projectTaskRoutes = Router({ mergeParams: true });

projectTaskRoutes.use(protect);

projectTaskRoutes
  .route("/")
  .post(validate(createTaskSchema), taskController.create)
  .get(validate(listTasksSchema), taskController.list);

// ---------- Standalone task routes ----------
export const taskRoutes = Router();

taskRoutes.use(protect);


taskRoutes
.route("/:id")
.get(validate(taskIdSchema), taskController.getOne)
.patch(validate(updateTaskSchema), taskController.update)
.delete(validate(taskIdSchema), taskController.remove);
