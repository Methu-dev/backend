const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../helpers/customErorr");
const { Schema, Types } = mongoose;

const variantSchema = new Schema(
  {
    variantName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
    },
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
    },
    barCode: {
      type: String,
    },
    qrCode: {
      type: String,
    },
    size: [
      {
        type: String,
        trim: true,
      },
    ],
    colorList: [
      {
        type: String,
        trim: true,
      },
    ],
    stockVariant: {
      type: Number,
      default: 0,
      min: 0,
    },
    warehouseLocation: {
      type: Types.ObjectId,
      ref: "Warehouse",
    },
    alertVariantStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchasePrice: {
      type: Number,
      min: 100,
      required: true,
    },
    retailPrice: {
      type: Number,
      required: true,
    },
    wholeSalePrice: {
      type: Number,
    },
    stockAlert: {
      type: Boolean,
      default: false,
    },
    instock: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: [{}],
  },
  { timestamps: true }
);

// slugify before save
variantSchema.pre("save", async function (next) {
  if (this.isModified("variantName")) {
    this.slug = slugify(this.variantName, {
      replacement: "-",
      lower: false,
      strict: false,
      locale: "vi",
      trim: true,
    });
  }
  next();
});

// check slug uniqueness
variantSchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({
    slug: this.slug,
  });
  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(
      401,
      `${this.variantName} already exists. Try another one.`
    );
  }
  next();
});

module.exports =
  mongoose.models.Variant || mongoose.model("Variant", variantSchema);
