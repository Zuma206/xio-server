import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import deta from "./deta";
import { getUserById } from "./users";

const channels = deta.Base("channels");

export type XIOChannel = {
    name: string;
    owners: string[];
    blacklist: string[];
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
    userData.channels.forEach(async (channelId) => {
        userChannels.push(await getChannelById(channelId));
    });
    return userChannels;
};
