import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

if (!process.env.DETA_RUNTIME) {
    app.listen(PORT, () => console.log(`Started on http://localhost:${PORT}`));
}

export default app;
