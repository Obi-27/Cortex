import * as AWS from "@aws-sdk/client-s3"
import 'dotenv/config'


const s3Connection = new AWS.S3({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY
    }
})


export default s3Connection
