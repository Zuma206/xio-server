import { Router } from "express";
import {
    addChannelMember,
    channelBlacklistUser,
    channelKickUser,
    channelWhitelistUser,
    createChannel,
    deleteChannel,
    getChannelById,
    getUserChannels,
} from "../database/channels";
import { deleteMessages, getMessages, sendMessage } from "../database/messages";
import { authorize } from "../firebase";
import { pusher } from "../pusher";

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
        await addChannelMember(req.body.channelId, userData.uid);
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
        await pusher.trigger(req.params.id, "message", {
            content: req.body.content,
            user: userData.uid,
            timestamp: Date.now(),
            key,
            clientKey: req.body.clientKey,
            clientSide: false,
        });
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

router.get(
    "/:id/delete",
    authorize(async (req, _userData, result) => {
        await deleteChannel(req.params.id);
        pusher.trigger(req.params.id, "deleted", null);
        return result(true);
    })
);

router.get(
    "/:id/clear",
    authorize(async (req, _userData, result) => {
        await deleteMessages(req.params.id);
        pusher.trigger(req.params.id, "clear", null);
        return result(true);
    })
);

router.get(
    "/:id/members",
    authorize(async (req, _userData, result) => {
        const { members, blacklist } = await getChannelById(req.params.id);
        return result({ members, blacklist });
    })
);

router.post(
    "/:id/blacklist",
    authorize(async (req, _userData, result) => {
        await channelBlacklistUser(req.params.id, req.body.user);
        await channelKickUser(req.params.id, req.body.user);
        pusher.trigger(req.params.id, "kicked", req.body.user);
        return result(true);
    })
);

router.post(
    "/:id/whitelist",
    authorize(async (req, _userData, result) => {
        await channelWhitelistUser(req.params.id, req.body.user);
        return result(true);
    })
);

router.get(
    "/:id/leave",
    authorize(async (req, userData, result) => {
        await channelKickUser(req.params.id, userData.uid);
        return result(true);
    })
);

router.get(
    "/:id/:last",
    authorize(async (req, _userData, result) => {
        const messages = await getMessages(req.params.id, req.params.last);
        return result(messages);
    })
);

export default router;
