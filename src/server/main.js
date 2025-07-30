import express from "express";
import ViteExpress from "vite-express";
import dbConnect from "./database.js";

const app = express();
const s3 = new dbConnect().s3Connection


app.get('/readAllFiles', async (req, res) => {
  console.log('ha')
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
 