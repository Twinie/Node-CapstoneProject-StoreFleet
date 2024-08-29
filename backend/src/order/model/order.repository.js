import OrderModel from "./order.schema.js";

export const createNewOrderRepo = async (data) => {
  // Write your code here for placing a new order

  const newOrder = new OrderModel(data);
  await newOrder.save();
  console.log();
  return newOrder;
};

export const findUserRepo = async (id) => {
  const foundOrder = await OrderModel.find({ user: id });
  if (foundOrder) {
  }
};

export const findProductRepo = async (id) => {
  const foundOrder = await OrderModel.find({ user: id });
  if (foundOrder) {
  }
};
