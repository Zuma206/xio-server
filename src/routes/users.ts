import { Router } from "express";
import { createUser, getUserById } from "../database/users";
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

router.get("/:id", async (req, res) => {
    firebase
        .verifyIdToken(req.headers.authorization ?? "")
        .then(async () => {
            const xioUserData = await getUserById(req.params.id);
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

router.post("/activate", (req, res) => {
    firebase
        .verifyIdToken(req.headers.authorization ?? "")
        .then(async (userData) => {
            const success = await createUser(req.body.username ?? "", userData);
            if (success) {
                res.send({
                    error: null,
                    result: null,
                });
            } else {
                res.status(400).send({
                    error: "Failed to create the user",
                    result: null,
                });
            }
        })
        .catch(() => {
            res.status(400).send({
                error: "Authentication failed",
                result: null,
            });
        });
});

export default router;
