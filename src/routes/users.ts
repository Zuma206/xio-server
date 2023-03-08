import { Router } from "express";
import { createUser, getUserById, isValidUsername } from "../database/users";
import { authorize } from "../firebase";

const router = Router();

router.get(
  "/",
  authorize(async (_req, userData, result) => {
    const xioUserData = await getUserById(userData.uid);
    return result(xioUserData);
  })
);

router.get(
  "/:id",
  authorize(async (req, _userData, result) => {
    const xioUserData = await getUserById(req.params.id);
    return result(xioUserData);
  })
);

router.post(
  "/activate",
  authorize(async (req, userData, result, error) => {
    const usernameRegex = /^[a-zA-Z0-9]{3,16}$/;
    const username = req.body.username ?? "";
    const passedRegex = usernameRegex.test(username);
    const passedTest = await isValidUsername(username);
    if (!passedRegex) return error(null, "Invalid username");
    if (!passedTest) return error(null, "That username is taken");
    const success = await createUser(username, userData);
    if (success) return result(success);
    else return error(null, "Failed to activate user");
  })
);

export default router;
