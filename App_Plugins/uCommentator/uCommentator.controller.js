(function () {        
    angular.module("umbraco")
    .controller("uCommentator.ConfirmationDialog.controller",
        function ($scope, dialogService, $compile, uCommentatorResource) {
            var settings = uCommentatorResource.getSettings();

            if (angular.isObject($scope.dialogData)) {
                $scope.content = $scope.dialogData;
            } else {
                $scope.message = $scope.dialogData;
            }

            $scope.ok = function () {
                dialogService.close($scope.$parent.dialogOptions, { resp: "ok" });
            };

            $scope.cancel = function () {
                dialogService.close($scope.$parent.dialogOptions, { resp: "cancel" });
            };
        })
    .controller("uCommentator.DeleteComment.controller",
        function ($scope, dialogService, $http, $route, umbRequestHelper, uCommentatorResource) {
            var settings = uCommentatorResource.getSettings();

            $scope.comment = $scope.dialogData;

            $scope.delete = function (id) {
                var req = { post: id, api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token };

                if (id > 0) {
                    $http({
                        method: "POST",
                        url: "https://disqus.com/api/3.0/posts/remove.json",
                        params: req,
                        config: { timeout: 30000 }
                    })
                        .success(function (resp) {
                            resp.response = resp.response;
                            dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                        }).error(function (resp) {
                            dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                        });
                }
            }

            $scope.cancelDelete = function () {
                dialogService.closeAll({ dialogData: $scope.comment, resp: "cancel" });
            };
        })
    .controller("uCommentator.SpamComment.controller",
        function ($scope, dialogService, $http, $route, umbRequestHelper, uCommentatorResource) {
            var settings = uCommentatorResource.getSettings();

            $scope.comment = $scope.dialogData;

            $scope.spam = function (id) {
                var req = { post: id, api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token };

                if (id > 0) {
                    $http({
                        method: "POST",
                        //url: url + "SendToSpamComment",
                        url: "https://disqus.com/api/3.0/posts/spam.json",
                        params: req,
                        config: { timeout: 30000 }
                    })
                        .success(function (resp) {
                            resp.response = resp.response;
                            dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                        }).error(function (resp) {
                            dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                        });
                }
            }

            $scope.cancelSpam = function () {
                dialogService.closeAll({ dialogData: $scope.comment, resp: "cancel" });
            };
        })
    .controller("uCommentator.ShowComment.controller",
        function ($scope, dialogService, $http, $route, umbRequestHelper, uCommentatorResource) {
            var settings = uCommentatorResource.getSettings();

            $scope.comment = $scope.dialogData;

            $scope.show = function (id) {
                var req = { post: id, api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token };

                if (id > 0) {
                    $http({
                        method: "POST",
                        url: "https://disqus.com/api/3.0/posts/approve.json",
                        params: req,
                        config: { timeout: 30000 }
                    })
                        .success(function (resp) {
                            resp.response = resp.response;
                            dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                        }).error(function (resp) {
                            dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                        });
                }
            }

            $scope.cancelShow = function () {
                dialogService.closeAll({ dialogData: $scope.comment, resp: "cancel" });
            };
        })
    .controller("uCommentator.DetailComment.controller",
        function ($scope, dialogService, $http, $route, umbRequestHelper, notificationsService, $timeout, uCommentatorResource) {
            var settings = uCommentatorResource.getSettings();

            $scope.comment = $scope.dialogData;
            $scope.context = {};

            if ($scope.comment.parent != null) {
                $http.get("https://disqus.com/api/3.0/posts/getContext.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
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
            }

            $scope.close = function () {
                dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
            };

            $scope.whitelist = function (data) {
                var whitelistDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/whitelistDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            };

            $scope.blacklist = function (data) {
                var blacklistDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/blacklistDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            };

            $scope.save = function (data) {
                var message = "<h4>Are you sure want to reply this comment?</h4>";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    dialogData: message,
                    closeCallback: done
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        var message = data.reply_message;
                        var parent = data.id;
                        var req = {
                            api_key: settings.api_key,
                            api_secret: settings.api_secret,
                            access_token: settings.access_token,
                            message: message,
                            parent: parent
                        };

                        if (message.trim().length > 0) {
                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/create.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        dialogService.close($scope.$parent.dialogOptions, {resp: resp});
                                    } else {
                                        dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                                    }
                                }).error(function (resp) {
                                    dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                                });
                        }
                    }
                }
            }

            $scope.edit = function (data) {
                var message = "<h4>Are you sure want to edit this comment?</h4>";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    dialogData: message,
                    closeCallback: done
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        var message = data.edit_message;
                        var post = data.id;
                        var req = {
                            api_key: settings.api_key,
                            api_secret: settings.api_secret,
                            access_token: settings.access_token,
                            message: message,
                            post: post
                        };

                        if (message.trim().length > 0) {
                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/update.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                                    } else {
                                        dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                                    }
                                }).error(function (resp) {
                                    dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                                });
                        }
                    }
                }
            }
        })
    .controller("uCommentator.Whitelist.controller",
        function ($scope, dialogService, $http, $route, umbRequestHelper, uCommentatorResource) {
            var settings = uCommentatorResource.getSettings();
            
            $scope.comment = $scope.dialogData;

            $scope.approve = function (data) {
                var email = data.email ? $scope.comment.author.email : "";
                var user = data.username ? $scope.comment.author.id : "";

                var req = {
                    forum: settings.short_name,
                    api_key: settings.api_key,
                    api_secret: settings.api_secret,
                    access_token: settings.access_token,
                    notes: "Added by ucommentator",
                    email: email,
                    user: user
                };

                if (data.email || data.username) {
                    $http({
                        method: "POST",
                        url: "https://disqus.com/api/3.0/whitelists/add.json",
                        params: req,
                        config: { timeout: 30000 }
                    })
                        .success(function (resp) {
                            resp.response = resp.response;
                            dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: resp });
                        }).error(function (resp) {
                            dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: resp });
                        });
                } else {
                    dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
                }
            };

            $scope.close = function () {
                dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
            };
        })
    .controller("uCommentator.Blacklist.controller",
        function ($scope, dialogService, $http, $route, umbRequestHelper, uCommentatorResource) {
            var settings = uCommentatorResource.getSettings();

            $scope.comment = $scope.dialogData;

            $scope.approve = function (data) {
                var email = data.email ? $scope.comment.author.email : "";
                var user = data.username ? $scope.comment.author.id : "";
                var ip = data.ipAddress ? $scope.comment.ipAddress : "";

                var req = {
                    forum: settings.short_name,
                    api_key: settings.api_key,
                    api_secret: settings.api_secret,
                    access_token: settings.access_token,
                    notes: "Added by ucommentator",
                    email: email,
                    user: user,
                    ip: ip
                };

                if (data.email || data.username || data.ipAddress) {
                    $http({
                        method: "POST",
                        url: "https://disqus.com/api/3.0/blacklists/add.json",
                        params: req,
                        config: { timeout: 30000 }
                    })
                        .success(function (resp) {
                            resp.response = resp.response;
                            dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: resp });
                        }).error(function (resp) {
                            dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: resp });
                        });
                } else {
                    dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
                }
            };

            $scope.close = function () {
                dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
            };
        })
    .controller("uCommentator.DisqusComment.controller",
        function ($scope, $http, $route, $routeParams, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, navigationService) {
            var settings = uCommentatorResource.getSettings();

            $scope.comment = {};
            $scope.cursor = {};
            $scope.search = '';
            $scope.sortComment = 'desc';

            var include = "&include=unapproved" +
                "&include=approved" +
                "&include=spam" +
                "&include=deleted" +
                "&include=flagged" +
                "&include=highlighted";

            $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
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

            $scope.markSpam = function (data) {
                var spamDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/spamDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            }

            $scope.showComment = function (comment) {
                var approveDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/showDialog.html',
                    show: true,
                    dialogData: comment,
                    closeCallback: done
                });
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
            }

            $scope.deleteComment = function (data) {
                var deleteDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/deleteDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            }

            $scope.commentDetail = function (data) {
                var detailDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/detailDialog.html',
                    closeCallback: done,
                    dialogData: data,
                    show: true
                });

                function done(data) {
                    if (data.resp != "cancel" && data.resp != null) {
                        if (data.resp.status = "reply") {
                            if (data.resp.code == 0) {
                                notificationsService.success("Success", "Reply comment has been send, page will refreshed");
                                $timeout(function () {
                                    $route.reload();
                                }, 3000);
                            } else if (data.resp.code != 0) {
                                notificationsService.error("Error", "Failed to reply comment, please try again later");
                            }
                        } else if (data.resp.status = "edit") {
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
            }

            $scope.goToPage = function (page) {
                $scope.sortComment = angular.isUndefined($scope.sortComment) ? "desc" : $scope.sortComment;
                $scope.search = angular.isUndefined($scope.search) ? "" : $scope.search;

                $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&cursor=" + page
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
                .success(function (data) {
                    $scope.comment = data.response;
                    $scope.cursor = data.cursor;
                });
            }

            $scope.check = function (check) {
                if (check) {
                    angular.forEach($scope.comment, function (value, key) {
                        value.isChecked = true;
                    });
                }

                if (!check) {
                    angular.forEach($scope.comment, function (value, key) {
                        value.isChecked = false;
                    });
                }
                check = !check;
            }

            $scope.approveChecked = function (data) {
                var param = [];
                var message = "<h4>Are you sure want to approve all checked comment?</h4>";
                var btn = "Approve";
                var btnClass = "btn-primary";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: {message: message, btn: btn, btnClass: btnClass}
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/approve.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been approved");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed approve checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }
                    }
                }


            }

            $scope.spamChecked = function (data) {
                var message = "<h4>Are you sure want to spam all checked comment?</h4>";
                var btn = "Mark as Spam";
                var btnClass = "btn-warning";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        var param = [];
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/spam.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been spammed");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed to spam checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }
                    }
                }
            }

            $scope.removeChecked = function (data) {
                var param = [];
                var message = "<h4>Are you sure want to remove all checked comment?</h4>";
                var btn = "Delete";
                var btnClass = "btn-danger";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/remove.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been deleted");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed to delete checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }

                    }
                }
            }

            $scope.clearSearch = function (query, sort) {
                query = '';
                $scope.search = '';
                $scope.searchPost(query, sort);
            }

            $scope.searchPost = function (query, sort) {
                sort = angular.isUndefined(sort) ? "desc" : sort;
                query = angular.isUndefined(query) ? "" : query;

                $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&query=" + query
                    + "&order=" + sort)
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

            navigationService.syncTree({ tree: 'uCommentatorSection', path: ["-1", "dashboard"], forceReload: false });
        })
    .controller("uCommentator.Approved.controller",
        function ($scope, $http, $route, $routeParams, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, navigationService) {
            var settings = uCommentatorResource.getSettings();

            $scope.comment = {};
            $scope.cursor = {};
            $scope.search = '';
            $scope.sortComment = 'desc';

            var include = "&include=approved";

            var url = "https://disqus.com/api/3.0/posts/list.json?";

            $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
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

            $scope.markSpam = function (data) {
                var spamDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/spamDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            }

            $scope.showComment = function (comment) {
                var approveDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/showDialog.html',
                    show: true,
                    dialogData: comment,
                    closeCallback: done
                });
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
            }

            $scope.deleteComment = function (data) {
                var deleteDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/deleteDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            }

            $scope.commentDetail = function (data) {
                var detailDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/detailDialog.html',
                    closeCallback: done,
                    dialogData: data,
                    show: true
                });

                function done(data) {
                    if (data.resp != "cancel" && data.resp != null) {
                        if (data.resp.code == 0) {
                            notificationsService.success("Success", "Reply comment has been send, page will refreshed");
                            $timeout(function () {
                                $route.reload();
                            }, 3000);
                        } else if (data.resp.code != 0 && data.resp.status == "reply") {
                            notificationsService.error("Error", "Failed to reply comment, please try again later");
                        }
                    }
                }
            }

            $scope.goToPage = function (page) {
                $scope.sortComment = angular.isUndefined($scope.sortComment) ? "desc" : $scope.sortComment;
                $scope.search = angular.isUndefined($scope.search) ? "" : $scope.search;

                $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&cursor=" + page
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
                .success(function (data) {
                    $scope.comment = data.response;
                    $scope.cursor = data.cursor;
                });
            }

            $scope.check = function (check) {
                if (check) {
                    angular.forEach($scope.comment, function (value, key) {
                        value.isChecked = true;
                    });
                }

                if (!check) {
                    angular.forEach($scope.comment, function (value, key) {
                        value.isChecked = false;
                    });
                }
                check = !check;
            }

            $scope.approveChecked = function (data) {
                var param = [];
                var message = "<h4>Are you sure want to approve all checked comment?</h4>";
                var btn = "Approve";
                var btnClass = "btn-primary";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/approve.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been approved");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed approve checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }
                    }
                }


            }

            $scope.spamChecked = function (data) {
                var message = "<h4>Are you sure want to spam all checked comment?</h4>";
                var btn = "Mark as Spam";
                var btnClass = "btn-warning";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        var param = [];
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/spam.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been spammed");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed to spam checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }
                    }
                }
            }

            $scope.removeChecked = function (data) {
                var param = [];
                var message = "<h4>Are you sure want to remove all checked comment?</h4>";
                var btn = "Delete";
                var btnClass = "btn-danger";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/remove.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been deleted");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed to delete checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }

                    }
                }
            }

            $scope.clearSearch = function (query, sort) {
                query = '';
                $scope.search = '';
                $scope.searchPost(query, sort);
            }

            $scope.searchPost = function (query, sort) {
                sort = angular.isUndefined(sort) ? "desc" : sort;
                query = angular.isUndefined(query) ? "" : query;

                $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&query=" + query
                    + "&order=" + sort)
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

            navigationService.syncTree({ tree: 'uCommentatorSection', path: ["-1", "approved"], forceReload: false });
        })
    .controller("uCommentator.Pending.controller",
        function ($scope, $http, $route, $routeParams, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, navigationService) {
            var settings = uCommentatorResource.getSettings();

            $scope.comment = {};
            $scope.cursor = {};
            $scope.search = '';
            $scope.sortComment = 'desc';

            var include = "&include=unapproved";

            var url = "https://disqus.com/api/3.0/posts/list.json?";

            $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
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

            $scope.markSpam = function (data) {
                var spamDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/spamDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            }

            $scope.showComment = function (comment) {
                var approveDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/showDialog.html',
                    show: true,
                    dialogData: comment,
                    closeCallback: done
                });
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
            }

            $scope.deleteComment = function (data) {
                var deleteDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/deleteDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            }

            $scope.commentDetail = function (data) {
                var detailDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/detailDialog.html',
                    closeCallback: done,
                    dialogData: data,
                    show: true
                });

                function done(data) {
                    if (data.resp != "cancel" && data.resp != null) {
                        if (data.resp.code == 0) {
                            notificationsService.success("Success", "Reply comment has been send, page will refreshed");
                            $timeout(function () {
                                $route.reload();
                            }, 3000);
                        } else if (data.resp.code != 0 && data.resp.status == "reply") {
                            notificationsService.error("Error", "Failed to reply comment, please try again later");
                        }
                    }
                }
            }

            $scope.goToPage = function (page) {
                $scope.sortComment = angular.isUndefined($scope.sortComment) ? "desc" : $scope.sortComment;
                $scope.search = angular.isUndefined($scope.search) ? "" : $scope.search;

                $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&cursor=" + page
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
                .success(function (data) {
                    $scope.comment = data.response;
                    $scope.cursor = data.cursor;
                });
            }

            $scope.check = function (check) {
                if (check) {
                    angular.forEach($scope.comment, function (value, key) {
                        value.isChecked = true;
                    });
                }

                if (!check) {
                    angular.forEach($scope.comment, function (value, key) {
                        value.isChecked = false;
                    });
                }
                check = !check;
            }

            $scope.approveChecked = function (data) {
                var param = [];
                var message = "<h4>Are you sure want to approve all checked comment?</h4>";
                var btn = "Approve";
                var btnClass = "btn-primary";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/approve.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been approved");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed approve checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }
                    }
                }


            }

            $scope.spamChecked = function (data) {
                var message = "<h4>Are you sure want to spam all checked comment?</h4>";
                var btn = "Mark as Spam";
                var btnClass = "btn-warning";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        var param = [];
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/spam.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been spammed");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed to spam checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }
                    }
                }
            }

            $scope.removeChecked = function (data) {
                var param = [];
                var message = "<h4>Are you sure want to remove all checked comment?</h4>";
                var btn = "Delete";
                var btnClass = "btn-danger";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/remove.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been deleted");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed to delete checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }

                    }
                }
            }

            $scope.clearSearch = function (query, sort) {
                query = '';
                $scope.search = '';
                $scope.searchPost(query, sort);
            }

            $scope.searchPost = function (query, sort) {
                sort = angular.isUndefined(sort) ? "desc" : sort;
                query = angular.isUndefined(query) ? "" : query;

                $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&query=" + query
                    + "&order=" + sort)
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

            navigationService.syncTree({ tree: 'uCommentatorSection', path: ["-1", "pending"], forceReload: false });
        })
    .controller("uCommentator.Spam.controller",
        function ($scope, $http, $route, $routeParams, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, navigationService) {
            var settings = uCommentatorResource.getSettings();

            $scope.cursor = {};
            $scope.comment = {};
            $scope.search = '';
            $scope.sortComment = 'desc';

            $scope.timezone = new Date().getTimezoneOffset();

            var include = "&include=spam";

            var url = "https://disqus.com/api/3.0/posts/list.json?";

            $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread" +
                    include
                    + "&limit=" + settings.limit
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
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

            $scope.markSpam = function (data) {
                var spamDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/spamDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            }

            $scope.showComment = function (comment) {
                var approveDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/showDialog.html',
                    show: true,
                    dialogData: comment,
                    closeCallback: done
                });
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
            }

            $scope.deleteComment = function (data) {
                var deleteDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/deleteDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            }

            $scope.commentDetail = function (data) {
                var detailDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/detailDialog.html',
                    closeCallback: done,
                    dialogData: data,
                    show: true
                });

                function done(data) {
                    if (data.resp != "cancel" && data.resp != null) {
                        if (data.resp.code == 0) {
                            notificationsService.success("Success", "Reply comment has been send, page will refreshed");
                            $timeout(function () {
                                $route.reload();
                            }, 3000);
                        } else if (data.resp.code != 0 && data.resp.status == "reply") {
                            notificationsService.error("Error", "Failed to reply comment, please try again later");
                        }
                    }
                }
            }

            $scope.goToPage = function (page) {
                $scope.sortComment = angular.isUndefined($scope.sortComment) ? "desc" : $scope.sortComment;
                $scope.search = angular.isUndefined($scope.search) ? "" : $scope.search;

                $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&cursor=" + page
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
                .success(function (data) {
                    $scope.comment = data.response;
                    $scope.cursor = data.cursor;
                });
            }

            $scope.check = function (check) {
                if (check) {
                    angular.forEach($scope.comment, function (value, key) {
                        value.isChecked = true;
                    });
                }

                if (!check) {
                    angular.forEach($scope.comment, function (value, key) {
                        value.isChecked = false;
                    });
                }
                check = !check;
            }

            $scope.approveChecked = function (data) {
                var param = [];
                var message = "<h4>Are you sure want to approve all checked comment?</h4>";
                var btn = "Approve";
                var btnClass = "btn-primary";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/approve.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been approved");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed approve checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }
                    }
                }


            }

            $scope.spamChecked = function (data) {
                var message = "<h4>Are you sure want to spam all checked comment?</h4>";
                var btn = "Mark as Spam";
                var btnClass = "btn-warning";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        var param = [];
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/spam.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been spammed");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed to spam checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }
                    }
                }
            }

            $scope.removeChecked = function (data) {
                var param = [];
                var message = "<h4>Are you sure want to remove all checked comment?</h4>";
                var btn = "Delete";
                var btnClass = "btn-danger";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/remove.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been deleted");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed to delete checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }

                    }
                }
            }

            $scope.clearSearch = function (query, sort) {
                query = '';
                $scope.search = '';
                $scope.searchPost(query, sort);
            }

            $scope.searchPost = function (query, sort) {
                sort = angular.isUndefined(sort) ? "desc" : sort;
                query = angular.isUndefined(query) ? "" : query;

                $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&query=" + query
                    + "&order=" + sort)
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

            navigationService.syncTree({ tree: 'uCommentatorSection', path: ["-1", "spam"], forceReload: false });
        })
    .controller("uCommentator.Deleted.controller",
        function ($scope, $http, $route, $routeParams, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, navigationService) {
            var settings = uCommentatorResource.getSettings();

            $scope.comment = {};
            $scope.cursor = {};
            $scope.search = '';
            $scope.sortComment = 'desc';

            var include = "&include=deleted";

            var url = "https://disqus.com/api/3.0/posts/list.json?";

            $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
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

            $scope.markSpam = function (data) {
                var spamDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/spamDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            }

            $scope.showComment = function (comment) {
                var approveDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/showDialog.html',
                    show: true,
                    dialogData: comment,
                    closeCallback: done
                });
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
            }

            $scope.deleteComment = function (data) {
                var deleteDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/deleteDialog.html',
                    show: true,
                    dialogData: data,
                    closeCallback: done
                });
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
            }

            $scope.commentDetail = function (data) {
                var detailDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/detailDialog.html',
                    closeCallback: done,
                    dialogData: data,
                    show: true
                });

                function done(data) {
                    if (data.resp != "cancel" && data.resp != null) {
                        if (data.resp.code == 0) {
                            notificationsService.success("Success", "Reply comment has been send, page will refreshed");
                            $timeout(function () {
                                $route.reload();
                            }, 3000);
                        } else if (data.resp.code != 0 && data.resp.status == "reply") {
                            notificationsService.error("Error", "Failed to reply comment, please try again later");
                        }
                    }
                }
            }

            $scope.goToPage = function (page) {
                $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&cursor=" + page
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
                .success(function (data) {
                    $scope.comment = data.response;
                    $scope.cursor = data.cursor;
                });
            }

            $scope.check = function (check) {
                if (check) {
                    angular.forEach($scope.comment, function (value, key) {
                        value.isChecked = true;
                    });
                }

                if (!check) {
                    angular.forEach($scope.comment, function (value, key) {
                        value.isChecked = false;
                    });
                }
                check = !check;
            }

            $scope.approveChecked = function (data) {
                var param = [];
                var message = "<h4>Are you sure want to approve all checked comment?</h4>";
                var btn = "Approve";
                var btnClass = "btn-primary";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/approve.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been approved");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed approve checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }
                    }
                }


            }

            $scope.spamChecked = function (data) {
                var message = "<h4>Are you sure want to spam all checked comment?</h4>";
                var btn = "Mark as Spam";
                var btnClass = "btn-warning";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        var param = [];
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/spam.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been spammed");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed to spam checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }
                    }
                }
            }

            $scope.removeChecked = function (data) {
                var param = [];
                var message = "<h4>Are you sure want to remove all checked comment?</h4>";
                var btn = "Delete";
                var btnClass = "btn-danger";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: { message: message, btn: btn, btnClass: btnClass }
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        angular.forEach(data, function (value, key) {
                            if (value.isChecked) {
                                param.push(value.id);
                            }
                        });

                        if (param.length > 0) {
                            var req = { api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token, post: param };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/posts/remove.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    if (resp.code == 0) {
                                        notificationsService.success("Success", "Checked comment has been deleted");
                                        $timeout(function () {
                                            $route.reload();
                                        }, 3000);
                                    } else {
                                        notificationsService.error("Error", "Failed to delete checked comment, please try again later");
                                    }
                                }).error(function (resp) {
                                    dialogService.closeAll({ dialogData: $scope.comment, resp: resp });
                                });
                        }

                    }
                }
            }

            $scope.clearSearch = function (query, sort) {
                query = '';
                $scope.search = '';
                $scope.searchPost(query, sort);
            }

            $scope.searchPost = function (query, sort) {
                sort = angular.isUndefined(sort) ? "desc" : sort;
                query = angular.isUndefined(query) ? "" : query;

                $http.get("https://disqus.com/api/3.0/posts/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&category=" + settings.category
                    + "&category=" + new Date().getTime()
                    + "&related=thread"
                    + include
                    + "&limit=" + settings.limit
                    + "&query=" + query
                    + "&order=" + sort)
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

            navigationService.syncTree({ tree: 'uCommentatorSection', path: ["-1", "deleted"], forceReload: false });
        })
    .controller("uCommentator.BlacklistUser.controller",
        function ($scope, $http, $route, $routeParams, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, navigationService) {
            var settings = uCommentatorResource.getSettings();

            $scope.blacklist = {};
            $scope.cursor = {};
            $scope.search = '';
            $scope.sortComment = 'asc';

            $http.get("https://disqus.com/api/3.0/blacklists/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&forum=" + settings.short_name
                    + "&limit=" + settings.limit
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
                .success(function (data) {

                    $scope.blacklist = data.response;
                    $scope.cursor = data.cursor;

                    angular.forEach($scope.blacklist, function (value, key) {
                        value.isChecked = false;
                    });
                })
                .error(function (resp) {
                    notificationsService.error("Error", "Failed to retrieve blacklist user, please try again later / refresh page");
                });

            $scope.add = function () {
                var addDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/addBlacklistDialog.html',
                    show: true,
                    closeCallback: done
                });
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
            }

            $scope.delete = function (data) {
                var message = "<h4>Are you sure want to remove this blacklist?</h4>";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    dialogData: message,
                    closeCallback: done
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        var req = { forum: settings.short_name, api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token };
                        req[data.type] = angular.isObject(data.value) ? data.value.id : data.value;

                        $http({
                            method: "POST",
                            url: "https://disqus.com/api/3.0/blacklists/remove.json",
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
                    }
                }
            }

            $scope.goToPage = function (page) {
                $scope.search = angular.isUndefined($scope.search) ? "" : $scope.search;

                $http.get("https://disqus.com/api/3.0/blacklists/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&forum=" + settings.short_name
                    + "&limit=" + settings.limit
                    + "&cursor=" + page
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
                .success(function (data) {
                    $scope.blacklist = data.response;
                    $scope.cursor = data.cursor;
                });
            }

            $scope.check = function (check) {
                if (check) {
                    angular.forEach($scope.blacklist, function (value, key) {
                        value.isChecked = true;
                    });
                }

                if (!check) {
                    angular.forEach($scope.blacklist, function (value, key) {
                        value.isChecked = false;
                    });
                }
            }

            $scope.removeChecked = function (data) {
                var email = [];
                var ipAddress = [];
                var user = [];
                var domain = [];
                var message = "<h4>Are you sure want to remove checked blacklist?</h4>";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: message
                });

                function done(resp) {
                    if (resp.resp == 'ok') {

                        angular.forEach(data, function (value, key) {
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
                                        user.push(angular.isObject(value.value) ? value.value.id : value.value)
                                        break;
                                    default:
                                        break;
                                }
                            }
                        });

                        if (email.length > 0 || ipAddress.length > 0 || domain.length > 0 || user.length > 0) {
                            var req = {
                                api_key: settings.api_key,
                                api_secret: settings.api_secret,
                                access_token: settings.access_token,
                                forum: settings.short_name,
                                domain: domain,
                                ip: ipAddress,
                                user: user,
                                email: email
                            };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/blacklists/remove.json",
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
            }

            $scope.clearSearch = function (query) {
                query = '';
                $scope.search = '';
                $scope.searchPost(query);
            }

            $scope.searchPost = function (query) {
                query = angular.isUndefined(query) ? "" : query;

                $http.get("https://disqus.com/api/3.0/blacklists/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&forum=" + settings.short_name
                    + "&limit=" + settings.limit
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
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

            navigationService.syncTree({ tree: 'uCommentatorSection', path: ["-1", "blacklist"], forceReload: false });
        })
    .controller("uCommentator.AddBlacklist.controller",
        function ($scope, dialogService, $http, $route, umbRequestHelper, notificationsService, uCommentatorResource) {
            
            var settings = uCommentatorResource.getSettings();

            $scope.addBlacklist = function (data) {
                var notes = angular.isUndefined(data.notes) ? "Added by uCommentator" : data.notes;
                var type = data.type;
                var value = data.value;
                var message = "<h4>Are you sure want to add this blacklist?</h4>";

                if (value != "") {
                    var confirmationDialog = dialogService.open({
                        template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                        show: true,
                        closeCallback: done,
                        dialogData: message
                    });

                    function done(data) {
                        if (data.resp == 'ok') {
                            var req = {};
                            req["api_key"] = settings.api_key;
                            req["api_secret"] = settings.api_secret;
                            req["access_token"] = settings.access_token;
                            req["forum"] = settings.short_name;
                            req["notes"] = notes;
                            req[type] = type == "user" ? (angular.isNumber(value) ? value : "username:" + value) : value;

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/blacklists/add.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    resp.response = resp.response;
                                    dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                                }).error(function (resp) {
                                    dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                                });
                        }
                    }
                } else {
                    notificationsService.error("Error", "Value must not empty");
                }
            }

            $scope.cancel = function () {
                dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
            };
        })
    .controller("uCommentator.WhitelistUser.controller",
        function ($scope, $http, $route, $routeParams, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, navigationService) {
            var settings = uCommentatorResource.getSettings();

            $scope.whitelist = {};
            $scope.cursor = {};
            $scope.search = '';
            $scope.sortComment = 'asc';

            $http.get("https://disqus.com/api/3.0/whitelists/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&forum=" + settings.short_name
                    + "&limit=" + settings.limit
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
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

            $scope.add = function () {
                var addDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/addWhitelistDialog.html',
                    show: true,
                    closeCallback: done
                });
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
            }

            $scope.delete = function (data) {
                var message = "<h4>Are you sure want to remove this whitelist?</h4>";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    dialogData: message,
                    closeCallback: done
                });

                function done(resp) {
                    if (resp.resp == "ok") {
                        var req = { forum: settings.short_name, api_key: settings.api_key, api_secret: settings.api_secret, access_token: settings.access_token };
                        req[data.type] = angular.isObject(data.value) ? data.value.id : data.value;

                        $http({
                            method: "POST",
                            url: "https://disqus.com/api/3.0/whitelists/remove.json",
                            params: req,
                            config: { timeout: 30000 }
                        })
                            .success(function (resp) {
                                if (resp.code == 0) {
                                    notificationsService.success("Success", "Whitelist has been removed");
                                    $timeout(function () {
                                        $route.reload();
                                    }, 3000);
                                } else {
                                    notificationsService.error("Error", "Failed to remove whitelist, please try again later");
                                }
                            }).error(function (resp) {
                                notificationsService.error("Error", "Failed to remove whitelist, please try again later");
                            });
                    }
                }
            }

            $scope.goToPage = function (page) {
                $scope.search = angular.isUndefined($scope.search) ? "" : $scope.search;

                $http.get("https://disqus.com/api/3.0/whitelists/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&forum=" + settings.short_name
                    + "&limit=" + settings.limit
                    + "&cursor=" + page
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
                .success(function (data) {
                    $scope.whitelist = data.response;
                    $scope.cursor = data.cursor;
                });
            }

            $scope.check = function (check) {
                if (check) {
                    angular.forEach($scope.whitelist, function (value, key) {
                        value.isChecked = true;
                    });
                }

                if (!check) {
                    angular.forEach($scope.whitelist, function (value, key) {
                        value.isChecked = false;
                    });
                }
            }

            $scope.removeChecked = function (data) {
                var email = [];
                var ipAddress = [];
                var user = [];
                var domain = [];
                var message = "<h4>Are you sure want to remove checked whitelist?</h4>";

                var confirmationDialog = dialogService.open({
                    template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                    show: true,
                    closeCallback: done,
                    dialogData: message
                });

                function done(resp) {
                    if (resp.resp == 'ok') {

                        angular.forEach(data, function (value, key) {
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
                                        user.push(angular.isObject(value.value) ? value.value.id : value.value)
                                        break;
                                    default:
                                        break;
                                }
                            }
                        });

                        if (email.length > 0 || ipAddress.length > 0 || domain.length > 0 || user.length > 0) {
                            var req = {
                                api_key: settings.api_key,
                                api_secret: settings.api_secret,
                                access_token: settings.access_token,
                                forum: settings.short_name,
                                domain: domain,
                                ip: ipAddress,
                                user: user,
                                email: email
                            };

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/whitelists/remove.json",
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
            }

            $scope.clearSearch = function (query) {
                query = '';
                $scope.search = '';
                $scope.searchPost(query);
            }

            $scope.searchPost = function (query) {
                query = angular.isUndefined(query) ? "" : query;

                $http.get("https://disqus.com/api/3.0/whitelists/list.json?" +
                    "access_token=" + settings.access_token
                    + "&api_key=" + settings.api_key
                    + "&api_secret=" + settings.api_secret
                    + "&forum=" + settings.short_name
                    + "&limit=" + settings.limit
                    + "&query=" + $scope.search
                    + "&order=" + $scope.sortComment)
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

            navigationService.syncTree({ tree: 'uCommentatorSection', path: ["-1", "whitelist"], forceReload: false });
        })
    .controller("uCommentator.AddWhitelist.controller",
        function ($scope, dialogService, $http, $route, umbRequestHelper, notificationsService, uCommentatorResource) {
            var settings = uCommentatorResource.getSettings();

            $scope.addWhitelist = function (data) {
                var notes = angular.isUndefined(data.notes) ? "Added by uCommentator" : data.notes;
                var type = data.type;
                var value = data.value;
                var message = "<h4>Are you sure want to add this whitelist?</h4>";

                if (value != "") {
                    var confirmationDialog = dialogService.open({
                        template: '/App_Plugins/uCommentator/backoffice/uCommentatorSection/confirmationDialog.html',
                        show: true,
                        closeCallback: done,
                        dialogData: message
                    });

                    function done(data) {
                        if (data.resp == 'ok') {
                            var req = {};
                            req["api_key"] = settings.api_key;
                            req["api_secret"] = settings.api_secret;
                            req["access_token"] = settings.access_token;
                            req["forum"] = settings.short_name;
                            req["notes"] = notes;
                            req[type] = type == "user" ? (angular.isNumber(value) ? value : "username:" + value) : value;

                            $http({
                                method: "POST",
                                url: "https://disqus.com/api/3.0/whitelists/add.json",
                                params: req,
                                config: { timeout: 30000 }
                            })
                                .success(function (resp) {
                                    resp.response = resp.response;
                                    dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                                }).error(function (resp) {
                                    dialogService.close($scope.$parent.dialogOptions, { resp: resp });
                                });
                        }
                    }
                } else {
                    notificationsService.error("Error", "Value must not empty");
                }
            }

            $scope.cancel = function () {
                dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
            };
        })
})();
