import { Router } from "express";
import { createChannel, getUserChannels } from "../database/channels";
import { getMessages, sendMessage } from "../database/messages";
import { userJoinChannel } from "../database/users";
import { authorize } from "../firebase";

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
        const success: boolean = await createChannel(req.body.name, userData);
        if (success) return result(success);
        else return error(null, "Failed to create channel");
    })
);

router.post(
    "/join",
    authorize(async (req, userData, result) => {
        await userJoinChannel(req.body.channelId, userData);
        return result(true);
    })
);

router.post(
    "/:id/message",
    authorize(async (req, userData, result) => {
        const key = await sendMessage(
            req.params.id,
            req.body.content,
            userData
        );
        return result(key);
    })
);

router.get(
    "/:id",
    authorize(async (req, _userData, result) => {
        const messages = await getMessages(req.params.id);
        return result(messages);
    })
);

export default router;
