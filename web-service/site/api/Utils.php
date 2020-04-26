<?php
/**
 * Created by PhpStorm.
 * User: manosetro
 * Date: 11/23/15
 * Time: 12:40 PM
 */

class Utils {

    /** Checks whether the query is a logical expression *
     * @param $q
     * @return bool
     */
    public function isLogicalExpression($q) {
        return preg_match('/AND/',$q) || preg_match('/OR/',$q) || preg_match('/NOT/',$q);
    }

    public function isNegativeLogicalExpression($q) {
        return preg_match('/^NOT/',$q);
    }

    public function formulateLogicalQuery($keywords, $glue='AND') {

        $queryParts = array();
        foreach($keywords as $keyword) {
            if($this->isLogicalExpression($keyword) && !$this->isNegativeLogicalExpression($keyword)) {
                $queryParts[] =  "($keyword)";
            }
            else {
                $keyword = trim($keyword);
                if (preg_match('/\".+\"/m', $keyword)) {
                    $queryParts[] = $keyword;
                }
                else {
                    $keyword = preg_split("/\s+/", $keyword);
                    if (count($keyword) > 1) {
                        $queryParts[] = '(' . implode(' AND ', $keyword) . ')';
                    } else {
                        $queryParts[] = implode(' AND ', $keyword);
                    }
                }
            }
        }

        return implode(" $glue ", $queryParts);
    }

    public function formulateCollectionQuery($collection) {

        $keywords = $collection['keywords'];
        $keywords = array_map(function ($keyword) {
            return  trim($keyword['keyword']);
        }, $keywords);

        // hash tags
        $tags = array_filter($keywords, function ($keyword) {
            return preg_match('/^#/', $keyword);
        });

        $tags = array_map(function ($tag) {
            return  str_replace("#", "", $tag);
        }, $tags);

        // keywords for free text search
        $keywords = array_filter($keywords, function ($keyword) {
            return !preg_match('/^#/', $keyword);
        });

        //$keywords = array_keys($keywords);
        $textQuery = $this->formulateLogicalQuery($keywords, 'OR');
        $tagsQuery = $this->formulateLogicalQuery($tags, 'OR');

        // excluded keywords
        if(isset($collection['keywordsToExclude'])) {
            $keywordsToExclude = $collection['keywordsToExclude'];
            if ($keywordsToExclude != null && count($keywordsToExclude) > 0) {
                $excludedTermsQuery = $this->formulateLogicalQuery($keywordsToExclude, 'OR');

                $textQuery = $textQuery . " NOT (" . $excludedTermsQuery . ")";
                $tagsQuery = $tagsQuery . " NOT (" . $excludedTermsQuery . ")";
            }
        }

        $notParts = array();
        foreach($keywords as $keyword) {
            if ($this->isNegativeLogicalExpression($keyword)) {
                $keyword = preg_replace('/^NOT/', '', $keyword);
                $notParts[] = "($keyword)";
            }
        }

        if(count($notParts) > 0) {
            $textQuery = $textQuery . ' NOT (' . implode(" OR ", $notParts) . ')';
        }

        // user accounts to follow
        $accounts = $collection['accounts'];
        $users = array_map(function ($account) {
            return $account['source']."#".$account['id'];
        }, $accounts);

        $query = array();
        if($textQuery != null && $textQuery !== '') {
            $query[] = "title:($textQuery) OR description:($textQuery)";
        }

        if($tagsQuery != null && $tagsQuery !== '') {
            $query[] = "tags:($tagsQuery)^2";
        }

        if($users != null && count($users) > 0) {
            $usersQuery = implode(' OR ', $users);
            $query[] = "uid:($usersQuery)";
        }

        return implode(' OR ', $query);
    }

