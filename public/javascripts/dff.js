var app = angular.module('DailyFantasyFootball', ['ui.bootstrap', 'ngResource', 'ngRoute']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        })
        .when('/contest/:id', {
            templateUrl: 'partials/contest.html',
            controller: 'ContestCtrl'
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
        .when('/addweek', {
            templateUrl: '/partials/week-form.html',
            controller: 'AddWeekCtrl'
        })
        .when('/editweek/:id', {
            templateUrl: '/partials/week-form.html',
            controller: 'EditWeekCtrl'
        })
        .when('/editweek/:id/players', {
            templateUrl: '/partials/edit-players.html',
            controller: 'EditPlayersCtrl'
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

// TODO: Move directives to their own file
app.directive('header', function() {
    return {
        restrict: 'A',
        templateUrl: 'partials/header.html',
        controller: 'NavbarCtrl'
    }
});

app.directive('onFileChange', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.onFileChange);
            element.bind('change', onChangeHandler);
        }
    };
});
