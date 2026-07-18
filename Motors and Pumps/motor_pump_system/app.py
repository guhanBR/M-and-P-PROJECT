import os
import logging
from flask import Flask, render_template
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from config import Config
from models import db, User
from utils.email import init_mail

login_manager = LoginManager()
csrf = CSRFProtect()
scheduler = BackgroundScheduler()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    db.init_app(app)
    login_manager.init_app(app)
    csrf.init_app(app)
    init_mail(app)
    
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    from blueprints.auth import auth_bp
    from blueprints.customer import customer_bp
    from blueprints.admin import admin_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(admin_bp)
    
    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return render_template('errors/500.html'), 500
    
    @app.context_processor
    def cart_count():
        from flask import session
        cart = session.get('cart', [])
        return dict(cart_count=len(cart))
    
    return app


def start_scheduler(app):
    def send_reminders_job():
        with app.app_context():
            from utils.reminders import send_service_reminders
            try:
                count = send_service_reminders(app)
                logger.info(f"Service reminder job completed. Sent {count} reminders.")
            except Exception as e:
                logger.error(f"Service reminder job failed: {str(e)}")
    
    scheduler.add_job(
        send_reminders_job,
        trigger=CronTrigger(hour=8, minute=0),
        id='send_service_reminders',
        name='Send service reminders at 8 AM',
        replace_existing=True
    )
    
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started successfully")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")


app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    start_scheduler(app)
    
    try:
        app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
    finally:
        stop_scheduler()
