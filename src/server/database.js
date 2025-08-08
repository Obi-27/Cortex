import * as AWS from "@aws-sdk/client-s3"
import 'dotenv/config'


export const s3 = new AWS.S3({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
})