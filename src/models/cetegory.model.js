const slugify = require("slugify");
const mongoose = require("mongoose");
const { customError } = require("../helpers/customErorr");
const { Schema, Types } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// make a slug using slugify
categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = this.slug(this.name, {
      replacement: "-",
      lower: false,
      strict: false,
      locale: "vi",
      trim: true,
    });
  }
  next();
});

//check category slug already exist or not
categorySchema.pre("save", async function(next){
    const isExist = await this.constructor.findOne({
      slug: this.slug,
    });
    if(isExist && !isExist._id.equals(this._id)){
        throw new customError(401, `${this.name} already exist try another one`)
    }
})


module.exports =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
