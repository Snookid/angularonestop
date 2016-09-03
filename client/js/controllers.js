//Controllers
(function(){
  'use strict';
  /*global firebase*/
  /*global angular*/
  /*global moment*/
  angular.module('OneStop')
    .controller('onecontroller', onecontroller)
    .controller('homecontroller', homecontroller)
    .controller('dbcontroller', dbcontroller)
    .controller('qacontroller', qacontroller)
    .controller('kbcontroller', kbcontroller)
    .controller('collatedController', collatedController)
    .controller('todoController', todoController)
    .controller('notescontroller', notescontroller)
    .controller('prodController', prodControllerFn)
    .controller('settingscontroller', settingscontroller)
    ;

    function onecontroller($rootScope, $firebaseArray, $state){
      var _this = this;
      var dashboardref = firebase.database().ref('/dashboard/loggedin'),
          dashboardarr = $firebaseArray(dashboardref),
          loggedin;
      
      //to change the sign-in class as of not ctrl gets instantiated before $rootScope.user.intprofile is ready
      /*dashboardarr.$loaded()
        .then(function(){loggedin = (dashboardarr.$indexFor($rootScope.user.intprofile.$id) < 0) ? false : true;});*/
      
      angular.extend(this,{
        togglemodal: false,
        modalstate: '',
        loggedin: true,
        state: $state
      });
      
      console.log(this.state);
      
      $rootScope.$on('attendance', function(e, o){
        console.log(o);
        _this.loggedin = (o=='loggingin') ? true : false;
      });
    }
  
    function prodControllerFn($scope, $rootScope, $state, $firebaseObject, $firebaseArray, $filter){
        if(angular.isUndefined($rootScope.user.intprofile.role)){
          $state.go('settings.profile');
          return;
        }
        var _this = this;
        var amornonam,
            mo = moment().format('MMMYY'),
            session = moment().format('YYYYMMDD');
            
            
            
        if($rootScope.user.intprofile.role == 'AM') amornonam = 'amTasks';
            else amornonam = 'nonamTasks';
            
        var tasksref = firebase.database().ref('/'+amornonam),
		        tasksArr = $firebaseArray(tasksref);
        
        var prodref = firebase.database().ref('/prod/'+mo).child($rootScope.user.intprofile.$id).child(session),
            masterref = prodref.child('master'),
            currentref = prodref.child('current'),
            dbcurrentref = firebase.database().ref('/dashboard/activities').child($rootScope.user.intprofile.$id),
            dbcurrentobj = $firebaseObject(dbcurrentref),
            prodobj = $firebaseObject(prodref),
            currentobj = $firebaseObject(currentref),
            masterarr = $firebaseArray(masterref),
            prodarr = $firebaseArray(prodref);
        
        var currObjSetup = {
            startpstDate: null,
            ldap: null,
            durationforgelo: null,
            workCode: null,
            workDisplay: null,
            startTime: null,
            startTimeDisplay: null,
            endTime: null,
            endTimeDisplay: null,
            startphtTime: null,
            endphtTime: null,
            duration: null,
            durationfornoel: null,
            hasStarted: false,
            comments: ""
        };  
        
        function strip(obj){
          var extended = (angular.extend({}, obj));
          delete extended.$id;
          delete extended.$priority;
          delete extended.$$conf;
          delete extended.$value;
          console.log(extended);
          return extended;
        }
    
        angular.extend(this, {
          profile: $rootScope.user.intprofile,
          tasks: tasksArr,
          masterArr: masterarr,
          currentObj: currentobj,
          currentObjref: currentref,
          dbactivityref: dbcurrentref,
          dbcurrentObj: dbcurrentobj,
          selected: '',
          formatfornoel: $filter('formatduration'),
          strip: strip
        });

        currentobj.$loaded()
          .then(function(){
            console.log(currentobj);
            if(!currentobj.hasStarted){
              angular.extend(_this.currentObj, currObjSetup);
              // angular.extend(_this.dbcurrentObj, currObjSetup);
              // _this.dbcurrentObj.$save();
            }
            _this.selected = _this.currentObj.wordCode;
            console.log('HALLOS@!#EFSD');
            console.log(_this.currentObj.workCode);
            angular.extend(_this.dbcurrentObj, strip(currentobj), {ldap: $rootScope.user.intprofile.ldap});
            _this.dbcurrentObj.$save();
          });
          
        $rootScope.$on('attendance', function(e, o){
          console.log(o);
          if(o=="loggingout" && _this.currentObj.hasStarted != false){
            _this.currentObj.endTime = moment().toDate().getTime();
            _this.currentObj.endTimeDisplay = moment().tz('Asia/Manila').format('h:mm:ss a');
            _this.currentObj.endphtTime = moment().tz('Asia/Manila').format('dddd MM/DD/YYYY, h:mm:ss a z');
            _this.currentObj.duration = moment.duration((_this.currentObj.endTime - _this.currentObj.startTime)).humanize();
            _this.currentObj.durationforgelo = moment.duration((_this.currentObj.endTime - _this.currentObj.startTime)).asMinutes();
            _this.currentObj.durationfornoel = _this.formatfornoel(_this.currentObj.endTime - _this.currentObj.startTime);
            _this.currentObj.hasStarted = "shiftEnd";
            
            _this.masterArr.$add(_this.currentObj)
              .then(function(){
                _this.currentObj.$remove()
                  .then(function(){}, function(err){console.log(err)});
              });
          }
        });
    }
    
    function dbcontroller($firebaseObject, $firebaseArray, $rootScope){
      var _this = this;
      
      var dbref = firebase.database().ref('/dashboard');
      
      angular.extend(this, {
        intprofile: $rootScope.user.intprofile,
        activitiesArr: $firebaseArray(dbref.child('activities')),
        onlineArr: $firebaseArray(dbref.child('loggedin')),
        breakschedArr: $firebaseArray(dbref.child('breaksched'))
      });
    }
      
    function homecontroller($scope, $firebaseObject, $firebaseArray){
      // var ref = firebase.database().ref();
  
      // var rootref = $firebaseObject(ref);

    }
    
    function qacontroller($scope){
  
    }
    
    function kbcontroller($scope){
  
    }
  
    function collatedController($scope){
  
    }
    
    function todoController($rootScope, $firebaseArray, $firebaseObject, fbtodosrv){
      var _this = this;
      
      angular.extend(this, {
        todos: $firebaseArray(firebase.database().ref().child('users/'+$rootScope.user.intprofile.$id).child('todos')),
        fbtodosrv: fbtodosrv,
        newtodo: '',
        head: 'TodoHolism',
  			ordering: '',
			  orderFn: orderFn
      });
      
      $rootScope.$on('todoadded', function(){
        _this.newtodo = '';
      });
      
  		function orderFn(){
  			if(this.ordering == '') this.ordering = '-timestamp';
  				else this.ordering = '';
  		}
    }
  
    function notescontroller($scope){
  
    }
  
  
    function settingscontroller($rootScope, $firebaseObject, $firebaseArray){
      console.log('settingscontroller');
      var _this = this;
  		// var baseobj = firebase.database().ref().child('users').child($rootScope.user.intprofile.$id);
  		// var baseobjRef = $firebaseObject(baseobj);
      var roles = [{
          label: 'Team Lead',
          value: 'TL',
          id: ['jlanas', 'julliekeutch', 'stonsourinc']
        },{
          label: 'Team Captain',
          value: 'TC',
          id: ['jlanas', 'gepino', 'julliekeutch', 'nfelicia']
        },{
          label: 'Shift Lead',
          value: 'SL',
          id: ['jlanas', 'gepino', 'julliekeutch', 'nfelicia', 'minabangan', 'hbebida', 'mboqueo', 'cleia', 'bnabo']
        },{
          label: 'Core Analyst',
          value: 'Core',
        },{
          label: 'Publisher Analyst',
          value: 'Pub'
        },{
          label: 'Account Manager',
          value: 'AM'
        },{
          label: 'Quality Analyst',
          value: 'QA'
      }];
    
    
    angular.extend(this, {
      showalert: true,
      profile: $rootScope.user.intprofile,
      roles: roles,
      fbref: $firebaseObject(firebase.database().ref().child('users').child($rootScope.user.intprofile.$id)),
      updateprofile: updateprofile,
      saved: false,
      couldnotsave: false,
      couldnotsavemsg: ''
    });
    
    function updateprofile(profileform){
      console.log(this.fbref);
      _this.fbref.$save().then(function(baseobj) {
        if(baseobj.key === _this.fbref.$id){
          profileform.$setPristine();
          _this.saved = true;
          console.log('saved');
        }
      }, 
      function(error) {
        _this.couldnotsave = true;
        _this.couldnotsavemsg = error;
        alert(error);
      });
    }
  }
})();

