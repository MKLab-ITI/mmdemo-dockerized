<?php
/**
 * Created by PhpStorm.
 * User: manosetro
 * Date: 11/23/15
 * Time: 12:40 PM
 */

class Utils {

    public function formulateLogicalQuery($keywords) {
        $queryParts = array();
        foreach($keywords as $keyword) {
            trim($keyword);
            $keyword = preg_split("/\s+/", $keyword);
            if(count($keyword) > 1) {
                $queryParts[] = '(' . implode(' AND ', $keyword) . ')';
            }
            else {
                $queryParts[] = implode(' AND ', $keyword);
            }
        }
        $query = implode(' OR ', $queryParts);
        return $query;
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
        $textQuery = $this->formulateLogicalQuery($keywords);
        $tagsQuery = $this->formulateLogicalQuery($tags);

        // excluded keywords
        $keywordsToExclude = $collection['keywordsToExclude'];
        if($keywordsToExclude != null && count($keywordsToExclude) > 0) {
            $excludedTermsQuery = $this->formulateLogicalQuery($keywordsToExclude);

            $textQuery = $textQuery . " NOT (" . $excludedTermsQuery . ")";
            $tagsQuery = $tagsQuery . " NOT (" . $excludedTermsQuery . ")";
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

        $itemsToExclude = $collection('itemsToExclude');
        if($itemsToExclude != null && count($itemsToExclude) > 0) {
            $idsToExclude = implode(' OR ', $itemsToExclude);
            $query[] = "-id:($idsToExclude)";
        }

        return implode(' OR ', $query);
    }

    public function getFilters($since, $until, $source, $original, $type, $language, $query) {
        // Add filters if available
        $filters = array();

        // filter by query
        if ($query != null && $query != '') {
            $query = urldecode($query);
            $keywords = explode(',', $query);

            $filterTextQuery = $this->formulateLogicalQuery($keywords);
            $filters['allText'] = $filterTextQuery;
        }

        //filter by source
        if($source != null) {
            if($source == 'all') {
                $filters['source'] = "*";
            }
            else {
                $sources = explode(',', $source);
                $sources = implode(' OR ', $sources);
                $filters['source'] = "$sources";
            }
        }
        else {
            $filters['-source'] = "*";
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
            $filters['publicationTime'] = "[$since TO $until]";
        }

        return $filters;
    }

}