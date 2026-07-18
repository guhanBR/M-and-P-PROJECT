import os
from flask import render_template, current_app
from flask_mail import Mail, Message

mail = Mail()


def init_mail(app):
    """Initialize Flask-Mail with app config"""
    mail.init_app(app)


def send_email(to, subject, template, **kwargs):
    """Send an email using a template"""
    try:
        msg = Message(
            subject,
            recipients=[to],
            html=render_template(template, **kwargs),
            sender=current_app.config.get('MAIL_DEFAULT_SENDER')
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email to {to}: {str(e)}")
        return False


def send_service_reminder_email(user, customer_product, reminder):
    """Send service reminder email to customer"""
    from datetime import datetime
    
    tasks = []
    if reminder.tasks:
        tasks = reminder.tasks.split('\n')
    
    days_until = (customer_product.next_service_date - datetime.now().date()).days
    
    return send_email(
        to=user.email,
        subject=f"Service Reminder: {customer_product.spare_part.name}",
        template='email/service_reminder.html',
        user=user,
        customer_product=customer_product,
        reminder=reminder,
        tasks=tasks,
        days_until=days_until
    )
