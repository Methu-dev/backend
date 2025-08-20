exports.emailVerificationTemplate = (name, otp, expireTime, flink) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>OTP Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fa; font-family: Arial, sans-serif;">

  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <tr>
      <td align="center" style="background-color:#4CAF50; padding:20px;">
        <h1 style="color:#ffffff; margin:0; font-size:24px;">OTP Verification</h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:30px; text-align:center;">
        <p style="font-size:16px; color:#333333; margin-bottom:15px;">
          Hi <strong>${name}</strong>,
        </p>
        <p style="font-size:16px; color:#333333; margin-bottom:20px;">
          Use the OTP code below to verify your account. This code will expire in 
          <strong style="color:#4CAF50;">${expireTime}</strong> minutes.
        </p>

        <!-- OTP Code -->
        <div style="display:inline-block; background-color:#f0f0f0; padding:15px 25px; border-radius:6px; font-size:26px; font-weight:bold; letter-spacing:4px; color:#4CAF50; margin-bottom:25px;">
          ${otp}
        </div>

        <!-- Security Note -->
        <p style="font-size:14px; color:#777777; margin-bottom:30px;">
          Please do not share this code with anyone for security reasons.
        </p>

        <!-- Button -->
        <a href="${flink}" style="background-color:#4CAF50; color:#ffffff; text-decoration:none; padding:12px 30px; border-radius:4px; font-size:16px; font-weight:bold; display:inline-block;">
          Verify Now
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color:#f5f7fa; text-align:center; padding:15px; font-size:12px; color:#999999;">
        If you did not request this code, you can safely ignore this email.<br/>
        &copy; Clicon
      </td>
    </tr>
  </table>

</body>
</html>
`;
};

//resend Otp
exports.ResendOtpTemplate = (name, otp, expireTime, flink) => {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Resend OTP</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fa; font-family: Arial, sans-serif;">

  <table align="center" cellpadding="0" cellspacing="0" width="100%" 
    style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; 
    box-shadow:0 4px 12px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <tr>
      <td align="center" style="background-color:#2196F3; padding:20px;">
        <h1 style="color:#ffffff; margin:0; font-size:22px;">🔄 Resend OTP Verification</h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:30px; text-align:center;">
        <p style="font-size:16px; color:#333333; margin-bottom:15px;">
          Hello <strong>${name}</strong>,
        </p>
        <p style="font-size:15px; color:#444444; margin-bottom:20px;">
          You requested to resend your OTP. Please use the OTP below to verify your account.<br/>
          This OTP will expire in <strong style="color:#2196F3;">${expireTime} minutes</strong>.
        </p>

        <!-- OTP Code -->
        <div style="display:inline-block; background-color:#f0f0f0; padding:15px 25px; border-radius:6px; 
        font-size:26px; font-weight:bold; letter-spacing:4px; color:#2196F3; margin-bottom:25px;">
          ${otp}
        </div>

        <!-- Security Note -->
        <p style="font-size:14px; color:#777777; margin-bottom:25px;">
          ⚠️ For your security, never share this OTP with anyone.
        </p>

        <!-- Verify Button -->
        <a href="${flink}" 
          style="background-color:#2196F3; color:#ffffff; text-decoration:none; padding:12px 30px; 
          border-radius:6px; font-size:16px; font-weight:bold; display:inline-block;">
          Verify Now
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color:#f5f7fa; text-align:center; padding:15px; font-size:12px; color:#999999;">
        If you did not request this OTP, please ignore this email.<br/>
        &copy; ${new Date().getFullYear()} Clicon. All rights reserved.
      </td>
    </tr>
  </table>

</body>
</html>
`;
};


// forgot password
exports.ForgotPasswordTemplate = (name, flink) => {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Forgot Password</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fa; font-family: Arial, sans-serif;">

  <table align="center" cellpadding="0" cellspacing="0" width="100%" 
    style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; 
    box-shadow:0 4px 12px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <tr>
      <td align="center" style="background-color:#FF5722; padding:20px;">
        <h1 style="color:#ffffff; margin:0; font-size:22px;">🔑 Password Reset Request</h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:30px; text-align:center;">
        <p style="font-size:16px; color:#333333; margin-bottom:15px;">
          Hi <strong>${name}</strong>,
        </p>
        <p style="font-size:15px; color:#444444; margin-bottom:20px;">
          We received a request to reset your password. If you made this request, please click the button below to set a new password.
        </p>

        <!-- Reset Button -->
        <a href="${flink}" 
          style="background-color:#FF5722; color:#ffffff; text-decoration:none; padding:12px 30px; 
          border-radius:6px; font-size:16px; font-weight:bold; display:inline-block; margin-bottom:25px;">
          Reset Password
        </a>

        <!-- Security Note -->
        <p style="font-size:14px; color:#777777; margin-bottom:10px;">
          If you did not request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color:#f5f7fa; text-align:center; padding:15px; font-size:12px; color:#999999;">
        &copy; ${new Date().getFullYear()} Clicon. All rights reserved.
      </td>
    </tr>
  </table>

</body>
</html>
`;
};

