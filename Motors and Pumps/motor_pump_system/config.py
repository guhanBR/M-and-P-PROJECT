import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{os.path.join(basedir, "instance", "motor_pump.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Currency settings (INR)
    CURRENCY_SYMBOL = '₹'
    CURRENCY_CODE = 'INR'
    USD_TO_INR_RATE = 83.0  # Example rate
    
    UPLOAD_FOLDER = os.path.join(basedir, 'static', 'images', 'products')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    
    # Flask-Login settings
    REMEMBER_COOKIE_DURATION = timedelta(days=7)
    
    # Mail settings
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or 'noreply@motorspumps.com'
    
    # Stripe settings (test mode)
    STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY') or 'pk_test_your_stripe_public_key'
    STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY') or 'sk_test_your_stripe_secret_key'
    
    # Application settings
    ITEMS_PER_PAGE = 12
    LOW_STOCK_THRESHOLD = 5
    
    # Email template path
    EMAIL_TEMPLATE_FOLDER = 'templates/email'
