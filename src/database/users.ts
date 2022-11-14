import deta from "./deta";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import md5 from "md5";

const users = deta.Base("users");

export type XIOUser = {
    username: string;
    gravatar: string;
    channels: string[];
    key: string;
};

export const getUserById = async (uid: string): Promise<null | XIOUser> => {
    const user = await users.get(uid);
    if (user) {
        return user as XIOUser;
    }
    return null;
};

export const getGravatar = (token: DecodedIdToken) => {
    const hash = md5(token.email);
    return `https://www.gravatar.com/avatar/${hash}`;
};

export const createUser = async (
    username: string,
    token: DecodedIdToken
): Promise<boolean> => {
    if (await users.get(token.uid)) return false;

    await users.put(
        {
            username,
            gravatar: getGravatar(token),
            channels: [],
        },
        token.uid
    );

    return true;
};

export const userJoinChannel = async (
    channelId: string,
    userData: DecodedIdToken
) => {
    return await users.update(
        {
            channels: users.util.append(channelId),
        },
        userData.uid
    );
};
