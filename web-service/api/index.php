<?php
/**
 * Created by PhpStorm.
 * User: Manos Schinas
 * email: manosetro@hotmail.com
 *
 * Date: 11/19/15
 * Time: 5:35 PM
 */

require "vendor/autoload.php";

Predis\Autoloader::register();
spl_autoload_register(function ($class) {
    include "$class.php";
});

$app = new \Slim\Slim();
$app->setName('mmdemo_api');

$response = $app->response();
$response['Content-Type'] = 'application/json';
$response['X-Powered-By'] = 'Slim';

//Initialization Parameters
$mongoHost = "mongodb";
$mongoDatabase = "Demo";

$textIndexService = "solr";
$textIndexItemsCollection = "Items";

try {
    $textIndex = new TextIndex($textIndexService, $textIndexItemsCollection);
    $mongoDAO = new MongoDAO($mongoHost, $mongoDatabase);
    $utils = new Utils();

    $redisParams = array('scheme' => 'tcp', 'host'   => 'redis', 'port' => 6379);
    $redisClient = new Predis\Client($redisParams);

    $smWrapper = new SocialMediaWrapper();
}
catch(Exception $e) {
    echo json_encode(
        array(
            'trace' => $e->getTrace()
        )
    );
    return;
}


/**
 *  GET /users/:id
 */
$app->get('/users/:uid',
    function($uid) use ($mongoDAO) {
        $user = $mongoDAO->getUser($uid);
        if($user === null) {
            $user = array();
        }
        echo json_encode($user);
})->name("user");

/**
 *  GET /items/:id
 */
$app->get('/items/:id',
    function($id) use ($mongoDAO) {
        $item = $mongoDAO->getItem($id);
        if($item === null) {
            $item = array();
        }

        echo json_encode($item);

})->name("item");

/**
 *  POST /items/:id
 */
$app->post('/items/:id',
    function($id) use ($mongoDAO, $redisClient) {

        $item = $mongoDAO->getItem($id);
        if($item === null) {
            $item = array();
        }
        else {
            $pieces = explode("#", $id);
            if(count($pieces) == 2) {
                $message = array(
                    "id" => $pieces[1],
                    "source" => $pieces[0],
                );

                $redisClient->publish("items:new", $message);
                $redisClient->set($id, time());
            }


        }

        echo json_encode($item);
    })->name("item_monitor");

/**
 *  DELETE /items/:id
 */
$app->delete('/items/:id',
    function($id) use ($mongoDAO, $redisClient) {

        $item = $mongoDAO->getItem($id);
        if($item === null) {
            $item = array();
        }
        else {
            $pieces = explode("#", $id);
            if(count($pieces) == 2) {
                $message = array(
                    "id" => $pieces[1],
                    "source" => $pieces[0],
                );

                $redisClient->publish("items:delete", $message);
                $redisClient->del($id);
            }
        }

        echo json_encode($item);
    })->name("stop_item_monitor");

/**
 *  GET /items/:id/comments
 */
$app->get('/items/:id/comments',
    function($id) use ($mongoDAO) {
        $comments = array();
        $item = $mongoDAO->getItem($id);
        if($item !== null) {
            $comments = $mongoDAO->getItemComments($id);
        }

        echo json_encode($comments);
    })->name("item_comments");

/**
 *  GET /items
 */
