from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, PasswordField, TextAreaField, SelectField, IntegerField, FloatField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Optional, NumberRange, ValidationError
from models import User


class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=80)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    phone = StringField('Phone', validators=[Optional(), Length(max=20)])
    address = TextAreaField('Address', validators=[Optional()])
    submit = SubmitField('Register')
    
    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('Username already taken. Please choose another.')
    
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email already registered. Please use another.')


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Login')


class CheckoutForm(FlaskForm):
    shipping_address = TextAreaField('Shipping Address', validators=[DataRequired()])
    payment_method = SelectField('Payment Method', 
                                choices=[('cod', 'Cash on Delivery'), 
                                        ('stripe', 'Credit Card (Stripe)')],
                                validators=[DataRequired()])
    submit = SubmitField('Place Order')


class ProductForm(FlaskForm):
    part_number = StringField('Part Number', validators=[DataRequired(), Length(max=50)])
    name = StringField('Name', validators=[DataRequired(), Length(max=100)])
    description = TextAreaField('Description', validators=[Optional()])
    category_id = SelectField('Category', coerce=int, validators=[Optional()])
    price = FloatField('Price', validators=[DataRequired(), NumberRange(min=0)])
    stock_quantity = IntegerField('Stock Quantity', validators=[DataRequired(), NumberRange(min=0)])
    reorder_level = IntegerField('Reorder Level', validators=[DataRequired(), NumberRange(min=0)])
    image_url = StringField('Primary Image URL', validators=[Optional(), Length(max=200)])
    image_files = FileField('Upload Images (Multiple)', validators=[
        Optional()
    ])
    is_service_eligible = BooleanField('Service Eligible')
    service_interval_months = IntegerField('Service Interval (months)', validators=[Optional(), NumberRange(min=1)])
    service_tasks = TextAreaField('Service Tasks (JSON format)', validators=[Optional()])
    submit = SubmitField('Save Product')


class OrderStatusForm(FlaskForm):
    status = SelectField('Order Status',
                        choices=[('pending', 'Pending'),
                                ('confirmed', 'Confirmed'),
                                ('processing', 'Processing'),
                                ('shipped', 'Shipped'),
                                ('delivered', 'Delivered'),
                                ('cancelled', 'Cancelled')],
                        validators=[DataRequired()])
    tracking_number = StringField('Tracking Number', validators=[Optional(), Length(max=100)])
    submit = SubmitField('Update Status')


class StockForm(FlaskForm):
    quantity_change = IntegerField('Quantity Change', validators=[DataRequired()])
    reason = StringField('Reason', validators=[DataRequired(), Length(max=100)])
    submit = SubmitField('Update Stock')


class SearchForm(FlaskForm):
    search = StringField('Search', validators=[Optional()])
    category = SelectField('Category', coerce=int, validators=[Optional()])
    min_price = FloatField('Min Price', validators=[Optional(), NumberRange(min=0)])
    max_price = FloatField('Max Price', validators=[Optional(), NumberRange(min=0)])
    in_stock = BooleanField('In Stock Only')
    submit = SubmitField('Filter')


class CustomerProductForm(FlaskForm):
    serial_number = StringField('Serial Number', validators=[Optional(), Length(max=100)])
    submit = SubmitField('Update')
