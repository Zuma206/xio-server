import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import deta from "./deta";
import { getUserById, userJoinChannel } from "./users";

const channels = deta.Base("channels");

export type XIOChannel = {
    name: string;
    owners: string[];
    blacklist: string[];
    key: string;
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
    const userData = await getUserById(token.uid);
    if (!userData) return null;
    const userChannels: XIOChannel[] = [];
    for (const channelId of userData.channels) {
        const details = await getChannelById(channelId);
        if (details) {
            userChannels.push(details);
        }
    }
    return userChannels;
};

export const createChannel = async (name: string, token: DecodedIdToken) => {
    const channelDetails = (await channels.put({
        name,
        owners: [token.uid],
        blacklist: [],
        messages: 0,
    })) as XIOChannel;

    await userJoinChannel(channelDetails.key, token);

    return true;
};
