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
    }
)->name("item");

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
    }
)->name("start_item_monitor");

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
    }
)->name("stop_item_monitor");

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
    }
)->name("item_comments");

/**
 *  GET /items/:id/comments
 */
$app->get('/items/:id/statistics',
    function($id) use ($mongoDAO) {
        $items_states = array();
        $item = $mongoDAO->getItem($id);
        if($item !== null) {
            $items_states = $mongoDAO->getItemStates($id);
        }

        echo json_encode($items_states);
    }
)->name("item_statistics");

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

    $unique = $request->get('unique')==null ? false : $request->get('unique');

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
    $results = array();
    if($collectionId != null) {
        $collection = $mongoDAO->getCollection($collectionId);
        if($collection != null) {

            $judgements = $mongoDAO->getRelevanceJudgements($collection);

            // query formulation
            $q = $utils->formulateCollectionQuery($collection);

            // Add filters if available
            $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query);
            $results = $textIndex->searchItems($q, $pageNumber, $nPerPage,  $filters, $sort, $judgements, $unique);
        }
    }
    else {
        // free text search outside collections
        if($query != null && $query != "") {
            // Add filters if available

            $query = urldecode($query);
            $keywords = explode(',', $query);

            $query = $this->formulateLogicalQuery($keywords);
            $query = "title:($query) OR description:($query)";

            $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, null);
            $results = $textIndex->searchItems($query, $pageNumber, $nPerPage,  $filters, $sort, null, $unique);
        }
    }

    foreach($results as $result) {
        $item = $mongoDAO->getItem($result['id']);
        $item['score'] = $result['score'];
        $item['minhash'] = $result['minhash'];
        $item['cleanTitle'] = $result['cleanTitle'];

        if(isset($result['title_hl'])) {
            $item['originalTitle'] = $item['title'];
            $item['title'] = $result['title_hl'];
        }

        $items[] = $item;
    }

    echo json_encode($items);

})->name("items");

/**
 *  GET /summary
 */
