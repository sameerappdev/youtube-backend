import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config();


connectDB()
console.log('process.DATABASE_URL',process.env.DATABASE_URL)

// require('dotenv').config({path: './env'})
// import mongoose from "mongoose";
// import express from "express";
// import { DB_NAME } from "./constants.js";
// const app = express()
// 1. Approach for connect DB by creating IFFI fn with syntax ;()()
// ;(
//   async () => {
//     try {
//       await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);
//       app.on("error", (error) => {
//         console.log("ERROR:", error);
//         throw error;
//       });
//       app.listen(process.env.PORT, () => {
//         console.log(`App is listening on localhost:${process.env.PORT}`);
//       });
//     } catch (error) {
//       console.log("error", error);
//       throw error;
//     }
//   }
// )();
