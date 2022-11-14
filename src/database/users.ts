import deta from "./deta";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import md5 from "md5";

const users = deta.Base("users");

export const getUserById = async (uid: string) => {
    return await users.get(uid);
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
        },
        token.uid
    );

    return true;
};
