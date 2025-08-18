import express from "express"
import ViteExpress from "vite-express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import cookieParser from "cookie-parser"

import { authenticateToken } from "./routes/users.js"
import { s3 } from "./database.js"
import routes from "./routes/index.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express();

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../../dist')))
app.use('/', routes)

app.get('/readAllFiles', authenticateToken, async (req, res) => {
  try {
      const result = await s3.listObjectsV2({
          Bucket: 'notesbucket27'
      })

      res.status(200).json(result.Contents)
  } catch (e) {
      console.error(e)
  }
})


app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/dashboard.html'))
})

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
