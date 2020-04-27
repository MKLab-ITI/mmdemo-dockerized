import time
import threading
import json
import os

from pymongo import MongoClient
from redis import Redis

username = os.environ['MONGO_USER']
password = os.environ['MONGO_PASSWORD']
mongo_client = MongoClient('localhost', port=27017,
                           user=username, password=password, authSource='admin',
                           authMechanism='SCRAM-SHA-1')

redis_client = Redis(host='localhost', port=6379)
p = redis_client.pubsub()
p.subscribe('job:download')


def download(job_id, ids):
    items_collection = mongo_client.Demo.Item
    print('=======================================')
    print('=======================================')
    print(job_id, ids)
    for id in ids:
        item = items_collection.find_one({'_id': id})
        print(item)

    print('=======================================')
    print('=======================================')


if __name__ == '__main__':
    while True:
        try:
            message = p.get_message()
            if message:
                msg = json.loads(message)
                job_id = msg.get('job_id', None)
                ids = msg.get('ids', None)
                if job_id is not None:
                    thrd = threading.Thread(target=download, args=(job_id, ids))

        except Exception as exc:
            print(exc)

        time.sleep(5.0)
