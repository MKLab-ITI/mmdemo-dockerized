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

    $mongoDAO = new MongoDAO($mongoHost, $mongoDatabase, 27017, $_ENV["MONGO_USER"],  $_ENV["MONGO_PASSWORD"]);

    $utils = new Utils();

    $redisParams = array('scheme' => 'tcp', 'host' => 'redis', 'port' => 6379);
    $redisClient = new Predis\Client($redisParams);

    $smWrapper = new SocialMediaWrapper();

    $memcached = new Memcached();
    $memcached->addServer('localhost', 11211);
}
catch(Exception $e) {
    echo json_encode(
        array(
            'trace' => $e->getMessage()
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
    }
)->name("user");

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
$app->post('/items/:iid',
    function($iid) use ($mongoDAO, $redisClient, $app) {

        $request = $app->request();
        $cid = $request->get('cid');

        $item = $mongoDAO->getItem($iid);
        if($item === null) {
            $item = array();
        }
        else {
            $pieces = explode("#", $iid);
            if(count($pieces) == 2) {
                $message = array(
                    "id" => $pieces[1],
                    "source" => $pieces[0],
                );

                $redisClient->publish("items:new", $message);
                $mongoDAO->insertItemUnderMonitoring($iid, $cid);
            }

        }
        echo json_encode($item);
    }
)->name("start_item_monitor");

/**
 *  DELETE /items/:id
 */
$app->delete('/items/:iid',
    function($iid) use ($mongoDAO, $redisClient, $app) {

        $request = $app->request();
        $cid = $request->get('cid');

        $item = $mongoDAO->getItem($iid);
        if($item === null) {
            $item = array();
        }
        else {
            $pieces = explode("#", $iid);
            if(count($pieces) == 2) {
                $message = array(
                    "id" => $pieces[1],
                    "source" => $pieces[0],
                );

                $redisClient->publish("items:delete", $message);
                $mongoDAO->removeItemUnderMonitoring($iid, $cid);
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
$app->get('/items',
    function() use($mongoDAO, $textIndex, $memcached, $utils, $smWrapper, $app) {
        $request = $app->request();

        $s = $request->get('since');
        $u = $request->get('until');
        $since = ($s==null || $s === '') ? '*' : $s;
        $until = ($u==null || $u === '') ? '*' : $u;

        $source = $request->get('source');
        $language = $request->get('language');
        $original = $request->get('original');
        $type = $request->get('type');

        $relevance = $request->get('relevance');
        if ($relevance != null && $relevance !== '') {
            $relevance = explode(",", $relevance);
        }

        $user = $request->get('user');

        $unique = $request->get('unique')==null ? false : $request->get('unique');
        $sort = $request->get('sort');
        $query = $request->get('q');

        $topicQuery = $request->get('topicQuery');
        if($topicQuery != null && $topicQuery != '*') {
            if($query == null) {
                $query = $topicQuery;
            }
            else {
                $query = $query . ',' . $topicQuery;
            }
        }

        $collectionId = $request->get('collection');
        $pageNumber = $request->get('pageNumber')==null ? 1 : $request->get('pageNumber');
        $nPerPage = $request->get('nPerPage')==null ? 20 : $request->get('nPerPage');

        $cached = ($request->get('cached')==null || $request->get('cached')=='') ? 'true' : $request->get('cached');

        $owner_id = null;
        $filters = array();
        $items = array();
        $results = array();
        $language_facet = array();
        $topics = array();
        $judgements = null;
        $filters_count = 0;

        if($collectionId != null) {
            $collection = $mongoDAO->getCollection($collectionId);
            $owner_id = $collection['ownerId'];

            if(isset($collection['status']) && $collection['status'] == "stopped") {
                if (isset($collection['stopDate']) && $collection['stopDate'] != null) {
                    $until = $collection['stopDate'];
                }
            }

            if($collection != null) {
                $judgements = null;
                if ($relevance != null && count($relevance) > 0) {
                    $judgements = $mongoDAO->getItemsOfSpecificRelevance($collectionId, $relevance);
                }

                // query formulation
                $collection_query = $utils->formulateCollectionQuery($collection);

                // Add filters if available
                $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:null;
                $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:null;
                $keywordsToExclude = isset($collection['keywordsToExclude'])?$collection['keywordsToExclude']:null;
                $nearLocations = isset($collection['nearLocations'])?$collection['nearLocations']:null;

                $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query, $user,
                    $itemsToExclude, $usersToExclude, $keywordsToExclude, $judgements, $nearLocations);

                $filters_count = count($filters);

                $results = $textIndex->searchItems($collection_query, $pageNumber, $nPerPage,  $filters, $sort, $unique, $query);
                $language_facet = $textIndex->getFacet('language', $collection_query, $filters, 100, true, null, $unique, null, 'fcs');


                $clusters_hash = $utils->getParametersHash($collectionId, '*', '*', $source, true, null, $language,
                    $query, $user, $itemsToExclude, $usersToExclude, $keywordsToExclude, null, null, "clusters_");

                $topics_hash = $utils->getParametersHash($collectionId, $since, $until, $source, $original, $type,
                        $language, $query, $user, $itemsToExclude, $usersToExclude, $keywordsToExclude, null, $unique,
                        "topics_");

                $clusters = $memcached->get($clusters_hash);
                if($clusters == false || count($clusters) == 0 || $cached === 'false') {
                    $clusters = $textIndex->getClusters($collection_query, $filters, 5000);
                    $memcached->set($clusters_hash, $clusters, time() + 601);
                }

                $topics = $memcached->get($topics_hash);
                if($topics == false || count($topics) == 0 || $cached === 'false') {
                    $topics = $utils->getTopicsFromClusters($clusters, $results['numFound'], 5000,
                        $collection_query, $query, $since, $until, $source, $original, $type, $language, $user,
                        $itemsToExclude, $usersToExclude, $keywordsToExclude, $judgements, $nearLocations, $textIndex);
                    if (count($topics) > 0) {
                        $memcached->set($topics_hash, $topics, time() + 601);
                    }
                }

            }
        }
        else {
            // free text search outside collections
            if($query != null && $query != "") {
                // Add filters if available
                $hl = $query;

                $query = urldecode($query);
                $keywords = explode(',', $query);

                $query = $utils->formulateLogicalQuery($keywords, 'OR');
                $query = "title:($query) OR description:($query)";

                $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, null, $user, null, null, null);
                $results = $textIndex->searchItems($query, $pageNumber, $nPerPage,  $filters, $sort, $unique, $hl);

                $facet = $textIndex->getFacet('language', $query, $filters, 100, true, null, $unique, null, 'fcs');
            }
        }

        $rank = $nPerPage * ($pageNumber - 1);
        if(isset($results['docs'])) {
            foreach ($results['docs'] as $result) {
                if ($mongoDAO->itemExists($result['id'])) {
                    $item = $mongoDAO->getItem($result['id']);
                    $item['score'] = $result['score'];
                    $item['minhash'] = $result['minhash'];
                    $item['cleanTitle'] = $result['cleanTitle'];
                }
                else {
                    $item = $result;

                    $id_parts = explode("#", $item['id']);
                    if(count($id_parts) > 1) {
                        $item['source'] = $id_parts[0];
                        if ($item['source'] == 'Youtube') {
                            $item['pageUrl'] = 'https://www.youtube.com/watch?v=' . $id_parts[1];
                        }
                        elseif ($item['source'] == 'Twitter') {
                            $item['pageUrl'] = 'https://twitter.com/username/status/' . $id_parts[1];
                        }
                        elseif ($item['source'] == 'Facebook') {
                            $item['pageUrl'] = 'https://www.facebook.com/' . $id_parts[1];
                        }
                    }

                    if(strpos($item['title'], 'RT ') === 0) {
                        $item['original'] = False;
                    }
                    else {
                        $item['original'] = True;
                    }

                    if($item['tags'] == null) {
                        $item['tags'] = [];
                    }

                    $uid = $item['uid'];
                    $user = $mongoDAO->getUser($uid);
                    if($user != null) {
                        $item['user'] = $user;
                    }
                    else {
                        $user_link = '';
                        $uid_parts = explode("#", $uid);
                        if(count($uid_parts) > 1) {
                            if ($uid_parts[0] == 'Youtube') {
                                $youtube_channel = $smWrapper->getYoutubeChannel($uid_parts[1]);
                                if ($youtube_channel != null && count($youtube_channel) > 0) {
                                    $user = array(
                                        'id' => $uid, 'username' => $youtube_channel['username'],
                                        'name' => $youtube_channel['name'], 'userid' => $youtube_channel['id'],
                                        'views' => $youtube_channel['viewCount'],
                                        'comments' => $youtube_channel['commentCount'],
                                        'followers' => $youtube_channel['subscriberCount'],
                                        'items' => $youtube_channel['videoCount'],
                                        'mentions' => 0, 'source' => 'Youtube',
                                        'pageUrl' => 'https://www.youtube.com/channel/' . $youtube_channel['id'],
                                        'favorities' => 0, 'listedCount' => 0, 'friends' => 0, 'shares' => 0
                                    );
                                    $item['user'] = $user;
                                }
                                else {
                                    $user_link = 'https://www.youtube.com/channel/' . $uid_parts[1];
                                    $item['user'] = array(
                                        'id' => $uid, 'items' => 0, 'mentions' => 0, 'pageUrl' => $user_link,
                                        'friends' => 0, 'followers' => 0, 'shares' => 0);
                                }
                            }
                            elseif ($uid_parts[0] == 'Twitter') {
                                $twitter_user = $smWrapper->getTwitterUser($uid_parts[1]);
                                if ($twitter_user != null && count($twitter_user) > 0) {
                                    $user = array(
                                        'id' => $uid, 'username' => $twitter_user->screen_name,
                                        'userid' => $twitter_user->id_str, 'url' => $twitter_user->url,
                                        'name' => $twitter_user->name, 'items' => $twitter_user->statuses_count,
                                        'profileImage' => $twitter_user->profile_image_url_https,
                                        'followers' => $twitter_user->followers_count,
                                        'friends' => $twitter_user->friends_count,
                                        'favorities' => $twitter_user->favourites_count,
                                        'listedCount' => $twitter_user->listed_count,
                                        'mentions' => 0, 'source' => 'Twitter',
                                        'verified' => $twitter_user->verified,
                                        'pageUrl' => 'https://twitter.com/' . $twitter_user->screen_name
                                    );
                                    $item['user'] = $user;
                                } else {
                                    $item['user'] = array(
                                        'id' => $uid, 'items' => 0, 'mentions' => 0, 'pageUrl' => $user_link,
                                        'friends' => 0, 'followers' => 0, 'shares' => 0
                                    );
                                }
                            }
                            else {
                                $item['user'] = array(
                                    'id' => $uid, 'items' => 0, 'mentions' => 0, 'pageUrl' => $user_link,
                                    'friends' => 0, 'followers' => 0, 'shares' => 0
                                );
                            }
                        }
                        else {
                            $item['user'] = array(
                                'id' => $uid, 'items' => 0, 'mentions' => 0, 'pageUrl' => $user_link,
                                'friends' => 0, 'followers' => 0, 'shares' => 0
                            );
                        }
                    }
                    $item['type'] = 'item';
                }

                $item['rank'] = $rank;

                $rank += 1;
                if (isset($result['title_hl'])) {
                    $item['originalTitle'] = $item['title'];
                    $item['title'] = $result['title_hl'];
                }

                if ($owner_id != null && $collectionId != null) {
                    $rel = $mongoDAO->getRelevanceJudgement($owner_id, $collectionId, $result['id']);
                    if ($rel != null) {
                        $item['relevance'] = $rel['relevance'];
                    }
                }
                $items[] = $item;
            }
        }

        $response = array(
            'items' => $items,
            'pageNumber' => $pageNumber,
            'nPerPage' => $nPerPage,
            'total' => $results['numFound'],
            'filters' => $filters,
            'filters_count' => $filters_count,
            'collection_query' => isset($collection_query) ? $collection_query : '',
            'languages' => $language_facet,
            'topics' => $topics,
            'owner' => $owner_id,
            'collection' => $collectionId,
            'judgements' => $judgements,
            'unique' => $unique,
            'relevance' => $relevance
        );

        echo json_encode($response);
    }
)->name("items");

/**
 *  GET /collection/:id/download
 */
$app->get('/collection/:cid/download',
    function($cid) use($mongoDAO, $textIndex, $utils, $redisClient, $app) {

        $request = $app->request();

        $s = $request->get('since');
        $u = $request->get('until');
        $since = ($s==null || $s === '') ? '*' : $s;
        $until = ($u==null || $u === '') ? '*' : $u;

        $source = $request->get('source');
        $language = $request->get('language');
        $original = $request->get('original');
        $type = $request->get('type');

        $relevance = $request->get('relevance');
        if ($relevance != null && $relevance !== '') {
            $relevance = explode(",", $relevance);
        }

        $user = $request->get('user');

        $unique = $request->get('unique')==null ? false : $request->get('unique');
        $query = $request->get('q');

        $topicQuery = $request->get('topicQuery');
        if($topicQuery != null && $topicQuery != '*') {
            if($query == null) {
                $query = $topicQuery;
            }
            else {
                $query = $query . ',' . $topicQuery;
            }
        }

        $collection = $mongoDAO->getCollection($cid);
        if ($collection == null) {
            echo json_encode(array('error' => "collection $collection does not exist."));
            return;
        }

        // query formulation
        $collection_query = $utils->formulateCollectionQuery($collection);

        // Add filters if available
        $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:null;
        $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:null;
        $keywordsToExclude = isset($collection['keywordsToExclude'])?$collection['keywordsToExclude']:null;
        $nearLocations = isset($collection['nearLocations'])?$collection['nearLocations']:null;

        $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query, $user,
            $itemsToExclude, $usersToExclude, $keywordsToExclude, null, $nearLocations);

        $results = $textIndex->getAllItemIds($collection_query,  $filters,  $unique);

        $message = array(
            "job_id" => $cid,
            "ids" => $results,
        );

        $redisClient->publish("job:download", json_encode($message));

        echo json_encode(array('job_id' => $cid, 'status'=> 'not_ready'));

    }
)->name("collection_download");

/**
 *  GET /collection/:id/download
 */
$app->get('/download/:job_id', function($job_id) use($mongoDAO, $app) {

    $response = $app->response();
    $stream = new \Slim\Http\Stream(null);

    return $response->withHeader('Content-Type', 'application/force-download')
        ->withHeader('Content-Type', 'application/octet-stream')
        ->withHeader('Content-Type', 'application/download')
        ->withHeader('Content-Description', 'File Transfer')
        ->withHeader('Content-Transfer-Encoding', 'binary')
        ->withBody($stream);
}
)->name("download_result");


/**
 *  GET /summary
 */
$app->get('/summary', function() use($mongoDAO, $textIndex, $utils, $app) {

    $request = $app->request();

    $s = $request->get('since');
    $u = $request->get('until');
    $since = ($s==null || $s === '') ? '*' : $s;
    $until = ($u==null || $u === '') ? '*' : $u;

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
            $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:null;
            $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:null;
            $keywordsToExclude = isset($collection['keywordsToExclude'])?$collection['keywordsToExclude']:null;
            $filters = $utils->getFilters($since, $until, $source, 'original', $type, $language, $query, null,
                $itemsToExclude, $usersToExclude, $keywordsToExclude);

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
    function ($field) use ($mongoDAO, $textIndex, $utils, $app, $memcached) {
        $request = $app->request();

        $s = $request->get('since');
        $u = $request->get('until');
        $since = ($s==null || $s === '') ? '*' : $s;
        $until = ($u==null || $u === '') ? '*' : $u;

        $language = $request->get('language');
        $source = $request->get('source');

        $prefix = $request->get('prefix');

        $original = $request->get('original');
        $type = $request->get('type');

        $user = $request->get('user');
        $relevance = $request->get('relevance');
        if ($relevance != null) {
            $relevance = explode(",", $relevance);
        }

        $judgements = array();

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

                        $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:null;
                        $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:null;
                        $keywordsToExclude = isset($collection['keywordsToExclude'])?$collection['keywordsToExclude']:null;
                        $nearLocations = isset($collection['nearLocations'])?$collection['nearLocations']:null;

                        if ($relevance != null) {
                            $judgements = $mongoDAO->getItemsOfSpecificRelevance($collectionId, $relevance);
                        }

                        $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query,
                            $user, $itemsToExclude, $usersToExclude, $keywordsToExclude, $judgements, $nearLocations);

                        $requestHash = $field."_".$utils->getParametersHash($collectionId, $since, $until, $source,
                                $original, $type, $language, $query, $user,
                                $itemsToExclude, $usersToExclude, $keywordsToExclude,
                                $judgements, $unique);

                        $facet = $memcached->get($requestHash);
                        if($facet == false || count($facet) < 2) {
                            $facet = $textIndex->getFacet($field, $collectionQuery, $filters, $n, true, $prefix, $unique, null, 'fcs');
                            $memcached->set($requestHash, $facet, time()+61);
                        }

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

        $s = $request->get('since');
        $u = $request->get('until');
        $since = ($s==null || $s === '') ? '*' : $s;
        $until = ($u==null || $u === '') ? '*' : $u;

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

                    $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:null;
                    $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:null;
                    $keywordsToExclude = isset($collection['keywordsToExclude'])?$collection['keywordsToExclude']:null;
                    $nearLocations = isset($collection['nearLocations'])?$collection['nearLocations']:null;

                    $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query, null,
                        $itemsToExclude, $usersToExclude, $keywordsToExclude, null, $nearLocations);

                    $facet = $textIndex->getFacet('uidFacet', $collectionQuery, $filters, $n, false, null, $unique, null, 'fcs');

                    $users = array();
                    foreach($facet as $result) {
                        $user = $mongoDAO->getUser($result['field']);
                        if ($user != null && count($user) > 0) {
                            $user['count'] = $result['count'];
                            $users[] = $user;
                        }
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
    '/articles',
    function () use ($mongoDAO, $textIndex, $utils, $memcached, $app) {

        $articles = array();
        $request = $app->request();

        $cached = $request->get('cached');
        $collectionId = $request->get('collection');
        if($collectionId != null) {
            $collection = $mongoDAO->getCollection($collectionId);
            if ($collection != null) {
                $requestHash = "articles_$collectionId";
                $articles = $memcached->get($requestHash);

                if($articles == false || $cached === 'false') {

                    $signatures = [];
                    $signature_counts = [];
                    $articles = array();
                    $filename = "./urls_content/".$collectionId.".txt";
                    if ($file = fopen($filename, "r")) {
                        while(!feof($file)) {
                            $line = fgets($file);
                            $json_data = json_decode($line);
                            $json_data->content = $json_data->text;
                            unset($json_data->text);
                            if(in_array($json_data->minhash, $signatures)) {
                                $signature_counts[$json_data->minhash] += 1;
                                continue;
                            }
                            $signatures[] = $json_data->minhash;
                            $signature_counts[$json_data->minhash] = 1;

                            $articles[] = $json_data;
                            if(count($articles) >= 1000) {
                                break;
                            }
                        }
                        fclose($file);

                        foreach($articles as $article) {
                            $article->count = $signature_counts[$article->minhash];
                        }

                        usort($articles, function ($obj1, $obj2) { return $obj1->count <= $obj2->count; });
                        if(count($articles) > 15) {
                            $articles = array_slice($articles, 15);
                        }

                    }
                    else {
                        echo json_encode(array('error'=>"Cannot open $filename"));
                        return;
                    }

                    $memcached->set($requestHash, $articles, time() + 600);
                }
            }
        }
        echo json_encode(array('articles' => $articles));

    }
)->name("articles");

$app->get(
    '/terms',
    function () use ($mongoDAO, $textIndex, $utils, $app) {
        $request = $app->request();

        $s = $request->get('since');
        $u = $request->get('until');
        $since = ($s==null || $s === '') ? '*' : $s;
        $until = ($u==null || $u === '') ? '*' : $u;

        $n = $request->get('n') == null ? 10 : $request->get('n');
        $collectionId = $request->get('collection');

        $original = $request->get('original');
        $type = $request->get('type');

        $language = $request->get('language');
        $source = $request->get('source');

        $user = $request->get('user');

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

                    $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:null;
                    $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:null;
                    $keywordsToExclude = isset($collection['keywordsToExclude'])?$collection['keywordsToExclude']:null;
                    $nearLocations = isset($collection['nearLocations'])?$collection['nearLocations']:null;

                    $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query, $user,
                        $itemsToExclude, $usersToExclude, $keywordsToExclude, null, $nearLocations);

                    $termsToExclude = preg_split("/[\s,]+/", $query);
                    $termsToExclude = array_map(function($k) {
                        return strtolower($k);
                    }, $termsToExclude);

                    $tagsFacet = $textIndex->getFacet('tags', $collectionQuery, $filters, ceil($n/3), false, null, $unique, $termsToExclude, 'fcs');
                    $personsFacet = $textIndex->getFacet('persons', $collectionQuery, $filters, ceil($n/3), false, null, $unique, $termsToExclude, 'fcs');
                    $organizationsFacet = $textIndex->getFacet('organizations', $collectionQuery, $filters, ceil($n/3), false, null, $unique, $termsToExclude, 'fcs');

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

        $s = $request->get('since');
        $u = $request->get('until');
        $since = ($s==null || $s === '') ? '*' : $s;
        $until = ($u==null || $u === '') ? '*' : $u;

        $language = $request->get('language');
        $source = $request->get('source');

        $user = $request->get('user');

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


        $q = null;
        if($collectionId != null) {
            $collection = $mongoDAO->getCollection($collectionId);
            if($collection != null) {
                $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:null;
                $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:null;
                $keywordsToExclude = isset($collection['keywordsToExclude'])?$collection['keywordsToExclude']:null;
                $nearLocations = isset($collection['nearLocations'])?$collection['nearLocations']:null;

                $filters = $utils->getFilters($since, $until, $source, null, null, $language, $query, $user,
                    $itemsToExclude, $usersToExclude, $keywordsToExclude, null, null, $nearLocations);

                $q = $utils->formulateCollectionQuery($collection);

                $points = $textIndex->get2DFacet('latlonRPT', $q, $filters, $minLat, $maxLat, $minLong, $maxLong);

                echo json_encode($points);
                return;
            }
        }

        echo json_encode(array('points' => array()));
    }
)->name('heatmap');

// GET route
$app->get(
    '/timeline',
    function () use ($mongoDAO, $textIndex, $utils, $app, $memcached) {

        $request = $app->request();

        $since = $request->get('since');
        $until = $request->get('until');

        $original = $request->get('original');
        $type = $request->get('type');
        $language = $request->get('language');
        $source = $request->get('source');

        $user = $request->get('user');

        $relevance = $request->get('relevance');
        if ($relevance != null) {
            $relevance = explode(",", $relevance);
        }

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
        if ($resolution === 'MINUTE' || $resolution === 'minute' || $resolution === 'minutes') {
            $gap = $gap / 60;
        }

        $tm = array();

        $collection = $mongoDAO->getCollection($collectionId);

        if($collection != null) {
            $itemsToExclude = isset($collection['itemsToExclude']) ? $collection['itemsToExclude'] : null;
            $usersToExclude = isset($collection['usersToExclude']) ? $collection['usersToExclude'] : null;
            $keywordsToExclude = isset($collection['keywordsToExclude']) ? $collection['keywordsToExclude'] : null;
            $nearLocations = isset($collection['nearLocations']) ? $collection['nearLocations'] : null;

            $judgements = null;
            if ($relevance != null) {
                $judgements = $mongoDAO->getItemsOfSpecificRelevance($collectionId, $relevance);
            }

            $filters = $utils->getFilters(($since==null?"*":$since), ($until==null?"*":$until),  $source, $original,
                $type, $language, $query, $user, $itemsToExclude, $usersToExclude, $keywordsToExclude,
                $judgements, $nearLocations);

            $q = $utils->formulateCollectionQuery($collection);
            if($since == null) {
                $since = 1000*time() - 856800000;
            }
            if($until == null) {
                $until = 1000*time();
            }

            $requestHash = "timeline_".$gap."_".$utils->getParametersHash($collectionId, $since, $until, $source,
                    $original, $type, $language, $query, $user, $itemsToExclude, $usersToExclude, $keywordsToExclude,
                    $judgements, $unique);

            $cachedTimeline = $memcached->get($requestHash);
            if($cachedTimeline != false) {
                $r = array('timeline' => $cachedTimeline, 'cached' => True, 'since' => $since, 'until' => $until);
                echo json_encode($r);
                return;
            }

            $start = $gap * ($since / $gap);
            $end = $gap * ($until / $gap);
            $rangeFacet = $textIndex->getRangeFacet('publicationTime', $q, $filters, $gap, $start, $end, $unique);
            foreach($rangeFacet as $bin) {
                if($bin['count'] > 0) {
                    $entry = array('timestamp'=>$bin['field'],
                        'date'=>date($dateFormat, $bin['field']/1000), 'count' => $bin['count']);
                    $tm[] = $entry;
                }
            }
            $memcached->set($requestHash, $tm, time()+61);

            $response = array(
                'timeline' => $tm,
                'collection_query' => $q,
                'filters' => $filters,
                'since' => $since,
                'until' => $until
            );
            echo json_encode($response);
        }
        else {
            echo json_encode(array('error' => "$collectionId does not exist!"));
        }

    }
)->name("timeline");

$app->get(
    '/statistics',
    function () use($mongoDAO, $textIndex, $utils, $app, $memcached) {
        $request = $app->request();
        $s = $request->get('since');
        $u = $request->get('until');
        $since = ($s==null || $s === '') ? '*' : $s;
        $until = ($u==null || $u === '') ? '*' : $u;


        $source = $request->get('source');
        $original = $request->get('original');
        $type = $request->get('type');
        $language = $request->get('language');

        $relevance = $request->get('relevance');
        $user = $request->get('user');

        if ($relevance != null) {
            $relevance = explode(",", $relevance);
        }

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
                $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:null;
                $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:null;
                $keywordsToExclude = isset($collection['keywordsToExclude'])?$collection['keywordsToExclude']:null;
                $nearLocations = isset($collection['nearLocations'])?$collection['nearLocations']:null;

                $judgements = null;
                if ($relevance != null) {
                    $judgements = $mongoDAO->getItemsOfSpecificRelevance($collectionId, $relevance);
                }

                $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query, $user,
                    $itemsToExclude, $usersToExclude, $keywordsToExclude, $judgements, $nearLocations);

                $requestHash = "stats_".$utils->getParametersHash($collectionId, $since, $until, $source, $original,
                        $type, $language, $query, $user, $itemsToExclude, $usersToExclude, $keywordsToExclude,
                        $judgements, $unique);


                $cachedStatistics = $memcached->get($requestHash);
                if($cachedStatistics != false && $cachedStatistics['total'] > 0) {
                    echo json_encode($cachedStatistics);
                    return;
                }

                $statistics = $textIndex->facetedStatistics("likesFacet,sharesFacet,followersFacet,friendsFacet", $q, $filters, $unique, "source");

                $counts = $textIndex->fieldsCount("uidFacet", $q, $filters, $unique, "source");

                $followersMean = $statistics['followersFacet']['mean'];
                $statistics['endorsement'] = $statistics['likesFacet']['sum'];
                $statistics['reach'] = $statistics['followersFacet']['sum'] / ($followersMean > 0 ? $followersMean : 1);
                $statistics['users'] = $counts['uidFacet']['cardinality'];

                $sources = $textIndex->getFacet('source', $q, $filters, -1, false, null, $unique, null, 'enum');
                foreach($sources as &$source) {
                    $field = $source['field'];

                    $source['endorsement'] = $statistics['likesFacet']['facets']['source'][$field]['sum'];
                    $source['reach'] = $statistics['followersFacet']['facets']['source'][$field]['sum'];
                    $source['users'] = $counts['uidFacet']['facets']['source'][$field]['cardinality'];
                }

                $statistics['sources'] = $sources;
                $statistics['query'] = $query;
                $statistics['filters'] = $filters;

                $memcached->set($requestHash, $statistics, time()+61);
            }
        }

        echo json_encode($statistics);

    }
)->name("statistics");

