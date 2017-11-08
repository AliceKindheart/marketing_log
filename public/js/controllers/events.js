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
       // $scope.event.CompanyId = comp.id;
    }; 

    $scope.chooseforcreate = function(comp){
       // console.log("stupidchoosefunctionran");
        $scope.company = comp;
     //   console.log("$scope.company", $scope.company);
        var company = $scope.company;

        $http({
            method: 'GET',
            url: '/findcompanycontacts',
            params: {Company_name: company}
        }).then(function(company){
            $scope.company = company.data;
        //    console.log("COMpanyfound", $scope.company);
            $scope.compcontacts = $scope.company.Contacts;
         //  console.log($scope.compcontacts, "$scope.compcontacts");
            

            $scope.compcontactschunked = $scope.chunk($scope.compcontacts, 3);
     //       console.log($scope.compcontactschunked, "$scope.compcontactschunked");
        });
       // $scope.event.company = comp;
       // $scope.event.CompanyId = comp.id;
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
     //   console.log("revisedrevisedevent.Contacts", event.Contacts);
        $scope.names=[];
        //var stringonames;
        for (var x=0; x<event.Contacts.length; x++){ 
            if (event.Contacts[x].length===0){
              //  console.log("triggered");
                $scope.names.push(["None"]);
            } else {
                $scope.names.push(event.Contacts[x].Contact_name);
               // console.log("contactname", event.Contacts[x].Contact_name);
            } 
        }
        stringonames = $scope.names.join(", ");
      //  console.log ("$scope.names", $scope.names, typeof $scope.names);
        event.names = stringonames;
        $scope.eventcontacts = stringonames;
        //console.log("$scope.eventcontacts", $scope.eventcontacts);
        if ($scope.eventcontacts.length>=3) {
          //  console.log("SHORT");
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
        console.log("cleanedupcontacts: ", $scope.selectedcontacts);
        //get an array of contact ids
        for (var m=0; m<$scope.selectedcontacts.length; m++){
            $scope.contactids.push($scope.selectedcontacts[m].id);
        }

        $scope.event.contactids = $scope.contactids;
        console.log("$scope.event.contactids", $scope.event.contactids);

    };

    

    $scope.createEvent = function() {
       // $scope.cleanupcontacts();
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
        console.log("Event", event);
         //console.log("DATEFORMAT: ", event.Event_date);
         //console.log("DATEtype: ", typeof event.Event_date);
        event.$save(function(response) {
           // console.log("response", response);
            //$state.go('viewCompany',{Company_name : responseid});
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
        console.log("Event", event);
         //console.log("DATEFORMAT: ", event.Event_date);
         //console.log("DATEtype: ", typeof event.Event_date);
        event.$save(function(response) {
            
            //update old event 
            $scope.event.FollowedUp=true;
            $scope.event.Event_followupdate=null;
            $scope.event.Event_flag = false;
            
            $scope.event.updated = [];
            $scope.event.updated.push(new Date().getTime());
            
            $scope.event.$update(function() {
            //console.log("response", response.data);
            }).then(function(){
                $scope.Edit=false;
                $scope.FollowUp=false;
           // console.log("response", response);
            //$state.go('viewCompany',{Company_name : responseid});
            $state.go('viewTech',{id: response.TechnologyId});
            });

        
          //  console.log("here'swhat'sleftonthescope", $scope);
           // $scope.createEvent();
            
          //  $state.go('viewEvent',{id : event.id});
          //  $scope.findOneEvent();
        });


        //$scope.createEvent();
    };

    $scope.startFollowUp = function(){
       // $scope.findCompanies();
        $scope.Edit = false;
        $scope.FollowUp = true;
        $scope.findusers();
        $scope.findCompanies();
        console.log("eventinscope: ", $scope.event);

        $scope.chooseforcreate($scope.event.Company.Company_name);
        $scope.newcontactnames=$scope.names;
        $scope.selectedcontacts=$scope.event.Contacts;
        $scope.company=$scope.event.Company;
        $scope.user=$scope.event.User;
        $scope.technology=$scope.event.Technology;
       // $scope.getfollowupflaganswer($scope.event.Event_flag);
       // $scope.getfollowedupanswer($scope.event.FollowedUp);
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
      //      console.log("cntctstosave", $scope.cntcts);
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

          //  console.log("EVENT ABOUT TO SAVE", event);

            event.$save(function(response) {
            //    console.log("response", response);
            });  
            $scope.cntcts = [];     
        }
        $state.go('techs');     
    };

    $scope.editoutcome = function (outcome) {
        $scope.event.Event_outcome = outcome;
        console.log("NEWOUTCOME", $scope.event.Event_outcome);
        console.log("revisedevent", $scope.event);
        
    };

    $scope.exists = function (tag, list) {
      //  console.log("compcontact.Contact_name", compcontact.Contact_name, "$scope.names", $scope.names);
        return list.indexOf(tag) > -1;
    };

    $scope.findCompanies = function() {
        $http({
            method: 'GET',
            url: '/companiesforevent'
        }).then(function(response){
            $scope.companies = response.data;
            $scope.companynames = [];
            //console.log("$scope.companies", $scope.companies);
            response.data.forEach(function(company){
                $scope.companynames.push(company.Company_name);
            });
        //console.log("companynames", $scope.companynames);
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
            //console.log("$scope.companies", $scope.companies);         
            $scope.chunkedcompanies = $scope.chunk($scope.companies, 3);
        });            
    };
    
    $scope.findCompaniesToEditEvent=function(){
        $scope.findCompanies();
        $scope.choose();
    };

    $scope.findEvent = function() {
        Events.query(function(events) {
            //console.log("findeventfindevent");
            $scope.events = events;
            //console.log(events);
        });
    };

    $scope.findOneEvent = function() {
       // console.log("findoneeventran");
        Events.get({
            id: $stateParams.id 
        }, function(response) {
            //console.log("response", response);
            $scope.event = response;
           // console.log("$scope.event", $scope.event);
            $scope.contacts(response);
           // console.log("stupidateformatlookslike: ", $scope.event.Event_date);
           // console.log("typeofstupid: ", typeof $scope.event.Event_date);
            $scope.event.Event_date = new Date($scope.event.Event_date);
            $scope.event.Event_followupdate = new Date($scope.event.Event_followupdate);
             //$scope.event.Event_date=($scope.event.Event_date | date:'MM/dd/yyyy');
            
            if ($scope.event.FollowedUp===true){
          //      console.log("saysfollowedup=true");
                $scope.event.Followedupanswer="Yes";
             //   console.log("followedupanswerisnow:", $scope.event.Followedupanswer);
            } else if ($scope.event.FollowedUp===false){
                $scope.event.Followedupanswer="No";
             //   console.log("saysfollowedup=true");
            }

            if ($scope.event.Event_flag===true){
                $scope.event.flaganswer="Yes";
            } else {
                $scope.event.flaganswer="No";
            }

            $scope.event.CompanyId=$scope.event.Company.id;
           // console.log("$scope.eventonload", $scope.event);

            console.log("EVENTFOUND", $scope.event);    
        });
        $scope.Edit = false;
        $scope.FollowUp = false;
        console.log("EVENTFOUND", $scope.event);
       // console.log("made it to the end of findoneevent");
    };

    $scope.editEvent = function(){
     //   console.log("editeventcalled");
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
       // console.log("findusers just called, here are the users before the call", $scope.users);
        $http.get('/showusers')
            .then(function(response){
               // console.log("HEREARETHE USERS: ", response.data);
                $scope.users = response.data;
               // console.log("length", $scope.users.length, "$scope.users", $scope.users);
                for (var x=0; x<$scope.users.length; x++){
                   // console.log("$scope.users[x]", $scope.users[x]);
                    $scope.usernames.push($scope.users[x].name);
                }

           // console.log("$scope.usernames", $scope.usernames);
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
        console.log("$scope.event.flagyes: ", $scope.event.flagyes);
    };

    $scope.gettech = function(){
        $http({
            method: 'GET', 
            url: 'findtech',
            params: {id: $stateParams.id}
        }).then(function(tec){
            $scope.technology=tec.data;
          //  console.log("technoll", $scope.technology);
        });
    };

    $scope.gettechandcomp = function(){
        $http({
            method: 'GET',
            url: 'findteck',
            params: {TechId: $stateParams.TechId}
        }).then(function(teck){
            $scope.technology=teck.data;
            console.log("teck", $scope.technology);
        });

        $http({
            method: 'GET',
            url: 'findkomp',
            params: {CompId: $stateParams.CompId}
        }).then(function(komp){
            $scope.kompany=komp.data;
            console.log("komp", $scope.kompany);
        });
    };

    $scope.removeEvent = function(event) {
       // console.log("removeevent was called");
       // console.log($scope.event);

        if ($window.confirm("Are you sure you want to delete this event?")){
            if (event) {
               // console.log("THERE WAS AN EVENT");
                event.$remove();  

                for (var i in $scope.events) {
                    if ($scope.events[i] === event) {
                       // console.log("that thing happened");
                        $scope.events.splice(i, 1);
                    }
                }
            }
            else {
              //  console.log("hello event else");
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
        console.log("newmethod", $scope.event.Event_method, typeof $scope.event.Event_method);
        console.log("revisedevent", $scope.event);
    }; 

    $scope.selectoutcome = function (outcome){
        $scope.Event_outcome = outcome;
    };

    $scope.email;
    $scope.nameofperson;

    $scope.createandsendmanyemails = function(){
        //console.log("hello");
        
        //console.log($scope.selectedcontacts, "$scope.selectedcontacts");
        //$scope.emailbody =;
        //$scope.createEvent();
        for(var x=0; x<$scope.selectedcontacts.length; x++){
            //console.log("$scope.selectedcontacts[x].Contact_email", $scope.selectedcontacts[x].Contact_email);
            $scope.emails.push($scope.selectedcontacts[x].Contact_email);
            //$scope.addressees.push($scope.selectedcontacts[x].Contact_name);
            //console.log("$scope.addressees", $scope.addressees);

        }
       // $scope.emails = $scope.emails.join("; ");
        console.log("$scope.emails", $scope.emails);
       // $scope.addressees=$scope.addressees.join(", ");
       // console.log("$scope.addressees", $scope.addressees);
        
      // for(var y=0; y<$scope.emails.length; y++){
          //  console.log("thisran");
          //  $scope.email=$scope.emails[y];
           // $scope.nameofperson=$scope.addressees[y];
            //$scope.sendemail();       
        

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
            //$scope.event.flagyes = false;
            //$scope.event.Event_flag = false;
        } else if (answer==="No"){
            $scope.event.Followedupanswer=false;
        
        }
        //$scope.event.Followedupanswer = answer;
        console.log("FOLLLOWEDUPANSWEER", $scope.event.Followedupanswer);
    };

    $scope.setfollowupflag = function(answer){
        if(answer==="Yes"){
            //$scope.event.flagyes = true;
            $scope.Event_flag = true;
        } else {
            //$scope.event.flagyes = false;
            $scope.Event_flag = false;
        }
    }; 

    $scope.setfollowupflagtoedit = function(answer){
        if(answer==="Yes"){
            console.log("flagshouldbeyes");
            //$scope.event.flagyes = true;
            $scope.event.Event_flag = true;
        } else {
            //$scope.event.flagyes = false;
            $scope.event.Event_flag = false;
            console.log("$scope.event.Event_flagrevised", $scope.event.Event_flag);
        }
        console.log("$scope.event.Event_flag", $scope.event.Event_flag);
    }; 

    $scope.showFollowUp = function(){
        console.log("SHOWFOLLOWUP");
        $scope.FollowUp = true;
        $scope.Edit = false;
    };

    $scope.toggle = function (contact) {
        var idx = $scope.selectedcontacts.indexOf(contact);
        //var idx2 = $scope.selectedcontacts.indexOf(contact);
        //console.log($scope.selectedcontacts, "$scope.selectedcontacts");
      //  console.log("idx", idx);

        if (idx > -1) {
          $scope.selectedcontacts.splice(idx, 1);
        }
        else {
          $scope.selectedcontacts.push(contact);
        }
    
    };

    $scope.toggle2 = function (contact, selected) {
        //$scope.selectedcontacts=[];
         var idx = $scope.selectedcontacts.indexOf(contact);
        // var idx2 = $scope.selectedcontactnames.indexOf(contact);
  //       console.log("idx", idx);
         //if (idx > -1) {
           //selected.splice(idx, 1);
         //}
         //else {
           //selected.push(contact);
         //}
 
         if (idx > -1){
             $scope.selectedcontacts.splice(idx,1);
         } else {
             $scope.selectedcontacts.push(contact);
         }
 
 //        console.log("$scope.selectedcontacts", $scope.selectedcontacts);
     };

    $scope.toggleCompanies = function (company,selected) {
        $scope.selectedcompanynames=[];
        $scope.contacts = [];
        $scope.contactinfo = [];
        //console.log("$scope.companies", $scope.companies);
        
        var idx = selected.indexOf(company);
        var idx2 = $scope.selectedcompanies.indexOf(company);
     //   console.log("idx", idx);
        if (idx > -1) {
          selected.splice(idx, 1);
          $scope.selectedcompanies.splice(idx2,1);
        }
        else {
          selected.push(company);
          $scope.selectedcompanies.push(company);
        }
      //  console.log("selected", selected);
        //console.log("$scope.selectedcompanies", $scope.selectedcompanies);

        //get contact objects into a separate array
        for (var x=0; x<$scope.selectedcompanies.length; x++){
            if(typeof $scope.selectedcompanies[x]==="object"){
                $scope.contacts.push($scope.selectedcompanies[x].Contacts);
                $scope.selectedcompanynames.push(selected[x].Company_name);
            }
        }
    //    console.log("$scope.contacts", $scope.contacts);
        //console.log("$scope.selectedcompanynames", $scope.selectedcompanynames);

        if($scope.contacts!=="undefined"){
            var temp = [];
            for (var y=0; y<$scope.contacts.length; y++){
                for (var z=0; z<$scope.contacts[y].length; z++){
                    temp.push($scope.contacts[y][z]);
                    //$scope.contactnames.push($scope.contacts[y][z].Contact_name);
                }
                $scope.contactinfo.push(temp);
                temp=[];
            }
            //$scope.contactnames = $scope.chunk($scope.contactnames, 3);
        }
      };

    $scope.updateEvent = function() {
      //  console.log("typeof", typeof $scope.event);
        if($scope.event.Followedupanswer===true){
            $scope.event.flagyes = false;
            $scope.event.Event_flag = false;
            $scope.event.Event_followupdate = null;
        }

        var event = $scope.event;
        $scope.cleanupcontacts();
//        console.log("a;skdlf;aslkdjf;lskdjf", $scope.event.selectedcontacts);
        //console.log("whynotworking", $scope.event.Event_outcome);
        //console.log("EVENT", $scope.event);
        console.log("$scope.event.Event_flag", $scope.event.Event_flag);
        if($scope.event.Event_outcome==="Not interested"){
            $scope.event.Event_flag = false;
            //$scope.event.flagyes = "No";
            //console.log("NOTINETERESTED< BUTDIDNchange");
            $scope.event.Event_followupdate=null;
        }
        if($scope.event.Event_flag===false){
            $scope.event.Event_followupdate=null;
        }
        if($scope.event.FollowedUp===true){
            console.log("HELLOTRUE");
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
        //console.log("response", response.data);
        }).then(function(){
            $scope.Edit=false;
            $state.go('viewEvent',{id : event.id});
            $scope.findOneEvent();
        });
    };

    $scope.checkifnewuser = function(){
         //find user object if a new user has been selected
        if ($scope.event.userchange===true){
            console.log("USERCHANGED!");

//            $http({
  //              method: 'GET',
    //            url: '/findnewuser',
      //          params: {name: $scope.event.newusername}
        //    }).then(function(user){
          //      console.log("What came back: ", user.data);
            //    $scope.event.newuser = user.data;
        
                $scope.updateEvent();
            
               // console.log("$scope.event typeof", typeof $scope.event, "$scope.event", $scope.event);
            
        } else {
            //console.log("ELLLLLLLLLLLLLSSSSSSSSSSSSEEEEEEEEEEE");
            $scope.updateEvent();
            //console.log("$scope.event typeof", typeof $scope.event, "$scope.event", $scope.event);
            //$scope.updateEvent();
            
        }
    };

}]);




    

