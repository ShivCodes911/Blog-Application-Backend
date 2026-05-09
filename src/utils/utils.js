export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000) .toString();
}


export function getOtpHtml(otp) {
  return `
    <div style="
      font-family: Arial, sans-serif;
      background: #f4f7ff;
      padding: 40px 20px;
      text-align: center;
    ">
      <div style="
        max-width: 400px;
        margin: auto;
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <h1 style="
          color: #4f46e5;
          margin-bottom: 10px;
        ">
          Verify Your Account
        </h1>

        <p style="
          color: #555;
          font-size: 15px;
          margin-bottom: 25px;
        ">
          Use the OTP below to complete your signup.
        </p>

        <div style="
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 6px;
          padding: 16px 24px;
          border-radius: 10px;
          display: inline-block;
          margin-bottom: 25px;
        ">
          ${otp}
        </div>

        <p style="
          color: #777;
          font-size: 13px;
        ">
          This OTP is valid for 10 minutes.
        </p>
      </div>
    </div>
  `;
}