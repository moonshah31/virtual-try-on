import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

  customerName: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  items: [
    {
      productId: {
        type: String
      },

      name: {
        type: String
      },

      productName: {
        type: String
      },

      category: {
        type: String
      },

      image: {
        type: String
      },

      price: {
        type: Number
      },

      quantity: {
        type: Number
      },

      baseSubtotal: {
        type: Number,
        default: 0
      },

      prescriptionFee: {
        type: Number,
        default: 0
      },

      prescriptionUploaded: {
        type: Boolean,
        default: false
      },

      prescriptionImagePath: {
        type: String
      },

      itemTotal: {
        type: Number,
        default: 0
      }
    }
  ],

  productSummary: {
    type: String
  },

  hasPrescriptionImages: {
    type: Boolean,
    default: false
  },

  totalPrice: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    default: "Cash on Delivery"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Order = mongoose.model("Order", orderSchema);

export default Order;
