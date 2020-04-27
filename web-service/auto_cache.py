import requests
import time
import datetime
import sys

ip = sys.argv[1]
service = 'http://{}/api'.format(ip)
collectionsUrl = '{}/collections'.format(service)

time.sleep(600)

while True:
    t1 = time.time()
    r = requests.get(collectionsUrl)
    collections = r.json()

    owners = dict()
    for collection in collections:
        owner = collection['ownerId']
        owners[owner] = owners.get(owner, 0) + 1

    print('%s:  %s collections found from %s owners' % (datetime.datetime.fromtimestamp(t1).strftime('%Y-%m-%d %H:%M:%S'), len(collections), len(owners)))
    for owner in owners:
        count = owners[owner]
        try:
            ownerCollectionsUrl = '{}/collection/{}?cached=false&nPerPage={}&pageNumber=1'.format(service, owner, count)
            r = requests.get(ownerCollectionsUrl)
        except IOError as e:
            print("I/O error({0}): {1}".format(e.errno, e.strerror))

    dt = time.time() - t1
    if dt < 300:
        sleep_time = 300 - dt
        print('Sleep time: %s' % sleep_time)
        try:
            time.sleep(sleep_time)
        except KeyboardInterrupt:
            # exit script gracefully while running
            sys.exit()
        except Exception:
            # handle exceptions on a general level"
            print("Exception during sleep time")
