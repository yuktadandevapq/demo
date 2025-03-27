from flask import Flask, render_template, request, jsonify,redirect, url_for,flash
from flask_mail import Mail, Message

app = Flask(__name__)
app.secret_key = "secret_key"

# ✅ Flask-Mail Configuration (Update with your SMTP settings)
app.config['MAIL_SERVER'] = 'smtp.example.com'  # Replace with your mail server
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'anjalypriya7@gmail.com'  # Replace with your email
app.config['MAIL_PASSWORD'] = 'kiod yhth lecq xaau' 

mail = Mail(app)

# Serve the main HTML page
@app.route('/')
def home():

    return render_template('Home.html')

@app.route('/home1', methods=["GET"])
def home1():
    return render_template('Home1.html')

@app.route('/submit', methods=["POST"])
def submit():
    if request.method== "POST":
        print(request.form)  # Debug: Print form data
        user_name = request.form.get('name')
        user_email = request.form.get('email')
        user_contact = request.form.get('contact_number')
        user_location = request.form.get('location')
        
        print(user_name)
        # ✅ Validate Form Data
        if not user_name or not user_email or not user_contact or not user_location:
            return "All fields are required!", 400  # Bad Request

        
        # Send email to the client
        client_email =app.config['MAIL_USERNAME']   # Replace with the website's client email
        subject = f"New Request from {user_name}"
        body = f"Name: {user_name}\nEmail: {user_email}\nContact: {user_contact}\nlocation: {user_location}"

        try:
            msg = Message(subject, recipients=[client_email], body=body,sender=user_email)
            mail.send(msg)
            flash("Your form has been submitted successfully!", "success") 

        except Exception as e:
            
            print(f"Error: {e}")
            flash("Email sending failed!", "error") 

        return redirect(url_for('home1'))


@app.route('/navbar')
def navbar():
    return render_template('footer.html')

@app.route('/footer')
def footer():
    return render_template('footer.html')

@app.route('/3pl-storage')
def storage():
    return render_template('3plStorage.html')

@app.route('/about-us')
def about():
    return render_template('aboutUs.html')

@app.route('/bonded-storage')
def bondedStorage():
    return render_template('bondedStorage.html')

@app.route('/business')
def business():
    return render_template('business.html')

@app.route('/corporate-storage')
def corporateStorage():
    return render_template('corporateStorage.html')

@app.route('/enterprise-storage')
def enterpriseStorage():
    return render_template('enterpriseStorage.html')


@app.route('/household')
def household():
    return render_template('household.html')

@app.route('/news')
def news():
    return render_template('News.html')

@app.route('/platinum-storage')
def platinumStorage():
    return render_template('platinumStorage.html')

@app.route('/self-storage')
def selfStorage():
    return render_template('selfStorage.html')

@app.route('/vehicle-storage')
def vehicleStorage():
    return render_template('vehicleStorage.html')

@app.route('/warehouse-storage')
def warehouseStorage():
    return render_template('warhouseStorage.html')

if __name__ == '__main__':
    app.run(debug=True)
