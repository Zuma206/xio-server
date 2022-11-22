import express from "express";
import users from "./routes/users";
import channels from "./routes/channels";
import { authorize } from "./firebase";
import axios from "axios";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/users", users);
app.use("/api/channels", channels);

app.get("*", async (_req, res) => {
    res.send("XIO API");
});

app.post(
    "/api/image",
    authorize(async (req, _userData, result) => {
        const res = await axios.get(req.body.url);
        return result(res.status == 200);
    })
);

if (!process.env.DETA_RUNTIME) {
    app.listen(PORT, () => console.log(`Started on http://localhost:${PORT}`));
}

export default app;
