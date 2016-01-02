var app = angular.module('DailyFantasyFootball');

app.controller('HomeCtrl', ['$scope', '$resource',
    function($scope, $resource) {
        var Weeks = $resource('/api/v1/weeks');

        Weeks.query({ contests: true }, function(weeks) {
            $scope.weeks = weeks;

            for (var i = 0; i < $scope.weeks.length; i++) {
                if ($scope.weeks[i].state !== 'completed') {
                    $scope.currentWeek = $scope.weeks[i];
                    break;
                }
            }
        });
    }
]);

app.controller('ContestCtrl', ['$scope', '$rootScope', '$resource', '$routeParams',
    function($scope, $rootScope, $resource, $routeParams) {
        var Contests = $resource('/api/v1/contests/:id');
        var Players = $resource('/api/v1/weeks/:weekNumber/players');

        $scope.roster = [];

        $scope.sortType = 'salary';
        $scope.sortReverse = true;
        $scope.searchField = '';

        var tabFilter = 'QB';

        $scope.setTab = function(filter) {
            tabFilter = filter;
        };

        $scope.playerFilter = function(item) {
            if (item.player.displayName.toLowerCase().indexOf($scope.searchField.toLowerCase()) != -1) {
                // Matches the search box. See if the player is already in our roster or not
                for (var i = 0; i < $scope.roster.length; i++) {
                    if ($scope.roster[i].player._id === item.player._id) {
                        return false;
                    }
                }

                switch(tabFilter) {
                    case 'All':
                        return true;

                    case 'FLEX':
                        return flexAllowed(item.player.position);

                    default:
                        return (tabFilter === item.player.position);
                }
            }

            return false;
        };

        $scope.rosterSalary = 0;
        $scope.contestLineup = [];

        Contests.get({ id: $routeParams.id }, function(contest) {
            $scope.contest = contest;

            // Set the lineup array that the roster will fill-in.
            // TODO: Refactor this into a helper method that takes the position as a param
            // QBs
            for (var i = 0; i < contest.positionCounts.QB; i++) {
                $scope.contestLineup.push({
                    position: 'QB'
                });
            }

            // RB
            for (var i = 0; i < contest.positionCounts.RB; i++) {
                $scope.contestLineup.push({
                    position: 'RB'
                });
            }

            // WR
            for (var i = 0; i < contest.positionCounts.WR; i++) {
                $scope.contestLineup.push({
                    position: 'WR'
                });
            }

            // TE
            for (var i = 0; i < contest.positionCounts.TE; i++) {
                $scope.contestLineup.push({
                    position: 'TE'
                });
            }

            // FLEX
            for (var i = 0; i < contest.positionCounts.FLEX; i++) {
                $scope.contestLineup.push({
                    position: 'FLEX'
                });
            }

            // DST
            for (var i = 0; i < contest.positionCounts.DST; i++) {
                $scope.contestLineup.push({
                    position: 'DST'
                });
            }

            for (var i = 0; i < contest.entries.length; i++) {
                if (contest.entries[i].user._id === $rootScope.user._id) {
                    $scope.myEntry = contest.entries[i];
                    $scope.roster = $scope.myEntry.roster;

                    for (var i = 0; i < $scope.roster.length; i++) {
                        $scope.addPlayer($scope.roster[i]);
                    }
                    break;
                }
            }

            Players.get({ weekNumber: contest.week.weekNumber }, function(week) {
                $scope.players = week.players;
            });
        });

        function flexAllowed(position) {
            switch (position) {
                case 'QB':
                    return $scope.contest.qbFlex;
                case 'RB':
                    return $scope.contest.rbFlex;
                case 'WR':
                    return $scope.contest.wrFlex;
                case 'TE': 
                    return $scope.contest.teFlex;
                default:
                    return false;
            };
        };

        $scope.addPlayer = function(item, addToRoster) {
            // Determine if this player fits into one of the open slots
            for (var i = 0; i < $scope.contestLineup.length; i++) {
                if ((($scope.contestLineup[i].position === item.player.position) ||
                    (($scope.contestLineup[i].position === 'FLEX') && flexAllowed(item.player.position))) &&
                    !($scope.contestLineup[i].rosterEntry)) {

                    $scope.contestLineup[i].rosterEntry = item;
                    if (addToRoster) {
                        $scope.roster.push(item);
                    }
                    
                    $scope.rosterSalary += item.salary;
                    $scope.searchField = '';

                    break;
                }
            }            
        };

        $scope.removePlayer = function(index) {

            for (var i = 0; i < $scope.roster.length; i++) {
                if ($scope.roster[i].player._id === $scope.contestLineup[index].rosterEntry.player._id) {
                    $scope.roster.splice(i, 1);
                    $scope.rosterSalary -= $scope.contestLineup[index].rosterEntry.salary;

                    $scope.contestLineup[index].rosterEntry = null;
                    break;
                }
            }
        };

        $scope.save = function() {
            if ($scope.rosterSalary > $scope.contest.salaryCap) {
                // TODO: Salary cap error message
                return;
            }

            $scope.updating = true;

            var Entries = $resource('/api/v1/entries/:id', { id: "@_id" }, {
                update: { method: 'PUT' }
            });

            if ($scope.myEntry) {
                Entries.update($scope.myEntry, function(err) {
                    $scope.updating = false;
                    if (err) {
                        // TODO: Show error to user
                    }
                });
            } else {
                var newEntry = {
                    contest: $scope.contest._id,
                    roster: $scope.roster
                };

                // Creating a brand new entry
                Entries.save(newEntry, function(entry) {
                    $scope.myEntry = entry;
                    $scope.updating = false;
                }, function() {
                    // TODO: Show error to user
                });
            }
        }
    }
]);

