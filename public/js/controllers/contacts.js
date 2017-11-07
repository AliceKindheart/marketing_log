'use strict';

angular.module('mean.contacts').controller('ContactsController', ['$scope', '$stateParams', 'Global', 'Contacts', '$state', '$http', '$window', function ($scope, $stateParams, Global, Contacts, $state, $http, $window) {
    $scope.global = Global;

    $scope.create = function() {
        var Tagnames =[];

        console.log($scope.selected, "Company_name");
        var contact = new Contacts({
            Contact_firstname: this.Contact_firstname,
            Contact_lastname: this.Contact_lastname,
            Contact_name: this.Contact_firstname + " " + this.Contact_lastname,
            Contact_email: this.Contact_email,
            Contact_phone: this.Contact_phone,
            Contact_title: this.Contact_title,
            Company_name: this.Company_name,
            Contact_notes: this.Contact_notes,
            Tag_name: this.selected
        });
        contact.$save(function(response) {
            $state.go('viewContact',{id : response.id});
        });

        this.Contact_name = "";
        this.Contact_firstname="";
        this.Contact_lastname="";
        this.Contact_email = "";
        this.Contact_phone = "";
        this.Contact_title = "";
        this.Company_name = "";
        this.Contact_notes = "";
        this.Tag_name="";
    };

    $scope.remove = function(contact) {
        if ($window.confirm("Are you sure you want to delete this contact?")){
            if (contact) {
                contact.$remove();  
                for (var i in $scope.contacts) {
                    if ($scope.contacts[i] === contact) {
                        $scope.contacts.splice(i, 1);
                    }
                }
            } else {
                $scope.contact.$remove();
                $state.go('contacts');
            }
        }
    };

    $scope.update = function() {
        var contact = $scope.contact;
        var tagname = $scope.whatyouneed;
        contact.Tag_name = tagname;
        contact.compname = $scope.nameofcompany;
        console.log("contact", contact);
        contact.updated = [];
        contact.updated.push(new Date().getTime());
        contact.$update(function() {
        $state.go('viewContact',{id : contact.id});
        });
    };

    var whatyouneed;

    $scope.findOne = function() {
        var company;
        var tagarray = [];
        var tags = [];
        //console.log("$stateParams.id", $stateParams.id);
        Contacts.get({
            id: $stateParams.id 
        }, function(contact) {
            company = contact.Company;
            $scope.contact = contact;
            $scope.company = company;
            if(company){
                $scope.nameofcompany=company.Company_name;
            }
            
            $scope.events = contact.Events;
            console.log("$scope.events", $scope.events);
            if($scope.events.length===0){
                $scope.noevents = true;
            } else {
                $scope.noevents = false;
            }
        
            if(contact.Tags.length!==0){
                //tagarray = contact.Tags;
                contact.Tags.forEach(function(tag){
                    tags.push(tag.Tag_name);
                });
            } else {
                tags.push({Tag_name:"None"});
            }
            console.log("did this thing even happen?", tags);
            $scope.vartags=tags.join(", ");
            
            

            $scope.whatyouneed = tags;
            whatyouneed = $scope.whatyouneed;
            //console.log("vartags", vartags);
            $scope.tags=$scope.vartags;
        
            $scope.tagnames1 = $scope.tags;
            console.log("$scope.tagnames1", $scope.tagnames);
            $scope.findtags();
            console.log("$scope.tagnames", $scope.tagnames);
            $scope.selected = $scope.tagnames1;
            console.log("selected, ", $scope.selected);
        });
        

        $scope.findcompanies();
    };

    $scope.geteventinfo = function(event){
        $http({
            method: 'GET', 
            url: '/geteventinfo',
            params: {id: event.id}
        }).then(function(resp){
            console.log("resp", resp);
            $scope.eventdetails=resp.data;
        });
    };


    $scope.find = function() {
        var arrayofcontacts = [];
        var arrayofarrayoftagobjects = [];
        var arrayoftagobjects = [];

        Contacts.query(function(contacts) {
            console.log("CONTACTSSSSS: ", contacts);
            $scope.contacts = contacts;
            var companies = [];

            contacts.forEach(function(contact){
                if (contact.Company){
                    arrayofcontacts.push(contact.Company);
                } else {
                    arrayofcontacts.push({Company_name: "None"});
                }
                $scope.companies = arrayofcontacts;
            });

            contacts.forEach(function(contact){
                if(contact.Tags.length!==0){
                    console.log("HELLLLLOWOWOWOWO");
                    arrayofarrayoftagobjects.push(contact.Tags);
                } else {
                    arrayofarrayoftagobjects.push([{Tag_name: "None"}]);
                }
            });
            console.log("arrayofarrayoftagobjects", arrayofarrayoftagobjects);

            var tags = [];
            var arrayoftags = [];

            arrayofarrayoftagobjects.forEach(function(array){
                array.forEach(function(object){
                    tags.push(object.Tag_name);    
                });
                arrayoftags.push(tags);   
                tags = [];  
            });
            console.log("arrayoftags: ", arrayoftags);

            var arrayoftagnames = [];
            var stringoftagnames;
            arrayoftags.forEach(function(array){
                stringoftagnames = array.join(", ");
                console.log("stringoftagnames", stringoftagnames);
                arrayoftagnames.push(stringoftagnames);
            });
            console.log("arrayoftagnames: ", arrayoftagnames);

            $scope.tags=arrayoftagnames;
        });
    };

    $scope.findcompanies =  function(){
        $scope.companies = [];
        $http.get('/companies')
        .then(function(response){
            $scope.companyresponse = response.data;
            $scope.companyresponse.forEach(function(company){
                $scope.companies.push(company.Company_name);
            });
            $scope.chunkedcompanies = $scope.chunk($scope.companies, 3);
            //$scope.findtags();
        });
    };

    $scope.chunk = function(arr, size){
        var newArr =[];
            for (var i=0; i<arr.length; i+=size) {
                newArr.push(arr.slice(i, i+size));
            }
            return newArr;
    };

      $scope.selected = [];

    $scope.choose = function (company) {
        $scope.Company_name = company;
      };

      $scope.exists = function (company) {
        if (company === $scope.nameofcompany){
            return true;
        }
      };

      $scope.choose2edit = function(company){
        $scope.nameofcompany = company;
        console.log("COMPANY, $scope.nameofcompany", $scope.nameofcompany);
      };

      $scope.searchForContact = function(){
        $http({
            method: 'GET',
            url: '/searchforcontacts',
            params: {contactname: $scope.contactname}
        }).then(function(resp){
        //$searchcontacts
          //  .then(function(resp){
            //    console.log("response", resp.data);
                $scope.contacts = resp.data;
            });
      };

    $scope.findtags =  function(){
        console.log("Find tags was called!");
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
        if(!list){
            return -1;
        } else {
            return list.indexOf(tag) > -1;
        }
    };

}]);