$app->get('/items', function() use($mongoDAO, $textIndex, $utils, $app) {

    $request = $app->request();

    $since = $request->get('since')==null ? '*' : $request->get('since');
    $until = $request->get('until')==null ? '*' : $request->get('until');

    $source = $request->get('source');
    $language = $request->get('language');
    $original = $request->get('original');
    $type = $request->get('type');

    $sort = $request->get('sort');

    $query = $request->get('q');
    $topicQuery = $request->get('topicQuery');
    if($topicQuery != null && $topicQuery != '*') {
        if($query == null) {
            $query = $topicQuery;
        }
        else {
            $query = $query . ' ' . $topicQuery;
        }
    }

    $collectionId = $request->get('collection');

    $pageNumber = $request->get('pageNumber')==null ? 1 : $request->get('pageNumber');
    $nPerPage = $request->get('nPerPage')==null ? 20 : $request->get('nPerPage');

    $items = array();
    if($collectionId != null) {
        $collection = $mongoDAO->getCollection($collectionId);
        if($collection != null) {
            // query formulation
            $q = $utils->formulateCollectionQuery($collection);

            // Add filters if available
            $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query);
            $results = $textIndex->searchItems($q, $pageNumber, $nPerPage,  $filters, $sort);


            foreach($results as $result) {
                $item = $mongoDAO->getItem($result['id']);
                $item['score'] = $result['score'];
                if(isset($result['title_hl'])) {
                    $item['title'] = $result['title_hl'];
                }

                $items[] = $item;
            }
        }
    }

    echo json_encode($items);

})->name("items");

$app->get(
    '/top/:field',
    function ($field) use ($mongoDAO, $textIndex, $utils, $app) {
        $request = $app->request();

        $since = $request->get('since') == null ? '*' : $request->get('since');
        $until = $request->get('until') == null ? '*' : $request->get('until');

        $language = $request->get('language');
        $source = $request->get('source');

        $original = $request->get('original');
        $type = $request->get('type');

        $n = $request->get('n') == null ? 20 : $request->get('n');
        $collectionId = $request->get('collection');

        $query = $request->get('q');
        $topicQuery = $request->get('topicQuery');
        if($topicQuery != null && $topicQuery != '*') {
            if($query == null)
                $query = $topicQuery;
            else
                $query = $query . ' ' . $topicQuery;
        }

        if($field == null) {
            echo json_encode(array());
        }
        else {
            if($collectionId != null) {
                $collection = $mongoDAO->getCollection($collectionId);
                if($collection != null) {
                    try {
                        $collectionQuery = $utils->formulateCollectionQuery($collection);

                        $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query);

                        $facet = $textIndex->getFacet($field, $collectionQuery, $filters, $n, true);
                        echo json_encode(array('facet'=>$field, 'values' => $facet, 'query'=>$collectionQuery, 'filters' => $filters));
                    }
                    catch(Exception $e) {
                        echo json_encode(array('facet'=>$field, 'values' => array(), 'error'=>$e->getMessage()));
                    }
                }
                else {
                    echo json_encode(array('facet'=>$field, 'values' => array(), 'error'=>"Collection $collectionId does not exist!"));
                }
            }
            else {
                echo json_encode(array('facet'=>$field, 'values' => array(), 'error'=>"Cannot retrieve top fields dur to null collectionId."));
            }
        }
    }
)->name("top");

$app->get(
    '/users',
    function () use ($mongoDAO, $textIndex, $utils, $app) {
        $request = $app->request();

        $since = $request->get('since') == null ? '*' : $request->get('since');
        $until = $request->get('until') == null ? '*' : $request->get('until');

        $n = $request->get('n') == null ? 10 : $request->get('n');
        $collectionId = $request->get('collection');

        $original = $request->get('original');
        $type = $request->get('type');

        $language = $request->get('language');
        $source = $request->get('source');

        $query = $request->get('q');
        $topicQuery = $request->get('topicQuery');
        if($topicQuery != null && $topicQuery != '*') {
            if($query == null)
                $query = $topicQuery;
            else
                $query = $query . ' ' . $topicQuery;
        }

        if($collectionId != null) {
            $collection = $mongoDAO->getCollection($collectionId);
            if($collection != null) {
                try {
                    $collectionQuery = $utils->formulateCollectionQuery($collection);

                    $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query);

                    $facet = $textIndex->getFacet('uid', $collectionQuery, $filters, $n, false);

                    $users = array();
                    foreach($facet as $result) {
                        $user = $mongoDAO->getUser($result['field']);
                        $user['count'] = $result['count'];
                        $users[] = $user;
                    }
                    echo json_encode($users);
                }
                catch(Exception $e) {
                    echo json_encode(array('facet'=>'uid', 'values' => array(), 'error'=>$e->getMessage()));
                }
            }
            else {
                echo json_encode(array('facet'=>'uid', 'values' => array(), 'error'=>"Collection $collectionId does not exist!"));
            }
        }
    }
)->name("top_users");

