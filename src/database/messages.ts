import { FetchResponse } from "deta/dist/types/types/base/response";
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

export const getMessages = async (
  channel: string,
  from: string | undefined = undefined
) => {
  const { items, last } = await messages.fetch(
    {
      channel,
    },
    {
      limit: 50,
      last: from,
    }
  );
  return {
    messages: items.reverse(),
    last,
  };
};

export const deleteMessages = async (channel: string) => {
  let res: FetchResponse = {
    items: [],
    count: 0,
    last: "key",
  };
  while (res.last) {
    res = await messages.fetch(
      { channel },
      { limit: 25, last: res.last == "key" ? undefined : res.last }
    );
    const puts = res.items.map(({ key }) => ({ key }));
    if (puts.length > 0) {
      await messages.putMany(puts, { expireIn: 0 });
    }
  }
};

export async function getMessage(id: string) {
  return await messages.get(id);
}
