import json, sys
from math import pow

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
if len(sys.argv) < 2:
    print("Usage: %s fennica-all.json"%sys.argv[0])
    sys.exit()

fennica_all = getJsonFromFile(sys.argv[1])
PATH_TO_FENNICA_ALL_JSON_FILE = './fennica-graph.json'

# DATA HANDLING #

def countMagicValue(this, mean, max):
	if int(this) - int(mean) == 0:
		return 50
	elif int(this) < int(mean):
		diff = 1 + (int(mean) - int(this)) / mean
		return int(50 - 50 * (1 - 1 / diff))
	elif int(this) > int(mean):
		diff = 1 + (int(this) - int(mean))/ (max - mean)
		return int(50 + 50 * (1 - 1 / diff))
	else:
		return 50

def getMeanAndMaxOfYear(json_data, year):
	sum = 0
	count = 0
	max = 0
	for word in json_data[year]:
		count = count + 1
		sum = sum + json_data[year][word]
		if max < json_data[year][word]:
			max = json_data[year][word]
	return float(sum)/float(count), float(max)

def changeWordWeightsToRelativeOfMeanByYear(json_data, year):
	mean, max = getMeanAndMaxOfYear(json_data, year)
	for word in json_data[year]:
		json_data[year][word] = countMagicValue(float(json_data[year][word]), mean, max)

def changeWordWeightsToRelative(json_data):
	for year in json_data:
		changeWordWeightsToRelativeOfMeanByYear(json_data, year)
	return json_data

fennica_all_relative = changeWordWeightsToRelative(fennica_all)
writeJsonToFile(fennica_all_relative, 'fennica-graph.json')
