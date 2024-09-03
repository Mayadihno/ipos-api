import { db } from "@/db/db";
import { ErrorMessage } from "@/utils/ErrorMessage";
import { error } from "console";
import { Request, Response } from "express";

export async function createProduct(req: Request, res: Response) {
  const {
    name,
    description,
    expiryDate,
    batchNumber,
    barCode,
    image,
    alertQty,
    tax,
    stockQty,
    price,
    buyingPrice,
    sku,
    productCode,
    slug,
    supplierId,
    brandId,
    categoryId,
    unitId,
  } = req.body;

  try {
    const slugExist = await db.product.findUnique({
      where: {
        slug,
      },
    });
    if (slugExist) {
      return ErrorMessage(res, 409, `Product with ${slug} Already exist`);
    }
    const skuExist = await db.product.findUnique({
      where: {
        sku,
      },
    });
    if (skuExist) {
      return ErrorMessage(res, 409, `Product with ${sku} Already exist`);
    }

    if (barCode) {
      const barCodeExist = await db.product.findUnique({
        where: {
          barCode,
        },
      });
      if (barCodeExist) {
        return ErrorMessage(res, 409, `Product with ${barCode} Already exist`);
      }
    }

    const productCodeExist = await db.product.findUnique({
      where: {
        productCode,
      },
    });
    if (productCodeExist) {
      return ErrorMessage(
        res,
        409,
        `Product with ${productCode} Already exist`
      );
    }

    const newProduct = await db.product.create({
      data: {
        name,
        description,
        expiryDate,
        batchNumber,
        barCode,
        image,
        alertQty,
        tax,
        stockQty,
        price,
        buyingPrice,
        sku,
        productCode,
        slug,
        supplierId,
        brandId,
        categoryId,
        unitId,
      },
    });

    res.status(201).json({ data: newProduct, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getProducts(req: Request, res: Response) {
  try {
    const products = await db.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = products.length;
    res.status(200).json({ data: products, total, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function getProductById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const product = await db.product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      return ErrorMessage(res, 404, "Product not found");
    }
    res.status(200).json({ data: product, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function deleteProductById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const product = await db.product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      return ErrorMessage(res, 404, "Product not found");
    }
    await db.product.delete({
      where: { id },
    });
    res
      .status(200)
      .json({ data: "Product deleted successfully!!", error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal server error");
  }
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const {
    name,
    description,
    expiryDate,
    batchNumber,
    barCode,
    image,
    alertQty,
    tax,
    stockQty,
    price,
    buyingPrice,
    sku,
    productCode,
    slug,
    supplierId,
    brandId,
    categoryId,
    unitId,
  } = req.body;
  try {
    const product = await db.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return ErrorMessage(res, 404, "Product Not Found");
    }

    if (slug && slug !== product.slug) {
      const existSlug = await db.product.findUnique({
        where: {
          slug,
        },
      });
      if (existSlug) {
        return ErrorMessage(res, 409, `Product ${slug} with Already Exist `);
      }
    }
    if (sku && sku !== product.sku) {
      const existSku = await db.product.findUnique({
        where: {
          sku,
        },
      });
      if (existSku) {
        return ErrorMessage(res, 409, `Product ${sku} with Already Exist `);
      }
    }
    if (productCode && productCode !== product.productCode) {
      const existProductCode = await db.product.findUnique({
        where: {
          productCode,
        },
      });
      if (existProductCode) {
        return ErrorMessage(
          res,
          409,
          `Product ${productCode} with Already Exist `
        );
      }
    }
    if (barCode && barCode !== product.barCode) {
      const existBarCode = await db.product.findUnique({
        where: {
          barCode,
        },
      });
      if (existBarCode) {
        return ErrorMessage(res, 409, `Product ${barCode} with Already Exist `);
      }
    }

    const updatedProduct = await db.product.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        expiryDate,
        batchNumber,
        barCode,
        image,
        alertQty,
        tax,
        stockQty,
        price,
        buyingPrice,
        sku,
        productCode,
        slug,
        supplierId,
        brandId,
        categoryId,
        unitId,
      },
    });

    res.status(200).json({ data: updatedProduct, error: null });
  } catch (error) {
    return ErrorMessage(res, 500, "Internal server error");
  }
}
