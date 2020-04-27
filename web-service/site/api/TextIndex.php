<?php
/**
 * Created by PhpStorm.
 * User: Manos Schinas
 * Date: 11/19/15
 * Time: 6:59 PM
 */

class TextIndex {
    function __construct($host, $collection, $port=8983) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        $config = array(
            'endpoint' => array(
                'items' => array(
                    'host' => $host,
                    'port' => $port,
                    'path' => "/solr/$collection"
                )
            )
        );

        $this->client = new Solarium\Client($config);
    }

    public function getAllItemIds($q, $filters=null, $unique=false) {

        $query = $this->client->createSelect();

        if($filters != null && isset($filters['geofilters'])) {
            $helper = $query->getHelper();
            $geoParts = array();
            foreach($filters['geofilters'] as $geo) {
                $geoFilterPart = $helper->geofilt('latlonRPT', $geo['latitude'], $geo['longitude'], $geo['radius']);
                $geoParts[] = "latlonRPT:$geoFilterPart";
            }
            if($q != null &&  $q !== '') {
                $q = $q . ' OR (' . implode(' OR ', $geoParts) . ')';
            }
            else {
                $q = implode(' OR ', $geoParts);
            }
            unset($filters['geofilters']);
        }
        if($q != null) {
            $query->setQuery($q);
        }

        if($unique === 'true' OR $unique === true) {
            $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash min=publicationTime}");
        }
        $query->addSort('publicationTimeFacet', Solarium\QueryType\Select\Query\Query::SORT_DESC);

        // filters
        if($filters != null) {
            foreach($filters as $filterKey=>$filterValue) {
                $query->createFilterQuery($filterKey)->setQuery("$filterKey:($filterValue)");
            }
        }
        $query->setFields(['id']);

        $pageNumber = 1;
        $nPerPage = 5000;
        $offset = ($pageNumber - 1) * $nPerPage;

        $docsFound = array();
        do {
            $query->setStart($offset);
            $query->setRows($nPerPage);
            try {
                $resultSet = $this->client->execute($query);
                $numFound = $resultSet->getNumFound();
                foreach ($resultSet as $document) {
                    $docsFound[] = $document['id'];
                }
                $pageNumber += 1;
                $offset = ($pageNumber - 1) * $nPerPage;
            }
            catch(Exception $e) {
                break;
            }
        } while($offset < $numFound && $pageNumber < 100);

        return $docsFound;
    }

    public function searchItems($q, $pageNumber=1, $nPerPage=20, $filters=null, $sort=null, $unique=false, $hlq=null) {
        $query = $this->client->createSelect();

        if($filters != null && isset($filters['geofilters'])) {
            $helper = $query->getHelper();
            $geoParts = array();
            foreach($filters['geofilters'] as $geo) {
                $geoFilterPart = $helper->geofilt('latlonRPT', $geo['latitude'], $geo['longitude'], $geo['radius']);
                $geoParts[] = "latlonRPT:$geoFilterPart";
            }
            if($q != null &&  $q !== '') {
                $q = $q . ' OR (' . implode(' OR ', $geoParts) . ')';
            }
            else {
                $q = implode(' OR ', $geoParts);
            }
            unset($filters['geofilters']);
        }

        if($q != null) {
            $query->setQuery($q);
        }

        // to be used
        //$helper = $query->getHelper();

        $hlUsed = false;
        if($hlq != null) {
            $hl = $query->getHighlighting();
            $hl->setFields(array('title'));
            $hl->setSimplePrefix('<span class="highlight">');
            $hl->setSimplePostfix('</span>');
            $hl->setQuery("title:($hlq) OR allText:($hlq)");
            $hl->setFragSize(0);
            $hl->setMaxAnalyzedChars(1500);
            $hlUsed = true;
        }

        if($unique === 'true' OR $unique === true) {
            $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash min=publicationTime}");
        }

        // sort by
        if($sort != null && $sort != 'recency') {
            if($sort === 'relevance') {
                $query->addSort('score', Solarium\QueryType\Select\Query\Query::SORT_DESC);
                $query->addSort('sum(product(0.7,likesFacet),product(0.3,sharesFacet))', Solarium\QueryType\Select\Query\Query::SORT_DESC);
            }
            else if($sort === 'popularity') {
                $query->addSort('sum(product(0.7,likesFacet),product(0.3,sharesFacet))', Solarium\QueryType\Select\Query\Query::SORT_DESC);
                $query->addSort('publicationTimeFacet', Solarium\QueryType\Select\Query\Query::SORT_DESC);
            }
            else if($sort === 'user') {
                $query->addSort('username', Solarium\QueryType\Select\Query\Query::SORT_ASC);
                $query->addSort('publicationTimeFacet', Solarium\QueryType\Select\Query\Query::SORT_DESC);
            }
            else {
                $query->addSort('publicationTimeFacet', Solarium\QueryType\Select\Query\Query::SORT_DESC);
            }
        }
        else {
            $query->addSort('publicationTimeFacet', Solarium\QueryType\Select\Query\Query::SORT_DESC);
        }

        // filters
        if($filters != null) {
            foreach($filters as $filterKey=>$filterValue) {
                $query->createFilterQuery($filterKey)->setQuery("$filterKey:($filterValue)");
            }
        }

        // paging
        $query->setStart(($pageNumber-1)*$nPerPage);
        $query->setRows($nPerPage);

        $query->setFields(['id', 'score', 'minhash', 'cleanTitle', 'title',
            'uidFacet', 'publicationTimeFacet', 'language_s', 'commentsFacet',
            'tags', 'likesFacet', 'sharesFacet']);

        $numFound = 0;
        $docsFound = array();
        try {
            $resultSet = $this->client->execute($query);
            $highlighting = $resultSet->getHighlighting();
            $numFound = $resultSet->getNumFound();

            $maxScore = $resultSet->getMaxScore();
            if($maxScore == null || $maxScore == 0) {
                $maxScore = 1;
            }

            foreach ($resultSet as $document) {
                $doc = array(
                    'id' => $document['id'],
                    'score' => $document['score'],
                    'normalizedScore' => $document['score'] / $maxScore,
                    'minhash' => $document['minhash'],
                    'cleanTitle' => $document['cleanTitle'],
                    'title' => $document['title'],
                    'uid' => $document['uidFacet'],
                    'publicationTime' => $document['publicationTimeFacet'],
                    'language' => $document['language_s'],
                    'comments' => $document['commentsFacet'],
                    'tags' => $document['tags'],
                    'likes' => $document['likesFacet'],
                    'shares' => $document['sharesFacet'],
                    'views' => 0
                );

                if($hlUsed) {
                    $highlightedDoc = $highlighting->getResult($document['id']);
                    if ($highlightedDoc) {
                        $title_hl = $highlightedDoc->getField('title');
                        if ($title_hl != null && count($title_hl) > 0) {
                            $doc['title_hl'] = $title_hl[0];
                        }
                    }
                }

                $docsFound[] = $doc;
            }
        }
        catch(Exception $e) {

        }


        return array(
            'docs' => $docsFound,
            'numFound'=>$numFound
        );
    }

    public function getSummary($q, $length, $filters=null) {

        $query = $this->client->createSelect();

        if($q != null) {
            $query->setQuery($q);
        }

        $query->addSort('score', Solarium\QueryType\Select\Query\Query::SORT_DESC);
        $query->addSort('sum(product(0.7,likes),product(0.3,shares))', Solarium\QueryType\Select\Query\Query::SORT_DESC);

        // filters
        if($filters != null) {
            foreach($filters as $filterKey=>$filterValue) {
                $query->createFilterQuery($filterKey)->setQuery("$filterKey:($filterValue)");
            }
        }
        $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash min=publicationTime}");
        $query->addParam("expand", true);
        $query->addParam("expand.rows", $length);

        $query->setRows($length);
        $query->setFields(['id', 'score', 'minhash']);

        $ids = array();
        try {
            $resultSet = $this->client->execute($query);
            foreach ($resultSet as $document) {
                $doc = array(
                    'id' => $document['id'],
                    'score' => $document['score'],
                    'minhash' => $document['minhash']
                );
                $ids[] = $doc;
            }
        }
        catch(Exception $e) {
            return $e->getMessage();
        }

        return $ids;
    }

    public function countItems($q, $filters=null, $unique=false) {
        $query = $this->client->createSelect();

        if($filters != null && isset($filters['geofilters'])) {
            $helper = $query->getHelper();
            $geoParts = array();
            foreach($filters['geofilters'] as $geo) {
                $geoFilterPart = $helper->geofilt('latlonRPT', $geo['latitude'], $geo['longitude'], $geo['radius']);
                $geoParts[] = "latlonRPT:$geoFilterPart";
            }
            if($q != null &&  $q !== '') {
                $q = $q . ' OR (' . implode(' OR ', $geoParts) . ')';
            }
            else {
                $q = implode(' OR ', $geoParts);
            }
            unset($filters['geofilters']);
        }

        if($query != null) {
            $query->setQuery($q);
        }

        if($filters != null) {
            foreach($filters as $filterKey=>$filterValue) {
                $query->createFilterQuery($filterKey)->setQuery("$filterKey:($filterValue)");
            }
        }

        if($unique) {
            $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash min=publicationTime}");
        }

        $count = 0;
        try {
            $resultSet = $this->client->execute($query);
            $count = $resultSet->getNumFound();
        }
        catch(Exception $e) {}

        return $count;
    }

    public function statistics($fields, $q, $filters=null, $unique=false) {
        $query = $this->client->createSelect();
        if($query != null) {
            $query->setQuery($q);
        }

        if($filters != null) {
            foreach($filters as $filterKey=>$filterValue) {
                $query->createFilterQuery($filterKey)->setQuery("$filterKey:($filterValue)");
            }
        }

        if($unique === 'true' OR $unique === true) {
            $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash min=publicationTime}");
        }

        $stats = $query->getStats();
        $fields = explode(',', $fields);
        foreach($fields as $field) {
            $stats->createField($field);
        }

        $statistics = array();
        try {
            $resultSet = $this->client->execute($query);
            $count = $resultSet->getNumFound();

            $statsResult = $resultSet->getStats();
            foreach ($statsResult as $field) {
                $statistics[$field->getName()] = array(
                    'sum' => $field->getSum(),
                    'max' => $field->getMax(),
                    'min' => $field->getMin(),
                    'avg' => $field->getMean(),
                    'stddev' => $field->getStddev()
                );
            }

            $statistics['total'] = $count;
        }
        catch(Exception $e) { return $e; }

        return $statistics;
    }

    public function fieldsCount($fields, $q, $filters=null, $unique=false, $facets = null) {

        $query = $this->client->createSelect();

        if($filters != null && isset($filters['geofilters'])) {
            $helper = $query->getHelper();
            $geoParts = array();
            foreach($filters['geofilters'] as $geo) {
                $geoFilterPart = $helper->geofilt('latlonRPT', $geo['latitude'], $geo['longitude'], $geo['radius']);
                $geoParts[] = "latlonRPT:$geoFilterPart";
            }
            if($q != null &&  $q !== '') {
                $q = $q . ' OR (' . implode(' OR ', $geoParts) . ')';
            }
            else {
                $q = implode(' OR ', $geoParts);
            }
            unset($filters['geofilters']);
        }


        if($query != null) {
            $query->setQuery($q);
        }
        $query->setRows(0);

        if($filters != null) {
            foreach($filters as $filterKey => $filterValue) {
                $query->createFilterQuery($filterKey)->setQuery("$filterKey:($filterValue)");
            }
        }

        if($unique === 'true' OR $unique === true) {
            $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash min=publicationTime}");
        }

        $stats = $query->getStats();
        $fields = explode(',', $fields);
        foreach($fields as $fieldName) {
            $stats->createField("{!cardinality=true}$fieldName");
        }

        if($facets != null) {
            $facets = explode(",", $facets);
            $stats->setFacets($facets);
        }

        try {
            $resultSet = $this->client->execute($query);

			$data = $resultSet->getData();

            $stats = $data['stats']['stats_fields'];
            return $stats;

        }
        catch(Exception $e) {
            return $e;
        }

    }

    public function getFacet($facetField, $q, $filters = array(), $n = 10, $includeAll=true, $prefix=null, $unique=false, $exclude=null, $method=null) {

        // get a select query instance
        $query = $this->client->createSelect();

        if($filters != null && isset($filters['geofilters'])) {
            $helper = $query->getHelper();
            $geoParts = array();
            foreach($filters['geofilters'] as $geo) {
                $geoFilterPart = $helper->geofilt('latlonRPT', $geo['latitude'], $geo['longitude'], $geo['radius']);
                $geoParts[] = "latlonRPT:$geoFilterPart";
            }
            if($q != null &&  $q !== '') {
                $q = $q . ' OR (' . implode(' OR ', $geoParts) . ')';
            }
            else {
                $q = implode(' OR ', $geoParts);
            }
            unset($filters['geofilters']);
        }

        $query->setQuery($q);
        $query->setRows(0);
        $query->addParam("facet.threads", 4);

        // set filter queries
        if($filters != null) {
            foreach($filters as $filterKey => $filterValue) {
                $fq = $filterKey . ':(' . $filterValue . ')';
                $query->createFilterQuery($filterKey)->setQuery($fq);
            }
        }

        if($unique === 'true' OR $unique === true) {
            $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash min=publicationTime}");
        }

        // get the facet set component
        $facetSet = $query->getFacetSet();
        $facetSet->setMinCount(1);
        $facetSet->setLimit($n);

        // create a facet field instance and set options
        $ff = $facetSet->createFacetField($facetField);
        $ff->setField($facetField)->setMissing(false);

        if($prefix != null) {
            $ff->setPrefix($prefix);
        }

        if($method != null) {
            $ff->setMethod($method);
        }

        if($exclude != null) {
            foreach($exclude as $excludedValue) {
                $ff->setContainsIgnoreCase($excludedValue);
            }
        }

        $facets = array();

        // this executes the query and returns the result
        try {
            $resultSet = $this->client->execute($query);
            $facet = $resultSet->getFacetSet()->getFacet($facetField);

            if ($includeAll) {
                $facets[] = array('field' => 'all', 'count' => $resultSet->getNumFound());
            }

            foreach ($facet as $value => $count) {
                $facets[] = array('field' => $value, 'count' => $count);
            }
        }
        catch(Exception $e) {

        }

        return $facets;
    }

    public function getFacetAndCount($facetField, $q, $filters = array(), $n = 10, $includeAll=true, $prefix=null, $unique=false) {

        // get a select query instance
        $query = $this->client->createSelect();
        $query->setQuery($q);

        // set filter queries
        if($filters != null) {
            foreach($filters as $filterKey => $filterValue) {
                $fq = $filterKey . ':(' . $filterValue . ')';
                $query->createFilterQuery($filterKey)->setQuery($fq);
            }
        }

        if($unique === 'true' OR $unique === true) {
            $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash min=publicationTime}");
        }

        // get the facet set component
        $facetSet = $query->getFacetSet();
        $facetSet->setMinCount(1);
        $facetSet->setLimit($n);

        // create a facet field instance and set options
        $ff = $facetSet->createFacetField($facetField);
        $ff->setField($facetField)->setMissing(false);
        if($prefix != null) {
            $ff->setPrefix($prefix);
        }

        // this executes the query and returns the result
        $resultSet = $this->client->execute($query);
        $facet = $resultSet->getFacetSet()->getFacet($facetField);

        $facets = array();
        if($includeAll) {
            $facets[] = array('field' => 'all', 'count' => $resultSet->getNumFound());
        }
        foreach ($facet as $value => $count) {
            $facets[] = array('field' => $value, 'count'=>$count);
        }

        return array('facet'=>$facets, 'count'=>$resultSet->getNumFound());
    }

    public function get2DFacet($facetField, $q, $filters = array(), $minLat=-90, $maxLat=90, $minLong=-180, $maxLong=180, $unique=false) {

        // get a select query instance
        $query = $this->client->createSelect();

        if($filters != null && isset($filters['geofilters'])) {
            $helper = $query->getHelper();
            $geoParts = array();
            foreach($filters['geofilters'] as $geo) {
                $geoFilterPart = $helper->geofilt('latlonRPT', $geo['latitude'], $geo['longitude'], $geo['radius']);
                $geoParts[] = "latlonRPT:$geoFilterPart";
            }
            if($q != null &&  $q !== '') {
                $q = $q . ' OR (' . implode(' OR ', $geoParts) . ')';
            }
            else {
                $q = implode(' OR ', $geoParts);
            }
            unset($filters['geofilters']);
        }

        $query->setQuery($q);

        // set filter queries
        if($filters != null) {
            foreach($filters as $filterKey => $filterValue) {
                $fq = $filterKey . ':(' . $filterValue . ')';
                $query->createFilterQuery($filterKey)->setQuery($fq);
            }
        }

        if($unique === 'true' OR $unique === true) {
            $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash min=publicationTime}");
        }

        // get the facet set component
        $facetSet = $query->getFacetSet();
        $facetSet->setMinCount(1);

        // create a facet field instance and set options
        $ff = $facetSet->createFacetField($facetField);
        $ff->setField($facetField)->setMissing(false);

        $query->addParam('facet.heatmap', $facetField);

        $bottomPoint = "$minLong $minLat";
        $upperPoint = "$maxLong $maxLat";
        $query->addParam('facet.heatmap.geom', '["' . $bottomPoint . '" TO "' . $upperPoint . '"]');

        // grid level is unused as this value is computed via distErrPct
        //$query->addParam('facet.heatmap.gridLevel', 3);
        $query->addParam('facet.heatmap.distErrPct', '0.15');   // change this for better accuracy
        $query->addParam('facet.heatmap.format', 'ints2D');

        // this executes the query and returns the result
        $resultSet = $this->client->execute($query);
        $data = $resultSet->getData();

        $data = $data['facet_counts']['facet_heatmaps'][$facetField];
        $data = array_chunk($data, 2, false);
        $data = array_map(function($e) { return array($e[0]=>$e[1]); }, $data);
        $results = array();
        foreach($data as $r) {
            $results = array_merge($results, $r);
        }

        $points = array();
        $total = 0;

        $counts_ints2D = $results['counts_ints2D'];
        // X
        $minX = $results['minX'];
        $maxX = $results['maxX'];
        $columns = $results['columns'];
        $stepX = ($maxX - $minX) / $columns;

        // Y
        $minY = $results['minY'];
        $maxY = $results['maxY'];
        $rows = $results['rows'];
        $stepY = ($maxY - $minY) / $rows;

        for($i = 0; $i < $rows; $i++) {
            $row = $counts_ints2D[$i];
            if($row != null) {
                $y = $maxY - ($i * $stepY);
                for($j = 0; $j < $columns; $j++) {
                    $x = $minX + ($j * $stepX);
                    if($row[$j] > 0) {
                        $total = $total + $row[$j];
                        $points[] = array(
                            'longitude' => $x,
                            'latitude' => $y,
                            'count' => $row[$j]
                        );
                    }
                }
            }
        }

        $temp = array();
        $temp['total'] = $total;
        $temp['rows'] = $rows;
        $temp['columns'] = $columns;
        $temp['latitudeStep'] = $stepY;
        $temp['longitudeStep'] = $stepX;
        $temp['minLatitude'] = $minY;
        $temp['maxLatitude'] = $maxY;
        $temp['minLongitude'] = $minX;
        $temp['maxLongitude'] = $maxX;

        $temp['gridLevel'] = $results['gridLevel'];


        $temp['points'] = $points;

        return $temp;
    }

    public function getRangeFacet($facetField, $q, $filters, $gap, $start, $end, $unique=false) {

        // get a select query instance
        $query = $this->client->createSelect();

        if($filters != null && isset($filters['geofilters'])) {
            $helper = $query->getHelper();
            $geoParts = array();
            foreach($filters['geofilters'] as $geo) {
                $geoFilterPart = $helper->geofilt('latlonRPT', $geo['latitude'], $geo['longitude'], $geo['radius']);
                $geoParts[] = "latlonRPT:$geoFilterPart";
            }
            if($q != null &&  $q !== '') {
                $q = $q . ' OR (' . implode(' OR ', $geoParts) . ')';
            }
            else {
                $q = implode(' OR ', $geoParts);
            }
            unset($filters['geofilters']);
        }

        $query->setQuery($q);

        // set filter queries
        if($filters != null) {
            foreach($filters as $filterKey => $filterValue) {
                $fq = $filterKey . ':(' . $filterValue . ')';
                $query->createFilterQuery($filterKey)->setQuery($fq);
            }
        }

        if($unique === 'true' OR $unique === true) {
            $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash min=publicationTime}");
        }

        // get the facet set component
        $facetSet = $query->getFacetSet();
        $facetSet->createFacetRange($facetField)
            ->setField($facetField)
            ->setStart($start)
            ->setEnd($end)
            ->setGap($gap);

        // this executes the query and returns the result
        try {
            $resultSet = $this->client->execute($query);
        }
        catch(Exception $e) {
            return $e;
        }


        $facets = array();

        $facet = $resultSet->getFacetSet()->getFacet($facetField);
        foreach ($facet as $range => $count) {
            $facets[] = array('field' => $range, 'count'=>$count);
        }

        return $facets;
    }

    public function getClusters($q, $filters = null, $rows=1000, $engine='lingo') {

        $engine = $engine == null ? 'lingo' : $engine;

        // get a select query instance
        $query = $this->client->createSelect();

        if($filters != null && isset($filters['geofilters'])) {
            $helper = $query->getHelper();
            $geoParts = array();
            foreach($filters['geofilters'] as $geo) {
                $geoFilterPart = $helper->geofilt('latlonRPT', $geo['latitude'], $geo['longitude'], $geo['radius']);
                $geoParts[] = "latlonRPT:$geoFilterPart";
            }

            if($q != null &&  $q !== '') {
                $q = $q . ' OR (' . implode(' OR ', $geoParts) . ')';
            }
            else {
                $q = implode(' OR ', $geoParts);
            }
            unset($filters['geofilters']);
        }

        $query->setQuery($q);

        $query->setHandler('clustering');
        $query->addParam('clustering.engine', $engine);
        $query->addParam('carrot.title', 'cleanTitle');
        $query->addParam('carrot.lang', 'language_s');

        $query->addSort('score', Solarium\QueryType\Select\Query\Query::SORT_DESC);

        // set filter queries
        if($filters != null) {
            foreach($filters as $filterKey => $filterValue) {
                $fq = $filterKey . ':(' . $filterValue . ')';
                $query->createFilterQuery($filterKey)->setQuery($fq);
            }
        }

        $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash}");
        $query->setRows($rows);

        $this->client->getEndpoint('items')->setTimeout(60000);

        $resultSet = $this->client->execute($query);

        $data = $resultSet->getData();
        return $data['clusters'];
    }

    public function getTermVectors($q, $pageNumber=1, $nPerPage=10) {
        $query = $this->client->createSelect();
        $query->setQuery($q);
        $query->setHandler('tvrh');

        $query->addParam('tv.tf', true);
        $query->addParam('tv.df', true);
        $query->addParam('tv.tf_idf', true);

        // paging
        $query->setStart(($pageNumber-1)*$nPerPage);
        $query->setRows($nPerPage);

        $tvs = array();

        $resultSet = $this->client->execute($query);
        $data = $resultSet->getData();
        $termVectors =  $data['termVectors'];

        $termVectors = array_filter($termVectors, function($k) { return ($k%2==1); }, ARRAY_FILTER_USE_KEY);
        $termVectors = array_map(function($k){return array("id" => $k[1], "vector"=>$k[3]);}, $termVectors);

        foreach($termVectors as $tv) {
            $id = $tv['id'];
            $vector = $tv['vector'];
            $terms = array_filter($vector, function($k) { return ($k%2==0); },  ARRAY_FILTER_USE_KEY);
            $values = array_filter($vector, function($k) { return ($k%2==1); }, ARRAY_FILTER_USE_KEY);
            $values = array_map(function($k){return $k[5];}, $values);

            $norm = array_reduce($values, function($sum, $item) {
                    $sum += $item;
                    return $sum;
                }
            );

            $tvs[] = array(
                "id" => $id,
                "vector" => array_combine($terms, $values),
                "norm" => $norm
            );
        }
        return $tvs;

    }

    public function facetedStatistics($fields, $q, $filters=null, $unique=false, $facets = null)
    {
        $query = $this->client->createSelect();

        if($filters != null && isset($filters['geofilters'])) {
            $helper = $query->getHelper();
            $geoParts = array();
            foreach($filters['geofilters'] as $geo) {
                $geoFilterPart = $helper->geofilt('latlonRPT', $geo['latitude'], $geo['longitude'], $geo['radius']);
                $geoParts[] = "latlonRPT:$geoFilterPart";
            }
            if($q != null &&  $q !== '') {
                $q = $q . ' OR (' . implode(' OR ', $geoParts) . ')';
            }
            else {
                $q = implode(' OR ', $geoParts);
            }
            unset($filters['geofilters']);
        }

        if ($query != null) {
            $query->setQuery($q);
        }

        $query->setRows(0);

        if ($filters != null) {
            foreach ($filters as $filterKey => $filterValue) {
                $query->createFilterQuery($filterKey)->setQuery("$filterKey:($filterValue)");
            }
        }

        if ($unique === 'true' OR $unique === true) {
            $query->createFilterQuery("collapse")->setQuery("{!collapse field=minhash min=publicationTime}");
        }

        $stats = $query->getStats();
        if ($facets != null) {
            $facets = explode(",", $facets);
            $stats->setFacets($facets);
        }

        $fields = explode(',', $fields);
        foreach($fields as $field) {
            $stats->createField("{!max=true min=true sum=true mean=true}$field");
        }

        try {
            $resultSet = $this->client->execute($query);
            $data = $resultSet->getData();

            $count = $data['response']['numFound'];
            $statistics = $data['stats']['stats_fields'];

            $statistics['total'] = $count;
            return $statistics;
        }
        catch(Exception $e) {
            return array("error" => $e->getMessage());
        }

    }
}
