import Order from "../models/Orders.js";

export const createOrder = async (req, res) => {

  try {

    const {
      customerName,
      phone,
      address,
      city,
      items,
      totalPrice
    } = req.body;

    const newOrder = new Order({
      customerName,
      phone,
      address,
      city,
      items,
      totalPrice
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};