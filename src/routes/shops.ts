import {
  createShop,
  getShopAttendants,
  getShopByid,
  getShops,
} from "@/controller/shops";
import express from "express";

const shopRouter = express.Router();

shopRouter.post("/shops", createShop);
shopRouter.get("/shops", getShops);
shopRouter.get("/shop/:id", getShopByid);
shopRouter.get("/shop-attendant/:id", getShopAttendants);

export default shopRouter;
