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
        $scope.datePickerStatus = {
            lockOpened: false,
            endOpened: false
        };

        $scope.lockDate = new Date();
        $scope.lockTime = new Date();

        $scope.endDate = new Date();
        $scope.endTime = new Date();

        $scope.lockDateOpen = function($event) {
            $scope.datePickerStatus.lockOpened = true;
        };

        $scope.endDateOpen = function($event) {
            $scope.datePickerStatus.endOpened = true;
        };

        // Default to the next Thursday for the lock date
        $scope.lockDate.setDate($scope.lockDate.getDate() + (4 - $scope.lockDate.getDay() + 6) % 6);
        $scope.lockTime.setHours(17);
        $scope.lockTime.setMinutes(0);
        $scope.lockTime.setSeconds(0);
        
        // Default to the Tuesday following that for the end date
        $scope.endDate.setDate($scope.lockDate.getDate() + 5);
        $scope.endTime.setHours(1);
        $scope.endTime.setMinutes(0);
        $scope.endTime.setSeconds(0);


        $scope.save = function() {
            // TODO: check that $scope.week is valid

            var Weeks = $resource('/api/v1/weeks');

            // TODO: Validate other inputs, like dates, etc

            // Put the date/time inputs into the proper format
            // $scope.week.
            var lockDateTime = new Date(
                $scope.lockDate.getFullYear(),
                $scope.lockDate.getMonth(),
                $scope.lockDate.getDate(),
                $scope.lockTime.getHours(),
                $scope.lockTime.getMinutes(),
                0);

            $scope.week.weekLockDate = lockDateTime.toISOString();

            var endDateTime = new Date(
                $scope.endDate.getFullYear(),
                $scope.endDate.getMonth(),
                $scope.endDate.getDate(),
                $scope.endTime.getHours(),
                $scope.endTime.getMinutes(),
                0);

            $scope.week.weekEndDate = endDateTime.toISOString();

            console.log('LockDate: ' + lockDateTime.toString() + '(' + $scope.week.weekLockDate + ')');
            console.log('EndDate: ' + endDateTime.toString() + '(' + $scope.week.weekEndDate + ')');

            Weeks.save($scope.week, function() {
                $location.path('/admin');
            }, function() {
                // TODO: handle failures
            });
        };
    }
]);

// TODO: Refactor shared code between this and the AddWeekCtrl
app.controller('EditWeekCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams) {
        var Weeks = $resource('/api/v1/weeks/:id', { id: '@_id' }, {
            update: { method: 'PUT' }
        });

        Weeks.get({ id: $routeParams.id }, function(week) {
            $scope.week = week;

            $scope.lockDate = new Date($scope.week.weekLockDate);
            $scope.lockTime = new Date($scope.week.weekLockDate);

            $scope.endDate = new Date($scope.week.weekEndDate);
            $scope.endTime = new Date($scope.week.weekEndDate);

        });

        $scope.datePickerStatus = {
            lockOpened: false,
            endOpened: false
        };

        $scope.lockDateOpen = function($event) {
            $scope.datePickerStatus.lockOpened = true;
        };

        $scope.endDateOpen = function($event) {
            $scope.datePickerStatus.endOpened = true;
        };

        $scope.save = function() {
            // TODO: Validate other inputs, like dates, etc

            // Put the date/time inputs into the proper format
            // $scope.week.
            var lockDateTime = new Date(
                $scope.lockDate.getFullYear(),
                $scope.lockDate.getMonth(),
                $scope.lockDate.getDate(),
                $scope.lockTime.getHours(),
                $scope.lockTime.getMinutes(),
                0);

            $scope.week.weekLockDate = lockDateTime.toISOString();

            var endDateTime = new Date(
                $scope.endDate.getFullYear(),
                $scope.endDate.getMonth(),
                $scope.endDate.getDate(),
                $scope.endTime.getHours(),
                $scope.endTime.getMinutes(),
                0);

            $scope.week.weekEndDate = endDateTime.toISOString();

            console.log('LockDate: ' + lockDateTime.toString() + '(' + $scope.week.weekLockDate + ')');
            console.log('EndDate: ' + endDateTime.toString() + '(' + $scope.week.weekEndDate + ')');

            Weeks.update($scope.week, function() {
                $location.path('/admin');
            });
        };
    }
]);

app.controller('NavbarCtrl', ['$rootScope', '$scope', '$location', 
    function($rootScope, $scope, $location) {
        $scope.user = $rootScope.user;
    }
]);