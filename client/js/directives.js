//Directive that populates Task buttons
(function(){
  'use strict';
  /* global angular */
  /* global firebase */
  /* global moment */
  angular.module('OneStop')
    .directive('prodTable', Fn);
  
  function Fn(){
    var _this = {
      restrict: 'AE',
      scope: true,
      controller: 'prodController',
      link: link,
      template: `
        <div class="col-xs-12">
          <table id="prodtable" class="table table-striped table-hover">
            <thead>
              <tr class="prodtablehead">
                <th>Start</th>
                <th>Duration</th>
                <th>Queue</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              <tr ng-if="pc.currentObj.hasStarted">
                <td>{{pc.currentObj.startTimeDisplay}}</td>
                <td>{{2+3}}</td>
                <td>{{pc.currentObj.workDisplay}}</td>
                <td>{{pc.currentObj.comments}}</td>
              </tr>
              <tr ng-repeat="activity in pc.masterArr | orderBy: '-$id'">
                <td>{{activity.startTimeDisplay}}</td>
                <td>{{activity.duration}}</td>
                <td>{{activity.workDisplay}}</td>
                <td>{{activity.comments}}</td>
              </tr>
            </tbody>
          </table>
        </div> <!--end of col-xs-12 below mainList-->
      `
    };
    
    function link(scope, el, attr, tc, transclude){
      
    }

    
    return _this;
  }
  
  
})();



