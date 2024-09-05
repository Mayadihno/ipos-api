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

require("dotenv").config();
const cors = require("cors");
const app = express();

app.use(cors());

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
