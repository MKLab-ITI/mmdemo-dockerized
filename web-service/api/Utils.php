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

        //$keywords = array_keys($keywords);
        $textQuery = $this->formulateLogicalQuery($keywords);

        $accounts = $collection['accounts'];
        $users = array_map(function ($account) {
            return $account['source']."#".$account['id'];
        }, $accounts);

        $query = null;
        if($textQuery != null && $textQuery !== '') {
            $query = "title:($textQuery) OR tags:($textQuery) OR description:($textQuery)";
        }

        if($users != null && count($users) > 0) {
            $usersQuery = implode(' OR ', $users);
            if($query == null) {
                $query = "uid:($usersQuery)";
            }
            else {
                $query = "$query OR uid:($usersQuery)";
            }
        }

        return $query;
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