import express from'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {config} from 'dotenv'
import morgan from 'morgan'
import userRoutes from "./routes/user.routes.js"
config()

const app = express()

app.use(express.json())  // It parses incoming requests with JSON payloads and is based on body-parser.

app.use(cors({       //allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources
    origin: [process.env.FRONTEND_URL],
    credentials : true
}))

app.use(cookieParser()) //  parses cookies attached to the client request object.

app.use(morgan('dev'))  // logger middleware for Node js , Using Morgan, you can easily log requests made to your Node. js server
app.use('/ping' , function(req,res){
    res.send('/Pong')
})

//************************* routes of 3 module ******************************************//

app.use('api/v1/user', userRoutes)

app.all('*', (req,res) => {
    res.status(404).send('OPPS!! 404 page not found')
})

export default app;