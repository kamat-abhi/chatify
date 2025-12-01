import express from "express";

const router = express.Router()

router.get("/signup", (req, res) => {
    res.send("Sinup endpoint");
})

router.get("/login", (req, res) => {
    res.send("Sinup endpoint");
})

router.get("/logout", (req, res) => {
    res.send("Sinup endpoint");
})

export default router;