import express from "express"
import dotenv from "dotenv"
import { connectdb } from "./connection/connectiondb.js";
import cookieParser from "cookie-parser";
import authroutes from "./routes/auth.routes.js"
import cors from "cors"


const app = express()
dotenv.config();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser()); 
app.use(cors({ origin: "http://localhost:8081", credentials: true }));
app.use("/api/authroutes",authroutes)

app.listen(  process.env.port,()  =>  {
    connectdb();
    console.log("server is runnig on port", process.env.port);
});


