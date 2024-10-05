import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// json fomrate me data aayega esiliye
app.use(express.json({ limit: "16kb" }));

// url se data aayega esiliye
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// files wagreh ke liye
app.use(express.static("public"));

// basically cookie pe curd operation perform kar payenge
app.use(cookieParser());

export { app };
