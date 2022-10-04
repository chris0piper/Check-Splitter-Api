from flask import Flask, request, jsonify
from venmo_api import ApiClient, UserApi, PaymentApi, AuthenticationApi, validate_access_token, Client
import os

app = Flask(__name__)

client = None

def getFriendsList(username):
    return client.user.get_user_friends_list(user_id=username)

# requests will be a 2d array in the order of [[id, ammount], [id, ammount], [id, ammount]]
def requestPayment(self, requests, description):
    for request in requests:
        self.client.payment.request_money(request[1], description, request[0])



@app.route('/getmsg/', methods=['GET'])
def respond():
    # Retrieve the name from the url parameter /getmsg/?name=
    name = request.args.get("userId", None)
    users = getFriendsList(name)
    output = ""
    for user in users:
        output += "  " + user.username
    # For debugging
    print(f"Received: {name}")

    response = {}

    # Check if the user sent a name at all
    if not name:
        response["ERROR"] = "No name found. Please send a name."
    # Check if the user entered a number
    elif str(name).isdigit():
        response["ERROR"] = "The name can't be numeric. Please send a string."
    else:
        response["MESSAGE"] = output

    # Return the response in json format
    return jsonify(response)


@app.route('/post/', methods=['POST'])
def post_something():
    param = request.form.get('userid')
    users = getFriendsList(param)
    print(param)
    # You can add the test cases you made in the previous function, but in our case here you are just testing the POST functionality
    if param:
        return jsonify({
            "Message": users,
            # Add this option to distinct the POST request
            "METHOD": "POST"
        })
    else:
        return jsonify({
            "ERROR": "No name found. Please send a name."
        })


@app.route('/')
def index():
    # A welcome message to test our server
    return "<h1>Welcome to our medium-greeting-api!</h1>"


if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    access_token = os.environ.get("VENMO_ACCESS_TOKEN")
    client = Client(access_token=access_token)
    app.run(threaded=True, port=5000)