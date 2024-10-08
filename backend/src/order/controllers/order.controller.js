// Please don't change the pre-written code
// Import the necessary modules here

import { createNewOrderRepo } from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => {
  // Write your code here for placing a new order
  try {
    const id = req.user._id;
    const order = {
      user: id,
      paidAt: new Date(Date.now()),
      ...req.body,
    };
    const newOrder = await createNewOrderRepo(order);
    // if (newOrder) {
    res.status(200).json({
      success: true,
      newOrder,
    });
    // }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(500, error));
  }
};
