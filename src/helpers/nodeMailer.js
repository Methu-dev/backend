const nodemailer = require("nodemailer");
const { customError } = require("./customErorr");
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: process.env.NODE_ENV == "development" ? false : true,
  auth: {
    user: process.env.HOST_MAIL,
    pass: process.env.APP_PASSWORD,
  },
});

exports.mailer = async (subject = "confirm registation",template, email) => {
  try {
    const info = await transporter.sendMail({
      from: "clicon",
      to: email,
      subject: subject,
      html: template,
    });
    console.log("Message sent:", info.messageId)
  } catch (error) {
    console.log("from nodmailer not sed", error);

    throw new customError(501, "Mail Not send" + error);
  }
};