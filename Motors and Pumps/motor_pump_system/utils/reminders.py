from datetime import datetime, date, timedelta
from models import db, CustomerProduct, ServiceReminder, User
from utils.email import send_service_reminder_email


def send_service_reminders(app):
    """
    Daily job to check for upcoming services and send reminders.
    This function is called by APScheduler at 8:00 AM daily.
    """
    with app.app_context():
        today = date.today()
        reminder_window = today + timedelta(days=7)
        
        customer_products = CustomerProduct.query.filter(
            CustomerProduct.status == 'active',
            CustomerProduct.next_service_date >= today,
            CustomerProduct.next_service_date <= reminder_window
        ).all()
        
        reminders_sent = 0
        
        for cp in customer_products:
            existing_reminder = ServiceReminder.query.filter(
                ServiceReminder.customer_product_id == cp.id,
                ServiceReminder.due_date == cp.next_service_date,
                ServiceReminder.sent_at.isnot(None)
            ).first()
            
            if existing_reminder:
                continue
            
            reminder = ServiceReminder(
                customer_product_id=cp.id,
                due_date=cp.next_service_date,
                tasks='\n'.join(cp.spare_part.service_tasks) if cp.spare_part.service_tasks else '',
                status='pending'
            )
            db.session.add(reminder)
            
            user = User.query.get(cp.user_id)
            
            if user and user.email:
                try:
                    success = send_service_reminder_email(user, cp, reminder)
                    if success:
                        reminder.sent_at = datetime.utcnow()
                        reminder.status = 'sent'
                        reminders_sent += 1
                except Exception as e:
                    app.logger.error(f"Failed to send reminder for customer product {cp.id}: {str(e)}")
            
            db.session.commit()
        
        app.logger.info(f"Service reminders sent: {reminders_sent}")
        return reminders_sent


def create_customer_products_from_order(order):
    """
    Create CustomerProduct records when an order is delivered.
    Only creates records for service-eligible products.
    """
    for item in order.items:
        spare_part = item.spare_part
        if spare_part.is_service_eligible and spare_part.service_interval_months:
            customer_product = CustomerProduct(
                user_id=order.user_id,
                order_id=order.id,
                spare_part_id=spare_part.id,
                purchase_date=date.today(),
                next_service_date=date.today() + timedelta(days=30 * spare_part.service_interval_months),
                status='active'
            )
            db.session.add(customer_product)
    
    db.session.commit()


def mark_service_completed(customer_product_id):
    """
    Mark a service as completed for a customer's product.
    Updates the last_service_date and calculates next_service_date.
    """
    from dateutil.relativedelta import relativedelta
    
    customer_product = CustomerProduct.query.get(customer_product_id)
    if not customer_product:
        return False
    
    customer_product.last_service_date = date.today()
    
    if customer_product.spare_part.service_interval_months:
        customer_product.next_service_date = date.today() + relativedelta(
            months=customer_product.spare_part.service_interval_months
        )
    
    reminder = ServiceReminder.query.filter(
        ServiceReminder.customer_product_id == customer_product_id,
        ServiceReminder.status.in_(['pending', 'sent'])
    ).first()
    
    if reminder:
        reminder.completed_at = datetime.utcnow()
        reminder.status = 'completed'
    
    db.session.commit()
    return True


def get_upcoming_reminders(days=30):
    """Get all reminders due within the specified number of days"""
    today = date.today()
    end_date = today + timedelta(days=days)
    
    return ServiceReminder.query.filter(
        ServiceReminder.due_date >= today,
        ServiceReminder.due_date <= end_date
    ).order_by(ServiceReminder.due_date).all()


def get_overdue_reminders():
    """Get all reminders that are past due"""
    today = date.today()
    
    return ServiceReminder.query.filter(
        ServiceReminder.due_date < today,
        ServiceReminder.status.in_(['pending', 'sent'])
    ).order_by(ServiceReminder.due_date).all()
