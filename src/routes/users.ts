import { Router } from "express";
import { firebase } from "../firebase";

const router = Router();

router.get("/", async (req, res) => {
    firebase
        .verifyIdToken(req.headers.authorization)
        .then((userData) => {
            res.send({
                error: null,
                result: userData,
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
