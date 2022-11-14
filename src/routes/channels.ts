import { Router } from "express";
import { createChannel, getUserChannels } from "../database/channels";
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
        .catch((err) => {
            res.status(400).send({
                error: err.message,
                result: null,
            });
        });
});

router.post("/create", async (req, res) => {
    firebase
        .verifyIdToken(req.headers.authorization ?? "")
        .then(async (userData) => {
            console.log("body name:", req.body.name);
            const success = await createChannel(req.body.name, userData);
            res.send({
                error: null,
                result: success,
            });
        })
        .catch((err) => {
            res.status(400).send({
                error: err.message,
                result: null,
            });
        });
});

export default router;
