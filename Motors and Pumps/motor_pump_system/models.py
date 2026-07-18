from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime, date
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200))
    role = db.Column(db.String(20), default='customer')
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    orders = db.relationship('Order', backref='user', lazy=True)
    customer_products = db.relationship('CustomerProduct', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        return self.role == 'admin'


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    description = db.Column(db.Text)
    
    parent = db.relationship('Category', remote_side=[id], backref='subcategories')
    spare_parts = db.relationship('SparePart', backref='category', lazy=True)
    
    def __repr__(self):
        return f'<Category {self.name}>'


class SparePart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    part_number = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer, default=0)
    reorder_level = db.Column(db.Integer, default=5)
    image_url = db.Column(db.String(200))
    images = db.Column(db.JSON, nullable=True)
    is_service_eligible = db.Column(db.Boolean, default=False)
    service_interval_months = db.Column(db.Integer, nullable=True)
    service_tasks = db.Column(db.JSON, nullable=True)
    is_on_sale = db.Column(db.Boolean, default=False)
    sale_price = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    order_items = db.relationship('OrderItem', backref='spare_part', lazy=True)
    customer_products = db.relationship('CustomerProduct', backref='spare_part', lazy=True)
    
    def is_low_stock(self):
        return self.stock_quantity <= self.reorder_level
    
    @property
    def discount_percentage(self):
        if self.is_on_sale and self.sale_price:
            return int(((self.price - self.sale_price) / self.price) * 100)
        return 0
    
    def __repr__(self):
        return f'<SparePart {self.part_number}>'


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')
    total_amount = db.Column(db.Float)
    shipping_address = db.Column(db.Text)
    payment_method = db.Column(db.String(50))
    payment_status = db.Column(db.String(20), default='unpaid')
    tracking_number = db.Column(db.String(100), nullable=True)
    
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    customer_products = db.relationship('CustomerProduct', backref='order', lazy=True)
    
    STATUS_CHOICES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    
    def __repr__(self):
        return f'<Order {self.id}>'
    
    @property
    def status_display(self):
        status_map = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'processing': 'Processing',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        }
        return status_map.get(self.status, self.status)


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'))
    spare_part_id = db.Column(db.Integer, db.ForeignKey('spare_part.id'))
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    
    @property
    def subtotal(self):
        return self.quantity * self.unit_price


class CustomerProduct(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    spare_part_id = db.Column(db.Integer, db.ForeignKey('spare_part.id'), nullable=False)
    serial_number = db.Column(db.String(100), nullable=True)
    purchase_date = db.Column(db.Date, nullable=False)
    last_service_date = db.Column(db.Date, nullable=True)
    next_service_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='active')
    
    reminders = db.relationship('ServiceReminder', backref='customer_product', lazy=True)
    
    def __repr__(self):
        return f'<CustomerProduct {self.id}>'
    
    @property
    def is_service_due(self):
        return self.next_service_date <= date.today()
    
    @property
    def days_until_service(self):
        delta = self.next_service_date - date.today()
        return delta.days


class ServiceReminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_product_id = db.Column(db.Integer, db.ForeignKey('customer_product.id'), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    tasks = db.Column(db.Text)
    sent_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='pending')
    
    def __repr__(self):
        return f'<ServiceReminder {self.id}>'


class StockMovement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    spare_part_id = db.Column(db.Integer, db.ForeignKey('spare_part.id'))
    quantity_change = db.Column(db.Integer)
    reason = db.Column(db.String(100))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    spare_part = db.relationship('SparePart', backref='stock_movements')
    admin = db.relationship('User', backref='stock_movements')
    
    def __repr__(self):
        return f'<StockMovement {self.id}>'
