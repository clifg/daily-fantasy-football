var app = angular.module('DailyFantasyFootball', ['ngResource', 'ngRoute']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        })
        .when('/user/:id', {
            templateUrl: 'partials/user-form.html',
            controller: 'UserCtrl'
        })
        .when('/me', {
            templateUrl: 'partials/user-form.html',
            controller: 'MeCtrl'
        })
        .when('/admin', {
            templateUrl: 'partials/admin.html',
            controller: 'AdminCtrl'
        })
        .when('/login', {
            templateUrl: 'partials/login.html'
        })
        .when('/logout', {
            templateUrl: 'partials/login.html',
            controller: 'LogoutCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.run(['$rootScope', '$resource', '$location', function($rootScope, $resource, $location) {
    console.log('Running app.run function');
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        console.log('route change start...');
        if ($rootScope.user == null)
        {
            var Login = $resource('/api/v1/login');

            Login.get(function(user) {
                // We're logged in -- store the user for everyone to use
                $rootScope.user = user;
            }, function() {
                // If we fail, redirect the user to log in
                if (next.templteUrl != 'partials/login.html')
                {
                    $location.url('/login');
                }
            });
        }
    });
}]);


app.controller('HomeCtrl', ['$scope', '$resource',
    function($scope, $resource) {
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

app.controller('AdminCtrl', ['$scope', '$resource',
    function($scope, $resource) {
        var Users = $resource('/api/v1/users');

        Users.query(function(users) {
            $scope.users = users;
        });
    }
]);

app.controller('LogoutCtrl', ['$rootScope', '$scope', '$resource', '$location',
    function($rootScope, $scope, $resource, $location) {
        var Login = $resource('/api/v1/login');
        Login.delete();
        $rootScope.user = null;
        $location.path('/');
    }
]);

app.directive('header', function() {
    return {
        restrict: 'A',
        templateUrl: 'partials/header.html',
        controller: 'NavbarCtrl'
    }
});

// TODO: Move this
app.controller('NavbarCtrl', ['$rootScope', '$scope', '$location', 
    function($rootScope, $scope, $location) {
        $scope.user = $rootScope.user;
    }
]);
