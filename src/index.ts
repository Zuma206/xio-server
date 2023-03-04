import express from "express";
import users from "./routes/users";
import channels from "./routes/channels";
import { authorize, firebase } from "./firebase";
import axios from "axios";
import { userInChannel } from "./database/channels";
import { pusher } from "./pusher";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/users", users);
app.use("/api/channels", channels);

app.get("*", async (req, res) => {
  res.send(req.url);
});

app.post(
  "/api/image",
  authorize(async (req, _userData, result) => {
    const res = await axios.get(
      `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(
        req.body.url
      )}`
    );
    return result(res.status == 200);
  })
);

app.post("/api/auth", async (req, res) => {
  try {
    const socketId = req.body.socket_id;
    const pusherChannel = req.body.channel_name;
    const userData = await firebase.verifyIdToken(req.headers.authorization);
    const authorized = await userInChannel(
      pusherChannel.split("-")[1],
      userData.uid
    );
    if (authorized) {
      const response = pusher.authorizeChannel(socketId, pusherChannel);
      res.send(response).end();
    } else {
      res.status(403).end();
    }
  } catch {
    res.status(403).end();
  }
});

app.listen(PORT, () => console.log(`Started on http://localhost:${PORT}`));