    public function getFilters($since, $until, $source, $original, $type, $language, $query, $user,
                               $itemsToExclude, $usersToExclude, $keywordsToExclude, $judgements=null,
                               $nearLocations=null) {

        // Add filters if available
        $filters = array();

        // filter by query
        if ($query != null && $query != '') {
            $query = urldecode($query);
            if (preg_match('/^\".+\"$/m', $query)) {
                $filters['{!cache=false}allText'] = $query;
            }
            else {
                if($this->isLogicalExpression($query)) {
                    $filters['{!cache=false}allText'] = $query;
                }
                else {
                    $keywords = explode(',', $query);
                    $filterTextQuery = $this->formulateLogicalQuery($keywords, 'AND');

                    // Do not cache it
                    $filters['{!cache=false}allText'] = $filterTextQuery;
                }
            }
        }


        //filter by source
        if($source != null) {
            if($source !== 'all') {
                $sources = explode(',', $source);
                if(count($sources) > 0 && count($sources) < 6) {
                    $sources = implode(' OR ', $sources);
                    $filters['source'] = "$sources";
                }
            }
        }
        else {
            $filters['-source'] = "*";
        }

        if($user != null) {
            $filters["username"] = "$user*";
        }

        if($original != null) {
            if($original === 'original') {
                $filters['original'] = 'true';
            }
            if($original === 'share') {
                $filters['original'] = 'false';
            }
        }

        //filter by type
        if($type != null) {
            if($type === 'media') {
                $filters['mediaIds'] = "*";
            }
            if($type === 'text') {
                $filters['-mediaIds'] = "*";
            }
        }

        //filter by language
        if($language != null && $language !== '' && $language !== 'all' && $language !== 'All') {
            $languages = explode(',', $language);
            $languages = implode(' OR ', $languages);
            $filters['language'] = "($languages)";
        }

        // filter by publication time
        if($since !== '*' && $until !== '*') {
            // publication time filter query is rare as changes over time. Do not cache it
            $filters['{!cache=false}publicationTime'] = "[$since TO $until]";
        }


        if ($itemsToExclude != null && count($itemsToExclude) > 0) {
            $itemsToExclude = array_filter($itemsToExclude, function($item) { return $item != null; });
            $idsToExclude = implode(' OR ', $itemsToExclude);
            #$idsToExclude = urlencode($idsToExclude);
            if($idsToExclude != null) {
                $filters["-id"] = "($idsToExclude)";
                $filters["-reference"] = "($idsToExclude)";
            }
        }


        if ($usersToExclude != null && count($usersToExclude) > 0) {
            $usersToExclude = array_filter($usersToExclude, function($user) { return $user != null; });
            $q = implode(' OR ', $usersToExclude);
            if($q != null) {
                $filters["-uid"] = "($q)";
            }
        }

        if ($keywordsToExclude != null && count($keywordsToExclude) > 0) {
            $keywordsToExclude = array_filter($keywordsToExclude, function($keyword) { return $keyword != null; });
            $q = implode(' OR ', $keywordsToExclude);
            if($q != null) {
                $filters["-allText"] = "($q)";
            }
        }

        if ($nearLocations != null && count($nearLocations) > 0) {
            foreach($nearLocations as $nearLocation) {
                $filters['geofilters'][] = array('latitude'=>$nearLocation['center']['latitude'],
                    'longitude'=>$nearLocation['center']['longitude'], 'radius'=>$nearLocation['radius']);
            }
        }

        if($judgements != null && count($judgements) > 0) {
            $ids_of_rj = array_map(function($rj) { return $rj['iid'];}, $judgements);
            $ids_of_rj = implode(' OR ', $ids_of_rj);
            if($ids_of_rj != null) {
                if ($filters == null) {
                    $filters = array();
                }
                $filters["id"] = "($ids_of_rj)";
            }
        }

        return $filters;
    }

    public function getParametersHash($cid, $since, $until, $source, $original, $type, $language, $query, $user,
                                      $itemsToExclude, $usersToExclude, $keywordsToExclude,
                                      $judgements, $unique, $prefix='') {

        $data = $this->getFilters($since, $until, $source, $original, $type, $language, $query, $user,
            $itemsToExclude, $usersToExclude, $keywordsToExclude, $judgements);
        $data['unique'] = $unique;

        $input_str = json_encode($data);

        return $prefix . $cid . "_" . sha1($input_str);
    }

