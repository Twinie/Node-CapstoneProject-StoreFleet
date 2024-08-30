import OrderModel from "./order.schema.js";
import { ObjectId } from "mongodb";
import ProductModel from "../../product/model/product.schema.js";

export const createNewOrderRepo = async (data) => {
  // Write your code here for placing a new order
  // adding up the items amount
  const foundProductId = data.orderedItems.map((item) => {
    return item.product;
  });

  const foundProduct = await ProductModel.find({
    _id: foundProductId.map((id) => id),
  });
  console.log(foundProductId);
  if (foundProduct) {
    const itemsPrice = data.orderedItems.reduce(
      (acc, item) => acc + item.price,
      0
    );
    const taxPrice = Math.round((18 / 100) * itemsPrice);
    const shippingPrice = Math.round((1 / 100) * itemsPrice);
    const totalPrice = itemsPrice + taxPrice + shippingPrice;
    // console.log(finalTotalAmount);

    //create an order
    const newOrder = new OrderModel({
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      ...data,
    });
    // console.log(newOrder);
    await newOrder.save();
    // return newOrder;

    // Reduce the stock.
    foundProduct.forEach(async (product) => {
      product.stock -= 1;
      await product.save();
    });
    // foundProduct.save();
    return newOrder;
  } else {
    return "Product not found";
  }
};
