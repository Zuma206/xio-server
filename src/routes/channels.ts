import { Router } from "express";
import { deleteMessages, getMessages, sendMessage } from "../database/messages";
import { authorize } from "../firebase";
import { pusher } from "../pusher";
import { v4 as uuid } from "uuid";
import {
    addChannelMember,
    channelBlacklistUser,
    channelKickUser,
    channelWhitelistUser,
    createChannel,
    deleteChannel,
    getChannelById,
    getUserChannels,
    userCanCreateChannel,
} from "../database/channels";
import { checkCooldown } from "../database/cooldown";

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
        const channelNameRegex = /([A-z]|\ |[0-9]){3,16}/;
        const name: string = req.body.name;
        const isValidName = channelNameRegex.test(name);
        const canCreate = await userCanCreateChannel(userData.uid);
        if (!isValidName) {
            return error(null, "Invalid channel name");
        }
        if (!canCreate) {
            return error(null, "You have hit the channel ownership limit (3)");
        }
        const success: boolean = await createChannel(name, userData);
        if (success) return result(success);
        else return error(null, "Failed to create channel");
    })
);

router.post(
    "/join",
    authorize(async (req, userData, result) => {
        const added = await addChannelMember(req.body.channelId, userData.uid);
        return result(added);
    })
);

router.post(
    "/:id/message",
    authorize(async (req, userData, result, error) => {
        const canSendMessage = await checkCooldown(userData.uid);
        if (!canSendMessage) {
            return error(
                new Error("You are being rate-limited"),
                "Error sending message"
            );
        }
        const key = await sendMessage(
            req.params.id,
            req.body.content,
            userData
        );
        await pusher.trigger(req.params.id, "message", {
            content: req.body.content,
            user: userData.uid,
            timestamp: Date.now(),
            key: uuid(),
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
