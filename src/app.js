import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// app.use(cors())
// Cors Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
// CORS_ORIGIN is used to detect from where the request is coming from url like your deploy env like vercel, digital ocean or more

// app.use() is used when using middleware or doing configurations
app.use(express.json({limit: '16kb'})) // Limit setting for json data receiving in API request
app.use(express.urlencoded({extended: true, limit: '16kb'})) // Query params setting to understand encoded variables coming from API params
app.use(express.static("public")) // For storing files like pdf,jpg,favicon in public folder
app.use(cookieParser()) // To access and set (user browser cookies) from our server for CRUD operations, also used for secure cookies

// Importing Routes
import userRoutes from './routes/user.routes.js'


// Declaration of Routes 
const apiVersion = "/api/v1"
app.use(`${apiVersion}/users`, userRoutes) // /users will be prefix

export { app };
