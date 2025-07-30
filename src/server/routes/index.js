import express from "express";
import notes from "./notes.js"


const router = express.Router()

router.use('/notes', notes)


export default router