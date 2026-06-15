<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Re: Your Contact Message</title>
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
        .original-message {
            background-color: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            border-left: 4px solid #ddd;
        }
        .reply-message {
            background-color: #e3f2fd;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            border-left: 4px solid #2196F3;
        }
        .message-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reply to Your Message</h1>
    </div>
    
    <div class="content">
        <p>Dear {{ $contactMessage->name }},</p>
        
        <p>Thank you for contacting us. We have received your message and here is our response:</p>
        
        @if($contactMessage->subject)
        <div class="original-message">
            <div class="message-label">Your Original Message ({{ $contactMessage->subject }}):</div>
            <p style="margin: 0; white-space: pre-wrap;">{{ $contactMessage->message }}</p>
        </div>
        @endif
        
        <div class="reply-message">
            <div class="message-label">Our Reply:</div>
            <p style="margin: 0; white-space: pre-wrap;">{{ $replyMessage }}</p>
        </div>
        
        <p>If you have any further questions or concerns, please feel free to contact us again.</p>
        
        <p>Best regards,<br>
        <strong>Aviora Team</strong></p>
    </div>
    
    <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; {{ date('Y') }} Aviora Business Services. All rights reserved.</p>
    </div>
</body>
</html>

