import express from "express";

import users from "./routes/users";

const app = express();
const PORT = 3000;

app.use("/api/users", users);

app.get("*", async (req, res) => {
    res.send("XIO API");
});

if (!process.env.DETA_RUNTIME) {
    app.listen(PORT, () => console.log(`Started on http://localhost:${PORT}`));
}

export default app;
