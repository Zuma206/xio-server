import deta from "./deta";
import { v4 as uuid } from "uuid";

const pushers = deta.Base("pushers");

export const refreshPusher = async (channelId: string) => {
  await pushers.put({ pusher: uuid() }, channelId);
};

export const getPusher = async (channelId: string) => {
  const { pusher } = await pushers.get(channelId);
  return pusher;
};

export const deletePusher = async (channelId: string) => {
  await pushers.delete(channelId);
};