$app->get(
    '/topics/',
    function () use($mongoDAO, $textIndex, $utils, $app, $memcached) {

        $request = $app->request();

        $s = $request->get('since');
        $u = $request->get('until');
        $since = ($s==null || $s === '') ? '*' : $s;
        $until = ($u==null || $u === '') ? '*' : $u;

        $collectionId = $request->get('collection');
        $source = $request->get('source');
        $language = $request->get('language');

        $user = $request->get('user');

        $engine = $request->get('engine');

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

                $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:null;
                $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:null;
                $keywordsToExclude = isset($collection['keywordsToExclude'])?$collection['keywordsToExclude']:null;
                $nearLocations = isset($collection['nearLocations'])?$collection['nearLocations']:null;

                $original = null;
                $type = null;
                $judgements = null;
                $filters = $utils->getFilters($since, $until, $source, $original, $type, $language, $query, $user,
                    $itemsToExclude, $usersToExclude, $keywordsToExclude, $judgements, $nearLocations);

                $count = $textIndex->countItems($collectionQuery, $filters);

                $requestHash = $utils->getParametersHash($collectionId, "*", "*", $source, true, null, $language,
                    $query, $user, $itemsToExclude, $usersToExclude, $keywordsToExclude, null, null, "topics_");

                $cachedTopics = $memcached->get($requestHash);
                if($cachedTopics != false && count($cachedTopics) > 1) {
                    echo json_encode(array("topics"=>$cachedTopics));
                    return;
                }

                $rows_to_be_used = 5000;
                $clusters = $textIndex->getClusters($collectionQuery, $filters, $rows_to_be_used, $engine);
                $topics = $utils->getTopicsFromClusters($clusters, $count, $rows_to_be_used, $collectionQuery, $query,
                    $since, $until, $source, $original, $type, $language, $user,  $itemsToExclude, $usersToExclude,
                    $keywordsToExclude, $judgements, $nearLocations, $textIndex);

                if (count($topics) > 0) {
                    $memcached->set($requestHash, $topics, time() + 301);
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

        $s = $request->get('since');
        $u = $request->get('until');
        $since = ($s==null || $s === '') ? '*' : $s;
        $until = ($u==null || $u === '') ? '*' : $u;

        $collectionId = $request->get('collection');
        $source = $request->get('source');

        $user = $request->get('user');

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
        $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:null;
        $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:null;
        $keywordsToExclude = isset($collection['keywordsToExclude'])?$collection['keywordsToExclude']:null;
        $filters = $utils->getFilters($since, $until, $source, null, null, $language, $query, $user,
            $itemsToExclude, $usersToExclude, $keywordsToExclude);

        if($collectionId != null) {
            $collection = $mongoDAO->getCollection($collectionId);
            if ($collection != null) {
                $collectionQuery = $utils->formulateCollectionQuery($collection);

                $facet = $textIndex->getFacet('tags', $collectionQuery, $filters, 5, false, $query, 'fc');
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

            $cid = $collection['_id'];
            if (is_object($cid)) {
                $cid = $cid->__toString();
                $collection['_id'] = $cid;
            }

            echo json_encode($collection);
            return;
        }

        echo json_encode(array('ownerId' => "", 'collections'=>array(), 'count'=>0));
    }
)->name("get-no-collection");

$app->get(
    '/collections/',
    function() use($mongoDAO, $app) {

        $request = $app->request();
        $status = $request->get("status");

        $collections = $mongoDAO->getCollections(null, null, $status);
        if($collections == null || count($collections) < 1) {
            echo json_encode(array());
            return;
        }


            echo json_encode($collections);

    }
)->name("get-all-collection");

$app->get(
    '/collection/:uid',
    function ($uid) use($mongoDAO, $textIndex, $utils, $app, $redisClient, $memcached) {

        $request = $app->request();
        $cached = $request->get("cached");

		$pageNumber = $request->get("pageNumber")==null ? 1 : (int) $request->get("pageNumber");
        $nPerPage = $request->get("nPerPage")==null ? 6 : (int) $request->get("nPerPage");

        $status = $request->get("status"); // stopped / running

        $query = $request->get("q");

        $c = $mongoDAO->countUserCollections($uid, $status, 'false', $query);

		$userCollections = $mongoDAO->getUserCollections($uid, $status, $pageNumber, $nPerPage, 'false', $query);

        $collections = array();
        foreach($userCollections as &$collection) {
            $cid = $collection['_id'];

            if (is_object($cid)) {
                $cid = $cid->__toString();
                $collection['_id'] = $cid;
            }

            if($cached != "false") {
                $cachedCollection = $memcached->get($cid);
                if ($cachedCollection != false &&
                    (($cachedCollection['items'] > 0 && count($cachedCollection['facet']) > 0)
                    || (time()*1000 - $cachedCollection['creationDate']) > (1 * 3600000))) {
                    $collections[] = $cachedCollection;
                    continue;
                }
            }

            $lastExecution = $redisClient->get($cid);
            if($lastExecution != null) {
                $collection['lastExecution'] = $lastExecution;
            }

            if($collection['status'] != 'stopped') {
                $collection['stopDate'] = 1000 * time();
            }

            if (!array_key_exists('favorite', $collection)) {
                $collection['favorite'] = false;
            }

            $q = $utils->formulateCollectionQuery($collection);

            $collection['query'] = $q;

            $since = $collection['since'];
            $until = $collection['stopDate'];

            $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:null;
            $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:null;
            $keywordsToExclude = isset($collection['keywordsToExclude'])?$collection['keywordsToExclude']:null;
            $nearLocations = isset($collection['nearLocations'])?$collection['nearLocations']:null;


            $filters = $utils->getFilters($since, $until, "all", null, null, null, null, null,
                $itemsToExclude, $usersToExclude, $keywordsToExclude, null, $nearLocations);

            $collection['filters'] = $filters;

            $count = $textIndex->countItems($q, $filters);
            $collection['items'] = $count;

            $filters = $utils->getFilters($since, $until, "all", null, "media", null, null, null,
                $itemsToExclude, $usersToExclude, $keywordsToExclude, null, $nearLocations);

            $facet = $textIndex->getFacet('mediaIds', $q, $filters, 3, false, null, false, null, 'fc');
            $collection['facet'] = $facet;

            $polygons = array();
            if(isset($collection['nearLocations'])) {
                foreach($collection['nearLocations'] as $location) {
                    $polygon = array(
                        'centroid' => $location['name']
                    );

                    if(isset($location['polygon'])) {
                        $peaks = array();
                        foreach ($location['polygon'] as $peak) {
                            $peaks[] = array('lat' => $peak['latitude'], 'long' => $peak['longitude']);
                        }
                        $polygon['peaks'] = $peaks;
                    }
                    $polygons[] = $polygon;
                }

                //unset($collection['nearLocations']);
            }
            $collection['polygons'] = $polygons;
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
            $memcached->set($cid, $collection, time() + 300);
            $collections[] = $collection;
        }

        $userFavCollections = $mongoDAO->getUserCollections($uid, null, null, null, 'true', null);

        $favCollections = array();
        foreach($userFavCollections as &$favCollection) {
            $cid = $favCollection['_id'];

            if (is_object($cid)) {
                $cid = $cid->__toString();
                $favCollection['_id'] = $cid;
            }

            if($cached != "false") {
                $cachedCollection = $memcached->get($cid);
                if ($cachedCollection != false &&
                    (($cachedCollection['items'] > 0 && count($cachedCollection['facet']) > 0)
                        || (time()*1000 - $cachedCollection['creationDate']) > (1 * 3600000))) {
                    $favCollections[] = $cachedCollection;
                    continue;
                }
            }

            $lastExecution = $redisClient->get($cid);
            if($lastExecution != null) {
                $favCollection['lastExecution'] = $lastExecution;
            }

            if($favCollection['status'] != 'stopped') {
                $favCollection['stopDate'] = 1000 * time();
            }

            if (!array_key_exists('favorite', $favCollection)) {
                $favCollection['favorite'] = false;
            }

            $q = $utils->formulateCollectionQuery($favCollection);

            $favCollection['query'] = $q;

            $since = $favCollection['since'];
            $until = $favCollection['stopDate'];

            $itemsToExclude = isset($favCollection['itemsToExclude'])?$favCollection['itemsToExclude']:null;
            $usersToExclude = isset($favCollection['usersToExclude'])?$favCollection['usersToExclude']:null;
            $keywordsToExclude = isset($favCollection['keywordsToExclude'])?$favCollection['keywordsToExclude']:null;
            $nearLocations = isset($favCollection['nearLocations'])?$favCollection['nearLocations']:null;

            $filters = $utils->getFilters($since, $until, "all", null, null, null, null, null,
                $itemsToExclude, $usersToExclude, $keywordsToExclude, null, $nearLocations);

            $favCollection['filters'] = $filters;

            $count = $textIndex->countItems($q, $filters);
            $favCollection['items'] = $count;

            $filters = $utils->getFilters($since, $until, "all", null, "media", null, null, null,
                $itemsToExclude, $usersToExclude, $keywordsToExclude, null, $nearLocations);

            $facet = $textIndex->getFacet('mediaIds', $q, $filters, 3, false, null, false, null, 'fc');
            $favCollection['facet'] = $facet;

            $polygons = array();
            if(isset($favCollection['nearLocations'])) {
                foreach($favCollection['nearLocations'] as $location) {
                    $polygon = array(
                        'centroid' => $location['name']
                    );

                    if(isset($location['polygon'])) {
                        $peaks = array();
                        foreach ($location['polygon'] as $peak) {
                            $peaks[] = array('lat' => $peak['latitude'], 'long' => $peak['longitude']);
                        }
                        $polygon['peaks'] = $peaks;
                    }
                    $polygons[] = $polygon;
                }

                //unset($collection['nearLocations']);
            }
            $favCollection['polygons'] = $polygons;
            if(count($favCollection['facet']) > 0) {
                foreach($favCollection['facet'] as $ft) {
                    $mId = $ft['field'];
                    $mItem = $mongoDAO->getMediaItem($mId);
                    if($mItem != null) {
                        $favCollection['mediaUrl'] = $mItem['url'];
                        break;
                    }
                }
            }

            $memcached->set($cid, $favCollection, time() + 300);
            $favCollections[] = $favCollection;
        }

        $userSharedCollections = $mongoDAO->getUserSharedCollections($uid, null, null, null, null);

        $sharedCollections = array();
        foreach($userSharedCollections as &$sharedCollection) {
            $cid = $sharedCollection['_id'];

            if (is_object($cid)) {
                $cid = $cid->__toString();
                $sharedCollection['_id'] = $cid;
            }

            if($cached != "false") {
                $cachedCollection = $memcached->get($cid);
                if ($cachedCollection != false &&
                    (($cachedCollection['items'] > 0 && count($cachedCollection['facet']) > 0)
                        || (time()*1000 - $cachedCollection['creationDate']) > (1 * 3600000))) {
                    $sharedCollections[] = $cachedCollection;
                    continue;
                }
            }

            $lastExecution = $redisClient->get($cid);
            if($lastExecution != null) {
                $favCollection['lastExecution'] = $lastExecution;
            }

            if($sharedCollection['status'] != 'stopped') {
                $sharedCollection['stopDate'] = 1000 * time();
            }

            if (!array_key_exists('favorite', $sharedCollection)) {
                $sharedCollection['favorite'] = false;
            }

            $q = $utils->formulateCollectionQuery($sharedCollection);

            $sharedCollection['query'] = $q;

            $since = $sharedCollection['since'];
            $until = $sharedCollection['stopDate'];

            $itemsToExclude = isset($sharedCollection['itemsToExclude'])?$sharedCollection['itemsToExclude']:null;
            $usersToExclude = isset($sharedCollection['usersToExclude'])?$sharedCollection['usersToExclude']:null;
            $keywordsToExclude = isset($sharedCollection['keywordsToExclude'])?$sharedCollection['keywordsToExclude']:null;
            $nearLocations = isset($sharedCollection['nearLocations'])?$sharedCollection['nearLocations']:null;

            $filters = $utils->getFilters($since, $until, "all", null, null, null, null, null,
                $itemsToExclude, $usersToExclude, $keywordsToExclude, null, $nearLocations);

            $sharedCollection['filters'] = $filters;

            $count = $textIndex->countItems($q, $filters);
            $sharedCollection['items'] = $count;

            $filters = $utils->getFilters($since, $until, "all", null, "media", null, null, null,
                $itemsToExclude, $usersToExclude, $keywordsToExclude, null, $nearLocations);

            $facet = $textIndex->getFacet('mediaIds', $q, $filters, 3, false, null, false, null, 'fc');
            $sharedCollection['facet'] = $facet;

            $polygons = array();
            if(isset($sharedCollection['nearLocations'])) {
                foreach($sharedCollection['nearLocations'] as $location) {
                    $polygon = array(
                        'centroid' => $location['name']
                    );

                    if(isset($location['polygon'])) {
                        $peaks = array();
                        foreach ($location['polygon'] as $peak) {
                            $peaks[] = array('lat' => $peak['latitude'], 'long' => $peak['longitude']);
                        }
                        $polygon['peaks'] = $peaks;
                    }
                    $polygons[] = $polygon;
                }
            }
            $sharedCollection['polygons'] = $polygons;
            if(count($sharedCollection['facet']) > 0) {
                foreach($sharedCollection['facet'] as $ft) {
                    $mId = $ft['field'];
                    $mItem = $mongoDAO->getMediaItem($mId);
                    if($mItem != null) {
                        $sharedCollection['mediaUrl'] = $mItem['url'];
                        break;
                    }
                }
            }

            $memcached->set($cid, $sharedCollection, time() + 300);
            $sharedCollections[] = $sharedCollection;
        }


        echo json_encode(
            array(
                'ownerId' => $uid,
                'collections'=>$collections,
                'favs'=> $favCollections,
                'shared'=>$sharedCollections,
                'count'=>$c)
        );

    }
)->name("get_user_collections");

$app->post(
    '/collection',
    function () use($app, $mongoDAO, $redisClient, $memcached, $utils) {

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

            if(!isset($collection->favorite)) {
                $collection->favorite = false;
            }

            if(isset($collection->polygons)) {
                $locations = array();
                foreach($collection->polygons as $plg) {
                    $location = array('name'=>$plg->centroid);
                    $lats = array();
                    $longs = array();
                    $polygon = array();
                    foreach($plg->peaks as $peak) {
                        $polygon[] = array('latitude'=>$peak->lat, 'longitude'=>$peak->long);
                        $lats[] = $peak->lat;
                        $longs[] = $peak->long;
                    }

                    $meanLat = array_sum($lats) / count($lats);
                    $meanLong = array_sum($longs) / count($longs);
                    $center =  array('latitude'=>$meanLat, 'longitude'=>$meanLong);

                    if(!isset($location['center'])) {
                      $location['center'] = $center;
                    }

                    if(!isset($location['radius'])) {
                          $maxRadius = 0;
                          foreach($plg->peaks as $peak) {
                            $radius = $utils->distance($location['center']['latitude'],
                                    $location['center']['longitude'], $peak->lat, $peak->long);
                            if($radius > $maxRadius) {
                              $maxRadius = $radius;
                            }
                          }
                          $location['radius'] = round($maxRadius);
                    }

                    $location['polygon'] = $polygon;
                    $locations[] = $location;
                }
                $collection->nearLocations = $locations;

                unset($collection->polygons);
            }

            $mongoDAO->insertCollection($collection);

            $newMessage = json_encode($collection);
            $redisClient->publish("collections:new", $newMessage);

            $memcached->delete($collection->_id);
        }

        echo json_encode($collection);
    }
    )->name("insert_collection");

$app->post(
    '/collection/edit',
    function () use($app, $mongoDAO, $redisClient, $memcached, $utils) {
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

            if(isset($collection->polygons)) {
                $locations = array();
                foreach($collection->polygons as $plg) {
                    $location = array('name' => $plg->centroid);
                    $polygon = array();
                    $lats = array();
                    $longs = array();
                    foreach($plg->peaks as $peak) {
                        $polygon[] = array('latitude'=>$peak->lat, 'longitude'=>$peak->long);

                        $lats[] = $peak->lat;
                        $longs[] = $peak->long;
                    }

                    $meanLat = array_sum($lats) / count($lats);
                    $meanLong = array_sum($longs) / count($longs);
                    $center =  array('latitude'=>$meanLat, 'longitude'=>$meanLong);

                    if(!isset($location['center'])) {
                        $location['center'] = $center;
                    }

                    if(!isset($location['radius'])) {
                        $maxRadius = 0;
                        foreach($plg->peaks as $peak) {
                            $radius = $utils->distance($location['center']['latitude'],
                                $location['center']['longitude'], $peak->lat, $peak->long);
                            if($radius > $maxRadius) {
                                $maxRadius = $radius;
                            }
                        }
                        $location['radius'] = round($maxRadius);
                    }


                    $location['polygon'] = $polygon;
                    $locations[] = $location;
                }
                $collection->nearLocations = $locations;
            }

            $fieldsToUpdate = array(
                'title' => $collection->title,
                'keywords' => $collection->keywords,
                'keywordsToExclude' => $collection->keywordsToExclude,
                'itemsToExclude' => $collection->itemsToExclude,
                'usersToExclude' => $collection->usersToExclude,
                'privacy' => $collection->privacy,
                'accounts' => $collection->accounts,
                'nearLocations' => $collection->nearLocations,
                'status'=>'running',
                'updateDate' => 1000 * time()
            );

            $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

            $editMessage = json_encode($collection);
            $redisClient->publish("collections:edit", $editMessage);

            $memcached->delete($collection->_id);
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

            $memcached->delete($collection->_id);
        }

        echo json_encode($collection);
    }
)->name("edit_collection");

