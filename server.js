import express from "express"
import dotenv from "dotenv"
import { connectdb } from "./connection/connectiondb.js";
import cookieParser from "cookie-parser";
import authroutes from "./routes/auth.routes.js"
import cors from "cors"

const app = express()
dotenv.config();

// Middleware setup
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// CORS configuration - allows all origins
app.use(cors({
  origin: "*", // or use '*' to allow all origins
  credentials: true, // important for cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Routes
app.use("/api/authroutes", authroutes);

// Start server
app.listen(process.env.port, () => {
  connectdb();
  console.log("Server is running on port", process.env.port);
});