(function () {
    var commentManager = function ($scope,
        $http,
        $route,
        notificationsService,
        dialogService,
        $rootScope,
        $compile,
        $log,
        $q,
        $templateCache,
        umbRequestHelper,
        $timeout,
        uCommentatorResource,
        includes) {
        $scope.comment = {};
        $scope.cursor = {};
        $scope.search = '';
        $scope.sortComment = 'desc';

        uCommentatorResource.listComment($scope, notificationsService, includes);

        $scope.markSpam = function (data) {
            uCommentatorResource.showMarkSpamDialog(data, $scope, dialogService, notificationsService);
        }

        $scope.showComment = function (comment) {
            uCommentatorResource.showApproveDialog(comment, $scope, dialogService, notificationsService);
        }

        $scope.deleteComment = function (data) {
            uCommentatorResource.showDeleteDialog(data, $scope, dialogService, notificationsService);
        }

        $scope.commentDetail = function (data) {
            uCommentatorResource.showDetailDialog(data, $scope, dialogService, notificationsService);
        }

        $scope.goToPage = function (page) {
            uCommentatorResource.listComment($scope, notificationsService, includes, page);
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
            uCommentatorResource.showApproveCheckedDialog(data, $scope, dialogService, notificationsService);
        }

        $scope.spamChecked = function (data) {
            uCommentatorResource.showMarkSpamCheckedDialog(data, $scope, dialogService, notificationsService);
        }

        $scope.removeChecked = function (data) {
            uCommentatorResource.showDeleteCheckedDialog(data, $scope, dialogService, notificationsService);
        }

        $scope.clearSearch = function (query, sort) {
            query = '';
            $scope.search = '';
            $scope.searchPost(query, sort);
        }

        $scope.searchPost = function (query, sort) {
            uCommentatorResource.searchComment($scope, notificationsService, includes, query, sort);
        }
    }

    angular.module("umbraco")
        .controller("uCommentator.ConfirmationDialog.controller",
            function($scope, dialogService) {
                $scope.message = $scope.dialogData;

                $scope.ok = function() {
                    dialogService.close($scope.$parent.dialogOptions, { resp: "ok" });
                };

                $scope.cancel = function() {
                    dialogService.close($scope.$parent.dialogOptions, { resp: "cancel" });
                };
            })
        .controller("uCommentator.DeleteComment.controller",
            function($scope, dialogService, $http, $route, umbRequestHelper, uCommentatorResource) {
                $scope.comment = $scope.dialogData;

                $scope.delete = function(id) {
                    if (id > 0) {
                        uCommentatorResource.removeComment(id, $scope, dialogService);
                    }
                }

                $scope.cancelDelete = function() {
                    dialogService.closeAll({ dialogData: $scope.comment, resp: "cancel" });
                };
            })
        .controller("uCommentator.SpamComment.controller",
            function($scope, dialogService, $http, $route, umbRequestHelper, uCommentatorResource) {
                $scope.comment = $scope.dialogData;

                $scope.spam = function(id) {
                    if (id > 0) {
                        uCommentatorResource.moveToSpamComment(id, $scope, dialogService);
                    }
                }

                $scope.cancelSpam = function() {
                    dialogService.closeAll({ dialogData: $scope.comment, resp: "cancel" });
                };
            })
        .controller("uCommentator.ShowComment.controller",
            function($scope, dialogService, $http, $route, umbRequestHelper, uCommentatorResource) {
                $scope.comment = $scope.dialogData;

                $scope.show = function(id) {
                    if (id > 0) {
                        uCommentatorResource.approveComment(id, $scope, dialogService);
                    }
                }

                $scope.cancelShow = function() {
                    dialogService.closeAll({ dialogData: $scope.comment, resp: "cancel" });
                };
            })
        .controller("uCommentator.DetailComment.controller",
            function($scope, dialogService, $http, $route, umbRequestHelper, notificationsService, $timeout, uCommentatorResource) {
                $scope.comment = $scope.dialogData;
                $scope.context = {};

                if ($scope.comment.parent != null) {
                    uCommentatorResource.detailComment($scope, notificationsService);
                }

                $scope.close = function() {
                    dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
                };

                $scope.whitelist = function(data) {
                    uCommentatorResource.showWhitelistDialog(data, $scope, dialogService, notificationsService);
                };

                $scope.blacklist = function(data) {
                    uCommentatorResource.showBlacklistDialog(data, $scope, dialogService, notificationsService);
                };

                $scope.save = function(data) {
                    uCommentatorResource.showReplyDialog(data, $scope, dialogService);
                }

                $scope.edit = function(data) {
                    uCommentatorResource.showEditDialog(data, $scope, dialogService);
                }
            })
        .controller("uCommentator.Whitelist.controller",
            function($scope, dialogService, $http, $route, umbRequestHelper, uCommentatorResource) {
                $scope.comment = $scope.dialogData;

                $scope.approve = function(data) {
                    uCommentatorResource.showAddWhitelistDialog(data, $scope, dialogService);
                };

                $scope.close = function() {
                    dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
                };
            })
        .controller("uCommentator.Blacklist.controller",
            function($scope, dialogService, $http, $route, umbRequestHelper, uCommentatorResource) {
                $scope.comment = $scope.dialogData;

                $scope.approve = function(data) {
                    uCommentatorResource.showAddBlacklistDialog(data, $scope, dialogService);
                };

                $scope.close = function() {
                    dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
                };
            })
        .controller("uCommentator.DisqusComment.controller",
            function($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource) {
                var includes = ["unapproved", "approved", "spam", "deleted", "flagged", "highlighted"];
                commentManager($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, includes);
            })
        .controller("uCommentator.Approved.controller",
            function($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource) {
                var includes = ["approved"];
                commentManager($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, includes);
            })
        .controller("uCommentator.Pending.controller",
            function($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource) {
                var includes = ["unapproved"];
                commentManager($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, includes);
            })
        .controller("uCommentator.Spam.controller",
            function($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource) {
                var includes = ["spam"];
                commentManager($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, includes);
            })
        .controller("uCommentator.Deleted.controller",
            function ($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource) {
                var includes = ["deleted"];
                commentManager($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource, includes);
            })
        .controller("uCommentator.BlacklistUser.controller",
            function($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource) {
                $scope.blacklist = {};
                $scope.cursor = {};
                $scope.search = '';
                $scope.sortComment = 'asc';

                uCommentatorResource.listBlacklist($scope, notificationsService);

                $scope.add = function () {
                    uCommentatorResource.showAddBlacklistUserDialog(dialogService, notificationsService);
                }

                $scope.delete = function(data) {
                    uCommentatorResource.showDeleteBlacklistDialog(data, $scope, dialogService, notificationsService);
                }

                $scope.goToPage = function(page) {
                    uCommentatorResource.listBlacklist($scope, notificationsService, page);
                }

                $scope.check = function(check) {
                    if (check) {
                        angular.forEach($scope.blacklist, function(value, key) {
                            value.isChecked = true;
                        });
                    }

                    if (!check) {
                        angular.forEach($scope.blacklist, function(value, key) {
                            value.isChecked = false;
                        });
                    }
                }

                $scope.removeChecked = function (data) {
                    uCommentatorResource.showDeleteBlacklistCheckedDialog(data, $scope, dialogService, notificationsService);
                }

                $scope.clearSearch = function(query) {
                    query = '';
                    $scope.search = '';
                    $scope.searchPost(query);
                }

                $scope.searchPost = function(query) {
                    uCommentatorResource.searchBlacklist($scope, notificationsService, query);
                }
            })
        .controller("uCommentator.AddBlacklist.controller",
            function($scope, dialogService, $http, $route, umbRequestHelper, notificationsService, uCommentatorResource) {
                $scope.addBlacklist = function (data) {
                    uCommentatorResource.showAddBlacklistConfirmationDialog(data, $scope, dialogService, notificationsService);
                }

                $scope.cancel = function() {
                    dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
                };
            })
        .controller("uCommentator.WhitelistUser.controller",
            function($scope, $http, $route, notificationsService, dialogService, $rootScope, $compile, $log, $q, $templateCache, umbRequestHelper, $timeout, uCommentatorResource) {
                $scope.whitelist = {};
                $scope.cursor = {};
                $scope.search = '';
                $scope.sortComment = 'asc';

                uCommentatorResource.listWhitelist($scope, notificationsService);

                $scope.add = function() {
                    uCommentatorResource.showAddWhitelistUserDialog(dialogService, notificationsService);
                }

                $scope.delete = function (data) {
                    uCommentatorResource.showDeleteWhitelistDialog(data, $scope, dialogService, notificationsService);
                }

                $scope.goToPage = function(page) {
                    uCommentatorResource.listWhitelist($scope, notificationsService, page);
                }

                $scope.check = function(check) {
                    if (check) {
                        angular.forEach($scope.whitelist, function(value, key) {
                            value.isChecked = true;
                        });
                    }

                    if (!check) {
                        angular.forEach($scope.whitelist, function(value, key) {
                            value.isChecked = false;
                        });
                    }
                }

                $scope.removeChecked = function (data) {
                    uCommentatorResource.showDeleteWhitelistCheckedDialog(data, $scope, dialogService, notificationsService);
                }

                $scope.clearSearch = function(query) {
                    query = '';
                    $scope.search = '';
                    $scope.searchPost(query);
                }

                $scope.searchPost = function (query) {
                    uCommentatorResource.searchWhitelist($scope, notificationsService, query);
                }
            })
        .controller("uCommentator.AddWhitelist.controller",
            function ($scope, dialogService, $http, $route, umbRequestHelper, notificationsService, uCommentatorResource) {
                $scope.addWhitelist = function (data) {
                    uCommentatorResource.showAddWhitelistConfirmationDialog(data, $scope, dialogService, notificationsService);
                }

                $scope.cancel = function() {
                    dialogService.close($scope.$parent.dialogOptions, { dialogData: $scope.comment, resp: "cancel" });
                };
            });
})();