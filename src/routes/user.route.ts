import { Router } from "express";
import * as userController from "@/controllers/user.controller";
import { validate } from "@/middleware/validate.middleware";
import { createUserSchema } from "@/validators/user.validator";

const router = Router();

router.get("/", userController.getAllUsers);
router.post("/", validate(createUserSchema), userController.createUser);
router.get("/:id", userController.getUserById);

export default router;
