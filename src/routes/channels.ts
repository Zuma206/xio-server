import { Router } from "express";
import { deleteMessages, getMessages, sendMessage } from "../database/messages";
import { authorize } from "../firebase";
import { pusher } from "../pusher";
import { v4 as uuid } from "uuid";
import { checkCooldown } from "../database/cooldown";
import emoji from "node-emoji";
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
    userInChannel,
    userIsOwner,
} from "../database/channels";
import { getPusher, refreshPusher } from "../database/pushers";

const router = Router();

router.get(
    "/",
    authorize(async (_req, userData, result) => {
        const userChannels = await getUserChannels(userData);
        return result(userChannels);
    })
);

router.get(
    "/:id/pusher",
    authorize(async (req, userData, result, error) => {
        const inChannel = await userInChannel(req.params.id, userData.uid);
        if (!inChannel) {
            return error(null, "You must be in a channel to connect to it");
        }
        return result(await getPusher(req.params.id));
    })
); // finished validation

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
); // finished validation

router.post(
    "/join",
    authorize(async (req, userData, result) => {
        const added = await addChannelMember(req.body.channelId, userData.uid);
        return result(added);
    })
); // finished validation

router.post(
    "/:id/message",
    authorize(async (req, userData, result, error) => {
        const inChannel = await userInChannel(req.params.id, userData.uid);
        if (!inChannel) {
            return error(
                new Error("You do not have permission to send messages here"),
                "Error sending message"
            );
        }
        const canSendMessage = await checkCooldown(userData.uid);
        const messageRegEx = /^[A-z0-9, !@#$%^&*()\-_=+`~[{\]}|;:'",<.>/?]*$/;
        if (req.body.content.length < 1 || req.body.content.length > 280) {
            return error(
                new Error("Invalid message length"),
                "Error sending message"
            );
        }
        if (!messageRegEx.test(emoji.strip(req.body.content))) {
            return error(
                new Error("Invalid characters in message"),
                "Error sending message"
            );
        }
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
        const pusherId = await getPusher(req.params.id);
        await pusher.trigger(
            `private-${req.params.id}-${pusherId}`,
            "message",
            {
                content: req.body.content,
                user: userData.uid,
                timestamp: Date.now(),
                key: uuid(),
                clientKey: req.body.clientKey,
                clientSide: false,
            }
        );
        return result(key);
    })
); // finished validation

router.get(
    "/:id",
    authorize(async (req, userData, result, error) => {
        const inChannel = await userInChannel(req.params.id, userData.uid);
        if (!inChannel) {
            return error(
                null,
                "You do not have permission to view this channel"
            );
        }
        const messages = await getMessages(req.params.id);
        return result(messages);
    })
); // finished validation

router.get(
    "/:id/delete",
    authorize(async (req, userData, result, error) => {
        const isOwner = await userIsOwner(req.params.id, userData.uid);
        if (!isOwner) {
            return error(
                null,
                "You do not have permission to delete this channel"
            );
        }
        const pusherId = await getPusher(req.params.id);
        await deleteChannel(req.params.id);
        pusher.trigger(`private-${req.params.id}-${pusherId}`, "deleted", null);
        return result(true);
    })
); // finished validation

router.get(
    "/:id/data",
    authorize(async (req, _userData, result) => {
        const channelData = await getChannelById(req.params.id);
        return result(channelData);
    })
);

router.get(
    "/:id/clear",
    authorize(async (req, userData, result, error) => {
        const isOwner = await userIsOwner(req.params.id, userData.uid);
        if (!isOwner) {
            return error(
                null,
                "You do not have permission to clear this channel"
            );
        }
        await deleteMessages(req.params.id);
        const pusherId = await await getPusher(req.params.id);
        pusher.trigger(`private-${req.params.id}-${pusherId}`, "clear", null);
        return result(true);
    })
); // finished validation

router.get(
    "/:id/members",
    authorize(async (req, userData, result, error) => {
        const isMember = await userInChannel(req.params.id, userData.uid);
        if (!isMember) {
            return error(
                null,
                "You do not have permission to view this channel"
            );
        }
        const { members, blacklist, owners } = await getChannelById(
            req.params.id
        );
        return result({ members, blacklist, owners });
    })
); // finished validation

router.post(
    "/:id/blacklist",
    authorize(async (req, userData, result, error) => {
        const isCallerOwner = await userIsOwner(req.params.id, userData.uid);
        const isSubjectOwner = await userIsOwner(req.params.id, req.body.user);
        if (!isCallerOwner || isSubjectOwner) {
            return error(
                null,
                "You do not have permission to blacklist this user"
            );
        }
        await channelBlacklistUser(req.params.id, req.body.user);
        await channelKickUser(req.params.id, req.body.user);
        const pusherId = await await getPusher(req.params.id);
        pusher.trigger(
            `private-${req.params.id}-${pusherId}`,
            "kicked",
            req.body.user
        );
        await refreshPusher(req.params.id);
        return result(true);
    })
); // finished validation

router.post(
    "/:id/whitelist",
    authorize(async (req, userData, result, error) => {
        const isOwner = await userIsOwner(req.params.id, userData.uid);
        if (!isOwner) {
            return error(
                null,
                "You do not have permission to whitelist this user"
            );
        }
        await channelWhitelistUser(req.params.id, req.body.user);
        return result(true);
    })
); // finished validation

router.get(
    "/:id/leave",
    authorize(async (req, userData, result, error) => {
        const isOwner = await userIsOwner(req.params.id, userData.uid);
        if (isOwner) {
            return error(null, "You cannot leave this server");
        }
        await channelKickUser(req.params.id, userData.uid);
        return result(true);
    })
); // finished validation

router.get(
    "/:id/:last",
    authorize(async (req, _userData, result) => {
        const messages = await getMessages(req.params.id, req.params.last);
        return result(messages);
    })
);

export default router;