$app->post('/collection/:uid/:cid/favorite',
    function ($uid, $cid) use($app, $mongoDAO, $memcached) {
        $request = $app->request();

        $bodyJson = $request->getBody();
        $body = json_decode($bodyJson);
        $favorite =  $body->favorite;

        if (is_bool($favorite) === false) {
            echo json_encode(array(
                'error' => "Favorite parameter is not boolean. Provide true or false!"
            ));
            return;
        }

        $collection = $mongoDAO->getCollection($cid);

        $ownerId = $collection['ownerId'];
        if ($ownerId !== $uid) {
            echo json_encode(array(
                'error' => "User $uid is not the owner. Owner is $ownerId"
            ));
            return;
        }

        if ($collection['favorite'] === $favorite) {
            echo json_encode(array(
                'error' => "Favorite is already ".$collection['favorite']
            ));
            return;
        }

        $fieldsToUpdate = array('favorite' => $favorite);
        $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

        $memcached->delete($cid);

        echo json_encode($fieldsToUpdate);

    })->name('set_fav');

$app->post(
    '/collection/:cid/excludeKeywords',
    function ($cid) use($app, $mongoDAO) {

        $request = $app->request();

        $bodyJson = $request->getBody();
        $body = json_decode($bodyJson);
        $keywords =  $body->keywords;
        $forceExclude = isset($body->forceExclude) ? $body->forceExclude : false;

        $collection = $mongoDAO->getCollection($cid);
        if($collection != null && count($keywords) > 0) {

            if($forceExclude != true && $forceExclude !== 'true') {
                $inputKeywords = $collection['keywords'];
                $inputKeywords = array_map(function ($keyword) {
                    return trim($keyword['keyword']);
                }, $inputKeywords);

                $notAdded = array_intersect($inputKeywords, $keywords);
                $keywords = array_diff($keywords, $notAdded);
            }

            $keywordsToExclude = isset($collection['keywordsToExclude']) ? $collection['keywordsToExclude'] : array();
            $keywordsToExclude = array_merge($keywords, $keywordsToExclude);
            $keywordsToExclude = array_unique($keywordsToExclude);

            $msg = array(
                'collectionKeywords' => isset($inputKeywords) ? $inputKeywords : [],
                'newKeywordsToExclude' => $keywords,
                'oldKeywordsToExclude' => $keywordsToExclude,
                'notAdded' => isset($notAdded) ? $notAdded : []
            );

            $fieldsToUpdate = array(
                'keywordsToExclude' => $keywordsToExclude,
                'updateDate' => 1000 * time()
            );

            $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

            echo json_encode($msg);
        }
        else {
            echo json_encode(array(
                'error' => $collection == null ? "Collection $cid does not exist." : "No keywords specified"
            ));
        }

    }
)->name('exclude_keywords');