(function(){
  'use strict';
  angular.module('OneStop')
    .directive('login', login);
 
  function login($timeout, $firebaseObject, $firebaseArray, $rootScope, gapps){
    return{
      scope: {
      },
      restrict:"AE",
      template: `<div id="login" class="row row-content" ng-switch on="loginstate" style="margin: 5px 20px">
                      <div ng-switch="loginstate">
                        <h4 ng-switch-when="logging"><strong>{{details.type}}.</strong> Please wait...</h4>
                        <h4 ng-switch-when="logresult"><strong>{{complete}}<span class='glyphicon glyphicon-saved pull-right' data-toggle='modal' data-target=''><span></strong></h4>
                        <h5 ng-switch-default></h5>
                      </div>
                      
                      <div class="alert alert-success" ng-show="sentemail">
                    		<button type="button" class="close" ng-click="sentemail = !sentemail"><span aria-hidden="true">&times;</span></button>
                    		<span><i class="fa fa-info-circle"></i> Email was sent regarding the attendance.</span>
                    	</div>
                      
                    	<div class="alert alert-danger" ng-show="couldnotsend">
                    		<button type="button" class="close" ng-click="couldnotsend = !couldnotsend"><span aria-hidden="true">&times;</span></button>
                    		<span><i class="fa fa-info-circle"></i> Something went wrong, attendance record could not be sent to your email. Following error happened:</span>
                    		<p><code ng-bind="couldnotsendmsg"></code></p>
                    	</div>
                    	
                      <div class='logresult' ng-switch-when="logresult">
                        Following details were successfully logged:<br />
                        <ul style='padding-left: 3rem'>
                          <li>Email: {{result.email}}</li>
                          <li>Date: {{result.date}}</li>
                          <li>Time: {{result.time}}</li>
                          <li>Action: {{result.type}}</li>
                          <li>Shift: {{result.shift}}</li>
                          <li>Comments: {{result.comment || ''}}</li>
                        </ul>
                        Thanks for attendance
                      </div>
                      
                      <div class='progress' ng-switch-when="logging">
                        <div class='indeterminate'></div>
                      </div>

                      <form class="form-horizontal" name="loginform" ng-switch-default ng-submit="save(loginform)" novalidate>
                      
                          <div ng-class="{ 'has-error' : loginform.shift.$error.required && !loginform.shift.$pristine }" class="form-group">
                            <select class="form-control" name="shift" ng-model="details.shift" ng-options="shift.value as shift.label for shift in shifts" required>
                                <option value="">Select a shift.</option>
                            </select>
                            <span ng-show="loginform.shift.$error.required && !loginform.shift.$pristine " class="help-block">Must select a shift type.</span>
                          </div>
                          
                          <div ng-class="{ 'has-error' : details.shift== 'Other' && loginform.comment.$error.required && !loginform.comment.$pristine  || loginform.comment.$error.minlength && !loginform.comment.$pristine }" class="form-group">
                            <input type="text" class="form-control" name="comment" ng-minlength="6" ngtooltip="Some text" tooltip-trigger="mouseenter" ng-model="details.comment" placeholder="(Opt. if not Other) ex: Night 10-7 + extra comments" ng-required="details.shift== 'Other'">
                            <span ng-show="details.shift== 'Other' && loginform.comment.$error.required && !loginform.comment.$pristine " class="help-block">Must put a comment if it's Other.</span>
                            <span ng-show="loginform.comment.$error.minlength && !loginform.comment.$pristine " class="help-block">Must be at least six character long, please specify the shift time.</span>
                          </div>

                          <button class="btn btn-default" id="loginbtn" ng-disabled="loginform.$invalid">{{loginorlogout}}</button>
                      </form>
                  </div>
                  `,
//          replace:true,
      link: function(scope, element, attr){
          
        scope.shifts = [{value:"Night 9pm-6am", label:"Night 9-6"}, {value:"Night 10pm-7am", label:"Night 10-7"}, {value:"Night 11pm-8am", label:"Night 11-8"}, {value:"Night 12am-9am", label:"Night 12-9"}, {value:"Night 12:30am-9:30am", label:"Night 12:30-9:30"}, {value:"Day 6am-3pm", label:"Day 6-3"}, {value:"Mid 1pm-10pm", label:"Mid 1-10"},
                         {value:"Mid 2pm-11pm", label:"Mid 2-11"}, {value:"Mid 3pm-12am", label:"Mid 3-12"}, {value: "Other", label: "Other"}];
        
        var mo = moment().format('MMMYY'),
            session = moment().format('YYYYMMDD');
        
        var attendanceref = firebase.database().ref('/attendance/'+mo).child($rootScope.user.intprofile.$id).child(session),
            dashboardref = firebase.database().ref('/dashboard/loggedin'),
            dashboardobj = $firebaseObject(dashboardref),
            dashboardarr = $firebaseArray(dashboardref),
            attendanceobj = $firebaseObject(attendanceref),
            attendancearr = $firebaseArray(attendanceref);

        var isloggedin;
        
        // dashboardarr.$indexFor($rootScope.user.intprofile.$id);
        
        dashboardarr.$loaded()
          .then(function(val){
            console.log(val);
            scope.isloggedin = (dashboardarr.$indexFor($rootScope.user.intprofile.$id) < 0) ? false : true;
            console.log('$rootScope');
            scope.loginorlogout = scope.isloggedin ? 'Logout' : 'Login';
          });
        
        dashboardarr.$watch(function(event){
          console.log(event);
          scope.isloggedin = (dashboardarr.$indexFor($rootScope.user.intprofile.$id) < 0) ? false : true;
          scope.loginorlogout = scope.isloggedin ? 'Logout' : 'Login';
        });              
        
        angular.extend(scope, {
          fbref: attendancearr,
          save: save,
          details: {},
          sentemail: false,
          couldnotsend: false,
          couldnotsendmsg: ''
        });
        
        scope.details.comment = "";
        
        function save(loginform){    
          scope.loginstate = 'logging';
          if(scope.isloggedin){var type = "Logging out"; scope.complete="Logged out"; scope.details.type = "Logout";}
              else {var type = "Logging in"; scope.complete="Logged in"; scope.details.type = "Login";}
          var time = new Date();
          console.log(scope.details.type);
          scope.details.date = time.toLocaleDateString();
          scope.details.time = time.toLocaleTimeString();
          console.log(scope.details);
          
          attendancearr.$add(scope.details).then(function(ref){
            if(scope.isloggedin){
                dashboardarr.$remove(dashboardarr.$getRecord($rootScope.user.intprofile.$id))
                  .then(function(ref){
                    console.log(dashboardarr);
                    $rootScope.$broadcast('attendance', 'loggingout');  
                  });
            } else {
                var forloggedin = angular.extend({}, scope.details, {ldap: $rootScope.user.intprofile.ldap, avatar: $rootScope.user.intprofile.avatar});
                dashboardref.child($rootScope.user.intprofile.$id)
                  .set(forloggedin, function(err){
                    if(err)console.log(err);
                    else $rootScope.$broadcast('attendance', 'loggingin');
                  });
              }
            
            scope.result = scope.details;
            scope.result.email = $rootScope.user.intprofile.ldap + '@google.com';
            console.log(scope.result);
            scope.loginstate = 'logresult';
            var formail = {};
            var msgbody = "Following details were successfully logged:\r\n    LDAP: "+$rootScope.user.intprofile.ldap+"\r\n    Date: "+scope.details.date+"\r\n   Time: "+scope.details.time+"\r\n    Action: "+scope.details.type+"\r\n    Shift: "+scope.details.shift+"\r\n    Comments: "+scope.details.comment+"\r\nThanks for attendance";
            formail.To = 'stonsourinc@gmail.com';
            formail.Subject = 'Attendance log for '+scope.details.date;
            gapps.mail.send(formail, msgbody, sentFn);
            function sentFn(arg){
              console.log(arg);
              if(arg.error){
                scope.couldnotsendmsg = arg.message;
                scope.couldnotsend = true;
              } else scope.sentemail = true;
            }
            $timeout(function(){scope.loginstate = 'default'; scope.details={};}, 5000);
            loginform.$setPristine();
          });
        }
      }
    };
  }
})();



