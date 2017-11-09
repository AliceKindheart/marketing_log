'use strict';

angular.module('mean.tags').controller('TagsController', ['$scope', '$stateParams', 'Global', 'Tags', '$state', function ($scope, $stateParams, Global, Tags, $state) {
    $scope.global = Global;

     $scope.findtags =  function(){
     	$scope.tagnames = [];

        Tags.query(function(tags){
            $scope.tags = tags;

            tags.forEach(function(tag){
            	$scope.tagnames.push(tag.Tag_name);
            });
        });
    };
}]);
