import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import deta from "./deta";

const messages = deta.Base("messages");

export type APIMessage = {
    channel: string;
    content: string;
    user: string;
    timestamp: number;
};

export const generateMessageKey = () => {
    return `${8.64e15 - Date.now()}${Math.floor(
        Math.random() * (999 - 111) + 111
    )}`;
};

export const sendMessage = async (
    channel: string,
    content: string,
    userData: DecodedIdToken
) => {
    const key = generateMessageKey();
    const message: APIMessage = {
        channel,
        content,
        user: userData.uid,
        timestamp: Date.now(),
    };
    await messages.put(message, key);
    return { ...message, key };
};

export const getMessages = async (channel: string, from: number = null) => {
    const { items } = await messages.fetch(
        {
            channel,
            "key?gt": from ?? generateMessageKey(),
        },
        {
            limit: 5,
        }
    );
    return items.reverse();
};