$app->post(
    '/collection/:cid/includeKeywords',
    function ($cid) use($app, $mongoDAO) {

        $request = $app->request();

        $bodyJson = $request->getBody();
        $body = json_decode($bodyJson);

        $keywords =  $body->keywords;
        $collection = $mongoDAO->getCollection($cid);
        if($collection != null && count($keywords) > 0) {

            $keywordsToExclude = isset($collection['keywordsToExclude']) ? $collection['keywordsToExclude'] : array();
            $keywordsToExclude = array_diff($keywordsToExclude, $keywords);
            $msg = array(
                'keywordsToInclude' => $keywords,
                'keywordsToExclude' => $keywordsToExclude
            );

            $fieldsToUpdate = array(
                'keywordsToExclude' => $keywordsToExclude,
                'updateDate' => 1000 * time()
            );

            $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

            echo json_encode($msg);
        }
        else {
            echo json_encode(array(
                'error' => $collection == null ? "Collection $cid does not exist." : "No keywords specified"
            ));
        }

    }
)->name('include_keywords');

$app->post(
    '/collection/:cid/excludeItems',
    function ($cid) use($app, $mongoDAO) {

        $request = $app->request();

        $bodyJson = $request->getBody();
        $body = json_decode($bodyJson);

        $items =  $body->items;

        $collection = $mongoDAO->getCollection($cid);

        if($collection != null && count($items) > 0) {

            $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:array();
            $msg = array(
                'newItemsToExclude' => $items,
                'oldItemsToExclude' => $itemsToExclude
            );

            $itemsToExclude = array_merge($items, $itemsToExclude);
            $itemsToExclude = array_unique($itemsToExclude);

            $fieldsToUpdate = array(
                'itemsToExclude' => $itemsToExclude,
                'updateDate' => 1000 * time()
            );

            $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

            echo json_encode($msg);
        }
        else {
            echo json_encode(array(
                'error' => $collection == null ? "Collection $cid does not exist." : "No items specified"
            ));
        }

    }
)->name('exclude_items');

