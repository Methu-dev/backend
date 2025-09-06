const QRCode = require("qrcode");
const { customError } = require("./customErorr");
exports.genetateQrCode = async (text)=>{
    try {
        if(!text) throw new customError(401, "text is required qr code");
        const qrCodeDataUrl = await QRCode.toDataURL(text, {
          errorCorrectionLevel: "H",
          type: "image/jpeg",
          quality: 0.3,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        return qrCodeDataUrl
    } catch (error) {
        throw new customError(500, "failed to generate qr code"+error.message);
    }
}

// barcode generate
const bwipjs = require("bwip-js");
exports.barCodeGenerate = async(text = "hello")=>{
    try {
        if (!text) throw new customError(401, "text is required bar code");
        let svg = bwipjs.toSVG({
          bcid: "code128", // Barcode type
          text: text, // Text to encode
          height: 12, // Bar height, in millimeters
          includetext: true, // Show human-readable text
          textxalign: "center", // Always good to set this
          textcolor: "ff0000", // Red text
        });
        return svg
    } catch (error) {
        throw new customError(
          500,
          "failed to generate bar code" + error.message
        );
    }
}