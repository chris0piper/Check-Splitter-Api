import os
from flask import Flask, flash, request, redirect, url_for, render_template, session
from werkzeug.utils import secure_filename

from venmo_api import Client
from PIL import Image
from google.cloud import vision
import io
import os
import re
import json

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000
app.secret_key = 'SUPER_SECRET_KEY'


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
    largestPrice = 0
    #Iterate through the reciept text and find all prices. Create the top and bottom lines using y = mx + b
    for text in response.text_annotations:
        # if this text is not a price
        if(not moneyPattern.match(text.description)):
            continue

        largestPrice = max(largestPrice, float(text.description))

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
                items[i].append(text.description.replace("\'", "").replace("\"", ""))

    # {
    #     "TOTAL": "100.00",
    #     "SUBTOTAL": "99.00",
    #     "TAX": "1.00",
    #     "SUS": False,
    #     "LINE_ITEMS": [
    #         ["QUANTITY", "DESCRIPTION", "PRICE PER ITEM (total/quantity)"]
    #         ["1", "chicken sandwhich", "4.00"],
    #         ["2", "blt", "20.00"],
    #         ["4", "salad", "23.00"],
    #         ["2", "beer", "17.00"],
    #         ["1", "chips", "6..00"]
    #     ]
    # }


    sumPrices = 0
    reciept = {}
    reciept['LINE_ITEMS'] = []
    reciept["SUS"] = "False"
    for item in items:
        lineItem = []
        quantity = '1'
        foundQuantity = False
        description = ''
        price = '0.00'

        for word in item:
            # save price if found
            if(moneyPattern.match(word)):
                price = word
                continue

            # save quanitty if one exists
            if(not foundQuantity):
                cleanedWord = word.strip().replace('(', '').replace(')', '')
                if(cleanedWord.isnumeric()):
                    quantity = cleanedWord
                    foundQuantity = True
                    continue

            # assume everything else is a description
            description += ' ' + word

        # store the tax and total seperately
        if(float(price) == largestPrice):
            reciept['TOTAL'] = price
            continue

        if('tax' in description.lower()):
            reciept['TAX'] = price
            continue

        if('sub' in description.lower()):
            reciept['SUBTOTAL'] = price
            continue

        # if its not tax and not total, then it's a line item
        sumPrices += float(price)
        lineItem.append(quantity)
        lineItem.append(description)
        lineItem.append(str(float(price) / float(quantity)))
        reciept['LINE_ITEMS'].append(lineItem)

    # # verify that all the items add up to the total minus the tax
    # if (reciept.get('TAX') == None or reciept.get('TOTAL') == None) or (float(reciept.get('TOTAL')) - float(reciept.get('TAX') != sumPrices)):
    #     reciept['SUS'] = True
    
    return reciept


def getVenmoFriends(username):
    access_token = os.environ.get("VENMO_ACCESS_TOKEN")
    client = Client(access_token=access_token)
    friends = client.user.get_user_friends_list(user_id=username)
    dataMap = {}
    namesToIDs = []
    for friend in friends:
        nameToId = []
        nameToId.append(friend.first_name.replace('\'', '') + " " + friend.last_name.replace('\'', '') + " - " + friend.username)
        nameToId.append(friend.id)
        namesToIDs.append(nameToId)
    dataMap["NAMES_TO_IDS"] = namesToIDs
    return dataMap

def sendVenmoRequests(requests):
    access_token = os.environ.get("VENMO_ACCESS_TOKEN")
    client = Client(access_token=access_token)

    friendIds = requests.keys()
    for id in friendIds:
        description = ''
        totalPrice = 0
        for lineItem in requests[id]:
            description += '(' + lineItem[0] + ')' + lineItem[1] + ' (' + lineItem[2] + '$ each)' + '\n'
            totalPrice += float(lineItem[0]) * float(lineItem[2])
        if len(description) > 200:
            description = description[0:196] + '\n...'
        client.payment.request_money(totalPrice, description, id)


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

            session['reciept'] = processReciept(filename)

            return redirect(url_for('check_reciept'))

    return render_template('index.html')



# Sends the reciept
@app.route('/reciept', methods=['GET', 'POST'])
def check_reciept():
    if request.method == 'POST':
        session['reciept'] = request.data.decode()
        return "Success"
        # return redirect('/friends')
    return render_template('recieptReview.html', data=session['reciept'])


# add friends that were there
@app.route('/friends', methods=['GET', 'POST'])
def add_friends():
    if request.method == 'POST':
        session['friends'] = request.data
        return "Success"

    dataMap = getVenmoFriends("chris0piper")
    return render_template('addFriends.html', data=dataMap)

# add friends that were there
@app.route('/assignItems', methods=['GET', 'POST'])
def assign_items():
    if request.method == 'POST':
        data = request.data.decode()
        dictData = json.loads(data)
        session['finalSituation'] = dictData
        sendVenmoRequests(dictData)
        return "Success"

    dataMap = json.loads(session['reciept'])
    dataMap['friends'] = json.loads(session['friends'].decode())
    return render_template('assignItems.html', data=dataMap)


# Sends the reciept
@app.route('/checkVenmoUsername', methods=['POST'])
def checkVenmoUsername():
    if request.method == 'POST':
        username = request.data.decode()
        access_token = os.environ.get("VENMO_ACCESS_TOKEN")
        client = Client(access_token=access_token)
        users = client.user.search_for_users(query = username, limit=10)
        allUsers = []
        for user in users:
            arrayUser = []
            arrayUser.append(user.first_name.replace('\'', '') + " " + user.last_name.replace('\'', '') + " - " + user.username)
            arrayUser.append(user.id)
            allUsers.append(arrayUser)
        # Add in functionality to display options of the name
        return allUsers
        # return redirect('/friends')
    return render_template('recieptReview.html', data=session['reciept'])

# Sends the reciept
@app.route('/success', methods=['GET'])
def success():
    return render_template('success.html')


if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=5000)