    public static function expandQuery($judgements, $query, TextIndex $index) {

        $positive = array_filter($judgements, function($rj) { return ($rj['relevance'] >= 3); });
        $negative = array_filter($judgements, function($rj) { return ($rj['relevance'] < 3); });

        $positiveIds = array_map(function($entry) { return $entry['iid']; }, $positive);
        $negativeIds = array_map(function($entry) { return $entry['iid']; }, $negative);

        // get scores of positive items for the collection and the corresponding term vectors
        if(count($positiveIds) > 0) {
            $positiveQuery = implode(' OR ', $positiveIds);
            $positiveTVs = $index->getTermVectors("id:($positiveQuery)", 1, count($positiveIds));
            $positiveItems = $index->searchItems($query, 1, count($positiveIds), array('id' => $positiveQuery));
        }

        // get scores of negative items for the collection and the corresponding term vectors
        if(count($negativeIds) > 0) {
            $negativeQuery = implode(' OR', $negativeIds);
            $negativeTVs = $index->getTermVectors("id:($negativeQuery)", 1, count($negativeIds));
            $negativeItems = $index->searchItems($query, 1, count($negativeIds), array('id' => $negativeQuery));
        }

        // estimate positive and negative relevance models aggregated by each of the relevance judgements
        $positiveFeatureVector = array();
        if($positiveTVs != null && $positiveItems != null) {
            $positiveFeatureVector = Utils::estimateRelevanceModel($positiveTVs, $positiveItems);
        }

        $negativeFeatureVector = array();
        if($negativeTVs != null && $negativeItems != null) {
            $negativeFeatureVector = Utils::estimateRelevanceModel($negativeTVs, $negativeItems);
        }

        // todo: prune feature vectors
        // todo: expanded create query from feature vectors
        $query = urldecode($query);
        $queryTerms = explode(',', $query);

        $query = Utils::interpolate($queryTerms, $positiveFeatureVector, 0.8);

        return $query;

        // For negative boosting: boost documents that do not contain term zzz with a factor w3
        // q = xxx^w1 yyy^w2 (*:* -zzz)^w3  w3 >> w1, w2
    }

    public function estimateRelevanceModel($tvs, $items) {

        $featureVector = array();

        //$scores = array_map(function($item) { return array($item['id'] => $item['score']); }, $items['docs']);
        $scores = array();
        foreach($items['docs'] as $item) {
            $scores[$item['id']] = $item['score'];
        }

        $vocabulary = array();
        foreach($tvs as $tv) {
            $vocabulary = array_merge($vocabulary, array_keys($tv['vector']));
        }
        $vocabulary = array_unique($vocabulary);

        foreach($vocabulary as $term) {
            $weight = .0;
            foreach($tvs as $tv) {
                $iid = $tv['id'];
                $vector = $tv['vector'];
                $norm = $tv['norm'];
                if(isset($vector[$term]) && isset($scores[$iid])) {
                    // doc_score * (tf_idf) / sum(tf_idf)
                    $weight += ($scores[$iid] * ($vector[$term] / $norm));
                }
            }
            $featureVector[$term] = $weight;
        }

        return $featureVector;
    }

    public static function interpolate($x, $y, $xWeight) {

        $z = array();

        $vocabulary = array();
        $vocabulary = array_merge($vocabulary, array_keys($x));
        $vocabulary = array_merge($vocabulary, array_keys($y));
        $vocabulary = array_unique($vocabulary);

        foreach($vocabulary as $term) {
            $xw = isset($x[$term]) ? $x[$term] : .0;
            $yw = isset($y[$term]) ? $y[$term] : .0;

            $weight = ($xWeight*$xw + (1.0-$xWeight)*$yw);
            $z[$term] = $weight;
        }

        return $z;
    }


    public static function distance($latitude1, $longitude1, $latitude2, $longitude2) {
        $earth_radius = 6371;

        $dLat = deg2rad($latitude2 - $latitude1);  
        $dLon = deg2rad($longitude2 - $longitude1);

        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($latitude1)) * cos(deg2rad($latitude2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * asin(sqrt($a));
        $d = $earth_radius * $c;

        return $d;
    }

    public function getTopicsFromClusters($clusters, $count, $item_rows, $collectionQuery, $query, $since, $until,
                                          $source, $original, $type, $language, $user,
                                          $itemsToExclude, $usersToExclude, $keywordsToExclude,
                                          $judgements, $nearLocations, $textIndex) {

        $topics[] = array('label' => 'All', 'query' => '*', 'score' => 1, 'items' => $count);
        foreach($clusters as $cluster) {
            if($cluster['score'] > 0 && count($cluster['docs']) >= 15) {

                $topicQuery = implode(',',$cluster['labels']);
                $topic = array(
                    'label' => $cluster['labels'][0],
                    'query' => $topicQuery,
                    'score' => $cluster['score'],
                    'docs_count' => round((count($cluster['docs']) / $item_rows) * $count),
                    'docs' => $cluster['docs']
                );

                if($topicQuery != '*') {
                    $topicQuery = ($query == null) ? $topicQuery : $query . ' ' . $topicQuery;

                    $topicFilters = $this->getFilters($since, $until, $source, $original, $type, $language,
                        $topicQuery, $user, $itemsToExclude, $usersToExclude, $keywordsToExclude, $judgements,
                        $nearLocations);

                    $topicCount = $textIndex->countItems($collectionQuery, $topicFilters);
                    $topic['items'] = $topicCount;
                }

                $topics[] = $topic;
            }
        }

        return $topics;
    }
}
