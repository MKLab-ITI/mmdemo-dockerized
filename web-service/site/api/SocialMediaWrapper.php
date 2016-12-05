<?php
/**
 * Created by PhpStorm.
 * User: manosetro
 * Date: 12/16/15
 * Time: 11:51 AM
 */

require "vendor/autoload.php";

use Abraham\TwitterOAuth\TwitterOAuth;
use MetzWeb\Instagram\Instagram;

class SocialMediaWrapper {
    function __construct() {

        $ini = parse_ini_file('credentials.ini', true);

        if(isset($ini['Google'])) {
            $this->googleClient = new Google_Client();
            $this->googleClient->setApplicationName($ini['Google']['applicationName']);
            $this->googleClient->setDeveloperKey($ini['Google']['developerKey']);

            $this->plus = new Google_Service_Plus($this->googleClient);
            $this->youtube = new Google_Service_YouTube($this->googleClient);
        }

        if(isset($ini['Facebook'])) {
            $this->fb = new Facebook\Facebook(
                [
                    'app_id' => $ini['Facebook']['app_id'],
                    'app_secret' => $ini['Facebook']['app_secret'],
                    'default_graph_version' => 'v2.5',
                    'default_access_token' => $ini['Facebook']['app_id'] . "|" . $ini['Facebook']['app_secret']
                ]
            );
        }

        if(isset($ini['Instagram'])) {
            $this->instagram = new Instagram(
                [
                    'apiKey' => $ini['Instagram']['apiKey'],
                    'apiSecret' => $ini['Instagram']['apiSecret'],
                    'apiCallback' => 'YOUR_APP_CALLBACK'
                ]
            );
        }

        if(isset($ini['Twitter'])) {
            $this->twitter = new TwitterOAuth(
                $ini['Twitter']['apikey'],
                $ini['Twitter']['apiSecret'],
                $ini['Twitter']['accessToken'],
                $ini['Twitter']['accessTokenSecret']);
        }

    }

    public function search($username, $source) {
        if($source == 'Twitter') {
            return $this->searchTwitter($username);
        }

        if($source == 'GooglePlus') {
            return $this->searchGooglePlus($username);
        }

        if($source == 'Youtube') {
            return $this->searchYoutube($username);
        }

        if($source == 'Facebook') {
            return $this->searchFacebook($username);
        }

        if($source == 'Instagram') {
            return $this->searchInstagram($username);
        }

        return array();

    }

    // ========================== TWITTER =====================================

    public function searchTwitter($username) {
        $users = array();

        if($this->twitter == null) {
            return $users;
        }

        $params = array("q" => $username);
        $response = $this->twitter->get("users/search", $params);

        if(isset($response->errors)) {
            return $response;
        }

        foreach($response as $userFound) {
            $users[] = array(
                "id" => $userFound->id_str,
                "username" => $userFound->screen_name,
                "name" => $userFound->name,
                "description" => $userFound->description,
                "link" => "http://twitter.com/" . $userFound->screen_name,
                "followers_count" => $userFound->followers_count,
                "friends_count" => $userFound->friends_count,
                "favourites_count" => $userFound->favourites_count,
                "statuses_count" => $userFound->statuses_count,
                "profileImage" => $userFound->profile_image_url_https,
                "coverImage" => $userFound->profile_background_image_url_https,
                "timezone" => $userFound->time_zone,
                "location" => $userFound->location,
                "lang" => $userFound->lang,
                "source" => "Twitter"
            );
        }
        return $users;
    }

    public function getTwitterUser($user_id) {

        if($this->twitter == null) {
            return array();
        }

        $params = array("user_id" => $user_id);
        $user = $this->twitter->get("users/show", $params);

        return $user;
    }

    // ========================== INSTAGRAM =====================================

    public function searchInstagram($q) {

        if($this->instagram == null) {
            return array();
        }

        $response = $this->instagram->searchUser($q, 20);
        if(!isset($response->data)) {
            return array();
        }

        $data = array_map(
            function($entry) {
                return array(
                    'id' =>  $entry->id,
                    'username' =>  $entry->username,
                    'name' => $entry->full_name,
                    'link' =>  "http://instagram.com/".$entry->username,
                    'profileImage' => $entry->profile_picture,
                    'source' => 'Instagram'
                );
            }, $response->data
        );

        return $data;
    }

    public function getInstagramAccount($username) {

        if($this->instagram == null) {
            return array();
        }

        $user = $this->instagram->getUser($username);

        return $user;
    }

    // ========================== FACEBOOK =====================================

