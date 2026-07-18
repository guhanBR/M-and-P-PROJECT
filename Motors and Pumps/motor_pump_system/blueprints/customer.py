from flask import Blueprint, render_template, redirect, url_for, flash, request, session, jsonify
from flask_login import login_required, current_user
from models import db, SparePart, Category, Order, OrderItem, CustomerProduct, ServiceReminder
from forms import CheckoutForm, CustomerProductForm
from datetime import datetime, timedelta
import stripe

customer_bp = Blueprint('customer', __name__, url_prefix='')

stripe.api_key = None


def init_stripe(public_key, secret_key):
    global stripe_api_key
    stripe.api_key = secret_key
    return stripe


@customer_bp.route('/')
def index():
    featured_products = SparePart.query.filter(SparePart.stock_quantity > 0).order_by(db.func.random()).limit(6).all()
    sale_products = SparePart.query.filter(
        SparePart.is_on_sale == True,
        SparePart.stock_quantity > 0
    ).order_by(db.func.random()).limit(4).all()
    categories = Category.query.all()
    return render_template('index.html', 
                         featured_products=featured_products,
                         sale_products=sale_products,
                         categories=categories)


@customer_bp.route('/products')
def products():
    page = request.args.get('page', 1, type=int)
    per_page = 12
    
    query = SparePart.query
    
    search = request.args.get('search', '')
    category_id = request.args.get('category', type=int)
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    in_stock = request.args.get('in_stock', type=bool)
    
    if search:
        query = query.filter(
            db.or_(
                SparePart.name.ilike(f'%{search}%'),
                SparePart.part_number.ilike(f'%{search}%'),
                SparePart.description.ilike(f'%{search}%')
            )
        )
    
    if category_id:
        query = query.filter(SparePart.category_id == category_id)
    
    if min_price is not None:
        query = query.filter(SparePart.price >= min_price)
    
    if max_price is not None:
        query = query.filter(SparePart.price <= max_price)
    
    if in_stock:
        query = query.filter(SparePart.stock_quantity > 0)
    
    products = query.order_by(SparePart.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    categories = Category.query.all()
    
    return render_template('products.html',
                         products=products,
                         categories=categories,
                         search=search,
                         selected_category=category_id,
                         min_price=min_price,
                         max_price=max_price,
                         in_stock=in_stock)


@customer_bp.route('/product/<int:id>')
def product_detail(id):
    product = SparePart.query.get_or_404(id)
    return render_template('product_detail.html', product=product)


@customer_bp.route('/cart')
def cart():
    cart_items = session.get('cart', [])
    cart_products = []
    total = 0
    
    for item in cart_items:
        product = SparePart.query.get(item['product_id'])
        if product:
            quantity = item['quantity']
            subtotal = product.price * quantity
            total += subtotal
            cart_products.append({
                'product': product,
                'quantity': quantity,
                'subtotal': subtotal
            })
    
    return render_template('cart.html', cart_products=cart_products, total=total)


@customer_bp.route('/cart/add', methods=['POST'])
def cart_add():
    product_id = request.form.get('product_id', type=int)
    quantity = request.form.get('quantity', 1, type=int)
    
    product = SparePart.query.get_or_404(product_id)
    
    if quantity > product.stock_quantity:
        flash('Not enough stock available.', 'danger')
        return redirect(url_for('customer.product_detail', id=product_id))
    
    cart = session.get('cart', [])
    
    found = False
    for item in cart:
        if item['product_id'] == product_id:
            new_qty = item['quantity'] + quantity
            if new_qty > product.stock_quantity:
                flash('Not enough stock available.', 'danger')
                return redirect(url_for('customer.product_detail', id=product_id))
            item['quantity'] = new_qty
            found = True
            break
    
    if not found:
        cart.append({'product_id': product_id, 'quantity': quantity})
    
    session['cart'] = cart
    flash(f'{product.name} added to cart.', 'success')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True, 'cart_count': len(cart)})
    
    return redirect(url_for('customer.cart'))


@customer_bp.route('/cart/update', methods=['POST'])
def cart_update():
    product_id = request.form.get('product_id', type=int)
    quantity = request.form.get('quantity', type=int)
    
    product = SparePart.query.get_or_404(product_id)
    
    if quantity < 1:
        return redirect(url_for('customer.cart_remove', product_id=product_id))
    
    if quantity > product.stock_quantity:
        flash('Not enough stock available.', 'danger')
        return redirect(url_for('customer.cart'))
    
    cart = session.get('cart', [])
    for item in cart:
        if item['product_id'] == product_id:
            item['quantity'] = quantity
            break
    
    session['cart'] = cart
    flash('Cart updated.', 'success')
    return redirect(url_for('customer.cart'))


