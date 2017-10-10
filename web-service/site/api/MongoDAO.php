<?php
/**
 * Created by PhpStorm.
 * User: Manos Schinas
 *
 * Date: 11/19/15
 * Time: 6:01 PM
 */

class MongoDAO {

    private static $ITEMS = 'Item';
    private static $ITEM_STATES = 'ItemState';
    private static $MEDIA_ITEMS = 'MediaItem';
    private static $STREAM_USERS = 'StreamUser';
    private static $COLLECTIONS = 'Collection';

    private static $RELEVANCE_JUDGMENTS = 'RelevanceJudgments';
    private static $ITEMS_UNDER_MONITORING = 'ItemsUnderMonitoring';

    private static $ITEM_FIELDS = array('_id'=>1, 'shares'=>1, 'likes'=>1, 'title'=>1, 'tags'=>1, 'user'=>1, 'uid'=>1 ,'source'=>1, 'links'=>1,
        'language'=>1, 'pageUrl'=>1, 'publicationTime'=>1, 'original'=>1, 'reference'=>1, 'referencedUserId'=>1, 'type'=>1, 'inReply'=>1, 'mentions'=>1,
        'location'=>1, 'location.name'=>1, 'location.country'=>1, 'mediaIds'=>1, 'comments'=>1, 'topics'=>1);

    private static $MEDIA_FIELDS = array('_id'=>1, 'shares'=>1, 'likes'=>1, 'views'=>1, 'uid'=>1, 'url'=>1, 'thumbnail'=>1, 'pageUrl'=>1, 'source'=>1,
        'publicationTime'=>1, 'indexed'=>1, 'status'=>1, 'reference'=>1, 'title'=>1, 'tags'=>1, 'type'=>1, 'width'=>1, 'height'=>1, 'location'=>1);

    private static $USER_FIELDS = array( '_id'=>1,'username'=>1,'name'=>1, 'items'=>1,'friends'=>1,'followers'=>1,'pageUrl'=>1,'profileImage'=>1, 'mentions'=>1, 'shares'=>1);

    function __construct($host, $db, $port=27017, $username=null, $password=null) {

        $params = array();
        if($username != null && $password != null) {
            $params = array(
                'username' => $username,
                'password' => $password,
                'authSource'=>'admin',
                'authMechanism'=>'SCRAM-SHA-1');
        }

        $this->mongo = new MongoDB\Client("mongodb://$host:$port", $params,
            [
                'typeMap' => [
                    'array' => 'array',
                    'document' => 'array',
                    'root' => 'array',
                ],
            ]);

            $this->db = $this->mongo->selectDatabase($db);

            $rjCollection = $this->db->selectCollection(MongoDAO::$RELEVANCE_JUDGMENTS);
            $rjCollection->createIndex(array('cid' => 1, 'relevance' => 1));
    }

    public function getItem($id) {
        $collection = $this->db->selectCollection( MongoDAO::$ITEMS );

        $params = [
            'projection' => MongoDAO::$ITEM_FIELDS
        ];

        $item = null;
        try {
            $item = $collection->findOne(array('_id' => $id), $params);
        }
        catch(Exception $e) {
            $item = null;
        }

        if($item != null) {
            $item['id'] = $item['_id'];
            unset($item['_id']);

            if(!isset($item['uid'])) {
                return null;
            }

            $uid = $item['uid'];
            $user = $this->getUser($uid);
            if($user == null) {
                return null;
            }
            $item['user'] = $user;

            if (isset($item['mediaIds']) && count($item['mediaIds']) > 0) {
                $item['type'] = 'mediaItem';
                foreach($item['mediaIds'] as $mId) {
                    $mediaItem = $this->getMediaItem($mId);
                    if($mediaItem != null) {
                        $item['mediaUrl'] = $mediaItem['url'];
                        $item['thumbnail'] = $mediaItem['thumbnail'];
                        $item['views'] = $mediaItem['views'];
                        $item['mediaType'] = $mediaItem['type'];
                        break;
                    }
                }
            }
            else {
                $item['type'] = 'item';
            }
            unset($item['mediaIds']);
        }
        return $item;
    }

    public function itemExists($id) {
        $collection = $this->db->selectCollection(MongoDAO::$ITEMS);
        $c = $collection->count(array('_id' => $id));

        return $c > 0;
    }

    public function getItemComments($id) {
        $collection = $this->db->selectCollection( MongoDAO::$ITEMS );

        $params = [
            'projection' => MongoDAO::$ITEM_FIELDS
        ];

        $items = $collection->find(array('reference'=>$id), $params);

        return $items;
    }

