<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - Aviora Business Services</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        .otp-box {
            background-color: #f8f9fa;
            border: 2px dashed #dc3545;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #dc3545;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .message {
            margin: 20px 0;
            color: #666;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
            text-align: center;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .security-note {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Aviora</div>
            <h2>Password Reset Request</h2>
        </div>

        <p>Hello <strong>{{ $userName }}</strong>,</p>

        <p class="message">
            We received a request to reset your password for your Aviora Business Services account. 
            Please use the following One-Time Password (OTP) to reset your password:
        </p>

        <div class="otp-box">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your Password Reset Code:</p>
            <div class="otp-code">{{ $otp }}</div>
        </div>

        <div class="warning">
            <strong>⚠️ Important:</strong> This code will expire in <strong>10 minutes</strong>. 
            Please enter it in the password reset form to create a new password.
        </div>

        <div class="security-note">
            <strong>🔒 Security Notice:</strong> If you did not request a password reset, 
            please ignore this email. Your password will remain unchanged.
        </div>

        <p class="message">
            For security reasons, never share this code with anyone. Aviora Business Services staff will never ask for your OTP.
        </p>

        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} Aviora Business Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

