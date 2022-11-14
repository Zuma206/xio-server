import { Router } from "express";
import { getUserById } from "../database/users";
import { firebase } from "../firebase";

const router = Router();

router.get("/", async (req, res) => {
    firebase
        .verifyIdToken(req.headers.authorization ?? "")
        .then(async (userData) => {
            const xioUserData = await getUserById(userData.uid);
            res.send({
                error: null,
                result: xioUserData,
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