    public function getItemStates($id, $t1=null, $t2=null) {
        $collection = $this->db->selectCollection( MongoDAO::$ITEM_STATES );

        $q = array('_id'=>$id);
        if($t1 != null && $t2 != null) {
            $q['timestamp'] = array(
                '$gte' => $t1,
                '$lte' => $t2
            );
        }

        $params = [
            'sort' => ['timestamp' => 1],
            'projection' => ['_ιδ' => -1]
        ];

        $items_states = $collection->find($q, $params);

        return $items_states;
    }



    public function getMediaItem($id) {
        $collection = $this->db->selectCollection( MongoDAO::$MEDIA_ITEMS );

        $params = [
            'projection' => MongoDAO::$MEDIA_FIELDS
        ];

        $mItem = $collection->findOne(array('_id'=>$id), $params);

        return $mItem;
    }

    public function getUser($id) {
        $collection = $this->db->selectCollection(MongoDAO::$STREAM_USERS);

        $params = [
            'projection' => MongoDAO::$USER_FIELDS
        ];

        $user = $collection->findOne(array('_id' => $id), $params);
        if ($user != null) {
            $user['id'] = $user['_id'];
            unset($user['_id']);
        }
        return $user;
    }

    public function getUserByUsername($username) {
        $collection = $this->db->selectCollection(MongoDAO::$STREAM_USERS);

        $params = [
            'projection' => MongoDAO::$USER_FIELDS
        ];
        $user = $collection->findOne(array('username' => $username), $params);
        if ($user != null) {
            $user['id'] = $user['_id'];
            unset($user['_id']);
        }
        return $user;
    }


    public function getItems($since, $until, $pageNumber, $nPerPage, $source=null, $language=null, $sort=null, $label=null, $onlyGeoTagged=false) {

        $collection = $this->db->selectCollection( MongoDAO::$ITEMS );

        $query = array();

        // time constraint
        if(isset($since) && is_numeric($since)) {
            $query['publicationTime']['$gt'] = intval($since);
        }
        if(isset($until) && is_numeric($until)) {
            $query['publicationTime']['$lt'] = intval($until);
        }

        if(isset($source)) {
            $sources = explode(',', $source);
            $query['source'] = array('$in' => $sources);
        }

        if($language != null && $language !== 'all' && $language !== 'All') {
            $languages = explode(',', $language);
            $query['language'] = array('$in' => $languages);
        }

        if(isset($label)) {
            $query['labels'] = $label;
        }

        if($onlyGeoTagged) {
            $query['location.coordinates'] = array('$exists' => true);
        }

        $sortBy['publicationTime'] = -1;
        if($sort === 'popularity') {
            $sortBy = array('likes'=>-1);
        }

        $params = [
            'sort' => $sortBy,
            'skip' => ($pageNumber-1)*$nPerPage,
            'limit' => $nPerPage,
            'projection' => MongoDAO::$ITEM_FIELDS
        ];

        $cursor = $collection->find($query, $params);


        $items = iterator_to_array($cursor, false);
        foreach($items as $item) {
            $item['id'] = $item['_id'];
            unset($item['_id']);

            $uid = $item['uid'];
            unset($item['uid']);

            $user = $this->getUser($uid);
            $item['user'] = $user;

            if(isset($item['mediaIds']) && count($item['mediaIds'])>0) {
                $item['type'] = 'mediaItem';
                foreach($item['mediaIds'] as $mId) {
                    $mediaItem = $this->getMediaItem($mId);
                    if($mediaItem != null) {
                        $item['mediaUrl'] = $mediaItem['url'];
                        $item['thumbnail'] = $mediaItem['thumbnail'];
                        $item['views'] = $mediaItem['views'];
                        $item['mediaType'] = $mediaItem['type'];
                        break;
                    }
                }
            }
            else {
                $item['type'] = 'item';
            }
            unset($item['mediaIds']);

        }

        return $items;
    }

    public function getCollections($pageNumber=null, $nPerPage=null, $status=null) {

        $mongoCollection = $this->db->selectCollection(MongoDAO::$COLLECTIONS);

        $query = array();

        if($status != null && ($status==='stopped' || $status==='running')) {
            $query['status'] = $status;
        }

        $options = array('sort' => ['creationDate' => -1]);
        if($pageNumber != null && $nPerPage != null) {
            $options['skip'] = ($pageNumber-1)*$nPerPage;
            $options['limit'] = $nPerPage;
        }

        $cursor = $mongoCollection->find($query, $options);
        $collections = iterator_to_array($cursor, false);

        return $collections;
    }