$app->get(
    '/terms',
    function () use ($mongoDAO, $textIndex, $utils, $app) {
        $request = $app->request();

        $since = $request->get('since') == null ? '*' : $request->get('since');
        $until = $request->get('until') == null ? '*' : $request->get('until');

        $n = $request->get('n') == null ? 10 : $request->get('n');
        $collectionId = $request->get('collection');

        $original = $request->get('original');
        $type = $request->get('type');

        $language = $request->get('language');
        $source = $request->get('source');

        $query = $request->get('q');
        $topicQuery = $request->get('topicQuery');
        if ($topicQuery != null && $topicQuery != '*') {
            if ($query == null)
                $query = $topicQuery;
            else
                $query = $query . ' ' . $topicQuery;
        }

        if($collectionId != null) {
            $collection = $mongoDAO->getCollection($collectionId);
            if($collection != null) {
                try {
                    $collectionQuery = $utils->formulateCollectionQuery($collection);

                    $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query);

                    $tagsFacet = $textIndex->getFacet('tags', $collectionQuery, $filters, ceil($n/3), false);
                    $personsFacet = $textIndex->getFacet('persons', $collectionQuery, $filters, ceil($n/3), false);
                    $organizationsFacet = $textIndex->getFacet('organizations', $collectionQuery, $filters, ceil($n/3), false);

                    $terms = array();
                    foreach($tagsFacet as $result) {
                        $result['type'] = 'tag';
                        $terms[] = $result;
                    }
                    foreach($personsFacet as $result) {
                        $result['type'] = 'person';
                        $terms[] = $result;
                    }
                    foreach($organizationsFacet as $result) {
                        $result['type'] = 'organization';
                        $terms[] = $result;
                    }

                    usort($terms, function($e1, $e2) {
                            if ($e1['count'] == $e2['count']) {
                                return 0;
                            }
                            return ($e1['count'] > $e2['count']) ? -1 : 1;
                        }
                    );

                    $terms = array_slice($terms, 0, $n);

                    echo json_encode($terms);
                }
                catch(Exception $e) {
                    echo json_encode(array('facet'=>'uid', 'values' => array(), 'error'=>$e->getMessage()));
                }
            }
            else {
                echo json_encode(array('facet'=>'uid', 'values' => array(), 'error'=>"Collection $collectionId does not exist!"));
            }
        }
    }
)->name("top_terms");

/**
 *   /heatmap/points
 */