//Modal
(function(){
  'use strict';
  angular.module('OneStop')
    .directive('modular', modularfn);
  
  function modularfn($timeout){
    var _this = {
      restrict: 'AE',
      replace: true,
      scope: true,
      link: link,
      template: `
        <div id="timerConfirm" class="modal" tabindex='-1'>
            <div class="modal-content">
            
              <div class="modal-header">
                <div ng-style="{display: 'inline'}" ng-if="modalstate == 'submit'" ng-switch="submitting">
                  <h4 ng-style="{display: 'inline'}" ng-switch-default><strong>Caution</strong> Please read.</h4>
                  <h5 ng-style="{display: 'inline'}" ng-switch-when="logging">Uploading logs. Please wait...</h5>
                  <h5 ng-style="{display: 'inline'}" ng-switch-when="uploaded">Uploaded</h5>
                </div>
                <h4 ng-if="oc.modalstate == 'login'">Attendance form.</h4>
                <button class="close" ng-click="oc.togglemodal = !oc.togglemodal">&times;</button>
              </div>
              
              <div class="modal-body" ng-switch="oc.modalstate">
                <login ng-switch-when="login"></login>
                <div ng-switch-when="submit" ng-switch="submitting">
                  <div class='progress progress-bar-striped active' ng-switch-when="logging">
                    <div class='indeterminate'></div>
                  </div>
                  <h4 ng-switch-when="uploaded"><strong>Tapos na!<span class='glyphicon glyphicon-saved pull-right'></span></strong></h4>
                  <p ng-switch-default>Are you sure you want to stop the timer?</br>
                    If confirmed this will also mark as end of your shift and upload it !
                  </p>
                </div>
              </div>
              
              <div class="modal-footer" ng-hide="submitting == 'uploaded'">
                <a type="button" class="waves-effect waves-green btn-flat btn btn-primary" ng-if="modalstate == 'submit'" ng-disabled="submitting == 'logging' || globals.activityObj.hasStarted == false" data-toggle="modal" id="timerConfirmed" ng-click="submit();" data-target="#timerConfirm">Confirm</a>
                <a type="button" class="waves-effect waves-green btn-flat btn btn-primary" id="timerCancel" ng-click="oc.togglemodal = !oc.togglemodal" ng-disabled="submitting == 'logging'">Cancel</a>
              </div>
              
            </div>
        </div>
      `
    };
    
    function link(scope, el, attr, ctrl, trans){
      // scope.$watch(function(){return scope.globals.profile;}, function(value){
      //   console.log('PROFILE'); console.log(value);
      //   if(value){
      //     el.css({'background-image': 'url('+value.profile.cover.coverPhoto.url+':Soften=1,10,0)', 'background-size': 'cover'});
      //   }
      // });
      
      scope.$on('uploadinglogs', function(){
        console.log('uploadinglogs from link');
        scope.submitting = "logging";
      });
      scope.$on('uploaded', function(){
        console.log('uploaded from link');
        scope.submitting = "uploaded";
        $timeout(function(){scope.submitting = ''}, 2000);
      });
    }
    
    return _this;
  }
})();


