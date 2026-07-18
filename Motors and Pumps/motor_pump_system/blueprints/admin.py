from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app
from flask_login import login_required, current_user
from functools import wraps
from models import db, SparePart, Category, Order, OrderItem, CustomerProduct, ServiceReminder, StockMovement, User
from forms import ProductForm, OrderStatusForm, StockForm
from datetime import datetime, timedelta
from sqlalchemy import func
from werkzeug.utils import secure_filename
import os
import json

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin():
            flash('Admin access required.', 'danger')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function


@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        if current_user.is_admin():
            return redirect(url_for('admin.dashboard'))
        return redirect(url_for('customer.index'))
    from forms import LoginForm
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            from flask_login import login_user
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            return redirect(url_for('admin.dashboard'))
        else:
            flash('Invalid email or password.', 'danger')
    return render_template('admin/login.html', form=form)


@admin_bp.route('/')
@login_required
@admin_required
def dashboard():
    total_orders = Order.query.count()
    total_products = SparePart.query.count()
    total_customers = User.query.filter_by(role='customer').count()
    total_revenue = db.session.query(func.sum(Order.total_amount)).filter(
        Order.payment_status == 'paid'
    ).scalar() or 0
    
    low_stock_products = SparePart.query.filter(
        SparePart.stock_quantity <= SparePart.reorder_level
    ).all()
    
    recent_orders = Order.query.order_by(Order.order_date.desc()).limit(10).all()
    
    pending_orders = Order.query.filter_by(status='pending').count()
    processing_orders = Order.query.filter_by(status='processing').count()
    shipped_orders = Order.query.filter_by(status='shipped').count()
    
    monthly_sales = db.session.query(
        func.strftime('%Y-%m', Order.order_date).label('month'),
        func.sum(Order.total_amount).label('total')
    ).filter(
        Order.payment_status == 'paid'
    ).group_by('month').order_by('month').limit(12).all()
    
    sales_data = {
        'labels': [s.month for s in monthly_sales],
        'values': [float(s.total or 0) for s in monthly_sales]
    }
    
    upcoming_services = ServiceReminder.query.filter(
        ServiceReminder.status.in_(['pending', 'sent']),
        ServiceReminder.due_date >= datetime.now().date()
    ).order_by(ServiceReminder.due_date).limit(5).all()
    
    return render_template('admin/dashboard.html',
                         total_orders=total_orders,
                         total_products=total_products,
                         total_customers=total_customers,
                         total_revenue=total_revenue,
                         low_stock_products=low_stock_products,
                         recent_orders=recent_orders,
                         pending_orders=pending_orders,
                         processing_orders=processing_orders,
                         shipped_orders=shipped_orders,
                         sales_data=json.dumps(sales_data),
                         upcoming_services=upcoming_services)


@admin_bp.route('/products')
@login_required
@admin_required
def products():
    products = SparePart.query.order_by(SparePart.created_at.desc()).all()
    return render_template('admin/products.html', products=products)


@admin_bp.route('/products/add', methods=['GET', 'POST'])
@login_required
@admin_required
def add_product():
    form = ProductForm()
    form.category_id.choices = [(0, 'No Category')] + [
        (c.id, c.name) for c in Category.query.order_by('name').all()
    ]
    
    if form.validate_on_submit():
        image_path = form.image_url.data if form.image_url.data else None
        uploaded_images = []
        
        files = request.files.getlist('image_files')
        if files and files[0].filename:
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            
            for i, file in enumerate(files):
                if file and allowed_file(file.filename):
                    ext = file.filename.rsplit('.', 1)[1].lower()
                    filename = secure_filename(f"{form.part_number.data}_{i+1}.{ext}")
                    file.save(os.path.join(upload_folder, filename))
                    uploaded_images.append(f'/static/images/products/{filename}')
        
        if not image_path and uploaded_images:
            image_path = uploaded_images[0]
        
        product = SparePart(
            part_number=form.part_number.data,
            name=form.name.data,
            description=form.description.data,
            category_id=form.category_id.data if form.category_id.data != 0 else None,
            price=form.price.data,
            stock_quantity=form.stock_quantity.data,
            reorder_level=form.reorder_level.data,
            image_url=image_path,
            images=uploaded_images if len(uploaded_images) > 1 else None,
            is_service_eligible=form.is_service_eligible.data,
            service_interval_months=form.service_interval_months.data,
            service_tasks=json.loads(form.service_tasks.data) if form.service_tasks.data else None
        )
        
        db.session.add(product)
        db.session.commit()
        
        flash(f'Product "{product.name}" added successfully!', 'success')
        return redirect(url_for('admin.products'))
    
    return render_template('admin/product_form.html', form=form, title='Add Product')


