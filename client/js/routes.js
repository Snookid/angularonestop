(function(){
    'use strict';
    angular
        .module('OneStop')
        .config(router);
        
    function router($stateProvider, $urlRouterProvider, $locationProvider){
        $stateProvider
            .state('home', {
              url: '/',
              template: '<div ui-view></div>',
              controller: 'onecontroller as oc',
              abstract: true,
              menu: {
                Feeds: "home.feeds",
                Prod: "home.prod",
                Dashboard: "home.dashboard",
                Logs: "home.logs"
              },
              resolve: {
                currentAuth: function(Auth){
                  return Auth.$requireSignIn();
                }
              }
            })
            .state('home.prod', {
              parent: 'home',
              url: '',
              controller: 'prodController as pc',
              menu: {
                Feeds: "home.feeds",
                Prod: "home.prod",
                Dashboard: "home.dashboard",
                Logs: "home.logs"
              },
              templateUrl: '../views/home/prod.html'
            })
            .state('home.dashboard', {
              parent: 'home',
              url: 'dashboard',
              controller: 'dbcontroller as db',
              menu: {
                Feeds: "home.feeds",
                Prod: "home.prod",
                Dashboard: "home.dashboard",
                Logs: "home.logs"
              },
              templateUrl: '../views/home/dashboard.html'
            })
            .state('home.logs', {
              parent: 'home',
              menu: {
                Feeds: "home.feeds",
                Prod: "home.prod",
                Dashboard: "home.dashboard",
                Logs: "home.logs"
              },
              url: 'logs',
              template: '<h1>This is going to be the log page inside home.</h1>'
            })
            .state('qa', {
              url: '/qa',
              template: '<h1>This is going to be the QA homepage.</h1><div ui-view></div>',
              controller: 'qacontroller',
              resolve: {
                currentAuth: function(Auth){
                  return Auth.$requireSignIn();
                }
              }
            })
            .state('kb', {
              url: '/kb',
              template: '<h1>This is going to be the Knowledge base homepage.</h1><div ui-view></div>',
              controller: 'kbcontroller',
              resolve: {
                currentAuth: function(Auth){
                  return Auth.$requireSignIn();
                }
              }
            })
            .state('kb.am', {
              url: '',
              template: '<h1>This is going to be the AM KB page.</h1>',
              controller: 'amcontroller',
              resolve: {
                currentAuth: function(Auth){
                  return Auth.$requireSignIn();
                }
              }
            })
            .state('kb.core', {
              url: '',
              template: '<h1>This is going to be the Core KB page.</h1>',
              controller: 'corecontroller',
              resolve: {
                currentAuth: function(Auth){
                  return Auth.$requireSignIn();
                }
              }
            })
            .state('kb.pub', {
              url: '',
              template: '<h1>This is going to be the Pub KB page.</h1>',
              controller: 'pubcontroller',
              resolve: {
                currentAuth: function(Auth){
                  return Auth.$requireSignIn();
                }
              }
            })
            .state('kb.collated', {
              url: '/collated',
              parent: 'kb',
              templateUrl: '../views/KB/collated.html',
              controller: 'collatedController',
              resolve: {
                currentAuth: function(Auth){
                  return Auth.$requireSignIn();
                }
              }
            })
            .state('todo', {
              url: '/todo',
              controller: 'todoController as tdC',
              template: '<todo></todo>',
              resolve: {
                currentAuth: function(Auth){
                  return Auth.$requireSignIn();
                }
              }
            })
            .state('todo.all', {
              url: '',
              template: '<todo-list></todo-list>',
              resolve: {
                currentAuth: function(Auth){
                  return Auth.$requireSignIn();
                }
              }
            })
            .state('notes', {
              url: '/notes',
              template: '<h1>This is going to be the Notes homepage.</h1><div ui-view></div>',
              controller: 'notescontroller',
              resolve: {
                currentAuth: function(Auth){
                  return Auth.$requireSignIn();
                }
              }
            })
            .state('settings', {
              url: '/settings',
              template: '<h1>This is going to be the Settings homepage.</h1><div ui-view></div>',
              controller: 'settingscontroller as sc',
              abstract: true
            })
            .state('settings.profile', {
              url: '',
              parent: 'settings',
              templateUrl: '../views/settings/profile.html'
            })
            ;
            $urlRouterProvider.otherwise('/');
            // $locationProvider.html5Mode(true);
        }
})();