$app->get(
    '/heatmap/points',
    function() use($mongoDAO, $textIndex, $utils, $app) {

        $request = $app->request();

        $since = $request->get('since') == null ? '*' : $request->get('since');
        $until = $request->get('until') == null ? '*' : $request->get('until');

        $language = $request->get('language');
        $source = $request->get('source');

        $collectionId = $request->get('collection');

        $query = $request->get('q');
        $topicQuery = $request->get('topicQuery');
        if($topicQuery != null && $topicQuery != '*') {
            if($query == null)
                $query = $topicQuery;
            else
                $query = $query . ' ' . $topicQuery;
        }

        $minLat = $request->get('minLat')==null ? -90  : $request->get('minLat');
        $maxLat = $request->get('maxLat')==null ?  90  : $request->get('maxLat');
        $minLong = $request->get('minLong')==null ? -180 : $request->get('minLong');
        $maxLong = $request->get('maxLong')==null ?  180 : $request->get('maxLong');

        // Add filters if available
        $filters = $utils->getFilters($since, $until, $source, null, null, $language, $query);

        $q = null;
        if($collectionId != null) {
            $collection = $mongoDAO->getCollection($collectionId);
            if($collection != null) {
                $q = $utils->formulateCollectionQuery($collection);

                if ($query != null && $query != '') {
                    $query = urldecode($query);
                    $keywords = explode(',', $query);
                    $filterTextQuery = $utils->formulateLogicalQuery($keywords);
                    $filters['text1'] = $filterTextQuery;
                }
            }
        }
        else if($query != null && $query != '') {
            // collection is not specified. Perform text based search.
            $query = urldecode($query);
            $keywords = explode(',', $query);

            $textualQuery = $utils->formulateLogicalQuery($keywords);
            $q = "title:($textualQuery) OR tags:($textualQuery) OR description:($textualQuery)";
        }

        $points = $textIndex->get2DFacet('latlonRPT', $q, $filters, $minLat, $maxLat, $minLong, $maxLong);

        echo json_encode($points);

    }
)->name('heatmap');

// GET route
$app->get(
    '/timeline',
    function () use ($mongoDAO, $textIndex, $utils, $app) {

        $request = $app->request();

        $since = $request->get('since');
        $until = $request->get('until');

        $original = $request->get('original');
        $type = $request->get('type');
        $language = $request->get('language');
        $source = $request->get('source');

        $collectionId = $request->get('collection');

        $query = $request->get('q');
        $topicQuery = $request->get('topicQuery');
        if($topicQuery != null && $topicQuery != '*') {
            if($query == null)
                $query = $topicQuery;
            else
                $query = $query . ' ' . $topicQuery;
        }

        $gap = 3600000;
        $dateFormat = "F j, Y, g:i a";
        $resolution = $request->get('resolution');
        if ($resolution === 'DAY' || $resolution === 'day' || $resolution === 'days') {
            $dateFormat = "F j, Y";
            $gap = 24 * $gap;
        }
        if ($resolution === 'WEEK' || $resolution === 'week' || $resolution === 'weeks') {
            $dateFormat = "F j, Y";
            $gap = 7 * 24 * $gap;
        }

        $tm = array();

        $filters = $utils->getFilters(($since==null?"*":$since), ($until==null?"*":$until), $source, $original, $type, $language, $query);
        $collection = $mongoDAO->getCollection($collectionId);
        if($collection != null) {
            $q = $utils->formulateCollectionQuery($collection);
            if($since == null) {
                $since = 1000*time() - 856800000;
            }
            if($until == null) {
                $until = 1000*time();
            }

            $start = $gap * ($since / $gap);
            $end = $gap * ($until / $gap);
            $rangeFacet = $textIndex->getRangeFacet('publicationTime', $q, $filters, $gap, $start, $end);
            foreach($rangeFacet as $bin) {
                if($bin['count'] > 0) {
                    $entry = array('timestamp'=>$bin['field'], 'date'=>date($dateFormat, $bin['field']/1000), 'count'=>$bin['count']);
                    $tm[] = $entry;
                }
            }
        }

        $response = array('timeline' => $tm);

        echo json_encode($response);
    }
)->name("timeline");