@admin_bp.route('/products/edit/<int:id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_product(id):
    product = SparePart.query.get_or_404(id)
    form = ProductForm(obj=product)
    form.category_id.choices = [(0, 'No Category')] + [
        (c.id, c.name) for c in Category.query.order_by('name').all()
    ]
    
    if form.validate_on_submit():
        product.part_number = form.part_number.data
        product.name = form.name.data
        product.description = form.description.data
        product.category_id = form.category_id.data if form.category_id.data != 0 else None
        product.price = form.price.data
        product.stock_quantity = form.stock_quantity.data
        product.reorder_level = form.reorder_level.data
        product.is_service_eligible = form.is_service_eligible.data
        product.service_interval_months = form.service_interval_months.data
        if form.service_tasks.data:
            product.service_tasks = json.loads(form.service_tasks.data)
        
        files = request.files.getlist('image_files')
        if files and files[0].filename:
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            uploaded_images = []
            
            for i, file in enumerate(files):
                if file and allowed_file(file.filename):
                    ext = file.filename.rsplit('.', 1)[1].lower()
                    filename = secure_filename(f"{form.part_number.data}_{i+1}.{ext}")
                    file.save(os.path.join(upload_folder, filename))
                    uploaded_images.append(f'/static/images/products/{filename}')
            
            if uploaded_images:
                if product.images:
                    product.images.extend(uploaded_images)
                else:
                    product.images = uploaded_images
                if not product.image_url:
                    product.image_url = uploaded_images[0]
        
        if form.image_url.data:
            product.image_url = form.image_url.data
        
        db.session.commit()
        
        flash(f'Product "{product.name}" updated successfully!', 'success')
        return redirect(url_for('admin.products'))
    
    if form.service_tasks.data and isinstance(product.service_tasks, list):
        form.service_tasks.data = json.dumps(product.service_tasks)
    
    return render_template('admin/product_form.html', form=form, title='Edit Product', product=product)


@admin_bp.route('/products/delete/<int:id>', methods=['POST'])
@login_required
@admin_required
def delete_product(id):
    product = SparePart.query.get_or_404(id)
    
    if request.method == 'POST':
        db.session.delete(product)
        db.session.commit()
        flash(f'Product "{product.name}" deleted.', 'info')
    
    return redirect(url_for('admin.products'))


@admin_bp.route('/products/remove-image/<int:id>', methods=['POST'])
@login_required
@admin_required
def remove_product_image(id):
    product = SparePart.query.get_or_404(id)
    data = request.get_json()
    image_path = data.get('image_path')
    
    if image_path in (product.images or []):
        product.images.remove(image_path)
        if len(product.images) == 0:
            product.images = None
        db.session.commit()
        return {'success': True}
    
    return {'success': False, 'message': 'Image not found'}


@admin_bp.route('/orders')
@login_required
@admin_required
def orders():
    status_filter = request.args.get('status', '')
    
    query = Order.query.order_by(Order.order_date.desc())
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    orders = query.all()
    return render_template('admin/orders.html', orders=orders, status_filter=status_filter)


@admin_bp.route('/orders/<int:id>', methods=['GET', 'POST'])
@login_required
@admin_required
def order_detail(id):
    order = Order.query.get_or_404(id)
    form = OrderStatusForm(obj=order)
    
    if form.validate_on_submit():
        old_status = order.status
        order.status = form.status.data
        order.tracking_number = form.tracking_number.data
        
        if old_status != 'delivered' and order.status == 'delivered':
            from utils.reminders import create_customer_products_from_order
            create_customer_products_from_order(order)
            flash('Customer products created for service tracking.', 'info')
        
        db.session.commit()
        flash('Order status updated!', 'success')
        return redirect(url_for('admin.order_detail', id=order.id))
    
    return render_template('admin/order_detail.html', order=order, form=form)


@admin_bp.route('/service-reminders')
@login_required
@admin_required
def service_reminders():
    reminders = ServiceReminder.query.order_by(ServiceReminder.due_date).all()
    return render_template('admin/service_reminders.html', reminders=reminders)


@admin_bp.route('/service-reminder/complete/<int:id>', methods=['POST'])
@login_required
@admin_required
def complete_reminder(id):
    reminder = ServiceReminder.query.get_or_404(id)
    
    from utils.reminders import mark_service_completed
    cp = CustomerProduct.query.get(reminder.customer_product_id)
    
    if cp and mark_service_completed(cp.id):
        flash('Service reminder marked as completed.', 'success')
    else:
        flash('Error completing service reminder.', 'danger')
    
    return redirect(url_for('admin.service_reminders'))


@admin_bp.route('/stock')
@login_required
@admin_required
def stock():
    low_stock = SparePart.query.filter(
        SparePart.stock_quantity <= SparePart.reorder_level
    ).all()
    
    return render_template('admin/stock.html', low_stock=low_stock)


@admin_bp.route('/stock/update/<int:id>', methods=['POST'])
@login_required
@admin_required
def update_stock(id):
    product = SparePart.query.get_or_404(id)
    form = StockForm()
    
    if form.validate_on_submit():
        quantity_change = form.quantity_change.data
        product.stock_quantity += quantity_change
        
        movement = StockMovement(
            spare_part_id=product.id,
            quantity_change=quantity_change,
            reason=form.reason.data,
            created_by=current_user.id
        )
        db.session.add(movement)
        db.session.commit()
        
        flash(f'Stock updated for "{product.name}".', 'success')
    
    return redirect(url_for('admin.stock'))


@admin_bp.route('/categories')
@login_required
@admin_required
def categories():
    categories = Category.query.all()
    return render_template('admin/categories.html', categories=categories)


@admin_bp.route('/categories/add', methods=['POST'])
@login_required
@admin_required
def add_category():
    name = request.form.get('name')
    description = request.form.get('description', '')
    
    if name:
        category = Category(name=name, description=description)
        db.session.add(category)
        db.session.commit()
        flash(f'Category "{name}" added.', 'success')
    
    return redirect(url_for('admin.categories'))


@admin_bp.route('/categories/delete/<int:id>', methods=['POST'])
@login_required
@admin_required
def delete_category(id):
    category = Category.query.get_or_404(id)
    
    if request.method == 'POST':
        db.session.delete(category)
        db.session.commit()
        flash(f'Category "{category.name}" deleted.', 'info')
    
    return redirect(url_for('admin.categories'))
