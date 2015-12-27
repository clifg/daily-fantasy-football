var app = angular.module('DailyFantasyFootball');

app.controller('HomeCtrl', ['$scope', '$resource',
    function($scope, $resource) {
        var Weeks = $resource('/api/v1/weeks');

        Weeks.query(function(weeks) {
            $scope.weeks = weeks;
        });
    }
]);

app.controller('UserCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams) {        
        var Users = $resource('/api/v1/users/:id', { id: '@_id' }, {
            update: { method: 'PUT' }
        });

        Users.get({ id: $routeParams.id }, function(user) {
            console.log('*** got user');
            $scope.user = user;
        });

        $scope.save = function() {
            Users.update($scope.user, function() {
                $location.path('/');
            });
        };

        $scope.delete = function() {
            Users.delete({ id: $routeParams.id }, function(user) {
                $location.path('/');
            });
        };
    }
]);

app.controller('MeCtrl', ['$rootScope', '$scope', '$resource', '$location', 
    function($rootScope, $scope, $resource, $location) {
        var Me = $resource('/api/v1/users/me');

        Me.get(function(user) {
            $scope.user = user;
        });

        $scope.delete = function() {
            Me.delete(function(user) {
                // TODO: Create a service for managing user state
                $rootScope.user = null;
                $location.path('/');
            });
        };
    }
]);

app.controller('AdminCtrl', ['$rootScope', '$scope', '$resource', '$location',
    function($rootScope, $scope, $resource, $location) {
        // TODO: Move the admin check to a service. This check should probably be in one
        // of those 'resolve' things rather than in this contoller too...
        if (!$rootScope.user.isAdmin) {
            $location.path('/');
        } else {
            var Users = $resource('/api/v1/users');

            Users.query(function(users) {
                $scope.users = users;
            });

            var Weeks = $resource('/api/v1/weeks');

            Weeks.query(function(weeks) {
                $scope.weeks = weeks;
            });
        }
    }
]);

app.controller('AddWeekCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams) {
        $scope.save = function() {
            var Weeks = $resource('/api/v1/weeks');

            Weeks.save($scope.week, function() {
                $location.path('/admin');
            }, function() {
                // TODO: handle failures
            });
        };
    }
]);

app.controller('NavbarCtrl', ['$rootScope', '$scope', '$location', 
    function($rootScope, $scope, $location) {
        $scope.user = $rootScope.user;
    }
]);