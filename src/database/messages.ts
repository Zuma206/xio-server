import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import deta from "./deta";

const messages = deta.Base("messages");

export const sendMessage = async (
    channel: string,
    content: string,
    userData: DecodedIdToken
) => {
    const { key } = await messages.put({
        channel,
        content,
        user: userData.uid,
        timestamp: Date.now(),
    });

    return key;
};

export const getMessages = async (channel: string) => {
    const { items } = await messages.fetch({ channel });
    return items.reverse();
};
