import * as AWS from "@aws-sdk/client-s3"
import { MongoClient, ServerApiVersion } from "mongodb"
import 'dotenv/config'


export const s3 = new AWS.S3({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY
    }
})

export class mongoConnection {
    constructor() {
        const mongoUri = "mongodb+srv://obibrown24:<db_password>@main.dhye8.mongodb.net/?retryWrites=true&w=majority&appName=Main"
        this.client = new MongoClient(mongoUri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        })
    }

    async connectClient() {
        try{
            await this.client.connect()
            await this.client.db()
        } catch {

        }
    }
}


