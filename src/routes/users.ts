import { Router } from "express";
import { createUser, getUserById } from "../database/users";
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
        const success = await createUser(req.body.username ?? "", userData);
        if (success) return result(success);
        else return error(null, "Failed to activate user");
    })
);

export default router;