$app->get('/summary', function() use($mongoDAO, $textIndex, $utils, $app) {

    $request = $app->request();

    $since = $request->get('since')==null ? '*' : $request->get('since');
    $until = $request->get('until')==null ? '*' : $request->get('until');

    $source = $request->get('source');
    $language = $request->get('language');
    $type = $request->get('type');

    $length = $request->get('length')==null ? 100 : $request->get('length');

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

    $items = array();
    if($collectionId != null) {
        $collection = $mongoDAO->getCollection($collectionId);
        if($collection != null) {

            // query formulation
            $q = $utils->formulateCollectionQuery($collection);

            // Add filters if available
            $filters = $utils->getFilters($since, $until, $source, 'original', $type, $language, $query);

            $results = $textIndex->getSummary($q, $length,  $filters);
            foreach($results as $result) {
                $item = $mongoDAO->getItem($result['id']);
                $item['score'] = $result['score'];
                $item['minhash'] = $result['minhash'];

                $items[] = $item;
            }
        }
    }

    echo json_encode($items);

})->name("summary");

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

        $unique = $request->get('unique')==null ? false : $request->get('unique');

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

                        $facet = $textIndex->getFacet($field, $collectionQuery, $filters, $n, true, null, $unique);
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

        $unique = $request->get('unique')==null ? false : $request->get('unique');

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

                    $facet = $textIndex->getFacet('uid', $collectionQuery, $filters, $n, false, null, $unique);

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

        $unique = $request->get('unique')==null ? false : $request->get('unique');

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

                    $tagsFacet = $textIndex->getFacet('tags', $collectionQuery, $filters, ceil($n/3), false, null, $unique);
                    $personsFacet = $textIndex->getFacet('persons', $collectionQuery, $filters, ceil($n/3), false, null, $unique);
                    $organizationsFacet = $textIndex->getFacet('organizations', $collectionQuery, $filters, ceil($n/3), false, null, $unique);

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

        $unique = $request->get('unique')==null ? false : $request->get('unique');

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
            $rangeFacet = $textIndex->getRangeFacet('publicationTime', $q, $filters, $gap, $start, $end, $unique);
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

        $unique = $request->get('unique')==null ? false : $request->get('unique');

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

                $statistics = $textIndex->statistics("likes,shares,followers,friends", $q, $filters, $unique);
                $counts = $textIndex->fieldsCount("uid", $q, $filters, $unique);

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
                $filters = $utils->getFilters($since, $until, $source, 'original', null, $language, $query);

                $count = $textIndex->countItems($collectionQuery, $filters);

                $topics[] = array('label' => 'All', 'query' => '*', 'score' => 1, 'items' => $count);

                $clusters = $textIndex->getClusters($collectionQuery, $filters, 1000);
                //$clusters = $textIndex->getMultilingualClusters($collectionQuery, $filters, 1000);
                foreach($clusters as $cluster) {
                    if($cluster['score'] > 0 && count($cluster['docs']) >= 15) {
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
    '/collection/',
    function() use($mongoDAO, $app) {

        $request = $app->request();
        $cid = $request->get("cid");

        if(isset($cid)) {
            $collection = $mongoDAO->getCollection($cid);
            if($collection == null) {
                echo json_encode(array());
                return;
            }

            if($collection['status'] != 'stopped') {
                $collection['stopDate'] = 1000 * time();
            }

            echo json_encode($collection);
            return;
        }

        echo json_encode(array('ownerId' => "", 'collections'=>array(), 'count'=>0));
    }
)->name("get-no-collection");


$app->get(
    '/collection/:uid',
    function ($uid) use($mongoDAO, $textIndex, $utils, $app, $redisClient) {

		$request = $app->request();

		$pageNumber = $request->get("pageNumber")==null ? 1 : $request->get("pageNumber");
        $nPerPage = $request->get("nPerPage")==null ? 6 : $request->get("nPerPage");

        $status = $request->get("status"); // stopped / running

		$all = $mongoDAO->getUserCollections($uid, $status);
		$userCollections = $mongoDAO->getUserCollections($uid, $status, $pageNumber, $nPerPage);
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

            $count = $textIndex->countItems($q, $filters);
            $collection['items'] = $count;

            $filters = $utils->getFilters($since, $until, "*", null, "media", null, null);
            $facet = $textIndex->getFacet('mediaIds', $q, $filters, 3, false);
            $collection['facet'] = $facet;

            if(count($collection['facet']) > 0) {
                foreach($collection['facet'] as $ft) {
                    $mId = $ft['field'];
                    $mItem = $mongoDAO->getMediaItem($mId);
                    if($mItem != null) {
                        $collection['mediaUrl'] = $mItem['url'];
                        break;
                    }
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
            $collection->since = $t - (15 * 24 * 3600000);

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
            if(isset($collection->accounts)) {
                foreach($collection->accounts as $account) {
                    $account->_id = $account->id;
                }
            }

            $fieldsToUpdate = array(
                'title' => $collection->title,
                'keywords' => $collection->keywords,
                'accounts' => $collection->accounts,
                'status'=>'running',
                'updateDate' => 1000 * time()
            );

            $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

            $editMessage = json_encode($collection);
            $redisClient->publish("collections:edit", $editMessage);
        }
        else {
            $t = 1000 * time();
            $collection->creationDate = $t;
            $collection->updateDate = $t;
            $collection->since = $t - (15 * 24 * 3600000);

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


$app->get(
    '/relevance/:cid',
    function($cid) use ($mongoDAO, $app) {
        $judgements = $mongoDAO->getRelevanceJudgements($cid);

        echo json_encode($judgements);
    }
);

$app->post(
    '/relevance',
    function() use ($mongoDAO, $app) {
        $request = $app->request();

        $uid = $request->get('uid');                // user id
        $cid = $request->get('cid');                // collection id
        $iid = $request->get('iid');                // item id
        $relevance = $request->get('relevance');    // relevance judgment [1(not relevant) - 5(relevant)]

        if(!$mongoDAO->collectionExists($cid)) {
            echo json_encode(array('msg' => "Collection $cid does not exist."));
            return;
        }

        if(!$mongoDAO->itemExists($iid)) {
            echo json_encode(array('msg' => "Item $iid does not exist."));
            return;
        }

        if($relevance <= 5 && $relevance >= 1) {
            $mongoDAO->insertRelevanceJudgement($uid, $cid, $iid, $relevance);
            echo json_encode(array('msg' => "Relevance judgement $relevance for $iid in collection $cid inserted from user $uid"));
            return;
        }
        else if($relevance == 0 ) {
            $operation = array('$addToSet' => array('itemsToExclude' => $iid));
            $mongoDAO->updateCollection($cid, $operation);
            echo json_encode(array('msg' => "User $uid excluded item $iid from collection $cid"));
            return;
        }

        echo json_encode(array('msg' => "Relevance judgement for $iid in collection $cid inserted from user $uid failed!"));
    }
)->name("item_relevance");

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


$app->get('/termvectors',
    function() use ($app, $textIndex) {

        $request = $app->request();
        $q = $request->get('q');

        $tv = $textIndex->getTermVectors($q, 1, 20);

        echo json_encode(array("query"=>$q, "tv"=>$tv));
    }
)->name("user_search");

/**
 *  GET /detect/users
 */
$app->get('/detect/users',
    function() use ($smWrapper, $app) {

        $request = $app->request();
        $q = $request->get('q');

        $source = $request->get('source');
        $sources = explode(',', $source);

        // Twitter
        $twitterUsers = array();
        if(in_array("Twitter", $sources)) {
            $twitterUsers = $smWrapper->searchTwitter($q);
            if(count($twitterUsers) > 0) {
                usort($twitterUsers, function ($a, $b) {
                    return ($a['followers_count'] < $b['followers_count']) ? 1 : -1;
                });
                $followersCounts = array_map(function ($u) {
                    return $u['followers_count'];
                }, $twitterUsers);
                $maxFollowersCounts = max($followersCounts);
                $minFollowersCounts = min($followersCounts);
                array_walk($twitterUsers, function (&$u, $k, $minmax) {
                    if ($minmax[1] == 0) {
                        $u['significance'] = $u['followers_count'];
                    } else if ($minmax[1] == $minmax[0]) {
                        $u['significance'] = $u['followers_count'] / $minmax[1];
                    } else {
                        $u['significance'] = ($u['followers_count'] - $minmax[0]) / ($minmax[1] - $minmax[0]);
                    }
                }, array($minFollowersCounts, $maxFollowersCounts));
            }
        }


        // Facebook
        $fbUsers = array();
        if(in_array("Facebook", $sources)) {
            $fbUsers = $smWrapper->searchFacebook($q);
            if(count($fbUsers) > 0) {
                usort($fbUsers, function ($a, $b) {
                    return ($a['likes'] < $b['likes']) ? 1 : -1;
                });
                $likes = array_map(function ($u) {
                    return $u['likes'];
                }, $fbUsers);
                $maxLikes = max($likes);
                $minLikes = min($likes);
                array_walk($fbUsers, function (&$u, $k, $minmax) {
                    if ($minmax[1] == 0) {
                        $u['significance'] = $u['likes'];
                    } else if ($minmax[1] == $minmax[0]) {
                        $u['significance'] = $u['likes'] / $minmax[1];
                    } else {
                        $u['significance'] = ($u['likes'] - $minmax[0]) / ($minmax[1] - $minmax[0]);
                    }
                }, array($minLikes, $maxLikes));
            }
        }


        // Google Plus
        $googlePlusUsers = array();
        if(in_array("GooglePlus", $sources)) {
            $googlePlusUsers = $smWrapper->searchGooglePlus($q);
            if(count($googlePlusUsers) > 0) {
                $gPlusIds = array_map(function ($u) {
                    return $u['id'];
                }, $googlePlusUsers);
                $googlePlusUsers = array();
                foreach ($gPlusIds as $id) {
                    $googlePlusUsers[] = $smWrapper->getGooglePlusAccount($id);
                }
                $plusOneCounts = array_map(function ($u) {
                    return $u['plusOneCount'];
                }, $googlePlusUsers);
                $maxPlusOne = max($plusOneCounts);
                $minPlusOne = min($plusOneCounts);
                array_walk($googlePlusUsers, function (&$u, $k, $minmax) {
                    if ($minmax[1] == 0) {
                        $u['significance'] = $u['plusOneCount'];
                    } else if ($minmax[1] == $minmax[0]) {
                        $u['significance'] = $u['plusOneCount'] / $minmax[1];
                    } else {
                        $u['significance'] = ($u['plusOneCount'] - $minmax[0]) / ($minmax[1] - $minmax[0]);
                    }
                }, array($minPlusOne, $maxPlusOne));
            }
        }

        // Youtube
        $youtubeUsers = array();
        if(in_array("Youtube", $sources)) {
            $youtubeUsers = $smWrapper->searchYoutube($q);
            if(count($youtubeUsers) > 0) {
                $ytIds = array_map(function ($u) {
                    return $u['id'];
                }, $youtubeUsers);
                $youtubeUsers = array();
                foreach ($ytIds as $id) {
                    $youtubeUsers[] = $smWrapper->getYoutubeChannel($id);
                }
                $viewCounts = array_map(function ($u) {
                    return $u['viewCount'];
                }, $youtubeUsers);
                $maxViewCounts = max($viewCounts);
                $minViewCounts = min($viewCounts);
                array_walk($youtubeUsers, function (&$u, $k, $minmax) {
                    if ($minmax[1] == 0) {
                        $u['significance'] = $u['viewCount'];
                    } else if ($minmax[1] == $minmax[0]) {
                        $u['significance'] = $u['viewCount'] / $minmax[1];
                    } else {
                        $u['significance'] = ($u['viewCount'] - $minmax[0]) / ($minmax[1] - $minmax[0]);
                    }
                }, array($minViewCounts, $maxViewCounts));
            }
        }

        // Instagram
        $instagramUsers = array();
        if(in_array("Instagram", $sources)) {
            $instagramUsers = $smWrapper->searchInstagram($q);
        }

        $users = array_merge($twitterUsers, $fbUsers, $googlePlusUsers, $youtubeUsers);
        usort($users, function($a, $b) {
            return ($a['significance'] < $b['significance']) ? 1 : -1;
        });
        $users = array_merge($users, $instagramUsers);

        echo json_encode($users);

    }
)->name("detect_users");

/**
 *  GET /detect/users
 */
$app->get('/rss/validate',
    function() use ($app) {
        $request = $app->request();
        $rssLink = $request->get('rss');


        try {

            $ch = curl_init();
            $timeout = 5;
            curl_setopt($ch, CURLOPT_URL, $rssLink);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
            $content = curl_exec($ch);
            curl_close($ch);

            $sourceUrl = parse_url($rssLink);
            $host = $sourceUrl['host'];

            $xml = new SimpleXMLElement($content);
            $channel = $xml->channel;
            $source = array(
                'id' => hash('sha256', $rssLink),
                'username' => $rssLink,
                'name' => ((string) $channel->title),
                'description' => ((string) $channel->description),
                'domain' => $host,
                'source' => 'Web'
            );

            echo json_encode(array(
                'valid' => true,
                'rss' => $source
            ));
        }
        catch(Exception $e) {
            echo json_encode(array(
                'valid' => false,
                'rss' => array()
            ));
        }




    }
)->name("rss_validation");

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
