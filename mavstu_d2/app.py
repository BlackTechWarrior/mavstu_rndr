import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import random
import smtplib
from email.mime.text import MIMEText

load_dotenv()

app = Flask(__name__)
CORS(app)

otps = {}
users = {}

def send_email(to_email, subject, body):
    smtp_server = os.getenv('SMTP_SERVER')
    smtp_port = int(os.getenv('SMTP_PORT'))
    smtp_username = os.getenv('SMTP_USERNAME')
    smtp_password = os.getenv('SMTP_PASSWORD')

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = smtp_username
    msg['To'] = to_email

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    email = request.json.get('email')
    if not email.endswith('@mavs.uta.edu'):
        return jsonify({'success': False, 'message': 'Invalid email domain'}), 400

    otp = str(random.randint(100000, 999999))
    otps[email] = otp
    
    try:
        send_email(email, "Your OTP for MavSTU", f"Your OTP is: {otp}")
        return jsonify({'success': True, 'message': 'OTP sent'})
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'success': False, 'message': 'Error sending OTP'}), 500
    
@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    email = request.json.get('email')
    otp = request.json.get('otp')

    if email in otps and otps[email] == otp:
        del otps[email]
        users[email] = {'name': None}  # Initialize user with no name yet
        return jsonify({'success': True, 'message': 'OTP verified'})
    else:
        return jsonify({'success': False, 'message': 'Invalid OTP'}), 400

@app.route('/api/update-user', methods=['POST'])
def update_user():
    email = request.json.get('email')
    name = request.json.get('name')

    if email in users:
        users[email]['name'] = name
        try:
            send_email(email, "MavSTU Signup Successful", 
                       f"Hey {name},\n\nYour OTP has been verified and your signup is successful. Welcome to MavSTU!")
            return jsonify({'success': True, 'message': 'User updated and confirmation email sent'})
        except Exception as e:
            print(f"Error sending confirmation email: {e}")
            return jsonify({'success': True, 'message': 'User updated, but error sending confirmation email'}), 500
    else:
        return jsonify({'success': False, 'message': 'User not found'}), 400

if __name__ == '__main__':
    app.run(debug=True)
    