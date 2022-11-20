import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import deta from "./deta";
import { deleteMessages } from "./messages";
import { getUserById } from "./users";

const channels = deta.Base("channels");

export type XIOChannel = {
    name: string;
    owners: string[];
    blacklist: string[];
    key: string;
    members: string[];
};

export const getChannelById = async (
    channelId: string
): Promise<null | XIOChannel> => {
    const channel = await channels.get(channelId);
    if (channel) {
        return channel as XIOChannel;
    }
    return null;
};

export const getUserChannels = async (
    token: DecodedIdToken
): Promise<null | XIOChannel[]> => {
    const { items } = await channels.fetch({ "members?contains": token.uid });
    return items as XIOChannel[];
};

export const addChannelMember = async (channelId: string, memberId: string) => {
    await channels.update(
        { members: channels.util.append(memberId) },
        channelId
    );
};

export const createChannel = async (name: string, token: DecodedIdToken) => {
    await channels.put({
        name,
        owners: [token.uid],
        blacklist: [],
        members: [token.uid],
    });

    return true;
};

export const deleteChannel = async (channelId: string) => {
    await channels.delete(channelId);
    await deleteMessages(channelId);
};

export const channelKickUser = async (channelId: string, userId: string) => {
    const channelData = (await channels.get(channelId)) as XIOChannel;
    await channels.put(
        {
            ...channelData,
            members: channelData.members.filter((memberId) => {
                if (memberId == userId) return false;
                return true;
            }),
        },
        channelId
    );
    return true;
};

export const channelBlacklistUser = async (
    channelId: string,
    userId: string
) => {
    await channels.update(
        { blacklist: channels.util.append(userId) },
        channelId
    );
    return true;
};

export const channelWhitelistUser = async (
    channelId: string,
    userId: string
) => {
    const channelData = (await channels.get(channelId)) as XIOChannel;
    await channels.put(
        {
            ...channelData,
            blacklist: channelData.blacklist.filter((memberId) => {
                if (memberId == userId) return false;
                return true;
            }),
        },
        channelId
    );
    return true;
};