(function(){
  'use strict';
  angular
    .module('OneStop')
      .directive('breakschedForm', breakschedformFn);
  
  function breakschedformFn(){
    return{
      restrict: 'AE',
      scope: true,
      controller: 'dbcontroller',
      link: link,
      template: `
        <div class="container-fluid" id="breakschedformwrap">
          <form class="form-horizontal" name="breakschedform" ng-submit="save(breakschedform)" novalidate>
            <div class="form-group" ng-class="{ 'has-error' : breakschedform.analyst.$error.required && !breakschedform.analyst.$pristine }">
              <select class="form-control" name="analyst" ng-model="details.name" ng-options="user.ldap for user in db.onlineArr" required>
                <option value="">Select from available analysts</option>
              </select>
              <span ng-show="breakschedform.analyst.$error.required && !breakschedform.analyst.$pristine" class="help-block">This is a required field.</span>
            </div>
            
            <div class="form-group" ng-class="{ 'has-error' : breakschedform.analyst.$error.required && !breakschedform.analyst.$pristine || breakschedform.sched.$error.minlength && !breakschedform.sched.$pristine }">
              <input type="text" class="form-control" name="sched" ng-minlength="5" ng-model="details.sched" placeholder="eg., 2-6pm" required>
              <span ng-show="breakschedform.sched.$error.required && !breakschedform.sched.$pristine" class="help-block">This is a required field.</span>
              <span ng-show="breakschedform.sched.$error.minlength && !breakschedform.sched.$pristine" class="help-block">Must be at least 5 characters.</span>
            </div>
            
            <div class="form-group">
              <button type="submit" class="btn btn-default" id="breakschedbtn" ng-disabled="breakschedform.$invalid">Update</button>
            </div>
          </form>
        </div>
      `
    };
    
    function link(scope, el, attr, db){
      
      function save(form){
        console.log(scope.details);
        db.breakschedArr.$add(scope.details)
          .then(function(ref){
            console.log(ref);
            scope.details = {};
            form.$setPristine();
          });
      }
      
      angular.extend(scope, {
        save: save,
        details: {}
      });  
    } 
  }
})();


