import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import deta from "./deta";

const messages = deta.Base("messages");

export type APIMessage = {
    channel: string;
    content: string;
    user: string;
    timestamp: number;
};

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
    return items.sort((message0: APIMessage, message1: APIMessage) => {
        if (message0.timestamp < message1.timestamp) {
            return -1;
        } else if (message0.timestamp == message1.timestamp) {
            return 0;
        } else {
            return 1;
        }
    });
};
