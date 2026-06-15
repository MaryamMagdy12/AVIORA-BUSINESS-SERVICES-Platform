<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Reminder</title>
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
        .reminder-badge {
            display: inline-block;
            padding: 8px 15px;
            background-color: #ff9800;
            color: white;
            border-radius: 20px;
            font-weight: bold;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Appointment Reminder</h1>
    </div>
    
    <div class="content">
        <div class="reminder-badge">⏰ Reminder: Your appointment is tomorrow!</div>
        
        <p>Dear {{ $userName }},</p>
        
        <p>This is a friendly reminder that you have an appointment scheduled with us <strong>tomorrow</strong>.</p>
        
        <div class="info-box">
            <h3 style="margin-top: 0;">Appointment Details</h3>
            
            {{-- <div class="info-row">
                <span class="label">Appointment ID:</span>
                <span class="value">#{{ $appointment->id }}</span>
            </div> --}}
            
            <div class="info-row">
                <span class="label">Date:</span>
                <span class="value"><strong>{{ \Carbon\Carbon::parse($appointment->appointmentSlot->date)->format('l, F j, Y') }}</strong></span>
            </div>
            
            <div class="info-row">
                <span class="label">Time:</span>
                <span class="value"><strong>{{ \Carbon\Carbon::parse($appointment->appointmentSlot->time)->format('g:i A') }}</strong></span>
            </div>
            
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="value">{{ ucfirst($appointment->status) }}</span>
            </div>
        </div>
        
        @if($appointment->services->count() > 0)
        <div class="info-box">
            <h3 style="margin-top: 0;">Services</h3>
            <ul class="services-list">
                @foreach($appointment->services as $service)
                <li>{{ $service->name }}</li>
                @endforeach
            </ul>
        </div>
        @endif
        
        <div class="info-box">
            <h3 style="margin-top: 0;">Please Remember</h3>
            <ul>
                <li>Arrive 10 minutes before your scheduled appointment time.</li>
                <li>Bring any necessary documents or identification if required.</li>
                <li>If you need to cancel or reschedule, please contact us as soon as possible.</li>
            </ul>
        </div>
        
        <p>We look forward to seeing you tomorrow!</p>
        
        <p>Best regards,<br>
        <strong>Aviora Team</strong></p>
    </div>
    
    <div class="footer">
        <p>This is an automated reminder email. Please do not reply to this message.</p>
        <p>&copy; {{ date('Y') }} Aviora Business Services. All rights reserved.</p>
    </div>
</body>
</html>