    public function getUserCollections($uid, $status=null, $pageNumber=null, $nPerPage=null) {

        $mongoCollection = $this->db->selectCollection(MongoDAO::$COLLECTIONS);

        $query = array('ownerId' => $uid);
        if($status != null && ($status==='stopped' || $status==='running')) {
            $query['status'] = $status;
        }

        $options = array('sort' => ['creationDate' => -1]);
        if($pageNumber != null && $nPerPage != null) {
            $options['skip'] = ($pageNumber-1)*$nPerPage;
            $options['limit'] = $nPerPage;
        }

        $cursor = $mongoCollection->find($query, $options);
        $collections = iterator_to_array($cursor, false);

        return $collections;
    }

    public function getCollection($cid) {
        $mongoCollection = $this->db->selectCollection(MongoDAO::$COLLECTIONS);

        $query = array("_id" => $cid);
        $collection = $mongoCollection->findOne($query);

        return $collection;
    }

    public function collectionExists($cid) {
        $mongoCollection = $this->db->selectCollection(MongoDAO::$COLLECTIONS);
        $query = array("_id" => $cid);
        $c = $mongoCollection->count($query);

        return $c > 0;
    }

    public function insertCollection($collection) {
        $mongoCollection = $this->db->selectCollection(MongoDAO::$COLLECTIONS);
        $mongoCollection->insertOne($collection);
    }

    public function updateCollection($cid, $collection) {
        $mongoCollection = $this->db->selectCollection(MongoDAO::$COLLECTIONS);

        $criteria = array("_id" => $cid);
        $mongoCollection->updateOne($criteria, $collection);
    }

    public function updateCollectionFields($cid, $fieldsToUpdate) {
        $mongoCollection = $this->db->selectCollection(MongoDAO::$COLLECTIONS);

        $criteria = array("_id" => $cid);
        $ops = array('$set' => $fieldsToUpdate);

        $mongoCollection->updateOne($criteria, $ops);
    }

    public function deleteCollection($cid) {
        $mongoCollection = $this->db->selectCollection(MongoDAO::$COLLECTIONS);

        $criteria = array("_id" => $cid);
        $status = $mongoCollection->deleteMany($criteria);

        return $status;
    }

    public function insertRelevanceJudgement($uid, $cid, $iid, $relevance) {

        $id = $uid . "_" . $cid . "_" . $iid;
        $q = array('_id'   =>  $id);
        $doc = array(
            '_id'   =>  $id,
            'uid'   =>  $uid,
            'cid'   =>  $cid,
            'iid'   =>  $iid,
            'relevance' => $relevance,
            'timestamp' => 1000 * time()
        );

        $mongoCollection = $this->db->selectCollection(MongoDAO::$RELEVANCE_JUDGMENTS);

        $params = array("upsert" => true);
        try {
            $response = $mongoCollection->replaceOne($q, $doc, $params);
            return  ($response->getUpsertedCount() + $response->getModifiedCount()) . ' items judgments inserted / modified';
        }
        catch(Exception $e) {
            return $e->getMessage();
        }

    }


    public function getRelevanceJudgements($cid, $iid=null, $n=20) {
        $mongoCollection = $this->db->selectCollection(MongoDAO::$RELEVANCE_JUDGMENTS);

        $q = array("cid" => $cid);

        if($iid != null) {
            $q['iid'] = $iid;
        }

        $params = [
            'sort' => ['relevance' => -1],
            'limit' => $n
        ];

        $cursor = $mongoCollection->find($q, $params);

        $rj = iterator_to_array($cursor, false);
        return $rj;
    }

    public function insertItemUnderMonitoring($iid, $cid) {

        $id =  $iid . "_" . $cid;
        $q = array('_id'   =>  $id);
        $doc = array(
            '_id'   =>  $id,
            'cid'   =>  $cid,
            'iid'   =>  $iid,
            'timestamp' => 1000 * time()
        );

        $mongoCollection = $this->db->selectCollection(MongoDAO::$ITEMS_UNDER_MONITORING);
        $mongoCollection->updateOne($q, $doc, array("upsert" => true));
    }

    public function getItemsUnderMonitoring($cid) {

        $q = array('cid' => $cid);

        $mongoCollection = $this->db->selectCollection(MongoDAO::$ITEMS_UNDER_MONITORING);
        $cursor = $mongoCollection->find($q);

        $items = iterator_to_array($cursor, false);
        return $items;
    }

    public function removeItemUnderMonitoring($iid, $cid) {

        $id =  $iid . "_" . $cid;
        $q = array('_id'   =>  $id);

        $mongoCollection = $this->db->selectCollection(MongoDAO::$ITEMS_UNDER_MONITORING);
        $mongoCollection->deleteMany($q);
    }

}
