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


// Importing routers
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import reviewRouter from "./routes/review.routes.js";
import categoryRouter from "./routes/category.routes.js";
import chatRouter from "./routes/chat.routes.js";

// Application routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/chats", chatRouter);

export { app };
