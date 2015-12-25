var app = angular.module('DailyFantasyFootball', ['ngResource', 'ngRoute']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        })
        .when('/user/:id', {
            templateUrl: 'partials/user.html',
            controller: 'UserCtrl'
        })
        .when('/me', {
            templateUrl: 'partials/user.html',
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
            resolve: {
                logout: ['LogoutService', function(LogoutService) {
                    LogoutService();
                }]
            }
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

app.directive('header', function() {
    return {
        restrict: 'A',
        templateUrl: 'partials/header.html',
        controller: 'NavbarCtrl'
    }
});