$app->get(
    '/statistics',
    function () use($mongoDAO, $textIndex, $utils, $app) {
        $request = $app->request();

        $since = $request->get('since')==null ? '*' : $request->get('since');
        $until = $request->get('until')==null ? '*' : $request->get('until');

        $source = $request->get('source');
        $original = $request->get('original');
        $type = $request->get('type');
        $language = $request->get('language');

        $collectionId = $request->get('collection');

        $query = $request->get('q');
        $topicQuery = $request->get('topicQuery');
        if($topicQuery != null && $topicQuery != '*') {
            if($query == null) {
                $query = $topicQuery;
            }
            else {
                $query = $query . ' ' . $topicQuery;
            }
        }

        $time = $request->get('time');
        if($time != null) {
            $until = 1000 * time();
            if ($time == 'HALF') {
                $since = $until - 12*3600000;
            } else if ($time == 'DAY') {
                $since = $until - 24*3600000;
            } else if ($time == 'WEEK') {
                $since = $until - 7*24*3600000;
            } else if ($time == 'MONTH') {
                $since = $until - 30*24*3600000;
            }
        }


        $statistics = array();

        $q = null;
        if($collectionId != null) {
            $collection = $mongoDAO->getCollection($collectionId);
            if($collection != null) {
                $q = $utils->formulateCollectionQuery($collection);

                // Add filters if available
                $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query);

                $statistics = $textIndex->statistics("likes,shares,followers,friends", $q, $filters);
                $counts = $textIndex->fieldsCount("uid", $q, $filters);
                $statistics['endorsement'] = $statistics['likes']['sum'];
                $statistics['reach'] = $statistics['followers']['sum'];
                $statistics['users'] = $counts['uid']['cardinality'];

                $sources = $textIndex->getFacet('source', $q, $filters, -1, false);

                foreach($sources as &$source) {
                    $filters = $utils->getFilters($since, $until, $source['field'], $original, $type, $language, $query);
                    $sourceStatistics = $textIndex->statistics("likes,shares,followers,friends", $q, $filters);
                    $sourceCounts = $textIndex->fieldsCount("uid", $q, $filters);

                    $source['endorsement'] = $sourceStatistics['likes']['sum'];
                    $source['reach'] = $sourceStatistics['followers']['sum'];
                    $source['users'] = $sourceCounts['uid']['cardinality'];
                }

                $statistics['sources'] = $sources;
                $statistics['query'] = $query;
            }
        }

        echo json_encode($statistics);

    }
)->name("statistics");

$app->get(
    '/topics/',
    function () use($mongoDAO, $textIndex, $utils, $app) {

        $request = $app->request();

        $since = $request->get('since')==null ? '*' : $request->get('since');
        $until = $request->get('until')==null ? '*' : $request->get('until');

        $collectionId = $request->get('collection');
        $source = $request->get('source');
        $language = $request->get('language');

        $query = $request->get('q');
        $topicQuery = $request->get('topicQuery');
        if($topicQuery != null) {
            if($query == null)
                $query = $topicQuery;
            else
                $query = $query . ' ' . $topicQuery;
        }

        $topics = array();
        if($collectionId != null) {
            $collection = $mongoDAO->getCollection($collectionId);
            if ($collection != null) {
                $collectionQuery = $utils->formulateCollectionQuery($collection);
                $filters = $utils->getFilters($since, $until, $source, true, null, $language, $query);

                $count = $textIndex->countItems($collectionQuery, $filters);


                $topics[] = array(
                    'label' => 'All',
                    'query' => '*',
                    'score' => 1,
                    'items' => $count
                );

                $clusters = $textIndex->getClusters($collectionQuery, $filters, 1000);

                foreach($clusters as $cluster) {
                    if($cluster['score'] > 0 && count($cluster['docs'])>=10) {
                        $topic = array(
                            'label' => $cluster['labels'][0],
                            'query' => implode(',',$cluster['labels']),
                            'score' => $cluster['score'],
                            'items' => round((count($cluster['docs'])/1000) * $count)
                        );
                        $topics[] = $topic;
                    }
                }
            }
        }

        echo json_encode(array('topics' => $topics));
    }
)->name("topics");