$app->post(
    '/collection/:cid/includeItems',
    function ($cid) use($app, $mongoDAO) {

        $request = $app->request();

        $bodyJson = $request->getBody();
        $body = json_decode($bodyJson);

        $items =  $body->items;
        $collection = $mongoDAO->getCollection($cid);

        if($collection != null && count($items) > 0) {

            $itemsToExclude = isset($collection['itemsToExclude'])?$collection['itemsToExclude']:array();
            $msg = array(
                'itemsToInclude' => $items,
                'itemsToExclude' => $itemsToExclude
            );

            $itemsToExclude = array_diff($itemsToExclude, $items);

            $fieldsToUpdate = array(
                'itemsToExclude' => $itemsToExclude,
                'updateDate' => 1000 * time()
            );

            $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

            echo json_encode($msg);
        }
        else {
            echo json_encode(array(
                'error' => $collection == null ? "Collection $cid does not exist." : "No items specified"
            ));
        }

    }
)->name('include_items');

$app->post(
    '/collection/:cid/excludeUsers',
    function ($cid) use($app, $mongoDAO) {

        $request = $app->request();

        $bodyJson = $request->getBody();
        $body = json_decode($bodyJson);

        $users =  $body->users;
        $forceExclude = isset($body->forceExclude) ? $body->forceExclude : false;

        $collection = $mongoDAO->getCollection($cid);

        if($collection != null && count($users) > 0) {

            if($forceExclude != true && $forceExclude !== 'true') {
                $inputUsers = $collection['accounts'];
                $inputUsers = array_map(function ($account) { return $account['source'] . "#" . $account['id']; }, $inputUsers);

                $notAdded = array_intersect($inputUsers, $users);
                $users = array_diff($users, $notAdded);
            }

            $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:array();
            $msg = array(
                'collectionUsers' => isset($inputUsers) ? $inputUsers : [],
                'newUsersToExclude' => $users,
                'oldUsersToExclude' => $usersToExclude,
                'notAdded' => isset($notAdded) ? $notAdded : []
            );

            $usersToExclude = array_merge($users, $usersToExclude);
            $usersToExclude = array_unique($usersToExclude);

            $fieldsToUpdate = array(
                'usersToExclude' => $usersToExclude,
                'updateDate' => 1000 * time()
            );
            $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

            echo json_encode($msg);
        }
        else {
            echo json_encode(array(
                'error' => $collection == null ? "Collection $cid does not exist." : "No users specified!"
            ));
        }

    }
)->name('exclude_users');

