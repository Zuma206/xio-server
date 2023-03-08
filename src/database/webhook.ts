import deta from "./deta";

const webhooks = deta.Base("webhooks");

interface WebhookResult {
  key: string;
  url: string;
}

export async function getWebhook(channelID: string) {
  const res = await webhooks.get(channelID);
  if (res !== null) {
    return res.url as string;
  }
  return null;
}

export async function setWebhook(channelID: string, webhookURL: string) {
  await webhooks.put({ url: webhookURL }, channelID);
}

export async function deleteWebhook(channelID: string) {
  await webhooks.delete(channelID);
}
