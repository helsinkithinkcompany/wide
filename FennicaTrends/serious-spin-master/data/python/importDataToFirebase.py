import os, sys
import os.path

def getCommand(firebase_app, data_name, path_to_service_account):
    return 'firebase-import --database_url https://%s.firebaseio.com --path /%s --json %s.json --service_account %s' % (firebase_app, data_name, data_name, path_to_service_account)

def runCommand(cmd, data_name):
    print('Saving one data to Firebase database: %s.' % data_name)
    print('Running command: %s' % cmd)
    os.system(cmd)
    print('Done importing %s.' % data_name)

args = sys.argv[1:]

if not args:
    print('Give at least two arguments: firebase app name and path to service_account.json and optional data to import, otherwise trying to import everything by default')

else:
    firebase_app = args[0]
    path_to_service_account = args[1]
    data_to_import = args[2] if len(args) == 3 else None
    fennica_datas=['fennica-grouped', 'fennica-all', 'fennica-group-labels', 'fennica-graph']
    if data_to_import: # import only one file
        json = '%s.json' % data_to_import
        if os.path.isfile(json):
            cmd = getCommand(firebase_app, data_to_import, path_to_service_account)
            runCommand(cmd, data_to_import)
        else:
            print('No file found: %s.json! Not imported!' % data_to_import)
    else: # import all files
        for data in fennica_datas:
            print(data)
            json = '%s.json' % data
            if os.path.isfile(json):
                cmd = getCommand(firebase_app, data, path_to_service_account)
                runCommand(cmd, data)
            else:
                print('No file found: %s.json! Not imported!' % data)
