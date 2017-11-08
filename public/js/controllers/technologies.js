'use strict';

angular.module('mean.technologies').controller('TechController', ['$scope', '$stateParams', 'Global', 'Technologies', '$state', '$http', '$window', '$filter', function ($scope, $stateParams, Global, Technologies, $state, $http, $window, $filter) {
    $scope.global = Global;

    $scope.create = function() {
        var technology = new Technologies({
            Tech_RUNumber: this.Tech_RUNumber,
            Tech_name: this.Tech_name,
            Tech_inventor: this.Tech_inventor,
            Tag_name: this.selected,
            Tech_marketer: $scope.marketer,
            isActive: true, 
            isUnloved: false
        });
        console.log("$scope.marketer", $scope.marketer);
        console.log("technology:", technology);
        technology.$save(function(response) {
            $state.go('viewTech',{id : response.id});
        });

        this.Tech_RUNumber = "";
        this.Tech_name = "";
        this.Tech_inventor = "";
        this.Tag_name = "";
        this.Tech_marketer = "";
        this.isUnloved= "";
    };

    $scope.remove = function(technology) {
        if ($window.confirm("Are you sure you want to delete this technology?")){
            if (technology) {
                technology.$remove();  

                for (var i in $scope.technologies) {
                    if ($scope.technologies[i] === technology) {
                        $scope.technolgies.splice(i, 1);
                    }
                }
            } else {
                $scope.technology.$remove();
                $state.go('techs');
            }
        }
    };

    $scope.update = function() {
        var technology = $scope.technology;
        var tagname = $scope.whatyouneed;
        var marketer = $scope.Tech_marketer;

        technology.Tag_name = $scope.whatyouneed;
        technology.marketer = $scope.marketer;
        
        technology.updated = [];
        
        technology.updated.push(new Date().getTime());
        technology.$update(function() {
        $state.go('viewTech',{id : technology.id});
        });
    };

    var showtags;
    var whatyouneed;
    var tagarray = [];
    var tags = [];
    var tagids =[]; 
    var user;

  

    $scope.findOne = function() {
        
        //get information about technology
        Technologies.get({
            id: $stateParams.id 
            }, function(technology) {
                $scope.technology = technology;
                console.log("$scope.technology", $scope.technology);

                //get technology marketer
                if (technology.User) {
                    $scope.user = technology.User;
                    $scope.username = technology.User.name;
                } else {
                    $scope.username = "none";
                    $scope.user = "none";
                }
                
                //get technology tag objects
                if(technology.Tags.length!==0){
                    tagarray = technology.Tags;
                } else {
                    tagarray.push({Tag_name:"None"});
                }
                $scope.tagarray = tagarray;

                //pull out tagnames of each tag
                tagarray.forEach(function(tag){
                    tags.push(tag.Tag_name);
                    tagids.push(tag.id);
                });

                $scope.tagids = tagids;
                $scope.whatyouneed = tags;
                whatyouneed = $scope.whatyouneed;

                //get tagnames into easy to display format
                $scope.tags = tags.join(", ");
                 $scope.findtagsandusers();
                $scope.selected = $scope.tags;
                $scope.findEventsforOneTechnology();
            });
    };

  

    $scope.findEventsforOneTechnology = function(){  
      $http({
            method: 'GET',
            url: '/geteventsforonetechnology',
            params: {techid: $scope.technology.id}
        }).then(function(response){
            $scope.makeEventDataUseable(response);
        });
    };


    $scope.companynames=[];
    $scope.Eventtechs =[];
    $scope.users=[];
    $scope.companies=[];
    $scope.arrayofarrayofcontacts=[];
    $scope.arrayofcontacts=[];
    $scope.parsedevents=[];
    $scope.collectingevents=[];

    $scope.makeEventDataUseable = function(response){
        $scope.events = response.data;
        //var evnts = $scope.events;
        
  //      console.log("events", $scope.events);
        if($scope.events.length===0){
            //console.log("No events");
            //console.log("should hide");
            $scope.noevents = true;
        } else {
            $scope.noevents = false;
        }

        //separate events by company 
        //(events are returned sorted by company, but this will put all the events associated with a company 
        //into a separate array)
        //we'll also create an array of contact objects for each set of company events
        if(!$scope.noevents){
            var nametocheck = $scope.events[0].Company.Company_name;
            
            for(var k=0; k<$scope.events.length; k++){
                if($scope.events[k].Company.Company_name===nametocheck){
                    $scope.collectingevents.push($scope.events[k]);
                    $scope.arrayofcontacts.push($scope.events[k].Contacts);
                } else {
                    nametocheck=$scope.events[k].Company.Company_name;
                    $scope.parsedevents.push($scope.collectingevents);
                   $scope.arrayofarrayofcontacts.push($scope.arrayofcontacts);
                   $scope.arrayofcontacts.push($scope.events[k].Contacts);
                    $scope.collectingevents=[];
                    $scope.arrayofcontacts=[];
                    $scope.collectingevents.push($scope.events[k]);
                    $scope.arrayofcontacts.push($scope.events[k].Contacts);
                }
                if(k===$scope.events.length-1){
                    $scope.parsedevents.push($scope.collectingevents);
                    $scope.arrayofarrayofcontacts.push($scope.arrayofcontacts);
                }
            }
        }

   //     console.log('parsedevents', $scope.parsedevents);
    

        //push company names into $scope.companynames so that they can be compared to list of suggested companies and duplicates removed
        //console.log("$scope.companies", $scope.companies);
        for(var w=0; w<$scope.parsedevents.length; w++){
            //console.log("$scope.companies[w].Company_name", $scope.companies[w].Company_name);
            $scope.companynames.push(($scope.parsedevents[w])[0].Company.Company_name);
        }
        //console.log("$scope.companynames", $scope.companynames);
        $scope.findSuggestedCompanies();        
    };

    $scope.contacts = function(event){
        var names=[];
        for (var x=0; x<event.Contacts.length; x++){ 
            if (event.Contacts[x].length===0){
                console.log("triggered");
                names.push(["None"]);
            } else {
                names.push(event.Contacts[x].Contact_name);
            } 
        }
        names = names.join(", ");
        event.names = names;
    };    

    $scope.makeEventDataUseable2 = function(response){    
        $scope.events = response.data;

        if($scope.events.length===0){
            $scope.noevents = true;
        } else {
            $scope.noevents = false;
        }
    
        //parse out marketer, technology, and company info for each event
        if(!$scope.noevents){
            for(var i=0; i<$scope.events.length; i++){
                $scope.Eventtechs.push($scope.events[i].Technology);
                $scope.users.push($scope.events[i].User);
                $scope.companies.push($scope.events[i].Company);
                //console.log("$scope.events[i]", $scope.events[i]);

                //parse out contact info for each event
                if($scope.events[i].Contacts){
                    $scope.arrayofarrayofcontacts.push($scope.events[i].Contacts);
                } else {
                    $scope.arrayofarrayofcontacts.push({"Contact_name": "none"});
                }
            }

            var arrayofcontactnames =[];
            var contactnames =[];

            //parse out contact names from each contact object
            console.log("arrayofarrayofcontacts", $scope.arrayofarrayofcontacts);
            $scope.arrayofarrayofcontacts.forEach(function(array){
                array.forEach(function(contact){
                    contactnames.push(contact.Contact_name);
                });
                arrayofcontactnames.push(contactnames);
                contactnames = [];
            });

            //make a string of all the contact names for each company
            var stringofcontactnames;
            arrayofcontactnames.forEach(function(array){
                stringofcontactnames=array.join(", ");
                contactnames.push(stringofcontactnames);
            });

            $scope.contactnames = contactnames;
       }

    };         

    $scope.findSuggestedCompanies = function(){
        $http({
            method: 'GET',
            url: '/findsuggestedcompanies',
            params: {
                tags: tags,
                tagarray: $scope.tagarray,
                tagids: tagids
            }
        }).then(function(resp){
            $scope.suggestedcompanies=resp.data;
            $scope.revisedsuggestedcompanies=[];

            //put suggested companies into an array so that they can be cross-checked against companies that have been contacted
            for(var k=0; k<$scope.suggestedcompanies.length; k++){
                for(var m=0; m<$scope.companynames.length; m++){
                    if($scope.suggestedcompanies[k].Company_name===$scope.companynames[m]){
                        $scope.suggestedcompanies.splice(k,1);
                        k--;
                        break;
                    }
                }
            }

            var foundtags=[];
            var foundtagnames =[];
            var foundarrayoftagnames=[];
            var foundarrayofarrayoftags=[];
            
            //creating an array of arrays of tag objects 
            for (var i=0; i<$scope.suggestedcompanies.length; i++){
                    foundtags.push($scope.suggestedcompanies[i].Tags);
                }            
            //going through the array of array of tag objects and putting the name of each tag into a separate array
            foundtags.forEach(function(arrayoftags){
                arrayoftags.forEach(function(tagobject){
                    foundtagnames.push(tagobject.Tag_name);
                });
                //push all the tagnames for one matched company into another array
                foundarrayoftagnames.push(foundtagnames);
                //clear the array of tagnames we just pushed
                foundtagnames = [];
            });

            //make foundarrayoftagnames into one string of found tag names
            var foundstringoftagnames;
            var finaltagnames=[];
            foundarrayoftagnames.forEach(function(array){
                foundstringoftagnames=array.join(", ");
                finaltagnames.push(foundstringoftagnames);
            });
            $scope.finaltagnames=finaltagnames;
        });
    };

    $scope.getNow = function(){
        return new Date();
    };

    
    $scope.find = function() {
        Technologies.query(function(technologies) {
            $scope.technologies = technologies;  
            $scope.gettagsandmarketers();         
        });
    };

    $scope.usernames = [];

     $scope.findtagsandusers =  function(){
            $scope.tagnames = [];
            $http.get('/tags')
            .then(function(response){
                $scope.tagresponse = response.data;
                $scope.tagresponse.forEach(function(tag){
                    $scope.tagnames.push(tag.Tag_name);
                });
                $scope.chunkedtagnames = $scope.chunk($scope.tagnames, 5);
            });
            $http.get('/showusers')
                .then(function(response){
                    $scope.usersresponse = response.data;
                    $scope.usersresponse.forEach(function(userObject){
                        $scope.usernames.push(userObject.name);
                    });
                    $scope.chunkedmarketers = $scope.chunk($scope.usernames, 3);
                });
        };
     $scope.selected = [];

     $scope.chunk = function(arr, size){
        var newArr =[];
            for (var i=0; i<arr.length; i+=size) {
                newArr.push(arr.slice(i, i+size));
            }
            return newArr;
    };

    $scope.getAdmin = function(){
        console.log("hello?");
    };
     
    $scope.toggle = function (tag, tags) {
        var idx = tags.indexOf(tag);
        if (idx > -1) {
          tags.splice(idx, 1);
        }
        else {
          tags.push(tag);
        }
      };

    $scope.toggle2 = function (tag, whatyouneed) {
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

      $scope.yes = function(){
        $scope.technology.isActive = true;
      };

      $scope.no = function(){
        $scope.technology.isActive = false;
      };

    $scope.choosemarketer = function (name) {
        $scope.marketer = name;
        console.log(" chosen $scope.marketer", $scope.marketer);
        $scope.marketerchosenorchanged = true;
    };  

      $scope.marktheusername = function (name) {
        var thingtocheck;
        thingtocheck = $scope.user.name;
        if($scope.user.name && !$scope.marketerchosenorchanged) {
            $scope.marketer = $scope.user.name;
        } else if ($scope.marketerchosenorchanged) {
            thingtocheck = $scope.marketer;
        }
        if (thingtocheck === name){
            return true;
        }
      };

    $scope.searchForTech = function(){
        $http({
            method: 'GET',
            url: '/searchfortech',
            params: {number: $scope.number}
        }).then(function(resp){
            var technology = resp.data;
            $state.go('viewTech', {id: technology.id});
        });
    };

//     $scope.internid=[];

    $scope.mymarketing = function(){
        $scope.showall = false;
        if($scope.global.user.Interns!==undefined){
           console.log("INTERnS=TRUE");
           console.log("INterns are", $scope.global.user.Interns);
            $scope.internid=[];
            $http({
                method: "GET", 
                url: '/getinterninfo',
                params: {id: $scope.global.user.id}
            }).then(function(interninfo){
                console.log("interninfo: ", interninfo.data);
                for(var x=0; x<interninfo.data.length; x++){
                    $scope.internid.push(interninfo.data[x].id);
                }
                console.log("internid", $scope.internid);
            }).then(function(){
                 $http({
                    method: "GET",
                    url: '/mymarketing',
                    params: {internid: $scope.internid,
                             id: $scope.global.user.id}
                }).then(function(tex){
                    $scope.technologies = tex.data;
        //            console.log("whatcameback:", $scope.technologies);
                    $scope.gettagsandmarketers();
                });
                $scope.title = "My Active ";
                //$scope.findEventsForFollowUp();
            });
        } else {
            console.log("FALSEadmin")
             $http({
                    method: "GET",
                    url: '/mymarketingfornonadmins',
                    params: {id: $scope.global.user.id}
                }).then(function(tex){
                    $scope.technologies = tex.data;
                    console.log("whatcameback:", $scope.technologies);
                    $scope.gettagsandmarketers();
                });
                $scope.title = "My Active ";
                //$scope.findEventsForFollowUp();
        }
    };
  
    
    $scope.allcamps = function(){
        $scope.showlovedstatus = true;
        $scope.title = "All Active and Inactive ";
     
        $http({
            method: 'GET',
            url: '/allcampaigns'
        }).then(function(tex){
            $scope.technologies = tex.data;
            $scope.gettagsandmarketers();
            $scope.showall = true;
        });
    };

    $scope.active = function(){
        $scope.showlovedstatus = true;
        $scope.showall = false;

        $scope.title = "All Active ";
        $http({
            method: 'GET',
            url: '/active'
        }).then(function(tex){
            $scope.technologies = tex.data;
            $scope.gettagsandmarketers();
        });
    };

    $scope.unloved = function(){
        $scope.showlovedstatus = false;
        $scope.title = "Unloved ";
        $scope.showall = true;
        $http({
            method: 'GET',
            url: '/unloved'
        }).then(function(tex){
            $scope.technologies = tex.data;
            console.log("$scope.technologies", $scope.technologies);
            $scope.gettagsandmarketers();
        });
    };

    $scope.gettagsandmarketers = function(){
        //$scope.technologies is an array of objects; we are now going to get the information we want out of the array
        var arrayofarrayoftagobjects = [];
        var arrayoftagobjects = []; 
        $scope.arrayofusers = [];  
        var tempuser; 
        $scope.technologies.forEach(function(technology){
            //loading marketer information into an array
            if (!technology.User){
                $scope.arrayofusers.push("");
            } else {
                tempuser = technology.User;
                $scope.arrayofusers.push(tempuser.name);
            }
            //since there's only one marketer per technology, we've now got an array of strings/marketers that we can easily index for display
            
            //now we'll get the tag information into a useable format--this gets a little more complicated, since each technology can have more than one tag
            //first, we put the array of tag objects from each technology into an array, making an array of arrays of tag objects 
            if(technology.Tags){
                arrayofarrayoftagobjects.push(technology.Tags); 
            } else {
                //we'll push an empty string for technologies that don't have tags (since we'll want to be able to index these later!)
                arrayofarrayoftagobjects.push([{Tag_name: ""}]);
            }    
        });

        var arrayoftagnames = [];
        var tagnames = [];
        //now we go through the array of arrays of tag objects and put the name of each tag into a separate array called tagnames
        //visually, we're staring with something like this: [[{tag}, {tag}], [{tag}, {tag}, {tag}], [{tag}]]
        arrayofarrayoftagobjects.forEach(function(array){
            //so for each array in the array of arrays....
            array.forEach(function(tagobject){
                //...we go through the tag objects in the array, pull out the tagname and push that name into a separate array
                tagnames.push(tagobject.Tag_name);
            });
            //then, once we've collected all the tag names from one array, we push those tag names into yet another array descriptively called arrayoftagnames
            arrayoftagnames.push(tagnames);
            //and now we clear the array we just pushed the tagnames into so we can use it again
            tagnames = [];
        });
        //we've now got a array of arrays of tagnames. yay!
        //next step is to get the arrays of tag names into one string of tag names, so that it's easier to display:
        var stringoftagnames;
        arrayoftagnames.forEach(function(array){
            stringoftagnames=array.join(", ");
            tagnames.push(stringoftagnames);   
        });
        //now we'll put our array of strings/tagnames onto our scope 
        $scope.tagnames = tagnames;
    };


    $scope.choose = function(comp){
        $scope.company = comp;
        console.log("$scope.company", $scope.company);
        var company = $scope.company;

        $http({
            method: 'GET',
            url: '/findcompanycontacts',
            params: {Company_name: company}
        }).then(function(company){
            $scope.company = company.data;
            console.log("COMpanyfound", $scope.company);
            $scope.contacts = $scope.company.Contacts;
            console.log($scope.contacts, "$scope.contacts");
            $scope.contactschunked = $scope.chunk($scope.contacts, 3);
        });
    }; 

    $scope.select = function(contact){
        $scope.contact = contact;
    };  


    $scope.findEventsForFollowUp = function(){
        $scope.Eventtechs =[];
        $scope.Technologytitles=[];
        $scope.followups=[];
        $scope.users=[];
        $scope.companies=[];
        $scope.arrayofarrayofcontacts=[];

        if($scope.global.user.Interns!==undefined){
            console.log("TRUtueE");
            $scope.internid=[];
            $http({
                method: "GET", 
                url: '/getinterninfo',
                params: {id: $scope.global.user.id}
            }).then(function(){
        $http({
            method: 'GET',
            url: '/geteventsneedingfollowup',
            params: {internid: $scope.internid}
        }).then(function(response){
            console.log("response.data", response.data);
            $scope.makeEventDataUseable2(response);
            });
            });
        } else {
             $http({
                method: 'GET',
                url: '/geteventsneedingfollowupfornonadmin',
                params: {internid: $scope.internid}
            }).then(function(response){
                console.log("response.data", response.data);
                $scope.makeEventDataUseable2(response);            
            });
        }
    };

    $scope.showdetails = function(){
        if(!$scope.showthedetails){
            $scope.showthedetails=true;
        } else {
            $scope.showthedetails=false;
        }
    };

}]);