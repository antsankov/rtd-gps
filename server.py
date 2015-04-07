from flask import *
app = Flask(__name__)

@app.route('/nice')
def return_nice(name=None): 
    return render_template('index.html', name=name)

@app.route('/')
def return_working(name=None): 
    return render_template('test.html', name=name)


if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',)