app.controller('UserCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams) {        
        var Users = $resource('/api/v1/users/:id', { id: '@_id' }, {
            update: { method: 'PUT' }
        });

        Users.get({ id: $routeParams.id }, function(user) {
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
        $scope.pageHeader = 'Add a week';

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

        $scope.submitResult = {
            isError: false
        };

        $scope.save = function() {
            $scope.updating = true;
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

            var endDateTime = new Date(
                $scope.endDate.getFullYear(),
                $scope.endDate.getMonth(),
                $scope.endDate.getDate(),
                $scope.endTime.getHours(),
                $scope.endTime.getMinutes(),
                0);

            $scope.week.weekLockDate = lockDateTime.toISOString();
            $scope.week.weekEndDate = endDateTime.toISOString();

            Weeks.save($scope.week, function() {
                $scope.updating = false;
                $location.path('/admin');
            }, function(err) {
                $scope.submitResult.msg = err.data;
                $scope.submitResult.isError = true;
                $scope.updating = false;
            });
        };
    }
]);

// TODO: Refactor shared code between this and the AddWeekCtrl
app.controller('EditWeekCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams) {
        $scope.pageHeader = 'Edit week';
        $scope.weekNumber = $routeParams.id;

        var Weeks = $resource('/api/v1/weeks/:id', { id: '@_id' }, {
            update: { method: 'PUT' }
        });

        Weeks.get({ id: $routeParams.id }, function(week) {
            $scope.week = week;

            $scope.lockDate = new Date($scope.week.weekLockDate);
            $scope.lockTime = new Date($scope.week.weekLockDate);

            $scope.endDate = new Date($scope.week.weekEndDate);
            $scope.endTime = new Date($scope.week.weekEndDate);

            $scope.editingWeek = true;

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

        $scope.submitResult = {
            isError: false
        };

        $scope.save = function() {
            $scope.updating = true;
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

            var endDateTime = new Date(
                $scope.endDate.getFullYear(),
                $scope.endDate.getMonth(),
                $scope.endDate.getDate(),
                $scope.endTime.getHours(),
                $scope.endTime.getMinutes(),
                0);

            $scope.week.weekLockDate = lockDateTime.toISOString();
            $scope.week.weekEndDate = endDateTime.toISOString();

            Weeks.update($scope.week, function() {
                $scope.updating = false;
                $location.path('/admin');
            }, function(err) {
                $scope.submitResult.msg = err.data;
                $scope.submitResult.isError = true;
                $scope.updating = false;
            });
        };

        $scope.delete = function() {
            Weeks.delete( { id: $scope.week.weekNumber }, function() {
                $scope.updating = false;
                $location.path('/admin');
            }, function() {
                $scope.updating = false;
            });
        };
    }
]);

