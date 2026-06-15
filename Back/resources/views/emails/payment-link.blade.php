<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #2196F3;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-top: none;
        }
        .info-box {
            background-color: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 5px;
            border-left: 4px solid #2196F3;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #666;
        }
        .value {
            color: #333;
        }
        .services-list {
            list-style: none;
            padding: 0;
        }
        .services-list li {
            padding: 10px;
            background-color: #f0f0f0;
            margin: 5px 0;
            border-radius: 3px;
            border-left: 3px solid #2196F3;
        }
        .amount-box {
            background-color: #e3f2fd;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            text-align: center;
        }
        .amount-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        .amount-value {
            font-size: 32px;
            font-weight: bold;
            color: #2196F3;
        }
        .payment-button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
            text-align: center;
        }
        .payment-button:hover {
            background-color: #45a049;
        }
        .payment-link {
            word-break: break-all;
            color: #2196F3;
            text-decoration: none;
            font-size: 12px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }
        .transaction-id {
            font-family: monospace;
            background-color: #f5f5f5;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Payment Request</h1>
    </div>
    
    <div class="content">
        <p>Dear {{ $userName }},</p>
        
        <p>Your appointment has been evaluated and we're ready to proceed. Please complete your payment to confirm your appointment.</p>
        
        @if($payment->appointment && $payment->appointment->appointmentSlot)
        <div class="info-box">
            <h3 style="margin-top: 0;">Appointment Details</h3>
            
            <div class="info-row">
                <span class="label">Date:</span>
                <span class="value">{{ \Carbon\Carbon::parse($payment->appointment->appointmentSlot->date)->format('l, F j, Y') }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Time:</span>
                <span class="value">{{ \Carbon\Carbon::parse($payment->appointment->appointmentSlot->time)->format('g:i A') }}</span>
            </div>
        </div>
        @endif
        
        @if($payment->appointment && $payment->appointment->services->count() > 0)
        <div class="info-box">
            <h3 style="margin-top: 0;">Services Included</h3>
            <ul class="services-list">
                @foreach($payment->appointment->services as $service)
                <li><strong>{{ $service->name }}</strong>
                    @if($service->description)
                    <br><small style="color: #666;">{{ $service->description }}</small>
                    @endif
                </li>
                @endforeach
            </ul>
        </div>
        @endif
        
        <div class="amount-box">
            <div class="amount-label">Total Amount</div>
            <div class="amount-value">${{ number_format($payment->amount, 2) }}</div>
        </div>
        
        <div style="text-align: center;">
            <a href="{{ $payment->payment_link }}" class="payment-button">Complete Payment</a>
        </div>
        
        <div class="info-box">
            <p style="margin-top: 0; font-size: 14px; color: #666;">
                <strong>Transaction ID:</strong> 
                <span class="transaction-id">{{ $payment->transaction_id }}</span>
            </p>
            <p style="margin-top: 10px; font-size: 12px; color: #666;">
                Or copy and paste this link in your browser:<br>
                <a href="{{ $payment->payment_link }}" class="payment-link">{{ $payment->payment_link }}</a>
            </p>
        </div>
        
        <div class="info-box" style="background-color: #fff3cd; border-left-color: #ffc107;">
            <p style="margin: 0; font-size: 14px;">
                <strong>Important:</strong> Please complete your payment to confirm your appointment. If you have any questions, please contact us.
            </p>
        </div>
        
        <p>Thank you for choosing our services!</p>
        
        <p>Best regards,<br>
        <strong>Aviora Team</strong></p>
    </div>
    
    <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; {{ date('Y') }} Aviora Business Services. All rights reserved.</p>
    </div>
</body>
</html>

