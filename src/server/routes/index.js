import express from "express";
import notes from "./notes.js"
import folders from "./folders.js"
import users from "./users.js"

const router = express.Router()

router.use('/notes', notes)
router.use('/folders', folders)
router.use('/users', users)


export default router