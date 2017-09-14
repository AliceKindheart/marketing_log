'use strict';

angular.module('mean.companies').controller('CompaniesController', ['$scope', '$stateParams', 'Global', 'Companies', '$state', '$http', '$window', function ($scope, $stateParams, Global, Companies, $state, $http, $window) {
    $scope.global = Global;

    $scope.create = function() {
        var Tagnames = [];
        console.log("$scope.selected", $scope.selected);

        var company = new Companies({
            Company_name: this.Company_name,
            Notes: this.Notes,
            Tag_name: this.selected,
            Company_email: this.Company_email,
            Company_phone: this.Company_phone
        });
        company.$save(function(response) {
            $state.go('viewCompany',{id : response.id});
        });

        this.Company_name = "";
        this.notes = "";
        this.Tag_name = "";
        this.Company_email="",
        this.Company_phone=""
    };

    
    $scope.update = function() {
        var company = $scope.company;
        var tagname = $scope.whatyouneed;

        company.Tag_name = tagname;
        company.updated = [];
        company.updated.push(new Date().getTime());
        company.$update(function() {
            $state.go('viewCompany',{id : $stateParams.id});
        });
    };

    $scope.remove = function(company) {
        if ($window.confirm("Are you sure you want to delete this company?")){
            if (company) {
                company.$remove();  

                for (var i in $scope.companies) {
                    if ($scope.companies[i] === company) {
                        $scope.companies.splice(i, 1);
                    }
                }
            }
            else {
                $scope.company.$remove();
                $state.go('companies');
            }
        }
    };

    var showtags;
    var whatyouneed;
    var cmpnyid;

    $scope.findOne = function() {
        var tagarray = [];
        var tags = [];
        var contactarray;
        var contacts = [];
        //console.log("findOne ran");
        cmpnyid = $stateParams.id;
        Companies.get({id: $stateParams.id}, function(company) {
            $scope.company=company;
            console.log("$scope.company", $scope.company);
            contactarray = company.Contacts;
            $scope.completecontacts = company.Contacts;
            $scope.events=company.Events;

            console.log("contactarray", contactarray);
            if(contactarray!==0){
                for (var i=0; i<contactarray.length; i++){
                    contacts.push(contactarray[i].Contact_name);
                }
            } else {
                contacts.push("None");
            }
            $scope.contacts = contacts;
            $scope.contactschunked = $scope.chunk($scope.contacts, 3);
            //console.log("$scope.contactschunked", $scope.contactschunked);

            if(company.Tags.length!==0){
                tagarray = company.Tags;
            } else {
                tagarray.push({Tag_name:"None"});
            }
            
            tagarray.forEach(function(tag){
                tags.push(tag.Tag_name);
            });

            $scope.whatyouneed = tags;
            whatyouneed = $scope.whatyouneed;
        
            $scope.tags = tags.join(", ");
            $scope.findtags();
            $scope.selected = $scope.tags;

            $scope.findCompanyEvents();
            
        });
    };
    
    $scope.find = function() {
        var arrayofarrayoftagobjects = [];
        var arrayoftagobjects = [];

        Companies.query(function(companies) {
            $scope.companies = companies;

            companies.forEach(function(company){
                if(company.Tags){
                    arrayofarrayoftagobjects.push(company.Tags);
                } else {
                    arrayofarrayoftagobjects.push([{Tag_name: "None"}]);
                }
            });

            var tags = [];
            var arrayoftags = [];

            arrayofarrayoftagobjects.forEach(function(array){
                array.forEach(function(object){
                    tags.push(object.Tag_name);    
                });
                arrayoftags.push(tags);   
                tags = [];  
            });

            var arrayoftagnames = [];
            var stringoftagnames;
            arrayoftags = arrayoftags.forEach(function(array){
                stringoftagnames = array.join(", ");
                arrayoftagnames.push(stringoftagnames);
            });

            $scope.tags=arrayoftagnames;

        });
    };

    $scope.chunk = function(arr, size){
        var newArr =[];
            for (var i=0; i<arr.length; i+=size) {
                newArr.push(arr.slice(i, i+size));
            }
            return newArr;
    };

    $scope.findtags =  function(){
        $scope.tagnames = [];
        $http.get('/tags')
        .then(function(response){
            $scope.tagresponse = response.data;
            $scope.tagresponse.forEach(function(tag){
                $scope.tagnames.push(tag.Tag_name);
            });
            $scope.chunkedtagnames = $scope.chunk($scope.tagnames, 5);
            console.log("$scope.chunkedtagnames", $scope.chunkedtagnames);
        });
        
    };

    



    $scope.selected = [];

    $scope.findcompanycontacts = function(){
        $scope.contacts= [];
        $http.get('/companycontacts/cmpnyid')
        .then(function(response){
            $scope.contactresponse = response.data;
            $scope.contactresponse.forEach(function(contact){
                $scope.contacts.push(contact.Contact_name);
            });
        });
    };    
     
    $scope.toggle = function (tag, tags) {
        var idx = tags.indexOf(tag);
        console.log("idx", idx);
        if (idx > -1) {
          tags.splice(idx, 1);
        }
        else {
          tags.push(tag);
        }
      };

    $scope.toggle2 = function (tag, whatyouneed) {
        console.log("whatyouneed", whatyouneed, typeof whatyouneed);
        console.log("$scope.whatyouneed", $scope.whatyouneed, typeof $scope.whatyouneed);
        var idx = $scope.whatyouneed.indexOf(tag);
        if (idx > -1) {
            $scope.whatyouneed.splice(idx, 1);
        }
        else {
          $scope.whatyouneed.push(tag);
        }
    };  

    $scope.exists = function (tag, list) {
    return list.indexOf(tag) > -1;
    };

    $scope.searchForCompany = function(){
        $http({
            method: "GET",
            url: "/searchforcompany",
            params: {compname: $scope.compname}
        }).then(function(resp){
            console.log("response", resp.data);
            $scope.companies = resp.data;
        });
    };


    $scope.findCompanyEvents = function(){
        $scope.Eventtechs =[];
        $scope.Technologytitles=[];
        $scope.followups=[];
        $scope.users=[];
        $scope.companies=[];
        $scope.arrayofarrayofcontacts=[];
        $http({
            method: 'GET',
            url: '/getcompanyevents',
            params: {compid: $scope.company.id}
        }).then(function(response){
            //console.log("ReSPONSE", response);
            $scope.events = response.data;
            var evnts = $scope.events;
            //console.log("TYpeof $scope.events", typeof $scope.events);
            console.log("events", $scope.events);
            if($scope.events.length===0){
                //console.log("should hide");
                $scope.noevents = true;
            } else {
                $scope.noevents = false;
            }
            console.log("$scope.events.length", $scope.events.length, $scope.noevents);
            for(var i=0; i<$scope.events.length; i++){
                $scope.Eventtechs.push($scope.events[i].Technology);
                $scope.users.push($scope.events[i].User);
                $scope.companies.push($scope.events[i].Company);

                if($scope.events[i].Contacts){
                    $scope.arrayofarrayofcontacts.push($scope.events[i].Contacts);
                } else {
                    $scope.arrayofarrayofcontacts.push({"Contact Name": "none"});
                }
            }

            var arrayofcontactnames =[];
            var contactnames =[];

            $scope.arrayofarrayofcontacts.forEach(function(array){
                array.forEach(function(contact){
                    contactnames.push(contact.Contact_name);
                });
                arrayofcontactnames.push(contactnames);
                contactnames = [];
            });

            var stringofcontactnames;
            arrayofcontactnames.forEach(function(array){
                stringofcontactnames=array.join(", ");
                contactnames.push(stringofcontactnames);
            });

            $scope.contactnames = contactnames;
            //$scope.geteventsinfo();
            console.log("$scope.arrayofarrayofcontacts", $scope.arrayofarrayofcontacts);
        });
    };


   



}]);