app.controller('NavbarCtrl', ['$rootScope', '$scope', '$location', 
    function($rootScope, $scope, $location) {
        $scope.user = $rootScope.user;
    }
]);

app.controller('EditPlayersCtrl', ['$scope', '$resource', '$routeParams', '$location',
    function($scope, $resource, $routeParams, $location) {
        $scope.sortType = 'salary';
        $scope.sortReverse = true;
        $scope.searchField = '';

        var WeekPlayers = $resource('/api/v1/weeks/:id/players', { id: '@_id'}, {
            update: { method: 'PUT' }
        });

        WeekPlayers.get({ id: $routeParams.id }, function(week) {
            $scope.players = week.players;
        });

        $scope.playerFilter = function(item) {
            // Match against "First Last First" so we cover people who like to search both ways.
            var matchString = item.player.firstName.toLowerCase() + ' ' 
                + item.player.lastName.toLowerCase() + ' '
                + item.player.firstName.toLowerCase();

            return (matchString.indexOf($scope.searchField.toLowerCase()) != -1);
        };

        // TODO: Query for all players once, and match against that. There's a larger window for race conditions
        // but doing this one at a time is obviously quite slow.
        var findOrCreatePlayer = function(player, callback) {
            var Players = $resource('/api/v1/players', null, {
                update: { method: 'PUT' }
            });

            // We query by name and position. Team could change from week to week.
            Players.query({
                firstName: player.firstName,
                lastName: player.lastName,
                position: player.position
            }, function(returnedPlayers) {
                if (returnedPlayers.length > 0) {
                    // We found an existing player! See if the team as changed.
                    if (returnedPlayers[0].team != player.team) {
                        // The player changed teams, so update their player record.
                        returnedPlayers[0].team = player.team;

                        var UpdatePlayer = $resource('/api/v1/players/:id', { id: '@_id' }, {
                            update: { method: 'PUT' }
                        });

                        UpdatePlayer.update(returnedPlayers[0], function() {
                            return callback({ success: true, created: false, changed: true, player: returnedPlayers[0] });
                        }, function() {
                            console.log('Failed to update player record: ');
                            console.dir(returnedPlayers[0]);
                            return callback({ success: false, changed: true, player: returnedPlayers[0] });
                        });
                    } else {
                        return callback({ success: true, created: false, player: returnedPlayers[0]});
                    }
                }
                else {
                    // Didn't find a player, so we'll create a new one
                    Players.save(player, function(savedPlayer) {
                        return callback({ success: true, created: true, player: savedPlayer});
                    }, function() {
                        console.log('Failed to create player record:');
                        console.dir(player);
                        return callback({ success: false, player: player});
                    });
                }
            });
            
        };

        $scope.parsePlayerFile = function(event) {
            var playerFiles = event.target.files;

            if (playerFiles.length != 1) {
                return;
            }

            var playerFile = playerFiles[0];

            var reader = new FileReader();
            reader.readAsText(playerFile);

            reader.onloadend = function() {
                $scope.importing = true;
                $scope.players = [];

                var lines = reader.result.split('\n');

                // First, remove empty lines. Sometimes the csv has those
                for (var idx = 0; idx < lines.length; idx++) {
                    if (lines[idx].trim() === "") {
                        lines.splice(idx, 1);
                        idx--;
                    }
                }

                // The first line may be a header, just check the first word for "Position"
                var firstLineWords = lines[0].split(',');
                var i = (firstLineWords[0].toLowerCase().replace(/\"/g, '').trim() === 'position') ? 1 : 0;

                // Set up our progress bar state.
                $scope.$apply(function() {
                    $scope.importStarted = true;
                    $scope.importMax = lines.length - i;
                    $scope.importDone = 0;  
                });

                // ng-repeat is pretty slow with big lists, so we'll gather up all of the new players
                // into a local array and reassign when we're done.
                var newPlayerList = [];
                var importDone = 0;
                var importMax = $scope.importMax;
                var errorCount = 0;

                $scope.importResult = {
                    errorCount: 0,
                    errorNames: [],
                    changedCount: 0,
                    changedNames: [],
                    successCount: 0,
                    createdCount: 0
                };

                var importResult = {
                    errorCount: 0,
                    errorNames: [],
                    changedCount: 0,
                    changedNames: [],
                    successCount: 0,
                    createdCount: 0
                };

                for (; i < lines.length; i++)
                {
                    // TODO: Helper method for sanitizing strings from the csv
                    var playerFields = lines[i].split(',');
                    var player = {
                        position: playerFields[0].toUpperCase().replace(/\"/g, '').trim(),
                        firstName: playerFields[1].split(' ', 1)[0].replace(/\"/g, '').trim(),
                        lastName: playerFields[1].substr(playerFields[1].indexOf(' ') + 1).replace(/\"/g, '').trim(),
                        team: playerFields[5].toUpperCase().replace(/\"/g, '').trim()
                    };

                    if (player.position === 'DST')
                    {
                        // Special case for defenses. Put the team name as the last name and leave the first
                        // name blank.
                        player.lastName = playerFields[1].replace(/\"/g, '').trim();
                    }
                    else
                    {
                        player.firstName = playerFields[1].split(' ', 1)[0].replace(/\"/g, '').trim();
                        player.lastName = playerFields[1].substr(playerFields[1].indexOf(' ') + 1).replace(/\"/g, '').trim();
                    }

                    // We need to wrap this code in a function so we can capture the PlayerFields
                    // since JS only supports global and function scope (not for loop scope).
                    (function(playerFields) {
                        findOrCreatePlayer(player, function(playerResult) {
                            if (!playerResult.success) {
                                importResult.errorCount++;
                                importResult.errorNames.push(playerResult.player.position === 'DST' ?
                                    playerResult.player.firstName :
                                    playerResult.player.firstName + ' ' + playerResult.player.lastName);
                            } else {
                                var newItem = {
                                    player: playerResult.player,
                                    salary: playerFields[2].trim(),
                                    matchup: playerFields[3].toUpperCase().split(' ', 1)[0].replace(/\"/g, '').trim(),
                                    created: playerResult.created
                                };

                                newPlayerList.push(newItem);
                                importResult.successCount++;
                                if (newItem.created) {
                                    importResult.createdCount++;
                                }

                                if (playerResult.changed) {
                                    importResult.changedCount++;
                                    importResult.changedNames.push(playerResult.player.position === 'DST' ?
                                        playerResult.player.firstName :
                                        playerResult.player.firstName + ' ' + playerResult.player.lastName);
                                }
                            }

                            importDone++;
                            // The progress bar UI is more responsive and still looks good if we update scope every 5th item.
                            if (!(importDone % 5) || (importDone == importMax)) {
                                $scope.importDone = importDone;
                            }

                            if (importDone == importMax) {
                                $scope.players = newPlayerList;
                                $scope.importResult = importResult;
                                $scope.importing = false;
                            }
                        });
                    })(playerFields);
                }
            };
        };

        $scope.save = function() {
            $scope.updating = true;
            WeekPlayers.delete( {id: $routeParams.id}, function() {
                WeekPlayers.save({ id: $routeParams.id}, $scope.players, function() {
                    $scope.updating = false;
                    // TODO: Add flash message for success/fail
                    $location.path('/editweek/' + $routeParams.id);
                }, function() {
                    $scope.updating = false;
                });
            });
        };

        $scope.delete = function() {
            $scope.updating = true;
            WeekPlayers.delete({ id: $routeParams.id }, function() {
                $scope.updating = false;
                // TODO: Probably just reload table content?
                $location.path('/editweek/' + $routeParams.id);
            }, function() {
                $scope.updating = false;
            });
        }
    }
]);