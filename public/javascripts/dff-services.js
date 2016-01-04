var app = angular.module('DailyFantasyFootball');

// TODO: We need an authentication service anyway. This should go there too.
app.factory('LogoutService', function($rootScope, $resource, $location) {
    return function() {
        var Login = $resource('/api/v1/login');
        Login.delete(function() {
            $rootScope.user = null;
            $location.path('/');
        });
    };
});