(function(){
  'use strict';
  angular.module('OneStop')
    .directive('collateddirective', collatedFn);

  function collatedFn(){
    return {
      restrict: 'AE',
      scope: true,
      link: function(scope, element, attr){
        element.on('click', function(e){
         if(angular.element(e.target).hasClass('foranchor')){
           e.preventDefault();
                        console.log(angular.element(e.target)[0].attributes.href.value);
                        document.getElementById(angular.element(e.target)[0].attributes.href.value).scrollIntoView();
                    }
                });
      }
    };
  }
})();

(function(){
  'use strict';
  angular.module('OneStop')
    .directive('affix', affixFn);

  function affixFn($window){
    return{
      restrict: 'A',
      link: function(scope, element, attr){
        var originalOffsetTop = element[0].offsetTop;
        scope.condition = function(){return $window.pageYOffset > originalOffsetTop;};
        
        angular.element($window).bind('scroll', function(){
          scope.$apply(function(){
            if(scope.condition()){angular.element(element).addClass('sidebaraffix');}
              else angular.element(element).removeClass('sidebaraffix');
          });
        });
      }
    };
  }
})();



(function(){
  'use strict';
  angular.module('OneStop')
    .directive('tasks', fn);
  
  function fn(){
    var _this = {
      restrict: 'AE',
      scope: true,
      controller: 'prodController',
      link: link,
      template: `
        <div class="col-xs-12">
          <div class="row list-header">
            <h5>{{queue.$id}}</h5>
          </div>
          
          <div class="row list-checkboxes">
            <div class="form-group">
              <div class="col-xs-12 btn-group" id="check" data-toggle="buttons" data-target="#check">
                <label class="btn btn-default btn-xs btn-block" ng-class="{active : (tc.selected == {{queue.$id | lowercase}}{{task | lowercase | normalizebtnvalue}})}" ng-repeat="task in queue track by $index"><input type="radio" value="{{queue.$id | lowercase}}{{task | lowercase | normalizebtnvalue}}">{{task}}</label>
              </div>
            </div>
            
            <div ng-if="queue.$id == 'Google'" class="col-xs-12">
                <div class = "col-xs-6 btn-group" id="casebtn" data-toggle="buttons" data-target="#check">
                  <label class="btn btn-default btn-xs btn-block cases" ng-class="{active : (tc.selected == gCases)}"><input ng-model="tc.selected" type="radio" name="gCases" value="gCases">Cases</label>
                </div>
            </div>
          </div> <!--end of row after row list-header-->
        </div> <!--end of col-xs-12 below mainList-->
      `
    };
    
    function link(scope, el, attr, tc, transclude){
      
      el.bind('click', function($event){
        if($event.target.type == 'radio'){
          console.log(tc.currentObj);
          // console.log($event);
          // console.log($event.target.value);
          // console.log($event.target.parentNode.className);
          // console.log(el.parent().parent().children());
          var currentclass = $event.target.parentNode.className;
          el.parent().parent().children().find('.active').removeClass('active'); 
          $event.target.parentNode.className = currentclass+' active';
          tc.selected = $event.target.value;
          scope.selected = $event.target.value;
          console.log(tc.selected);
          
          if(tc.currentObj.workCode === '') return;
            else if(!tc.currentObj.hasStarted){
              tc.currentObj.startTime = moment().toDate().getTime();
              tc.currentObj.startpstDate = moment().tz('America/Los_Angeles').format('dddd MM/DD/YYYY, h:mm:ss a z');
              tc.currentObj.ldap = tc.profile.ldap;
              tc.currentObj.startTimeDisplay = moment().tz('Asia/Manila').format('h:mm:ss a');
              tc.currentObj.startphtTime = moment().tz('Asia/Manila').format('dddd MM/DD/YYYY, h:mm:ss a z');
              tc.currentObj.workCode = $event.target.value;
              tc.currentObj.workDisplay = $event.target.nextSibling.textContent;
              tc.currentObj.hasStarted = true;
              
              tc.currentObj.$save();
              angular.extend(tc.dbcurrentObj, tc.strip(tc.currentObj), {ldap: tc.$rootScope.user.intprofile.ldap});
              tc.dbcurrentObj.$save();
            }
            else{
              tc.currentObj.endTime = moment().toDate().getTime();
              tc.currentObj.endTimeDisplay = moment().tz('Asia/Manila').format('h:mm:ss a');
              tc.currentObj.endphtTime = moment().tz('Asia/Manila').format('dddd MM/DD/YYYY, h:mm:ss a z');
              tc.currentObj.duration = moment.duration((tc.currentObj.endTime - tc.currentObj.startTime)).humanize();
              tc.currentObj.durationforgelo = moment.duration((tc.currentObj.endTime - tc.currentObj.startTime)).asMinutes();
              tc.currentObj.durationfornoel = tc.formatfornoel(tc.currentObj.endTime - tc.currentObj.startTime);
              tc.currentObj.hasStarted = "finished";
              
              tc.masterArr.$add(tc.currentObj)
                .then(function(){
                  tc.currentObj.startpstDate = moment().tz('America/Los_Angeles').format('dddd MM/DD/YYYY, h:mm:ss a z');
                  tc.currentObj.ldap = tc.profile.ldap;
                  tc.currentObj.durationforgelo = null;
                  tc.currentObj.workCode = $event.target.value;
                  tc.currentObj.workDisplay = $event.target.nextSibling.textContent;
                  tc.currentObj.startTime = moment().toDate().getTime();
                  tc.currentObj.startTimeDisplay = moment().tz('Asia/Manila').format('h:mm:ss a');
                  tc.currentObj.endTime = null;
                  tc.currentObj.endTimeDisplay = null;
                  tc.currentObj.startphtTime = moment().tz('Asia/Manila').format('dddd MM/DD/YYYY, h:mm:ss a z');
                  tc.currentObj.endphtTime = null;
                  tc.currentObj.duration = null;
                  tc.currentObj.durationfornoel = null;
                  tc.currentObj.hasStarted = true;
                  tc.currentObj.comments = "";
                  
                  tc.currentObj.$save();
                  angular.extend(tc.dbcurrentObj, tc.strip(tc.currentObj), {ldap: tc.profile.ldap});
                  tc.dbcurrentObj.$save();
                });
              
    //          $('#displayMAA').html(JSON.stringify(masterActivityArray, null, 2));
            }
          console.log(tc.currentObj);
          console.log(tc.dbcurrentobj);
        }
      });
    }
    
    return _this;
  }
})();