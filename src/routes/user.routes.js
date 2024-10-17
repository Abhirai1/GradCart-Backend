import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"profileImage",
            maxCount:1,
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

// CRUD routes
router.route("/").get(verifyJWT, getAllUsers);
router.route("/:id").get(verifyJWT, getUserById).put(verifyJWT, updateUser).delete(verifyJWT, deleteUser);

export default router;