$app->post(
    '/collection/:cid/includeUsers',
    function ($cid) use($app, $mongoDAO) {

        $request = $app->request();

        $bodyJson = $request->getBody();
        $body = json_decode($bodyJson);

        $users =  $body->users;
        $collection = $mongoDAO->getCollection($cid);

        if($collection != null && count($users) >= 0) {

            $usersToExclude = isset($collection['usersToExclude'])?$collection['usersToExclude']:array();
            $msg = array(
                'usersToInclude' => $users,
                'usersToExclude' => $usersToExclude
            );

            $usersToExclude = array_diff($usersToExclude, $users);

            $fieldsToUpdate = array(
                'usersToExclude' => $usersToExclude,
                'updateDate' => 1000 * time()
            );
            $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

            echo json_encode($msg);
        }
        else {
            echo json_encode(array(
                'error' => $collection == null ? "Collection $cid does not exist." : "No users specified!"
            ));
        }

    }
)->name('include_users');

$app->get(
    '/collection/start/:cid',
    function ($cid) use($app, $mongoDAO, $redisClient, $memcached) {

        $collection = $mongoDAO->getCollection($cid);
        if($collection != null) {
            $ops = array('status' => 'running', 'updateDate' => 1000 * time(), 'stopDate' => null);
            $mongoDAO->updateCollectionFields($cid, $ops);

            $startMessage = json_encode($collection);
            $redisClient->publish("collections:new", $startMessage);

            $memcached->delete($cid);
        }

        echo json_encode($collection);
    }
)->name("start_collection");