    public function searchFacebook($q) {
        try {
            if($this->fb == null) {
                return array();
            }

            $fields = 'id,name,username,description,link,cover,picture,engagement,is_verified,location';
            $response = $this->fb->get("/search?q=$q&fields=$fields&type=page&limit=20");

            $body = $response->getDecodedBody();
            $data = $body['data'];

            $data = array_map(
                function($page) {
                    $page['source'] = 'Facebook';
                    if(isset( $page['cover'])) {
                        $page['coverImage'] = $page['cover']['source'];
                        unset($page['cover']);
                    }

                    $page['profileImage'] = $page['picture']['data']['url'];
                    unset($page['picture']);

                    $page['verified'] = $page['is_verified'];
                    unset($page['is_verified']);

                    $page['likes'] = $page['engagement']['count'];
                    unset($page['engagement']);

                    if(!isset( $page['description'])) {
                        $page['description'] = "";
                    }

                    if(!isset( $page['username'])) {
                        $page['username'] = $page['name'];
                    }

                    return $page;
                }, $data);

            return $data;

        } catch(Facebook\Exceptions\FacebookResponseException $e) {
            return array('trace' => $e->getTrace());
        } catch(Facebook\Exceptions\FacebookSDKException $e) {
            return array('trace' => $e->getTrace());
        }
    }

    public function getFacebookPage($page_id) {

        if($this->fb == null) {
            return array();
        }

        $fields = 'id,name,username,description,link,cover,picture,likes,is_verified';
        $page = $this->fb->get("/$page_id?fields=$fields");

        return $page;
    }

    // ========================== YOUTUBE =====================================

    public function searchYoutube($q) {
        if($this->youtube == null) {
            return array();
        }

        $searchResponse = $this->youtube->search->listSearch('id,snippet',
            array(
                'type' => 'channel',
                'q' => $q,
                'maxResults' => 20
            )
        );

        $channels = array();
        foreach ($searchResponse['items'] as $searchResult) {
            $channels[]= array(
                'id' => $searchResult['id']['channelId'],
                'username' => isset($searchResult['snippet']['customUrl'])?$searchResult['snippet']['customUrl']:$searchResult['snippet']['title'],
                'name' => $searchResult['snippet']['title'],
                'description' => $searchResult['snippet']['description'],
                'url' => "https://www.youtube.com/channel/" . $searchResult['id']['channelId'],
                'source' => 'Youtube',
                'profileImage' => $searchResult['snippet']['thumbnails']['default']['url']
            );
        }
        return $channels;
    }

    public function getYoutubeChannel($channel_id) {
        if($this->youtube == null) {
            return array();
        }

        $response = $this->youtube->channels->listChannels("id,snippet,statistics",
            array(
                'id' => $channel_id
            )
        );

        foreach ($response['items'] as $result) {

            $channel = array(
                'id' => $result['id'],
                'username' => isset($result['snippet']['customUrl'])?$result['snippet']['customUrl']:$result['snippet']['title'],
                'name' => $result['snippet']['title'],
                'description' => $result['snippet']['description'],
                'viewCount' => $result['statistics']['viewCount'],
                'commentCount' => $result['statistics']['commentCount'],
                'subscriberCount' => $result['statistics']['subscriberCount'],
                'videoCount' => $result['statistics']['videoCount'],
                'link' => isset($result['snippet']['customUrl'])?"https://www.youtube.com/c/".$result['snippet']['customUrl']:"https://www.youtube.com/channel/" . $result['id'],
                'profileImage' => $result['snippet']['thumbnails']['default']['url'],
                'source' => 'Youtube'
            );
            return $channel;
        }

        return array();
    }

    // ========================== GOOGLE PLUS =====================================

    public function searchGooglePlus($q) {
        if($this->plus == null) {
            return array();
        }

        $optParams = array('maxResults' => 20);
        $results = $this->plus->people->search($q, $optParams);

        $users = array();
        foreach ( $results['items'] as $result ) {
            $url = $result['url'];
            $uName = str_replace("https://plus.google.com/+", "", $url);
            if(0 === strpos($uName, 'http')) {
                $uName = $result['displayName'];
            }

            $users[]= array(
                'id' => $result['id'],
                'username' => $uName,
                'name' => $result['displayName'],
                'url' => $url,
                'source' => 'GooglePlus',
                'profileImage' => $result['image']['url']
            );
        }

        return $users;
    }

    public function getGooglePlusAccount($user_id) {

        if($this->plus == null) {
            return array();
        }

        $optParams = array('fields' => "displayName,id,image,isPlusUser,language,currentLocation,name,nickname,plusOneCount,tagline,url,urls,verified,circledByCount,aboutMe,image/url");
        $result = $this->plus->people->get($user_id, $optParams);

        $user = array(
            'id' => $result['id'],
            'username' => isset($result['nickname'])?$result['nickname']:$result['displayName'],
            'name' => $result['displayName'],
            'link' => $result['url'],
            'source' => 'GooglePlus',
            'description' => $result['aboutMe'],
            'profileImage' => $result['image']['url'],
            'plusOneCount' => isset($result['plusOneCount'])?$result['plusOneCount']:0,
            'circledByCount' => isset($result['circledByCount'])?$result['circledByCount']:0,
            'verified' => $result['verified'],
            'language' => isset($result['language'])?$result['language']:null,
            'location' => isset($result['currentLocation'])?$result['currentLocation']:null
        );

        return $user;

    }

}