$app->get(
    '/suggest/',
    function () use($mongoDAO, $textIndex, $utils, $app) {

        $request = $app->request();

        $since = $request->get('since')==null ? '*' : $request->get('since');
        $until = $request->get('until')==null ? '*' : $request->get('until');

        $collectionId = $request->get('collection');
        $source = $request->get('source');

        $language = $request->get('language');

        $query = $request->get('q');
        $topicQuery = $request->get('topicQuery');
        if($topicQuery != null) {
            if($query == null)
                $query = $topicQuery;
            else
                $query = $query . ' ' . $topicQuery;
        }

        $facet = array();
        $filters = $utils->getFilters($since, $until, $source, null, null, $language, $query);
        if($collectionId != null) {
            $collection = $mongoDAO->getCollection($collectionId);
            if ($collection != null) {
                $collectionQuery = $utils->formulateCollectionQuery($collection);

                $facet = $textIndex->getFacet('tags', $collectionQuery, $filters, 5, false, $query);
            }
        }

        echo json_encode(array('suggestions' => $facet));
    }
)->name("suggestions");

$app->get(
    '/collection/:uid',
    function ($uid) use($mongoDAO, $textIndex, $utils, $app, $redisClient) {

		$request = $app->request();

		$pageNumber = $request->get("pageNumber")==null ? 1 : $request->get("pageNumber");
        $nPerPage = $request->get("nPerPage")==null ? 6 : $request->get("nPerPage");

		$all = $mongoDAO->getUserCollections($uid);
		$userCollections = $mongoDAO->getUserCollections($uid, $pageNumber, $nPerPage);
        foreach($userCollections as &$collection) {

            $lastExecution = $redisClient->get($collection['_id']);
            if($lastExecution != null) {
                $collection['lastExecution'] = $lastExecution;
            }

            if($collection['status'] != 'stopped') {
                $collection['stopDate'] = 1000 * time();
            }

            $q = $utils->formulateCollectionQuery($collection);

            $collection['query'] = $q;

            $since = $collection['since'];
            $until = $collection['stopDate'];
            $filters = $utils->getFilters($since, $until, "*", null, null, null, null);

            $collection['filters'] = $filters;

			$facet = $textIndex->getFacetAndCount('mediaIds', $q, $filters, 1, false);
            $collection['items'] = $facet['count'];
            $collection['facet'] = $facet['facet'];
            if(count($facet['facet']) > 0) {
                $mId = $facet['facet'][0]['field'];
                $mItem = $mongoDAO->getMediaItem($mId);
                if($mItem != null) {
                    $collection['mediaUrl'] = $mItem['url'];
                }
            }

        }
        echo json_encode(array('ownerId' => $uid, 'collections'=>$userCollections, 'count'=>count($all)));
    }
)->name("get_user_collections");

$app->post(
    '/collection',
    function () use($app, $mongoDAO, $redisClient) {

        $request = $app->request();
        $content = $request->getBody();

        $collection = json_decode($content);
        if(isset($collection->ownerId)) {

            $t = 1000 * time();
            $collection->creationDate = $t;
            $collection->updateDate = $t;
            $collection->since = $t - (24*3600000);

            if(isset($collection->accounts)) {
                foreach($collection->accounts as $account) {
                    $account->_id = $account->id;
                }
            }

            $collection->status = "running";
            $mongoDAO->insertCollection($collection);

            $newMessage = json_encode($collection);
            $redisClient->publish("collections:new", $newMessage);
        }

        echo json_encode($collection);
    }
)->name("insert_collection");

$app->post(
    '/collection/edit',
    function () use($app, $mongoDAO, $redisClient) {
        $request = $app->request();

        $content = $request->getBody();
        $collection = json_decode($content);
        $cid = $collection->_id;

        $previousCollection = $mongoDAO->getCollection($cid);
        if ($previousCollection != null) {

            // save new collection
            $collection->updateDate = 1000 * time();
            $collection->status = "running";
            $collection->creationDate = $previousCollection['creationDate'];
            $collection->since = $previousCollection['since'];

            $fieldsToUpdate = array(
                'title' => $collection->title,
                'keywords' => $collection->keywords,
                'accounts' => $collection->accounts,
                'status'=>'running',
                'updateDate' => 1000 * time()
            );

            $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

            $deleteMessage = json_encode($previousCollection);
            $redisClient->publish("collections:delete", $deleteMessage);

            $newMessage = json_encode($collection);
            $redisClient->publish("collections:new", $newMessage);

        }

        echo json_encode($collection);
    }
)->name("edit_collection");

