import express from "express";
import ViteExpress from "vite-express";
import cors from "cors"

import s3 from "./database.js";
import routes from "./routes/index.js"


const app = express();

app.use(cors())
app.use(express.json())
app.use('/', routes)

app.get('/readAllFiles', async (req, res) => {
  try {
      const result = await s3.listObjectsV2({
          Bucket: 'notesbucket27'
      })

      res.status(200).json(result.Contents)
  } catch (e) {
      console.error(e)
  }
})

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
 