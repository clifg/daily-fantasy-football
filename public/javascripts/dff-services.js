var app = angular.module('DailyFantasyFootball');

app.factory('LogoutService', function($rootScope, $resource, $location) {
    return function() {
        var Login = $resource('/api/v1/login');
        Login.delete();
        $rootScope.user = null;
        $location.path('/');
    };
});