$app->get(
    '/collection/start/:cid',
    function ($cid) use($app, $mongoDAO, $redisClient) {

        $collection = $mongoDAO->getCollection($cid);
        if($collection != null) {
            $ops = array('status' => 'running', 'updateDate' => 1000 * time());
            $mongoDAO->updateCollectionFields($cid, $ops);

            $startMessage = json_encode($collection);
            $redisClient->publish("collections:new", $startMessage);
        }

        echo json_encode($collection);
    }
)->name("start_collection");

$app->get(
    '/collection/stop/:cid',
    function ($cid) use($app, $mongoDAO, $redisClient) {

        $collection = $mongoDAO->getCollection($cid);
        if($collection != null) {
            $ops = array('status' => 'stopped', 'updateDate' => 1000 * time(), 'stopDate' => 1000 * time());
            $mongoDAO->updateCollectionFields($cid, $ops);
            $stopMessage = json_encode($collection);
            $redisClient->publish("collections:stop", $stopMessage);
        }
        echo json_encode($collection);
    }
)->name("stop_collection");

$app->get(
    '/collection/delete/:cid',
    function ($cid) use($app, $mongoDAO, $redisClient) {
        $collection = $mongoDAO->getCollection($cid);
        if($collection != null) {
            $mongoDAO->deleteCollection($cid);
            $deleteMessage = json_encode($collection);
            $redisClient->publish("collections:delete", $deleteMessage);
        }
        echo json_encode($collection);
    }
)->name("delete_collection");

$app->get(
    '/collection/:uid/:cid',
    function ($uid, $cid) use($mongoDAO, $textIndex, $utils, $redisClient) {

        $collection = $mongoDAO->getCollection($cid);
        if($collection == null || $collection['ownerId'] != $uid) {
            echo json_encode(array());
            return;
        }

        $lastExecution = $redisClient->get($collection['_id']);
        if($lastExecution != null) {
            $collection['lastExecution'] = $lastExecution;
        }

        if($collection['status'] != 'stopped') {
            $collection['stopDate'] = 1000 * time();
        }

        echo json_encode($collection);
    }
)->name("get_collection");


/**
 *  GET /users/search
 */
$app->get('/search/users',
    function() use ($smWrapper, $app) {

        $request = $app->request();
        $q = $request->get('q');
        $source = $request->get('source');

        echo json_encode($smWrapper->search($q, $source));
    }
)->name("user_search");

/**
 *  GET /detect/users
 */
$app->get('/detect/users',
    function() use ($smWrapper, $app) {

        $request = $app->request();
        $q = $request->get('q');

        $twitterUsers = $smWrapper->searchTwitter($q);
        $fbUsers = $smWrapper->searchFacebook($q);
        $googlePlusUsers = $smWrapper->searchGooglePlus($q);
        $youtubeUsers = $smWrapper->searchYoutube($q);
        $instagramUsers = $smWrapper->searchInstagram($q);

        $users = array(
            'twitter' => $twitterUsers,
            'facebook' => $fbUsers,
            'googleplus' => $googlePlusUsers,
            'youtube' => $youtubeUsers,
            'instagram' => $instagramUsers
        );

        echo json_encode($users);

    }
)->name("detect_users");

try {
  $app->run();
}
catch(Exception $e) {
  $x = array(
    'trace' => $e->getTrace()
  );

  $messages = array();
  $messages[] = $e->getMessage();
  while($e->getPrevious() != null) {
    $e = $e->getPrevious();
    $messages[] = $e->getMessage();
  }
  $x['messages'] = $messages;

  echo json_encode($x);

  return;
}
