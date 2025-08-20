const axios = require("axios");
const { customError } = require("./customErorr");
exports.sendSms = async (number, messages) => {
  try {
  const respons = await axios.post(process.env.BULKSMS, {
      api_key: process.env.API_KEY,
      senderid: process.env.SENDER_ID,
      number: Array.isArray(number) ? number.join(",") : number,
      messages: messages,
    });
   return respons.data
  } catch (error) {
    console.log(error);
    throw new customError(501, "erorr occurend send sms", error);
  }
};