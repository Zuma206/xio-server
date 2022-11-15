import { Router } from "express";
import { createChannel, getUserChannels } from "../database/channels";
import { authorize, firebase } from "../firebase";

const router = Router();

router.get(
    "/",
    authorize(async (_req, userData, result) => {
        const userChannels = await getUserChannels(userData);
        return result(userChannels);
    })
);

router.post(
    "/create",
    authorize(async (req, userData, result, error) => {
        const success = await createChannel(req.body.name, userData);
        if (success) return result(success);
        else return error(null, "Failed to create channel");
    })
);

export default router;
