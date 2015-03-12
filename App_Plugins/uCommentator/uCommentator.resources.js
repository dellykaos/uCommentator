angular.module("umbraco.resources")
    .factory("uCommentatorResource", function ($http) {

        var api_key = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorApiKey"];
        var api_secret = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorApiSecret"];
        var access_token = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorAccessToken"];
        var short_name = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorShortname"];
        var category = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorCategory"];
        var limit = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorLimit"];
        
        return {
            getSettings: function () {
                var settings = {};
                settings["api_key"] = api_key;
                settings["api_secret"] = api_secret;
                settings["access_token"] = access_token;
                settings["short_name"] = short_name;
                settings["category"] = category;
                settings["limit"] = limit;

                return settings;
            }
        }
    });