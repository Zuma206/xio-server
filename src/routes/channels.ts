import { Router } from "express";
import { getUserChannels } from "../database/channels";
import { firebase } from "../firebase";

const router = Router();

router.get("/", async (req, res) => {
    firebase
        .verifyIdToken(req.headers.authorization ?? "")
        .then(async (userData) => {
            const userChannels = await getUserChannels(userData);
            res.send({
                error: null,
                result: userChannels,
            });
        })
        .catch(() => {
            res.status(400).send({
                error: "Authentication failed",
                result: null,
            });
        });
});

export default router;
