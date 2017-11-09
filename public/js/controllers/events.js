'use strict';

angular.module('mean.events').controller('EventController', ['$window', '$filter', '$scope', '$http', '$stateParams', 'Global', 'Technologies', 'Events', '$state', function ($window, $filter, $scope, $http, $stateParams, Global, Technologies, Events, $state) {
    $scope.global = Global;

    $scope.addressees=[];
    $scope.comps = [];
    $scope.cntcts = [];
    $scope.emails=[];
    $scope.methods = ["Phone", "Email", "Meeting"]; 
    $scope.names=[];  
    $scope.selected = ["None"];
    $scope.selectedcompanies =[];
    $scope.selectedcontacts=[];
    $scope.outcomes = ["In review", "Not interested", "No response", "Other"];
    $scope.numberofoutcomes = $scope.outcomes.length;
    $scope.usernames=[];
    $scope.yesno = ["Yes", "No"];
    
    var stringonames;

    $scope.choose = function(comp){
        $scope.chooseforcreate(comp);
        $scope.event.company = comp;
    }; 

    $scope.chooseforcreate = function(comp){
        $scope.company = comp;
        var company = $scope.company;

        $http({
            method: 'GET',
            url: '/findcompanycontacts',
            params: {Company_name: company}
        }).then(function(company){
            $scope.company = company.data;
            $scope.compcontacts = $scope.company.Contacts;
            $scope.compcontactschunked = $scope.chunk($scope.compcontacts, 3);
        });
    }; 

    $scope.chooseuser = function(user){
        console.log("USER: ", user);
        $scope.event.newusername=user;
        $scope.event.userchange=true;
    }; 

    $scope.chooseuserforfollowup = function(user){
        $scope.user = user;
    };

    $scope.chunk = function(arr, size){
        var newArr =[];
        for (var i=0; i<arr.length; i+=size) {
            newArr.push(arr.slice(i, i+size));
        }
        return newArr;
    };

    $scope.contacts = function(event){
        $scope.names=[];
        for (var x=0; x<event.Contacts.length; x++){ 
            if (event.Contacts[x].length===0){
                $scope.names.push(["None"]);
            } else {
                $scope.names.push(event.Contacts[x].Contact_name);
            } 
        }
        stringonames = $scope.names.join(", ");
        event.names = stringonames;
        $scope.eventcontacts = stringonames;

        if ($scope.eventcontacts.length>=3) {
            $scope.eventcontactschunked=$scope.chunk($scope.eventcontacts, 3);
        } else {
            $scope.eventcontactschunked = $scope.eventcontacts;
        }
    };

    $scope.contactids =[];
    $scope.cleanupcontacts = function(){
        //removing contacts that aren't from the event's selected company
        for (var i=0; i<$scope.selectedcontacts.length; i++){
            if ($scope.selectedcontacts[i].CompanyId!==$scope.company.id){
                $scope.selectedcontacts.splice(i, 1);
            }
        }
        //removing duplicate contacts
        for (var j=0; j<$scope.selectedcontacts.length-1; j++){
            for (var k=1; k<$scope.selectedcontacts.length; k++){
                if($scope.selectedcontacts[j]===$scope.selectedcontacts[k]){
                    $scope.selectedcontacts.splice(k,1);
                }
            }
        }
        //get an array of contact ids
        for (var m=0; m<$scope.selectedcontacts.length; m++){
            $scope.contactids.push($scope.selectedcontacts[m].id);
        }

        $scope.event.contactids = $scope.contactids;
    };

    

    $scope.createEvent = function() {
       console.log("NEWEVENT", $scope);

        var event = new Events({
            Event_date: this.Event_date,
            Event_notes: this.notes,
            Company: this.company,
            Contacts: this.selectedcontacts,
            Technology: this.technology,
            Event_flag: this.Event_flag,
            Event_followupdate: this.followupdate, 
            Event_method: this.Event_method, 
            Event_outcome: this.Event_outcome,
            FollowedUp: false
        });

        event.$save(function(response) {
            $state.go('viewTech',{id: response.TechnologyId});
        });

        this.Event_date = "";
        this.Event_notes = "";
        this.company = "";
        this.contacts = "";
        this.flag = "";
        this.followupdate = "";
        this.Event_outcome = "";
        this.FollowedUp = "";
    };

    $scope.createFollowUp = function(){
        var event = new Events({
            Event_date: this.Event_date,
            Event_notes: this.notes,
            Company: this.company,
            Contacts: this.selectedcontacts,
            Technology: this.technology,
            Event_flag: this.Event_flag,
            Event_followupdate: this.followupdate, 
            Event_method: this.Event_method, 
            Event_outcome: this.Event_outcome,
            FollowedUp: false
        });

        event.$save(function(response) {  
            //update old event 
            $scope.event.FollowedUp=true;
            $scope.event.Event_followupdate=null;
            $scope.event.Event_flag = false;
            
            $scope.event.updated = [];
            $scope.event.updated.push(new Date().getTime());
            
            $scope.event.$update(function() {
            }).then(function(){
                $scope.Edit=false;
                $scope.FollowUp=false;
            $state.go('viewTech',{id: response.TechnologyId});
            });
        });
    };

    $scope.startFollowUp = function(){
        $scope.Edit = false;
        $scope.FollowUp = true;
        $scope.findusers();
        $scope.findCompanies();

        $scope.chooseforcreate($scope.event.Company.Company_name);
        $scope.newcontactnames=$scope.names;
        $scope.selectedcontacts=$scope.event.Contacts;
        $scope.company=$scope.event.Company;
        $scope.user=$scope.event.User;
        $scope.technology=$scope.event.Technology;
    };

    $scope.createMultEvent = function() {
        //go through each selected company
        for (var x=0; x<$scope.selectedcompanies.length; x++){
            $scope.compny = $scope.selectedcompanies[x];
            //find all the contacts associated with that company
            for (var y=0; y<$scope.selectedcontacts.length; y++){                
                if($scope.selectedcontacts[y].CompanyId===$scope.compny.id){
                    $scope.cntcts.push($scope.selectedcontacts[y]);
                }
            }

            //create an event for that company
            var event = new Events({
                Event_date: this.Event_date,
                Event_notes: this.notes,
                Company: this.compny,
                Contacts: this.cntcts,
                Technology: this.technology,
                Event_flag: this.Event_flag,
                Event_followupdate: this.followupdate, 
                Event_method: this.Event_method, 
                Event_outcome: this.Event_outcome,
                Followedup: false
            });

            event.$save(function(response) {
            });  
            $scope.cntcts = [];     
        }
        $state.go('techs');     
    };

    $scope.editoutcome = function (outcome) {
        $scope.event.Event_outcome = outcome;        
    };

    $scope.exists = function (tag, list) {
        return list.indexOf(tag) > -1;
    };

    $scope.findCompanies = function() {
        $http({
            method: 'GET',
            url: '/companiesforevent'
        }).then(function(response){
            $scope.companies = response.data;
            $scope.companynames = [];
            response.data.forEach(function(company){
                $scope.companynames.push(company.Company_name);
            });
            $scope.chunkedcompanies = $scope.chunk($scope.companynames, 3);
        });            
    };

    $scope.findCompanies2 = function() {
        $http({
            method: 'GET',
            url: '/companiesforevent'
        }).then(function(response){
            $scope.companies = response.data;
            $scope.companynames = [];        
            $scope.chunkedcompanies = $scope.chunk($scope.companies, 3);
        });            
    };
    
    $scope.findCompaniesToEditEvent=function(){
        $scope.findCompanies();
        $scope.choose();
    };

    $scope.findEvent = function() {
        Events.query(function(events) {
            $scope.events = events;
        });
    };

    $scope.findOneEvent = function() {
        Events.get({
            id: $stateParams.id 
        }, function(response) {
            $scope.event = response;
            $scope.contacts(response);
            $scope.event.Event_date = new Date($scope.event.Event_date);
            $scope.event.Event_followupdate = new Date($scope.event.Event_followupdate);
            
            if ($scope.event.FollowedUp===true){
                $scope.event.Followedupanswer="Yes";
            } else if ($scope.event.FollowedUp===false){
                $scope.event.Followedupanswer="No";
            }

            if ($scope.event.Event_flag===true){
                $scope.event.flaganswer="Yes";
            } else {
                $scope.event.flaganswer="No";
            }

            $scope.event.CompanyId=$scope.event.Company.id;  
        });
        $scope.Edit = false;
        $scope.FollowUp = false;
    };

    $scope.editEvent = function(){
        $scope.Edit = true;
        $scope.FollowUp = false;
        $scope.findusers();
        $scope.findCompanies();
        $scope.chooseforcreate($scope.event.Company.Company_name);
        $scope.newcontactnames=$scope.names;
        $scope.getfollowupflaganswer($scope.event.Event_flag);
        $scope.getfollowedupanswer($scope.event.FollowedUp);
    };

    $scope.findusers = function(){
        $scope.usernames = [];
        $scope.chunkedusernames = [];
        $http.get('/showusers')
            .then(function(response){
                $scope.users = response.data;
                for (var x=0; x<$scope.users.length; x++){
                    $scope.usernames.push($scope.users[x].name);
                }
                $scope.chunkedusernames=$scope.chunk($scope.usernames,3);
            });
    };

    $scope.getfollowedupanswer = function(truefalse){
        if(truefalse===true){
            $scope.event.followedupanswer = "Yes";
        } else {
            $scope.event.followedupanswer = "No";
        }
    };

    $scope.getfollowupflaganswer = function(truefalse){
        if(truefalse === true){
            $scope.event.flagyes= "Yes";
        } else {
            $scope.event.flagyes = "No";
        }
    };

    $scope.gettech = function(){
        $http({
            method: 'GET', 
            url: 'findtech',
            params: {id: $stateParams.id}
        }).then(function(tec){
            $scope.technology=tec.data;
        });
    };

    $scope.gettechandcomp = function(){
        $http({
            method: 'GET',
            url: 'findteck',
            params: {TechId: $stateParams.TechId}
        }).then(function(teck){
            $scope.technology=teck.data;
        });

        $http({
            method: 'GET',
            url: 'findkomp',
            params: {CompId: $stateParams.CompId}
        }).then(function(komp){
            $scope.kompany=komp.data;
        });
    };

    $scope.removeEvent = function(event) {
        if ($window.confirm("Are you sure you want to delete this event?")){
            if (event) {
                event.$remove();  

                for (var i in $scope.events) {
                    if ($scope.events[i] === event) {
                        $scope.events.splice(i, 1);
                    }
                }
            }
            else {
                $scope.event.$remove();
                $state.go('techs');
            }
        }
    };

    $scope.selectmethod = function (method){
        //selecting method when creating new event
        $scope.Event_method = method;
        if(method==="Email"){
            $scope.email=true;
        } else {
            $scope.email=false;
        }
    }; 

    $scope.selectmethod2 = function (method){
        //selecting method when modifying already existing event
        $scope.event.Event_method = method;
        if(method==="Email"){
            $scope.email=true;
        } else {
            $scope.email=false;
        }
    }; 

    $scope.selectoutcome = function (outcome){
        $scope.Event_outcome = outcome;
    };

    $scope.email;
    $scope.nameofperson;

    $scope.createandsendmanyemails = function(){
        for(var x=0; x<$scope.selectedcontacts.length; x++){
            $scope.emails.push($scope.selectedcontacts[x].Contact_email);
        }
              
        window.open('mailto:' + $scope.global.user.email
                + '?subject=' + $scope.technology.Tech_name 
                +'&bcc='+$scope.emails
                + '&body=Hello,%0D%0A%0D%0AAny interest in ' + $scope.technology.Tech_name + "? It's really good and I think you might like it.%0D%0A%0D%0ABest regards,%0D%0A" + $scope.global.user.name)
    };

    $scope.sendemail = function(){
        window.open('mailto:' + $scope.email 
                
                +'?subject=' + $scope.technology.Tech_name 
                +'&body=Dear ' + $scope.nameofperson 
                + ",%0D%0A%0D%0AAny interest in " + $scope.technology.Tech_name + "? It's really good and I think you might like it.%0D%0A%0D%0ABest regards,%0D%0A" + $scope.global.user.name);            
    };  


    $scope.sendemailandsubmit=function(){
        $scope.createEvent();
        $scope.sendemail();
    };

    $scope.sendemailandsubmit2=function(){
        //for creating multiple events
        $scope.createMultEvent();
        $scope.createandsendmanyemails();
    };

    $scope.setfollowedup = function(answer){
        if (answer==="Yes"){
            $scope.event.Followedupanswer=true;
        } else if (answer==="No"){
            $scope.event.Followedupanswer=false;
        }
    };

    $scope.setfollowupflag = function(answer){
        if(answer==="Yes"){
            $scope.Event_flag = true;
        } else {
            $scope.Event_flag = false;
        }
    }; 

    $scope.setfollowupflagtoedit = function(answer){
        if(answer==="Yes"){
            $scope.event.Event_flag = true;
        } else {
            $scope.event.Event_flag = false;
        }
    }; 

    $scope.showFollowUp = function(){
        $scope.FollowUp = true;
        $scope.Edit = false;
    };

    $scope.toggle = function (contact) {
        var idx = $scope.selectedcontacts.indexOf(contact);

        if (idx > -1) {
          $scope.selectedcontacts.splice(idx, 1);
        }
        else {
          $scope.selectedcontacts.push(contact);
        }   
    };

    $scope.toggle2 = function (contact, selected) {
         var idx = $scope.selectedcontacts.indexOf(contact);
 
         if (idx > -1){
             $scope.selectedcontacts.splice(idx,1);
         } else {
             $scope.selectedcontacts.push(contact);
         }
     };

    $scope.toggleCompanies = function (company,selected) {
        $scope.selectedcompanynames=[];
        $scope.contacts = [];
        $scope.contactinfo = [];
        
        var idx = selected.indexOf(company);
        var idx2 = $scope.selectedcompanies.indexOf(company);

        if (idx > -1) {
          selected.splice(idx, 1);
          $scope.selectedcompanies.splice(idx2,1);
        }
        else {
          selected.push(company);
          $scope.selectedcompanies.push(company);
        }

        //get contact objects into a separate array
        for (var x=0; x<$scope.selectedcompanies.length; x++){
            if(typeof $scope.selectedcompanies[x]==="object"){
                $scope.contacts.push($scope.selectedcompanies[x].Contacts);
                $scope.selectedcompanynames.push(selected[x].Company_name);
            }
        }

        if($scope.contacts!=="undefined"){
            var temp = [];
            for (var y=0; y<$scope.contacts.length; y++){
                for (var z=0; z<$scope.contacts[y].length; z++){
                    temp.push($scope.contacts[y][z]);
                }
                $scope.contactinfo.push(temp);
                temp=[];
            }
        }
      };

    $scope.updateEvent = function() {
        if($scope.event.Followedupanswer===true){
            $scope.event.flagyes = false;
            $scope.event.Event_flag = false;
            $scope.event.Event_followupdate = null;
        }

        var event = $scope.event;
        $scope.cleanupcontacts();

        if($scope.event.Event_outcome==="Not interested"){
            $scope.event.Event_flag = false;
            $scope.event.Event_followupdate=null;
        }
        if($scope.event.Event_flag===false){
            $scope.event.Event_followupdate=null;
        }
        if($scope.event.FollowedUp===true){
            $scope.event.Event_followupdate=null;
            if($scope.event.notes!==null){
                ("Notnull");
                $scope.event.notes=$scope.event.notes + "; Followed up";
            } else {
                $scope.event.notes = "Followed up";
            }
        }
        event.updated = [];
        event.updated.push(new Date().getTime());
        
        event.$update(function() {
        }).then(function(){
            $scope.Edit=false;
            $state.go('viewEvent',{id : event.id});
            $scope.findOneEvent();
        });
    };

    $scope.checkifnewuser = function(){
         //find user object if a new user has been selected
        if ($scope.event.userchange===true){
                $scope.updateEvent();      
        } else {
            $scope.updateEvent();   
        }
    };

}]);




    

