import { Router } from "express";
import { userInChannel, userIsOwner } from "../database/channels";
import { deleteWebhook, getWebhook, setWebhook } from "../database/webhook";
import { authorize } from "../firebase";

const router = Router();

router.get(
  "/:id",
  authorize(async (req, userData, result, error) => {
    if (!(await userInChannel(req.params.id, userData.uid))) {
      return error(
        null,
        "You do not have permission to view this channel's webhook"
      );
    }
    if (await userIsOwner(req.params.id, userData.uid)) {
      return result((await getWebhook(req.params.id)) ?? "");
    } else {
      return result((await getWebhook(req.params.id)) ? "Webhook Enabled" : "");
    }
  })
);

router.post(
  "/:id",
  authorize(async (req, userData, result, error) => {
    const isValid =
      /^https:\/\/discord\.com\/api\/webhooks\/\d{19}\/[A-z0-9\-_]{68}$/.test(
        req.body.url
      ) || req.body.url === "";
    if (!isValid) return error(null, "Invalid webhook");
    if (await userIsOwner(req.params.id, userData.uid)) {
      if (req.body.url === "") {
        await deleteWebhook(req.params.id);
      } else {
        await setWebhook(req.params.id, req.body.url);
      }
      return result("success");
    }
    return error(
      null,
      "You do not have permission to set this channel's webhook"
    );
  })
);

export default router;
