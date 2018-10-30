import json
import sys
from math import pow

PATH_TO_FENNICA_ALL_JSON_FILE = '/home/jviding/Documents/fennicaAll.json'

# FILE HANDLING #

def writeJsonToFile(json_data, file_path):
	try:
		with open(file_path, 'w') as outfile:
			json.dump(json_data, outfile)
		return True
	except Exception as e:
		print(e)
		print('Failed to dump json to file ' + file_path)
		return False

def getJsonFromFile(file_path):
	try:
		with open(file_path) as infile:
			json_data = json.load(infile)
		return json_data
	except Exception as e:
		print(e)
		print('Failed to get json from file ' + file_path)
		return False

# DATA HANDLING #

def createEmptyTop20():
	return [['', 0]] * 20

def updateTop20(value, top20):
	for index, top_value in enumerate(top20):
		if (value[1] > top_value[1]):
			top20[index] = value
			value = top_value
	return top20

def getTop20OfYear(json_data, year):
	top20 = createEmptyTop20()
	for word in json_data[year]:
		top20 = updateTop20([word, json_data[year][word]], top20)
	return top20

def setTop20OfYear(json_data, year):
	top20 = getTop20OfYear(json_data, year)
	year_top_20 = {}
	for top_value in top20:
		if (len(top_value[0]) > 0):
			year_top_20[top_value[0]] = top_value[1]
	json_data[year] = year_top_20
	return True

def changeYearsToTop20Words(json_data):
	for year in json_data:
		setTop20OfYear(json_data, year)
	return json_data

# CODE #

file_in = sys.argv[1]
file_out = sys.argv[2]

data_json = getJsonFromFile(file_in)

data_json['fennica-all'] = changeYearsToTop20Words(data_json['fennica-all'])

writeJsonToFile(data_json, file_out)

#print(data_json['fennica-all']['1900'])