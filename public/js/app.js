var restApiBaseUrl = 'http://127.0.0.1:3000/';

var localStorageKey = {
    userAuth: 'userAuth'
};

var app = angular.module('myApp', ['ui.router', 'ngMessages']);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'views/home.html',
            controller: 'HomeCtrl'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'views/register.html',
            controller: 'RegisterCtrl'
        });

}]);

app.factory('UserFunction', ['$rootScope', '$window', '$http', '$state',
    function ($rootScope, $window, $http, $state) {
        function isAuthTokenAvailable() {
            if ($window.localStorage.getItem(localStorageKey.userAuth)) {
                return true;
            }

            return false;
        }

        function getUserToken() {
            var userAuth = $window.localStorage.getItem(localStorageKey.userAuth);
            if (userAuth) {
                return JSON.parse(userAuth).accessToken;
            }

            return null;
        }

        function login(email, password) {
            $http({
                method: 'GET',
                url: restApiBaseUrl + 'v1/oauth/token',
                headers: {
                    Authorization: 'Basic ' + btoa(email + ':' + password)
                }
            }).then(function (res) {
                alert('Login successful');
                $window.localStorage.setItem(localStorageKey.userAuth, JSON.stringify(res.data));
                $state.go('home');
            }, function (errRes) {
                alert(errRes.data.errorMessage);
            });
        }

        function logout() {
            if (isAuthTokenAvailable()) {
                $http({
                    method: 'POST',
                    url: restApiBaseUrl + 'v1/oauth/revoke',
                    headers: {
                        Authorization: 'Bearer ' + getUserToken()
                    }
                }).then(function (res) {
                    alert('Logout successful');
                    $state.go('home');
                    $rootScope.isLogin = false;
                    $window.localStorage.removeItem(localStorageKey.userAuth);
                }, function (errRes) {
                    alert('Logout successful');
                    $state.go('home');
                    $rootScope.isLogin = false;
                    $window.localStorage.removeItem(localStorageKey.userAuth);
                });
            }
        }

        return {
            isAuthTokenAvailable: isAuthTokenAvailable,
            getUserToken: getUserToken,
            login: login,
            logout: logout
        }
    }
]);

app.controller('HomeCtrl', ['$scope', '$rootScope', '$window', '$http', 'UserFunction',
    function ($scope, $rootScope, $window, $http, UserFunction) {
        $rootScope.isLogin = false;

        if (UserFunction.isAuthTokenAvailable()) {
            $http({
                method: 'GET',
                url: restApiBaseUrl + 'v1/customer/me',
                headers: {
                    Authorization: 'Bearer ' + UserFunction.getUserToken()
                }
            }).then(function (res) {
                $rootScope.isLogin = true;
                $scope.user = res.data.data;
            }, function (errRes) {
                alert(errRes.data.errorMessage);
                $window.localStorage.removeItem(localStorageKey.userAuth);
                $rootScope.isLogin = false;
            });
        }

        $scope.logout = function () {
            UserFunction.logout();
        }
    }
]);

app.controller('LoginCtrl', ['$scope', '$state', '$window', '$http', 'UserFunction',
    function ($scope, $state, $window, $http, UserFunction) {
        $scope.formData = {};
        $scope.login = function() {
            UserFunction.login($scope.formData.email, $scope.formData.password);
        };
    }
]);

app.controller('RegisterCtrl', ['$scope', '$state', '$window', '$http', 'UserFunction',
    function ($scope, $state, $window, $http, UserFunction) {
        $scope.formData = {};
        $scope.register = function () {
            $http({
                method: 'POST',
                url: restApiBaseUrl + 'v1/customer',
                data: $scope.formData
            }).then(function (res) {
                alert('Registration successful. You will be login automatically.');
                UserFunction.login($scope.formData.email, $scope.formData.password);
            }, function (errRes) {
                alert(errRes.data.errorMessage);
                delete $scope.formData.password;
            });
        };
    }
]);