var Q = require('q');
var ls = require('./../utils/ls');
var misc = require('./../utils/misc');
const config = require("./../config");

var ury = module.exports = {

    /**
     * @return Promise
     */
    getStudio: function () {
        return apiRequest(
            'selector/statusattime',
            {},
            30
        ).then(parseStudio);
    },

    /**
     * @return Promise
     */
    getShows: function () {
        return apiRequest(
            'timeslot/currentandnext',
            {
                n: config.NUM_SHOWS - 1,
                filter: [1, 2]
            },
            30
        ).then(parseShows);
    },

    /**
     * @return Promise
     */
    getSeasons: function () {
        return apiRequest(
            'season/allseasonsinlatestterm',
            null,
            // It is unlikely that the schedule will change often,
            // so we can cache this for a while
            60 * 60 * 24
        );
    }

};

/**
 * Makes a request to the URY API
 * @param endpoint to call relative to root. Don't include leading slash
 * @param options to pass in as GET parameters
 * @param cache {Number|boolean} either number of seconds to cache the request for, or false to not cache it
 * @return Promise
 */
function apiRequest(endpoint, options, cache) {
    var deferred = Q.defer();
    if (cache !== false && ls.isValid(endpoint)) {
        var value = ls.get(endpoint);
        deferred.resolve(value);
    } else { // No data in cache
        console.log("Nothing in cache, calling API");
        options = options || {};
        options["api_key"] = options["api_key"] || config.API_KEY;
        options = serialize(options);
        xhrRequest(config.API_URL + endpoint + "?" + options, "GET")
            .then(function (response) {
                try {
                    var data = JSON.parse(response);
                    if (cache !== false) {
                        ls.set(endpoint, data["payload"], cache);
                    }
                    deferred.resolve(data["payload"]);
                } catch (error) {
                    deferred.reject(error);
                }
            })
            .catch(deferred.reject)
            .done();
    }
    return deferred.promise;
}

/**
 * @returns Promise
 */
function xhrRequest(url, type) {
    var deferred = Q.defer();
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        deferred.resolve(this.responseText);
    };
    xhr.onerror = deferred.reject;
    xhr.open(type, url);
    xhr.send();
    return deferred.promise;
}

function serialize(obj) {
    // http://stackoverflow.com/a/1714899
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

function parseStudio(payload) {
    var studio;
    switch (payload["studio"]) {
        case 1:
        case 2:
            studio = 'Studio ' + payload["studio"];
            break;
        case 3:
            studio = 'Jukebox';
            break;
        case 4:
            studio = 'OB';
            break;
        default:
            studio = 'Unknown';
            break;
    }
    return studio;
}

function parseShows(payload) {
    var shows = [];
    shows.push(parseShow(payload["current"]));
    if (payload["next"]) {
        for (var i = 0; i < config.NUM_SHOWS - 1 && i < payload["next"].length; i++) {
            shows.push(parseShow(payload["next"][i]));
        }
    } else {
        console.warn("No 'next' shows in payload");
    }
    return shows;
}

function parseShow(show) {
    var name = show["title"];
    var start = show["start_time"];
    if (start == null) {
        start = 0;
    } else {
        start = parseInt(start);
    }
    var end = show["end_time"];
    if (end == "The End of Time") {
        end = 0;
    } else {
        end = parseInt(end);
    }
    var desc = misc.htmlToText(show["desc"]);
    return {
        name: name,
        start: start,
        end: end,
        desc: desc
    };
}