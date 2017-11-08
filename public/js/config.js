'use strict';
//Setting up route
angular.module('mean').config(['$stateProvider','$urlRouterProvider', function($stateProvider,$urlRouterProvider) {

    $urlRouterProvider.otherwise(function($injector, $location){
        $injector.invoke(['$state', function($state) {
            $state.go('404');
        }]);
    });
    $stateProvider
        .state('home',{
            url : '/',
            controller : 'EventController',
            templateUrl: 'views/index.html'
        })
        .state('addtags',{
            url: '/addtags',
            controller: 'AdminController',
            templateUrl: 'views/admin/tags.html'
        })
        .state('adduser',{
            url: '/adduser',
            controller: 'AdminController',
            templateUrl: 'views/admin/adduser.html'
        })
        .state('users',{
            url: '/users',
            controller: 'AdminController',
            templateUrl: 'views/admin/users.html'
        })
        .state('editUser',{
            url: '/edituser/{id}',
            controller: 'AdminController',
            templateUrl: 'views/admin/edituser.html'
        })
        .state('viewUser',{
            url: '/viewuser/{id}',
            controller: 'AdminController',
            templateUrl: 'views/admin/viewuser.html'
        })
        .state('companies',{
            url: '/companies',
            controller: 'CompaniesController',
            templateUrl: 'views/companies/list.html'
        })
        .state('addCompany',{
            url: '/addcompany',
            controller: 'CompaniesController',
            templateUrl: 'views/companies/create.html'
        })
        .state('editCompany',{
            url : '/companies/{id}/edit',
            controller : 'CompaniesController',
            templateUrl: 'views/companies/edit.html'
        })
        .state('viewCompany',{
            url : '/companies/{id}',
            controller : 'CompaniesController',
            templateUrl: 'views/companies/view.html'
        })
        .state('SignIn',{
            url : '/signin',
            templateUrl: 'views/users/signin.html'
        })
        .state('SignUp',{
            url : '/signup',
            templateUrl: 'views/users/signup.html'
        })
        .state('contacts',{
            url: '/contacts',
            controller: 'ContactsController',
            templateUrl: 'views/contacts/list.html'
        })
        .state('addContact',{
            url : '/contacts/create',
            controller : 'ContactsController',
            templateUrl: 'views/contacts/create.html'
        })
        .state('viewContact',{
            url : '/contacts/{id}',
            controller : 'ContactsController',
            templateUrl: 'views/contacts/view.html'
        })
        .state('editContact',{
            url : '/contacts/{id}/edit',
            controller : 'ContactsController',
            templateUrl: 'views/contacts/edit.html'
        })
        .state('techs',{
            url: '/technologies',
            controller: 'TechController',
            templateUrl: 'views/technologies/list.html'
        })
        .state('addTech',{
            url: '/technologies/create',
            controller: 'TechController',
            templateUrl: 'views/technologies/create.html'
        })
        .state('viewTech',{
            url: '/technologies/{id}',
            controller: 'TechController',
            templateUrl: 'views/technologies/view.html'
        })
        .state('editTech',{
            url: '/technologies/{id}/edit',
            controller: 'TechController',
            templateUrl: 'views/technologies/edit.html'
        })
        .state('events',{
            url: '/events',
            controller: 'EventController',
            templateUrl: 'views/events/list.html'
        })
        .state('addEvent',{
            url: '/events/create/{id}',
            controller: 'EventController',
            templateUrl: 'views/events/create.html'
        })
        .state('addFollowUpEvent',{
            url:'/events/create/{TechId}/{CompId}',
            controller: 'EventController',
            templateUrl: 'views/events/createfollowup.html'
        })
        .state('addManyEvents',{
            url: '/events/createmany/{id}',
            controller: 'EventController',
            templateUrl: 'views/events/createmany.html'
        })
        .state('viewEvent',{
            url: '/events/{id}',
            controller: 'EventController',
            templateUrl: 'views/events/view.html'
        })
        .state('editEvent',{
            url: '/events/{id}/edit',
            controller: 'EventController',
            templateUrl: 'views/events/edit.html'
        })
        .state('changepassword', {
            url: '/changepassword',
            controller: "AdminController",
            templateUrl: 'views/admin/changepassword.html'
        })
        .state('404',{
            templateUrl: 'views/404.html'
        });
}
]);

//Setting HTML5 Location Mode
angular.module('mean').config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(true);

}]);