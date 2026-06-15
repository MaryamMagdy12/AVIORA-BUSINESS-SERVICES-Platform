<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meeting Link - Your Appointment</title>
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
            background-color: #007bff;
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
            border-left: 4px solid #007bff;
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
        .meeting-link-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
        }
        .meeting-link-box h3 {
            color: white;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .meeting-link {
            display: inline-block;
            background-color: white;
            color: #667eea;
            padding: 15px 30px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
            margin: 10px 0;
            word-break: break-all;
        }
        .meeting-link:hover {
            background-color: #f0f0f0;
        }
        .services-list {
            list-style: none;
            padding: 0;
        }
        .services-list li {
            padding: 8px;
            background-color: #f0f0f0;
            margin: 5px 0;
            border-radius: 3px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 12px;
        }
        .status-pending {
            background-color: #ffc107;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Meeting Link - Your Appointment</h1>
    </div>
    
    <div class="content">
        <p>Dear {{ $userName }},</p>
        
        <p>We're excited to meet with you! Please find the meeting link and appointment details below.</p>
        
        <div class="meeting-link-box">
            <h3>📹 Join Meeting</h3>
            <a href="{{ $meetingLink }}" class="meeting-link" target="_blank">{{ $meetingLink }}</a>
            <p style="color: white; margin: 15px 0 0 0; font-size: 14px;">Click the link above to join your meeting at the scheduled time.</p>
        </div>
        
        <div class="info-box">
            <h3 style="margin-top: 0;">Appointment Details</h3>
            
            <div class="info-row">
                <span class="label">Date:</span>
                <span class="value">{{ \Carbon\Carbon::parse($appointment->appointmentSlot->date)->format('l, F j, Y') }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Time:</span>
                <span class="value">{{ \Carbon\Carbon::parse($appointment->appointmentSlot->time)->format('g:i A') }}</span>
            </div>
            
            @if($appointment->services->count() > 0)
            <div class="info-row">
                <span class="label">Services:</span>
                <span class="value">{{ $appointment->services->pluck('name')->join(', ') }}</span>
            </div>
            @endif
        </div>
        
        <div class="info-box">
            <h3 style="margin-top: 0;">Important Notes</h3>
            <ul>
                <li>Please join the meeting a few minutes before the scheduled time.</li>
                <li>Make sure you have a stable internet connection.</li>
                <li>Test your microphone and camera before joining.</li>
                <li>If you encounter any issues, please contact us immediately.</li>
            </ul>
        </div>
        
        <p>We look forward to speaking with you!</p>
        
        <p>Best regards,<br>
        <strong>Aviora Team</strong></p>
    </div>
    
    <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; {{ date('Y') }} Aviora Business Services. All rights reserved.</p>
    </div>
</body>
</html>

