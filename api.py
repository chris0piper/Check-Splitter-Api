import os
from flask import Flask, flash, request, redirect, url_for, render_template
from werkzeug.utils import secure_filename

from venmo_api import Client
from PIL import Image
from google.cloud import vision
import io
import os
import re




UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000

client = vision.ImageAnnotatorClient()
moneyPattern = re.compile('\A\$*\d+\.{1}\d{2}\$*\Z')


def processReciept(filename):

    #  open this uploaded reciept
    file_name = os.path.abspath('uploads/' + filename)
    with io.open(file_name, 'rb') as image_file:
        content = image_file.read()
    image = vision.Image(content=content)

    # Use google vision to scrape the text
    response = client.document_text_detection(image=image)

    # to calculate the average height of a reciepts line item
    heightSum = 0
    heightCount = 0

    # store a list of lines coming off the bottom and the top of each price. These lines will be used to match
    # a price with the items associated with them
    listOfEquations = []
    items = []

    #Iterate through the reciept text and find all prices. Create the top and bottom lines using y = mx + b
    for text in response.text_annotations:
        # if this text is not a price
        if(not moneyPattern.match(text.description)):
            continue
        botLeft = text.bounding_poly.vertices[0]
        botRight = text.bounding_poly.vertices[1]
        topRight = text.bounding_poly.vertices[2]
        topLeft = text.bounding_poly.vertices[3]

        heightSum += (topLeft.y - botLeft.y) + (topRight.y - botRight.y)
        heightCount += 2

        # create a line from both the top and the bottom of the prices
        slopeOfTop = (topRight.y-topLeft.y) / (topRight.x-topLeft.x)
        topIntercept = topLeft.y - (slopeOfTop * topLeft.x)
        slopeOfBot = (botRight.y-botLeft.y) / (botRight.x-botLeft.x)
        botIntercept = botLeft.y - (slopeOfBot * botLeft.x)

        listOfEquations.append([slopeOfTop, topIntercept, slopeOfBot, botIntercept])
        items.append([])

    # calculate how tall the average price is
    averageLineHeight = heightSum/heightCount

    #get a list of words that allign with a given price
    for text in response.text_annotations:
        botLeft = text.bounding_poly.vertices[0]
        botRight = text.bounding_poly.vertices[1]
        topRight = text.bounding_poly.vertices[2]
        topLeft = text.bounding_poly.vertices[3]
        for i in range(0, len(listOfEquations)):
            topsAlign = abs(topRight.y - ((topRight.x * listOfEquations[i][0]) + listOfEquations[i][1])) < averageLineHeight * (3/4)
            botsAlign = abs(botRight.y - ((botRight.x * listOfEquations[i][2]) + listOfEquations[i][3])) < averageLineHeight * (3/4)
            if(topsAlign and botsAlign):
                items[i].append(text.description)

    for item in items:
        print(item)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

            processReciept(filename)

            return redirect(url_for('upload_file', name=filename))

    return render_template('index.html')



if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=5000)