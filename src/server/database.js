import * as AWS from "@aws-sdk/client-s3"
import 'dotenv/config'

export default class dbConnect {
    constructor() {
        this.s3Connection = new AWS.S3({
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.ACCESS_KEY,
                secretAccessKey: process.env.SECRET_KEY
            }
        })
    }
}
