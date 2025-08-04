import express from "express";
import notes from "./notes.js"
import folders from "./folders.js"


const router = express.Router()

router.use('/notes', notes)
router.use('/folders', folders)


export default router