import { rateLimit } from "express-rate-limit";
import express from "express";
import customerRouter from "./routes/customer";
import userRouter from "./routes/users";
import shopRouter from "./routes/shops";
import supplierRouter from "./routes/supplier";
import loginRouter from "./routes/login";
import productRouter from "./routes/products";
import brandRouter from "./routes/brands";
import unitRouter from "./routes/units";
import categoryRouter from "./routes/category";
import salesRouter from "./routes/sales";
import payeeRouter from "./routes/payee";
import expenseRouter from "./routes/expense";
import expenseCategoriesRouter from "./routes/expenseCategories";
import { ErrorMessage } from "./utils/ErrorMessage";

require("dotenv").config();
const cors = require("cors");
const app = express();

app.use(cors());

// Configure general rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return ErrorMessage(res, 429, "Too many requests, please try again later");
  },
});

// Apply general rate limiter to all requests
app.use(generalLimiter);

// Configure stricter rate limiter for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ErrorMessage(res, 429, "Too many requests, please try again later");
  },
});

// Apply stricter rate limit to sensitive routes
app.use("/api/v1/sales", strictLimiter);
app.use("/api/v1/user", strictLimiter);
app.use("/api/v1/auth", strictLimiter);
app.use("/api/v1/expense", strictLimiter);

const PORT = process.env.PORT || 8000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use("/api/v1", customerRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", shopRouter);
app.use("/api/v1", supplierRouter);
app.use("/api/v1", loginRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", brandRouter);
app.use("/api/v1", unitRouter);
app.use("/api/v1", categoryRouter);
app.use("/api/v1", salesRouter);
app.use("/api/v1", payeeRouter);
app.use("/api/v1", expenseRouter);
app.use("/api/v1", expenseCategoriesRouter);