$app->get(
    '/collection/stop/:cid',
    function ($cid) use($app, $mongoDAO, $redisClient, $memcached) {

        $collection = $mongoDAO->getCollection($cid);
        if($collection != null) {
            $ops = array('status' => 'stopped', 'updateDate' => 1000 * time(), 'stopDate' => 1000 * time());
            $mongoDAO->updateCollectionFields($cid, $ops);
            $stopMessage = json_encode($collection);
            $redisClient->publish("collections:stop", $stopMessage);

            $memcached->delete($cid);
        }
        echo json_encode($collection);
    }
)->name("stop_collection");

$app->get(
    '/collection/delete/:cid',
    function ($cid) use($app, $mongoDAO, $redisClient, $memcached) {
        $collection = $mongoDAO->getCollection($cid);
        if($collection != null) {
            $mongoDAO->deleteCollection($cid);
            $deleteMessage = json_encode($collection);
            $redisClient->publish("collections:delete", $deleteMessage);

            $memcached->delete($cid);
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

        $polygons = array();
        if(isset($collection['nearLocations'])) {
            foreach($collection['nearLocations'] as $location) {
                $polygon = array(
                    'centroid' => $location['name']
                );

                if(isset($location['polygon'])) {
                    $peaks = array();
                    foreach ($location['polygon'] as $peak) {
                        $peaks[] = array('lat' => $peak['latitude'], 'long' => $peak['longitude']);
                    }
                    $polygon['peaks'] = $peaks;
                }
                $polygons[] = $polygon;
            }
            //unset($collection['nearLocations']);
        }
        $collection['polygons'] = $polygons;

        echo json_encode($collection);
    }
)->name("get_collection");

$app->post('/collection/:uid/:cid/move_to_user/:new_uid',
    function ($uid, $cid, $new_uid) use($mongoDAO, $redisClient, $memcached) {
        $collection_to_copy = $mongoDAO->getCollection($cid);
        if($collection_to_copy == null) {
            echo json_encode(array('error'=>"Collection $cid does not exist"));
            return;
        }
        if($collection_to_copy['ownerId'] != $uid) {
            echo json_encode(array('error'=>"User $uid is not the owner. Only the owner can copy a collection"));
            return;
        }

        $t = 1000 * time();
        $fieldsToUpdate = array('updateDate' => $t, 'ownerId' => $new_uid, 'favorite' => false);
        $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

        $collection = $mongoDAO->getCollection($cid);

        if($collection['ownerId'] != $new_uid || $collection['ownerId'] == $uid) {
            echo json_encode(array('error'=>"Owner id has not changed"));
            return;
        }

        $memcached->set($cid, $collection, time() + 300);
        echo json_encode($collection);
    }
)->name("move_collection");

$app->post('/collection/:uid/:cid/replicate/:new_cid',
    function ($uid, $cid, $new_cid) use($mongoDAO, $redisClient, $memcached) {
        $collection_to_copy = $mongoDAO->getCollection($cid);
        if($collection_to_copy == null) {
            echo json_encode(array('error'=>"Collection $cid does not exist"));
            return;
        }

        if($collection_to_copy['ownerId'] != $uid) {
            echo json_encode(array('error'=>"User $uid is not the owner. Only the owner can replicate a collection"));
            return;
        }

        $collection_to_copy['copiedFrom'] = $collection_to_copy['_id'];
        $collection_to_copy['title'] = 'copy of ' . $collection_to_copy['title'];
        $collection_to_copy['_id'] = $new_cid;

        $t = 1000 * time();
        $collection_to_copy['creationDate'] = $t;
        $collection_to_copy['updateDate'] = $t;

        $mongoDAO->insertCollection($collection_to_copy);
        $memcached->delete($collection_to_copy['_id']);

        if ($collection_to_copy->status === 'running') {
            $newMessage = json_encode($collection_to_copy);
            $redisClient->publish("collections:new", $newMessage);
        }

        echo json_encode($collection_to_copy);

    }
)->name("replicate_collection");

$app->post('/collection/:uid/:cid/share',
    function ($uid, $cid) use($mongoDAO, $memcached, $app) {

        $request = $app->request();
        $bodyJson = $request->getBody();
        $viewers = json_decode($bodyJson);

        if ($viewers == null || !is_array($viewers) || count($viewers) == 0) {
            echo json_encode(array('error'=>"No users to share"));
            return;
        }

        $collection = $mongoDAO->getCollection($cid);
        if($collection == null) {
            echo json_encode(array('error'=>"Collection $cid does not exist"));
            return;
        }

        if($collection['ownerId'] != $uid) {
            echo json_encode(array('error'=>"User $uid is not the owner. Only the owner can share a collection"));
            return;
        }

        if (in_array('viewers', $collection) && $collection['viewers'] != null && is_array($collection['viewers'])) {
            $viewers = array_merge($viewers, $collection['viewers']);
        }

        $viewers = array_diff($viewers, [""]);

        $t = 1000 * time();
        $fieldsToUpdate = array('updateDate' => $t, 'viewers' => $viewers);
        $mongoDAO->updateCollectionFields($cid, $fieldsToUpdate);

        $collection = $mongoDAO->getCollection($cid);
        $memcached->delete($cid);
        echo json_encode($collection);

    }
)->name('share_collection');

$app->get('/owners',
    function() use($mongoDAO) {
        $owners = $mongoDAO->getOwners();

        echo json_encode(array('owners' => $owners));
    }
)->name('get_owners');

$app->get(
    '/relevance/:cid',
    function($cid) use ($mongoDAO, $app) {
        $response = array();

        $judgements = $mongoDAO->getRelevanceJudgements($cid);
        foreach ($judgements as $judgement) {
            $iid = $judgement['iid'];
            $item = $mongoDAO->getItem($iid);
            if($item != null) {
                $item['relevance'] = $judgement['relevance'];
                $item['user_id'] = $judgement['uid'];

                $response[] = $item;
            }
        }

        echo json_encode(array('judgements' => $response));
    }
)->name('collection_relevance_judgments');

$app->get(
    '/relevance/user/:uid/:cid',
    function($uid, $cid) use ($mongoDAO, $app) {
        $judgements = $mongoDAO->getUserRelevanceJudgements($uid, $cid);

        echo json_encode($judgements);
    }
)->name('user_relevance_judgments');

$app->get(
    '/relevance/:cid/:iid',
    function($cid, $iid) use ($mongoDAO, $app) {
        $judgements = $mongoDAO->getRelevanceJudgements($cid, $iid);

        echo json_encode($judgements);
    }
)->name('item_relevance_judgments');

$app->post(
    '/relevance',
    function() use ($mongoDAO, $app) {
        $request = $app->request();

        $bodyJson = $request->getBody();
        $body = json_decode($bodyJson);

        $uid = $body->uid;                // user id
        $cid = $body->cid;                // collection id
        $iid = $body->iid;                // item id
        $relevance = $body->relevance;    // relevance judgment [1(not relevant) - 5(relevant)]

        if(!$mongoDAO->collectionExists($cid)) {
            echo json_encode(array('msg' => "Collection $cid does not exist."));
            return;
        }

        if(!$mongoDAO->itemExists($iid)) {
            echo json_encode(array('msg' => "Item $iid does not exist."));
            return;
        }

        if($relevance <= 5 && $relevance >= 1) {
            $response = $mongoDAO->insertRelevanceJudgement($uid, $cid, $iid, $relevance);
            echo json_encode(
                array(
                    'msg' => "Relevance judgement $relevance for $iid in collection $cid inserted from user $uid",
                    'response' => $response
                )
            );
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
    function() use ($smWrapper, $app, $memcached) {

        $request = $app->request();
        $q = $request->get('q');
        $source = $request->get('source');

        $searchId = "$source#$q";
        $cachedUsers = $memcached->get($searchId);
        if($cachedUsers != false && count($cachedUsers) > 0) {
            echo json_encode($cachedUsers);
            return;
        }

        $users = $smWrapper->search($q, $source);
        $memcached->set($searchId, $users, time() + 300);

        echo json_encode($users);
    }
)->name("user_search");

$app->get('/terms/vectors',
    function() use ($app, $textIndex) {

        $request = $app->request();

        $q = $request->get('q');
        $pageNumber = $request->get("pageNumber")==null ? 1 : (int) $request->get("pageNumber");
        $nPerPage = $request->get("nPerPage")==null ? 20 : (int) $request->get("nPerPage");

        $tv = $textIndex->getTermVectors($q, $pageNumber, $nPerPage);

        echo json_encode(array("query"=>$q, "vectors"=>$tv));
    }
)->name("term_vectors");

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
 *  GET /rss/validate
 *
 *  Fetches an RSS feed and validates it
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
            $channel = isset($xml->channel) ? $xml->channel : $xml;

            $title = (string) $channel->title;

            $source = array(
                'id' => hash('sha256', $rssLink),
                'username' => $rssLink,
                'name' => ($title==null || $title=="") ? $host : "$title ($host)",
                'description' => ((string) $channel->description),
                'domain' => $host,
                'source' => 'RSS'
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
