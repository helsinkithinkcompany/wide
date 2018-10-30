import os
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources=[r'/query/*',r'/query2/*'])

from app import routes