angular.module("umbraco.resources")
    .factory("uCommentatorResource", function ($http, $timeout, $route) {
        var disqusBaseUrl = "https://disqus.com/api/3.0/";
        var api_key = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorApiKey"];
        var api_secret = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorApiSecret"];
        var access_token = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorAccessToken"];
        var short_name = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorShortname"];
        var category = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorCategory"];
        var limit = Umbraco.Sys.ServerVariables["uCommentator"]["uCommentatorLimit"];

        var getSettings = function() {
            var settings = {};
            settings["api_key"] = api_key;
            settings["api_secret"] = api_secret;
            settings["access_token"] = access_token;
            settings["short_name"] = short_name;
            settings["category"] = category;
            settings["limit"] = limit;

            return settings;
        };
        
        /************************\
        # COMMENT SECTION
        \************************/

        var listComment = function ($scope, notificationsService, includes, page) {
            $scope.sortComment = angular.isUndefined($scope.sortComment) ? "desc" : $scope.sortComment;
            $scope.search = angular.isUndefined($scope.search) ? "" : $scope.search;

            var include = "";

            angular.forEach(includes, function(value) {
                include += "&include=" + value;
            });

            var qs = "access_token=" + access_token
                + "&api_key=" + api_key
                + "&api_secret=" + api_secret
                + "&category=" + category
                + "&category=" + new Date().getTime()
                + "&related=thread"
                + include
                + "&limit=" + limit
                + "&query=" + $scope.search
                + "&order=" + $scope.sortComment;

            if (page) {
                qs += "&cursor=" + page;
            }

            $http.get(disqusBaseUrl + "posts/list.json?" + qs)
                .success(function (data) {
                    $scope.comment = data.response;
                    $scope.cursor = data.cursor;

                    angular.forEach($scope.comment, function (value, key) {
                        value.isChecked = false;
                    });
                })
                .error(function (resp) {
                    notificationsService.error("Error", "Failed to retrieve comment, please try again later / refresh page");
                });
        };

        var searchComment = function($scope, notificationsService, includes, query, sort, page) {
            sort = angular.isUndefined(sort) ? "desc" : sort;
            query = angular.isUndefined(query) ? "" : query;

            var include = "";

            angular.forEach(includes, function (value) {
                include += "&include=" + value;
            });

            var qs = "access_token=" + access_token
                + "&api_key=" + api_key
                + "&api_secret=" + api_secret
                + "&category=" + category
                + "&category=" + new Date().getTime()
                + "&related=thread"
                + include
                + "&limit=" + limit
                + "&query=" + query
                + "&order=" + sort;

            if (page) {
                qs += "&cursor=" + page;
            }

            $http.get(disqusBaseUrl + "posts/list.json?" + qs)
            .success(function (data) {
                $scope.comment = data.response;
                $scope.cursor = data.cursor;

                angular.forEach($scope.comment, function (value, key) {
                    value.isChecked = false;
                });
            })
            .error(function (resp) {
                notificationsService.error("Error", "Failed to retrieve comment, please try again later / refresh page");
            });
        }

        var detailComment = function ($scope, notificationsService) {
            $http.get(disqusBaseUrl + "posts/getContext.json?" +
                    "access_token=" + access_token
                    + "&api_key=" + api_key
                    + "&api_secret=" + api_secret
                    + "&related=thread"
                    + "&post=" + $scope.comment.parent
                    + "&depth=4",
                    { config: { cache: true } })
                .success(function (data) {
                    $scope.context = data.response;
                })
                .error(function (resp) {
                    notificationsService.error("Error", "Failed to retrieve comment, please try again later / refresh page");
                });
        };

        var createComment = function (param, $scope, dialogService) {
            $http({
                method: "POST",
                url: disqusBaseUrl + "posts/create.json",
                params: param,
                config: { timeout: 30000 }
            })
                    .success(function (resp) {
                        resp.status = "reply";
                        if (resp.code == 0) {
                            dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                        } else {
                            dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                        }
                    }).error(function (resp) {
                        dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                    });
        };

        var updateComment = function (param, $scope, dialogService) {
            $http({
                method: "POST",
                url: disqusBaseUrl + "posts/update.json",
                params: param,
                config: { timeout: 30000 }
            })
                .success(function (resp) {
                    resp.status = "edit";
                    if (resp.code == 0) {
                        dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                    } else {
                        dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                    }
                }).error(function (resp) {
                    dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                });
        };

        var approveComment = function (id, $scope, dialogService, successCallback, errorCallback) {
            var param = { post: id, api_key: api_key, api_secret: api_secret, access_token: access_token };

            $http({
                method: "POST",
                url: disqusBaseUrl + "posts/approve.json",
                params: param,
                config: { timeout: 30000 }
            })
                .success(function (resp) {
                    if (successCallback) {
                        successCallback(resp);
                    } else {
                        resp.response = resp.response;
                        dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                    }
                }).error(function (resp) {
                    if (errorCallback) {
                        errorCallback(resp);
                    } else {
                        dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                    }
                });

        };

        var removeComment = function (id, $scope, dialogService, successCallback, errorCallback) {
            var param = { post: id, api_key: api_key, api_secret: api_secret, access_token: access_token };

            $http({
                method: "POST",
                url: disqusBaseUrl + "posts/remove.json",
                params: param,
                config: { timeout: 30000 }
            })
                .success(function (resp) {
                    if (successCallback) {
                        successCallback(resp);
                    } else {
                        resp.response = resp.response;
                        dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                    }
                }).error(function (resp) {
                    if (errorCallback) {
                        errorCallback(resp);
                    } else {
                        dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                    }
                });
        };

        var moveToSpamComment = function (id, $scope, dialogService, successCallback, errorCallback) {
            var param = { post: id, api_key: api_key, api_secret: api_secret, access_token: access_token };

            $http({
                method: "POST",
                url: disqusBaseUrl + "posts/spam.json",
                params: param,
                config: { timeout: 30000 }
            })
                .success(function (resp) {
                    if (successCallback) {
                        successCallback(resp);
                    } else {
                        resp.response = resp.response;
                        dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                    }
                }).error(function (resp) {
                    if (errorCallback) {
                        errorCallback(resp);
                    } else {
                        dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                    }
                });
        };

        var showDetailDialog = function (param, $scope, dialogService, notificationsService) {
            function done(data) {
                console.log(data);
                if (data.resp != "cancel" && data.resp != null) {
                    if (data.resp.status == "reply") {
                        if (data.resp.code == 0) {
                            notificationsService.success("Success", "Reply comment has been send, page will refreshed");
                            $timeout(function () {
                                $route.reload();
                            }, 3000);
                        } else if (data.resp.code != 0) {
                            notificationsService.error("Error", "Failed to reply comment, please try again later");
                        }
                    } else if (data.resp.status == "edit") {
                        if (data.resp.code == 0) {
                            notificationsService.success("Success", "Comment has been edited, page will refreshed");
                            $timeout(function () {
                                $route.reload();
                            }, 3000);
                        } else if (data.resp.code != 0) {
                            notificationsService.error("Error", "Failed to edit comment, please try again later");
                        }
                    }
                }
            }

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/detailDialog.html',
                closeCallback: done,
                dialogData: param,
                show: true
            });
        };

        var showApproveDialog = function (param, $scope, dialogService, notificationsService) {
            function done(data) {
                if (data.resp != "cancel" && data.resp != null) {
                    if (data.resp.code == 0) {
                        notificationsService.success("Success", "Comment has been showed");
                        data.dialogData.isApproved = true;
                        data.dialogData.isSpam = false;
                        data.dialogData.isDeleted = false;
                    } else {
                        notificationsService.error("Error", "Failed to show comment, please try again later");
                    }
                }
            }

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/showDialog.html',
                show: true,
                dialogData: param,
                closeCallback: done
            });
        };

        var showApproveCheckedDialog = function (param, $scope, dialogService, notificationsService) {
            var params = [];

            function done(resp) {
                if (resp.resp == "ok") {
                    angular.forEach(param, function (value, key) {
                        if (value.isChecked) {
                            params.push(value.id);
                        }
                    });

                    if (params.length > 0) {
                        var successCallback = function (resp) {
                            if (resp.code == 0) {
                                notificationsService.success("Success", "Checked comment has been approved");
                                $timeout(function () {
                                    $route.reload();
                                }, 3000);
                            } else {
                                notificationsService.error("Error", "Failed approve checked comment, please try again later");
                            }
                        }

                        approveComment(params, $scope, dialogService, successCallback);
                    }
                }
            }

            var message = "<h4>Are you sure want to approve all checked comment?</h4>";

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                show: true,
                closeCallback: done,
                dialogData: message
            });
        };

        var showReplyDialog = function (param, $scope, dialogService) {
            function done(resp) {
                if (resp.resp == "ok") {
                    var message = param.reply_message;
                    var parent = param.id;
                    var req = {
                        api_key: api_key,
                        api_secret: api_secret,
                        access_token: access_token,
                        message: message,
                        parent: parent
                    };

                    if (message.trim().length > 0) {
                        createComment(req, $scope, dialogService);
                    }
                }
            }

            var message = "<h4>Are you sure want to reply this comment?</h4>";

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                show: true,
                dialogData: message,
                closeCallback: done
            });
        };

        var showEditDialog = function (param, $scope, dialogService) {
            function done(resp) {
                if (resp.resp == "ok") {
                    var message = param.edit_message;
                    var post = param.id;
                    var req = {
                        api_key: api_key,
                        api_secret: api_secret,
                        access_token: access_token,
                        message: message,
                        post: post
                    };

                    if (message.trim().length > 0) {
                        updateComment(req, $scope, dialogService);
                    }
                }
            }

            var message = "<h4>Are you sure want to edit this comment?</h4>";

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                show: true,
                dialogData: message,
                closeCallback: done
            });
        };

        var showDeleteDialog = function (param, $scope, dialogService, notificationsService) {
            function done(data) {
                if (data.resp != "cancel" && data.resp != null) {
                    if (data.resp.code == 0) {
                        notificationsService.success("Success", "Comment has been deleted");
                        data.dialogData.isApproved = false;
                        data.dialogData.isSpam = false;
                        data.dialogData.isDeleted = true;
                    } else {
                        notificationsService.error("Error", "Failed to delete comment, please try again later");
                    }
                }
            }

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/deleteDialog.html',
                show: true,
                dialogData: param,
                closeCallback: done
            });
        };

        var showDeleteCheckedDialog = function (param, $scope, dialogService, notificationsService) {
            var params = [];

            function done(resp) {
                if (resp.resp == "ok") {
                    angular.forEach(param, function (value, key) {
                        if (value.isChecked) {
                            params.push(value.id);
                        }
                    });

                    if (params.length > 0) {
                        var successCallback = function (resp) {
                            if (resp.code == 0) {
                                notificationsService.success("Success", "Checked comment has been deleted");
                                $timeout(function () {
                                    $route.reload();
                                }, 3000);
                            } else {
                                notificationsService.error("Error", "Failed to delete checked comment, please try again later");
                            }
                        }

                        removeComment(params, $scope, dialogService, successCallback);
                    }

                }
            }

            var message = "<h4>Are you sure want to remove all checked comment?</h4>";

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                show: true,
                closeCallback: done,
                dialogData: message
            });
        };

        var showMarkSpamDialog = function (param, $scope, dialogService, notificationsService) {
            function done(data) {
                if (data.resp != "cancel" && data.resp != null) {
                    if (data.resp.code == 0) {
                        notificationsService.success("Success", "Comment has been moved to spam");
                        data.dialogData.isApproved = false;
                        data.dialogData.isSpam = true;
                        data.dialogData.isDeleted = false;
                    } else {
                        notificationsService.error("Error", "Failed to move comment to spam, please try again later");
                    }
                }
            }

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/spamDialog.html',
                show: true,
                dialogData: param,
                closeCallback: done
            });
        };

        var showMarkSpamCheckedDialog = function (param, $scope, dialogService, notificationsService) {
            var params = [];

            function done(resp) {
                if (resp.resp == "ok") {
                    angular.forEach(param, function (value, key) {
                        if (value.isChecked) {
                            params.push(value.id);
                        }
                    });

                    if (params.length > 0) {
                        var successCallback = function (resp) {
                            if (resp.code == 0) {
                                notificationsService.success("Success", "Checked comment has been spammed");
                                $timeout(function () {
                                    $route.reload();
                                }, 3000);
                            } else {
                                notificationsService.error("Error", "Failed to spam checked comment, please try again later");
                            }
                        }

                        moveToSpamComment(params, $scope, dialogService, successCallback);
                    }
                }
            }

            var message = "<h4>Are you sure want to spam all checked comment?</h4>";

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                show: true,
                closeCallback: done,
                dialogData: message
            });
        };





        /************************\
        # WHITELIST SECTION
        \************************/

        var listWhitelist = function ($scope, notificationsService, page) {
            var qs = "access_token=" + access_token
                + "&api_key=" + api_key
                + "&api_secret=" + api_secret
                + "&forum=" + short_name
                + "&limit=" + limit
                + "&query=" + $scope.search
                + "&order=" + $scope.sortComment;

            if (page) {
                qs += "&cursor=" + page;
            }

            $http.get(disqusBaseUrl + "whitelists/list.json?" + qs)
                .success(function (data) {

                    $scope.whitelist = data.response;
                    $scope.cursor = data.cursor;

                    angular.forEach($scope.whitelist, function (value, key) {
                        value.isChecked = false;
                    });
                })
                .error(function (resp) {
                    notificationsService.error("Error", "Failed to retrieve whitelist user, please try again later / refresh page");
                });
        };

        var searchWhitelist = function ($scope, notificationsService, query) {
            query = angular.isUndefined(query) ? "" : query;

            var qs = "access_token=" + access_token
                + "&api_key=" + api_key
                + "&api_secret=" + api_secret
                + "&forum=" + short_name
                + "&limit=" + limit
                + "&query=" + query;

            $http.get(disqusBaseUrl + "whitelists/list.json?" + qs)
                .success(function (data) {
                    $scope.whitelist = data.response;
                    $scope.cursor = data.cursor;

                    angular.forEach($scope.whitelist, function (value, key) {
                        value.isChecked = false;
                    });
                })
                .error(function (resp) {
                    notificationsService.error("Error", "Failed to retrieve whitelist, please try again later / refresh page");
                });
        }

        var addWhitelist = function (param, $scope, dialogService) {
            $http({
                method: "POST",
                url: disqusBaseUrl + "whitelists/add.json",
                params: param,
                config: { timeout: 30000 }
            })
                .success(function (resp) {
                    resp.response = resp.response;
                    dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: resp });
                }).error(function (resp) {
                    dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: resp });
                });
        };

        var deleteWhitelist = function (param, notificationsService) {
            var req = { forum: short_name, api_key: api_key, api_secret: api_secret, access_token: access_token };
            req[param.type] = angular.isObject(param.value) ? param.value.id : param.value;

            $http({
                    method: "POST",
                    url: disqusBaseUrl + "whitelists/remove.json",
                    params: req,
                    config: { timeout: 30000 }
                })
                .success(function(resp) {
                    if (resp.code == 0) {
                        notificationsService.success("Success", "Whitelist has been removed");
                        $timeout(function() {
                            $route.reload();
                        }, 3000);
                    } else {
                        notificationsService.error("Error", "Failed to remove whitelist, please try again later");
                    }
                }).error(function(resp) {
                    notificationsService.error("Error", "Failed to remove whitelist, please try again later");
                });
        };

        var showWhitelistDialog = function (param, $scope, dialogService, notificationsService) {
            function done(data) {
                if (data.resp != "cancel" && data.resp != null) {
                    if (data.resp.code == 0) {
                        notificationsService.success("Success", "User has been added to whitelist");
                        dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
                    } else {
                        notificationsService.error("Error", "Failed to add user to whitelist");
                        dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
                    }
                }
            }

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/whitelistDialog.html',
                show: true,
                dialogData: param,
                closeCallback: done
            });
        };

        var showAddWhitelistDialog = function (param, $scope, dialogService) {
            var email = param.email ? $scope.comment.author.email : "";
            var user = param.username ? $scope.comment.author.id : "";

            var req = {
                forum: short_name,
                api_key: api_key,
                api_secret: api_secret,
                access_token: access_token,
                notes: "Added by ucommentator",
                email: email,
                user: user
            };

            if (param.email || param.username) {
                addWhitelist(req, $scope, dialogService);
            } else {
                dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
            }
        };

        var showAddWhitelistUserDialog = function (dialogService, notificationsService) {
            function done(data) {
                if (data.resp != "cancel" && data.resp != null) {
                    if (data.resp.code == 0) {
                        notificationsService.success("Success", "Whitelist has been added");
                        $route.reload();
                    } else {
                        notificationsService.error("Error", "Failed to add whitelist, please try again later");
                    }
                }
            }

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/addWhitelistDialog.html',
                show: true,
                closeCallback: done
            });
        };

        var showAddWhitelistConfirmationDialog = function (param, $scope, dialogService, notificationsService) {
            var notes = angular.isUndefined(param.notes) ? "Added by uCommentator" : param.notes;
            var type = param.type;
            var value = param.value;
            var message = "<h4>Are you sure want to add this whitelist?</h4>";

            if (value != "") {
                function done(data) {
                    if (data.resp == 'ok') {
                        var req = {};
                        req["api_key"] = api_key;
                        req["api_secret"] = api_secret;
                        req["access_token"] = access_token;
                        req["forum"] = short_name;
                        req["notes"] = notes;
                        req[type] = type == "user" ? (angular.isNumber(value) ? value : "username:" + value) : value;

                        addWhitelist(req, $scope, dialogService);
                    }
                }

                dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: message
                });
            } else {
                notificationsService.error("Error", "Value must not empty");
            }
        };

        var showDeleteWhitelistDialog = function (param, $scope, dialogService, notificationsService) {
            function done(resp) {
                if (resp.resp == "ok") {
                    deleteWhitelist(param, notificationsService);
                }
            }

            var message = "<h4>Are you sure want to remove this whitelist?</h4>";

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                show: true,
                dialogData: message,
                closeCallback: done
            });
        };

        var showDeleteWhitelistCheckedDialog = function (param, $scope, dialogService, notificationsService) {
            var email = [];
            var ipAddress = [];
            var user = [];
            var domain = [];

            function done(resp) {
                if (resp.resp == 'ok') {

                    angular.forEach(param, function (value, key) {
                        if (value.isChecked) {
                            switch (value.type) {
                                case "email":
                                    email.push(value.value);
                                    break;
                                case "ip":
                                    ipAddress.push(value.value);
                                    break;
                                case "domain":
                                    domain.push(value.value);
                                    break;
                                case "user":
                                    user.push(angular.isObject(value.value) ? value.value.id : value.value);
                                    break;
                                default:
                                    break;
                            }
                        }
                    });

                    if (email.length > 0 || ipAddress.length > 0 || domain.length > 0 || user.length > 0) {
                        var req = {
                            api_key: api_key,
                            api_secret: api_secret,
                            access_token: access_token,
                            forum: short_name,
                            domain: domain,
                            ip: ipAddress,
                            user: user,
                            email: email
                        };

                        $http({
                            method: "POST",
                            url: disqusBaseUrl + "whitelists/remove.json",
                            params: req,
                            config: { timeout: 30000 }
                        })
                            .success(function (resp) {
                                if (resp.code == 0) {
                                    notificationsService.success("Success", "Checked whitelist has been deleted");
                                    $timeout(function () {
                                        $route.reload();
                                    }, 3000);
                                } else {
                                    notificationsService.error("Error", "Failed to delete checked whitelist, please try again later");
                                }
                            }).error(function (resp) {
                                notificationsService.error("Error", "Failed to delete checked whitelist, please try again later");
                            });
                    }
                }
            }

            var message = "<h4>Are you sure want to remove checked whitelist?</h4>";

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                show: true,
                closeCallback: done,
                dialogData: message
            });
        };





        /************************\
        # BLACKLIST SECTION
        \************************/

        var listBlacklist = function($scope, notificationsService, page) {
            var qs = "access_token=" + access_token
                + "&api_key=" + api_key
                + "&api_secret=" + api_secret
                + "&forum=" + short_name
                + "&limit=" + limit
                + "&query=" + $scope.search
                + "&order=" + $scope.sortComment;

            if (page) {
                qs += "&cursor=" + page;
            }

            $http.get(disqusBaseUrl + "blacklists/list.json?" + qs)
                .success(function(data) {

                    $scope.blacklist = data.response;
                    $scope.cursor = data.cursor;

                    angular.forEach($scope.blacklist, function(value, key) {
                        value.isChecked = false;
                    });
                })
                .error(function(resp) {
                    notificationsService.error("Error", "Failed to retrieve blacklist user, please try again later / refresh page");
                });
        };

        var searchBlacklist = function ($scope, notificationsService, query) {
            query = angular.isUndefined(query) ? "" : query;

            var qs = "access_token=" + access_token
                + "&api_key=" + api_key
                + "&api_secret=" + api_secret
                + "&forum=" + short_name
                + "&limit=" + limit
                + "&query=" + query;

            $http.get(disqusBaseUrl + "blacklists/list.json?" + qs)
                .success(function (data) {
                    $scope.blacklist = data.response;
                    $scope.cursor = data.cursor;

                    angular.forEach($scope.blacklist, function (value, key) {
                        value.isChecked = false;
                    });
                })
                .error(function (resp) {
                    notificationsService.error("Error", "Failed to retrieve blacklist, please try again later / refresh page");
                });
        }

        var addBlacklist = function(param, $scope, dialogService) {
            $http({
                    method: "POST",
                    url: disqusBaseUrl + "blacklists/add.json",
                    params: param,
                    config: { timeout: 30000 }
                })
                .success(function(resp) {
                    resp.response = resp.response;
                    dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: resp });
                }).error(function(resp) {
                    dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: resp });
                });
        };

        var deleteBlacklist = function(param, notificationsService) {
            var req = { forum: short_name, api_key: api_key, api_secret: api_secret, access_token: access_token };
            req[param.type] = angular.isObject(param.value) ? param.value.id : param.value;

            $http({
                method: "POST",
                url: disqusBaseUrl + "blacklists/remove.json",
                params: req,
                config: { timeout: 30000 }
            })
                .success(function (resp) {
                    if (resp.code == 0) {
                        notificationsService.success("Success", "Blacklist has been removed");
                        $timeout(function () {
                            $route.reload();
                        }, 3000);
                    } else {
                        notificationsService.error("Error", "Failed to remove blacklist, please try again later");
                    }
                }).error(function (resp) {
                    notificationsService.error("Error", "Failed to remove blacklist, please try again later");
                });
        };

        var showBlacklistDialog = function(param, $scope, dialogService, notificationsService) {
            function done(data) {
                if (data.resp != "cancel" && data.resp != null) {
                    if (data.resp.code == 0) {
                        notificationsService.success("Success", "User has been added to blacklist");
                        dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
                    } else {
                        notificationsService.error("Error", "Failed to add user to blacklist");
                        dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
                    }
                }
            }

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/blacklistDialog.html',
                show: true,
                dialogData: param,
                closeCallback: done
            });
        };

        var showAddBlacklistDialog = function (param, $scope, dialogService) {
            var email = param.email ? $scope.comment.author.email : "";
            var user = param.username ? $scope.comment.author.id : "";
            var ip = param.ipAddress ? $scope.comment.ipAddress : "";

            var req = {
                forum: short_name,
                api_key: api_key,
                api_secret: api_secret,
                access_token: access_token,
                notes: "Added by ucommentator",
                email: email,
                user: user,
                ip: ip
            };

            if (param.email || param.username || param.ipAddress) {
                addBlacklist(req, $scope, dialogService);
            } else {
                dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
            }
        };

        var showAddBlacklistUserDialog = function (dialogService, notificationsService) {
            function done(data) {
                if (data.resp != "cancel" && data.resp != null) {
                    if (data.resp.code == 0) {
                        notificationsService.success("Success", "Blacklist has been added");
                        $route.reload();
                    } else {
                        notificationsService.error("Error", "Failed to add blacklist, please try again later");
                    }
                }
            }

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/addBlacklistDialog.html',
                show: true,
                closeCallback: done
            });
        };

        var showAddBlacklistConfirmationDialog = function (param, $scope, dialogService, notificationsService) {
            var notes = angular.isUndefined(param.notes) ? "Added by uCommentator" : param.notes;
            var type = param.type;
            var value = param.value;
            var message = "<h4>Are you sure want to add this blacklist?</h4>";

            if (value != "") {
                function done(data) {
                    if (data.resp == 'ok') {
                        var req = {};
                        req["api_key"] = api_key;
                        req["api_secret"] = api_secret;
                        req["access_token"] = access_token;
                        req["forum"] = short_name;
                        req["notes"] = notes;
                        req[type] = type == "user" ? (angular.isNumber(value) ? value : "username:" + value) : value;

                        addBlacklist(req, $scope, dialogService);
                    }
                }

                dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: message
                });
            } else {
                notificationsService.error("Error", "Value must not empty");
            }
        };

        var showDeleteBlacklistDialog = function (param, $scope, dialogService, notificationsService) {
            function done(resp) {
                if (resp.resp == "ok") {
                    deleteBlacklist(param, notificationsService);
                }
            }

            var message = "<h4>Are you sure want to remove this blacklist?</h4>";

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                show: true,
                dialogData: message,
                closeCallback: done
            });
        };

        var showDeleteBlacklistCheckedDialog = function (param, $scope, dialogService, notificationsService) {
            var email = [];
            var ipAddress = [];
            var user = [];
            var domain = [];

            function done(resp) {
                if (resp.resp == 'ok') {

                    angular.forEach(param, function (value, key) {
                        if (value.isChecked) {
                            switch (value.type) {
                                case "email":
                                    email.push(value.value);
                                    break;
                                case "ip":
                                    ipAddress.push(value.value);
                                    break;
                                case "domain":
                                    domain.push(value.value);
                                    break;
                                case "user":
                                    user.push(angular.isObject(value.value) ? value.value.id : value.value);
                                    break;
                                default:
                                    break;
                            }
                        }
                    });

                    if (email.length > 0 || ipAddress.length > 0 || domain.length > 0 || user.length > 0) {
                        var req = {
                            api_key: api_key,
                            api_secret: api_secret,
                            access_token: access_token,
                            forum: short_name,
                            domain: domain,
                            ip: ipAddress,
                            user: user,
                            email: email
                        };

                        $http({
                            method: "POST",
                            url: disqusBaseUrl + "blacklists/remove.json",
                            params: req,
                            config: { timeout: 30000 }
                        })
                            .success(function (resp) {
                                if (resp.code == 0) {
                                    notificationsService.success("Success", "Checked blacklist has been deleted");
                                    $timeout(function () {
                                        $route.reload();
                                    }, 3000);
                                } else {
                                    notificationsService.error("Error", "Failed to delete checked blacklist, please try again later");
                                }
                            }).error(function (resp) {
                                notificationsService.error("Error", "Failed to delete checked blacklist, please try again later");
                            });
                    }
                }
            }

            var message = "<h4>Are you sure want to remove checked blacklist?</h4>";

            dialogService.open({
                template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                show: true,
                closeCallback: done,
                dialogData: message
            });
        };

        return {
            getSettings: function() {
                return getSettings();
            },
            listComment: function($scope, notificationsService, includes, page) {
                listComment($scope, notificationsService, includes, page);
            },
            searchComment: function($scope, notificationsService, includes, query, sort, page) {
                searchComment($scope, notificationsService, includes, query, sort, page);
            },
            detailComment: function($scope, notificationsService) {
                detailComment($scope, notificationsService);
            },
            createComment: function(param, $scope, dialogService) {
                createComment(param, $scope, dialogService);
            },
            approveComment: function(id, $scope, dialogService) {
                approveComment(id, $scope, dialogService);
            },
            removeComment: function(id, $scope, dialogService) {
                removeComment(id, $scope, dialogService);
            },
            moveToSpamComment: function(id, $scope, dialogService) {
                moveToSpamComment(id, $scope, dialogService);
            },
            showDetailDialog: function(param, $scope, dialogService, notificationsService) {
                showDetailDialog(param, $scope, dialogService, notificationsService);
            },
            showApproveDialog: function(param, $scope, dialogService, notificationsService) {
                showApproveDialog(param, $scope, dialogService, notificationsService);
            },
            showApproveCheckedDialog: function(param, $scope, dialogService, notificationsService) {
                showApproveCheckedDialog(param, $scope, dialogService, notificationsService);
            },
            showReplyDialog: function(param, $scope, dialogService) {
                showReplyDialog(param, $scope, dialogService);
            },
            showEditDialog: function(param, $scope, dialogService) {
                showEditDialog(param, $scope, dialogService);
            },
            showDeleteDialog: function(param, $scope, dialogService, notificationsService) {
                showDeleteDialog(param, $scope, dialogService, notificationsService);
            },
            showDeleteCheckedDialog: function(param, $scope, dialogService, notificationsService) {
                showDeleteCheckedDialog(param, $scope, dialogService, notificationsService);
            },
            showMarkSpamDialog: function(param, $scope, dialogService, notificationsService) {
                showMarkSpamDialog(param, $scope, dialogService, notificationsService);
            },
            showMarkSpamCheckedDialog: function(param, $scope, dialogService, notificationsService) {
                showMarkSpamCheckedDialog(param, $scope, dialogService, notificationsService);
            },
            listWhitelist: function ($scope, notificationsService, page) {
                listWhitelist($scope, notificationsService, page);
            },
            searchWhitelist: function ($scope, notificationsService, query) {
                searchWhitelist($scope, notificationsService, query);
            },
            showWhitelistDialog: function (param, $scope, dialogService, notificationsService) {
                showWhitelistDialog(param, $scope, dialogService, notificationsService);
            },
            showAddWhitelistDialog: function(param, $scope, dialogService) {
                showAddWhitelistDialog(param, $scope, dialogService);
            },
            showAddWhitelistUserDialog: function (dialogService, notificationsService) {
                showAddWhitelistUserDialog(dialogService, notificationsService);
            },
            showAddWhitelistConfirmationDialog: function (param, $scope, dialogService, notificationsService) {
                showAddWhitelistConfirmationDialog(param, $scope, dialogService, notificationsService);
            },
            showDeleteWhitelistDialog: function (param, $scope, dialogService, notificationsService) {
                showDeleteWhitelistDialog(param, $scope, dialogService, notificationsService);
            },
            showDeleteWhitelistCheckedDialog: function(param, $scope, dialogService, notificationsService) {
                showDeleteWhitelistCheckedDialog(param, $scope, dialogService, notificationsService);
            },
            listBlacklist: function ($scope, notificationsService, page) {
                listBlacklist($scope, notificationsService, page);
            },
            searchBlacklist: function ($scope, notificationsService, query) {
                searchBlacklist($scope, notificationsService, query);
            },
            showBlacklistDialog: function (param, $scope, dialogService, notificationsService) {
                showBlacklistDialog(param, $scope, dialogService, notificationsService);
            },
            showAddBlacklistDialog: function(param, $scope, dialogService) {
                showAddBlacklistDialog(param, $scope, dialogService);
            },
            showAddBlacklistUserDialog: function (dialogService, notificationsService) {
                showAddBlacklistUserDialog(dialogService, notificationsService);
            },
            showAddBlacklistConfirmationDialog: function (param, $scope, dialogService, notificationsService) {
                showAddBlacklistConfirmationDialog(param, $scope, dialogService, notificationsService);
            },
            showDeleteBlacklistDialog: function (param, $scope, dialogService, notificationsService) {
                showDeleteBlacklistDialog(param, $scope, dialogService, notificationsService);
            },
            showDeleteBlacklistCheckedDialog: function(param, $scope, dialogService, notificationsService) {
                showDeleteBlacklistCheckedDialog(param, $scope, dialogService, notificationsService);
            }
        }
    });