//Todo Directives
(function(){
	'use strict';
	angular
		.module('OneStop')
		.directive('todo', todoFn);

	function todoFn(){
		return{
			restrict: 'AE',
			controller: 'todoController',
			link: link,
			template: `
				<div id='maintodo' class="container text-center">
                    <div class="jumbotron maintodoclass" style="text-align: center">
                    	<h1>{{tdC.head}}</h1>
                   		<h6>What do I wanna do today?</h6>
                    </div>
                   
                    <div id="form">
                     	<form name="todoform" ng-submit="tdC.fbtodosrv.add(tdC.newtodo, tdC.todos)">
                       		<div class="input-group">
                        		<span class="input-group-btn"><button class="btn btn-default" ng-click="tdC.fbtodosrv.add(tdC.newtodo, tdC.todos)" type="button"><i class="fa fa-plus"></i></button></span>
                        		<input type="text" ng-model="tdC.newtodo" class="form-control" autofocus focus-form placeholder="I've gotto taste Bhut Jolokia someday">
                        	</div>
                    	</form>
                   	</div>

                    <div id="displaytodo" class="row" style="margin: 0; display: flex;">
	               		<div class="todoContainer col-sm-6" ng-repeat="(k, v) in tdC.todos | groupBy: 'status'" style="display: flexbox; background-color: #eee; border: 1px solid #ccc; padding: 2rem 2rem;">
	               			<h3 style="text-align: left; margin-top: 0; display: inline; float:left;">{{k}}</h3>
	               			<span style="float: right">
	               				<button ng-click="tdC.orderFn()"><i class="fa" ng-class="tdC.ordering == '-timestamp' ? 'fa-sort-numeric-desc' : 'fa-sort-numeric-asc'"></i></button>
	               				Order by time created
	               			</span>
      	   						<div style="padding: 1rem 0.5rem; border-bottom: 1px solid #f8f8f8;" ng-switch="todo.isEditing" ng-repeat="todo in v | orderBy: 'content'" class="todo input-group">
      	       				 		<span class="input-group-btn"><button ng-disabled="todo.status == 'Completed' || todo.isEditing" class="btn btn-default" ng-click="todo.status='Completed'; tdC.fbtodosrv.complete(todo, tdC.todos)" type="button"><i class="fa fa-check fagreen" style="background"></i></button></span>
      	       				 		<p ng-switch-default style="margin: 1rem 1rem; text-align: left" ng-class="todo.status == 'Completed'? 'completed' : 'pending'">{{todo.content}}</p>
      	       				 		<form ng-switch-when="true" ng-submit="todo.isEditing = !todo.isEditing; tdC.fbtodosrv.complete(todo, tdC.todos);">
      	       				 			<div class="input-group">
      										<input type="text" ng-blur="todo.isEditing = !todo.isEditing" id="js-focus" ng-model="todo.content" class="form-control">
      	       				 			</div>
      	       				 		</form>
      	       				 		<span class="input-group-btn"><button class="btn btn-default" ng-click="todo.isEditing = !todo.isEditing" type="button" focus-form><i class="fa fa-edit"></i></button></span>
      	       				 		<span class="input-group-btn"><button class="btn btn-default" ng-click="tdC.fbtodosrv.remove(todo, tdC.todos)" type="button"><i class="fa fa-remove fared"></i></button></span>
      	   				 		</div>
      	   				 		<span style="padding: 1rem; float: left">{{v.length}} {{(v.length == 1)? 'item' : 'items'}} in {{v.status || 'this'}} bucket.</span>
	               		</div>
	               		
               		</div><p style="float: left">Total of {{tdC.todos.length}} {{(tdC.todos.length == 1)? 'todo' : 'todos'}} in the bucket.</p>
                </div>
             `
		};

		function link(scope, el, attr, vm, trans){
			scope.$on('todoadded', function(){
				// vm.newtodo = '';
			})
		}
	}
})();


(function(){
	'use strict';
	angular
		.module('OneStop')
		.directive('focusForm', fn);

	function fn(){
		return{
			restrict: 'A',
			link: link
		};

		function link(scope, el, attr, ctrl){
		  if(el[0].tagName == 'input') el.focus();
			el.bind('click', function(){
				if(el.parent().parent().find('input').length)	el.parent().parent().find('input')[0].focus();
			});
		}
	}
})();



//Date and Time inside jumbotrons
(function(){
	'use strict';
	angular.module('OneStop')
		.directive('dateTime', currTimeFn);

	function currTimeFn($interval, $timeout, $document, $log){
	  return {
	    restrict: 'AE',
	    link: link,
	    template: `
	      <div class="pull-right row">
	          <div class="col-sm-5">
     	        <select class="col-sm-3" ng-model="selectedtz" ng-change="updatetz(selectedtz)" id="selecttimezone">
      	          <option value="Asia/Manila" ng-selected="selectedtz == 'Asia/Manila'">PhT</option>
      	          <option value="America/Los_Angeles" ng-selected="selectedtz == 'America/Los_Angeles'" >PST</option>
      	          <option value="America/New_York" ng-selected="selectedtz == 'America/New_York'" >EST</option>
      	          <option value="America/Danmarkshavn" ng-selected="selectedtz == 'America/Danmarkshavn'" >GMT</option>
    	        </select>
  	        </div>
  	        <div class="col-sm-7" id="datetime">
  	          <span class="datetime" ></span>
  	        </div>
	      </div>
	    `
	  };
	  
	  function link(scope, el, attr, vm){
	    scope.dummy = "dummytext";
	    scope.selectedtz = "Asia/Manila";
	    scope.updatetz = function(tz){
	      console.log(tz);
	    };
	    
	    var stopupdatetime = $interval(updatetime, 1000);
  		function updatetime(){
  			var datetime = $document.find('.datetime');
  			datetime.html(moment().tz(scope.selectedtz).format('ddd MM-DD-YYYY')+'<br />'+moment().tz(scope.selectedtz).format('h:mm:ss a z'));
		  } 
	  }

	}
})();