@customer_bp.route('/cart/remove/<int:product_id>')
def cart_remove(product_id):
    cart = session.get('cart', [])
    cart = [item for item in cart if item['product_id'] != product_id]
    session['cart'] = cart
    flash('Item removed from cart.', 'info')
    return redirect(url_for('customer.cart'))


@customer_bp.route('/cart/clear')
def cart_clear():
    session.pop('cart', None)
    flash('Cart cleared.', 'info')
    return redirect(url_for('customer.cart'))


@customer_bp.route('/checkout', methods=['GET', 'POST'])
@login_required
def checkout():
    cart = session.get('cart', [])
    if not cart:
        flash('Your cart is empty.', 'warning')
        return redirect(url_for('customer.products'))
    
    cart_products = []
    total = 0
    for item in cart:
        product = SparePart.query.get(item['product_id'])
        if product:
            subtotal = product.price * item['quantity']
            total += subtotal
            cart_products.append({
                'product': product,
                'quantity': item['quantity'],
                'subtotal': subtotal
            })
    
    if not cart_products:
        flash('Your cart is empty.', 'warning')
        return redirect(url_for('customer.products'))
    
    form = CheckoutForm()
    
    if form.validate_on_submit():
        order = Order(
            user_id=current_user.id,
            total_amount=total,
            shipping_address=form.shipping_address.data,
            payment_method=form.payment_method.data,
            payment_status='paid' if form.payment_method.data == 'stripe' else 'unpaid',
            status='pending'
        )
        db.session.add(order)
        db.session.flush()
        
        for item in cart_products:
            order_item = OrderItem(
                order_id=order.id,
                spare_part_id=item['product'].id,
                quantity=item['quantity'],
                unit_price=item['product'].price
            )
            db.session.add(order_item)
            
            product = item['product']
            product.stock_quantity -= item['quantity']
        
        db.session.commit()
        
        session.pop('cart', None)
        
        flash(f'Order #{order.id} placed successfully!', 'success')
        return redirect(url_for('customer.order_confirmation', order_id=order.id))
    
    return render_template('checkout.html', 
                         form=form, 
                         cart_products=cart_products, 
                         total=total)


@customer_bp.route('/order/confirmation/<int:order_id>')
@login_required
def order_confirmation(order_id):
    order = Order.query.get_or_404(order_id)
    
    if order.user_id != current_user.id and not current_user.is_admin():
        flash('Access denied.', 'danger')
        return redirect(url_for('customer.dashboard'))
    
    return render_template('order_confirmation.html', order=order)


@customer_bp.route('/order/<int:order_id>')
@login_required
def order_detail(order_id):
    order = Order.query.get_or_404(order_id)
    
    if order.user_id != current_user.id and not current_user.is_admin():
        flash('Access denied.', 'danger')
        return redirect(url_for('customer.dashboard'))
    
    return render_template('order_detail.html', order=order)


@customer_bp.route('/dashboard')
@login_required
def dashboard():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.order_date.desc()).limit(10).all()
    customer_products = CustomerProduct.query.filter_by(user_id=current_user.id, status='active').all()
    upcoming_reminders = ServiceReminder.query.join(CustomerProduct).filter(
        CustomerProduct.user_id == current_user.id,
        ServiceReminder.status.in_(['pending', 'sent'])
    ).order_by(ServiceReminder.due_date).limit(5).all()
    
    return render_template('dashboard.html',
                         orders=orders,
                         customer_products=customer_products,
                         upcoming_reminders=upcoming_reminders)


@customer_bp.route('/my-motors')
@login_required
def my_motors():
    customer_products = CustomerProduct.query.filter_by(user_id=current_user.id).order_by(
        CustomerProduct.purchase_date.desc()
    ).all()
    return render_template('my_motors.html', customer_products=customer_products)


@customer_bp.route('/service-complete/<int:cp_id>', methods=['POST'])
@login_required
def service_complete(cp_id):
    from utils.reminders import mark_service_completed
    
    customer_product = CustomerProduct.query.get_or_404(cp_id)
    
    if customer_product.user_id != current_user.id:
        flash('Access denied.', 'danger')
        return redirect(url_for('customer.my_motors'))
    
    if mark_service_completed(cp_id):
        flash('Service marked as completed! Next service date has been updated.', 'success')
    else:
        flash('Error marking service as completed.', 'danger')
    
    return redirect(url_for('customer.my_motors'))


@customer_bp.route('/order/track/<int:order_id>')
@login_required
def order_track(order_id):
    order = Order.query.get_or_404(order_id)
    
    if order.user_id != current_user.id and not current_user.is_admin():
        flash('Access denied.', 'danger')
        return redirect(url_for('customer.dashboard'))
    
    return render_template('order_track.html', order=order)
