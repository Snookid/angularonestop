/*global gapi*/
/*global firebase*/
/*global onestop*/
/*(function(){
    'use strict';
    angular
        .module("OneStop")
        .service(batteryinfo);
    
    function batteryinfo(){
        navigator.getBattery().then(function(battery) {
          function updateAllBatteryInfo(){
            updateChargeInfo();
            updateLevelInfo();
            updateChargingInfo();
            updateDischargingInfo();
          }
          updateAllBatteryInfo();
        
          battery.addEventListener('chargingchange', function(){
            updateChargeInfo();
          });
          function updateChargeInfo(){
            console.log("Battery charging? "
                        + (battery.charging ? "Yes" : "No"));
          }
        
          battery.addEventListener('levelchange', function(){
            updateLevelInfo();
          });
          function updateLevelInfo(){
            console.log("Battery level: "
                        + battery.level * 100 + "%");
          }
        
          battery.addEventListener('chargingtimechange', function(){
            updateChargingInfo();
          });
          function updateChargingInfo(){
            console.log("Battery charging time: "
                         + battery.chargingTime + " seconds");
          }
        
          battery.addEventListener('dischargingtimechange', function(){
            updateDischargingInfo();
          });
          function updateDischargingInfo(){
            console.log("Battery discharging time: "
                         + battery.dischargingTime + " seconds");
          }
        });
    }
    batteryinfo();
})();
*/

onestop.service('Authenticate', authenticateFn);
onestop.factory('Auth', AuthFn);
onestop.factory('validateuser', validateuserFn);
onestop.service('inituser', inituserFn);
onestop.service('gapps', gappsFn);
onestop.service('gapiAuth', gappsAuthFn);
onestop.service('fbtodosrv', fbtodosrvFn);
// onestop.service('strip', stripFn);


function authenticateFn($window, $rootScope, $state, $location, validateuser, inituser, $firebaseAuth, $cookieStore){
  var Auth = $firebaseAuth(),
    provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    provider.addScope('https://mail.google.com/');
    provider.addScope('https://www.googleapis.com/auth/gmail.compose');
    provider.addScope('https://www.googleapis.com/auth/gmail.send');
  return(function(firebaseUser){
    console.log('onAuthStateChanged running from the top');
    console.log(firebaseUser);
    if(!firebaseUser){
      if($cookieStore.get('email') === "!google"){
        console.log("running 1 = !googleCookie");
        Auth.$signOut();
        return false;
      }
      if(!$cookieStore.get('email')){
        console.log("running 2 != googleCookie so authenticate");
        // $rootScope.returntoState = toState;
        Auth.$signInWithPopup(provider)
          .then(function(authData){
            if(authData) $window.location.reload();
          });
      }
    } else
    if(firebaseUser){
      console.log('running 3 = has LoggedIn not authorized yet');
      if($cookieStore.get('email') === "!google"){
        console.log("running 4 = !googleCookie");
        Auth.$signOut();
        return false;
      }
      if(firebaseUser.email.toString().split('@')[1] === 'google.com' || firebaseUser.email == 'stonsourinc@gmail.com'){
        console.log('running 5 == isGoogle | Resh');
        // console.log(firebaseUser.user);
        console.log(firebaseUser.email);
        // if(!$rootScope.returntoState) $rootScope.returntoState = toState;
        validateuser(firebaseUser)
          .then(function(intprofile, newreg){
            console.log('running inituser');
            inituser(intprofile)
              .then(function(val){
                console.log(val);
                $rootScope.$broadcast('inituser', {user: val});
              });
            if(newreg === "new register"){
              console.log('New register => send to settings');
              $state.go('settings.profile');
            }
          })
          .catch(function(err){
            console.log(err);
            throw err[1];
          });
      } else
      {
        $cookieStore.put('user', firebaseUser.providerData);
        $cookieStore.put('email', "!google");           
          var notgoogle = new Error("Sorry you're not allowed to access this app. 401 Unauthorized");
          notgoogle.name = "Not Google";
          notgoogle.email = firebaseUser.email;
          Auth.$signOut();
          throw notgoogle;
      }
    }
  });
}


function inituserFn($rootScope, $firebaseArray, $q){
  return function(intprofile){
    var deferred = $q.defer();
    // var user = firebase.database().ref().child('users').child(auth.user.uid);
    var user = {};
    if(intprofile) {
      $rootScope.user.intprofile = intprofile;
      console.log($rootScope);
      deferred.resolve($rootScope.user.intprofile);
    }
    user.watch = function ($scope){
      return $scope.$watch(function(){return $rootScope.user.intprofile;}, function(val, oldval){
        console.log(val);
        console.log(oldval);
        if(val || oldval){console.log('hasvalue'); deferred.resolve(true);}
        if(!val) deferred.reject(false);
      });
    };
    return deferred.promise;
  };
}

function AuthFn($firebaseAuth) {
  return $firebaseAuth();
}

function validateuserFn($firebaseObject, $firebaseArray, $q){
  var users = firebase.database().ref().child('users');
  var analysts = firebase.database().ref().child('analysts');

  return function(authData){
    var deferred = $q.defer();
    var ldap = authData.email.split('@')[0];
    var islisted;
    var isregistered;
    analysts.once('value')
      .then(function(snapshot){
        islisted = snapshot.hasChild(ldap);
        if(islisted){
          console.log('islisted');
          users.once('value')
            .then(function(snapshot){
              isregistered = snapshot.hasChild(authData.uid);
              if(!isregistered){
                var user = {
                  fullname: authData.displayName, 
                  name: authData.displayName.split(' ')[0],
                  ldap: ldap,
                  avatar: authData.photoURL,
                  uid: authData.uid
                };
                console.log('is not registered');
                users.child(authData.uid)
                  .set(user, function(err){
                    if(err) {
                      console.log('error on adding to the users list');
                      deferred.reject(err);
                    }
                      else {
                        console.log('added to users list');
                        deferred.resolve(user, "new register");
                      }
                  });
              }
              else {
                var intprofile = $firebaseObject(users.child(authData.uid));
                console.log('is registered');
                intprofile.$loaded(function(data){
                  deferred.resolve(data);
                });
              }
            });
        }
        else deferred.reject("You're not authorized for this project, please contact shirishs@google.com");
      });
    return deferred.promise;
    };
}


function gappsFn($q){
  return {
    mail: {
      send: function(headers, msg, callback){
        var email = '';
        
        for (var header in headers){
          email += header += ": "+headers[header]+'\r\n';
        }
        email += "\r\n"+msg;
        
        return gapi.client.load('gmail', 'v1', function(){
          var enc = window.btoa(email).replace(/\+/g, '-').replace(/\//g, '_'),
              request = gapi.client.gmail.users.messages.send({
                'userId': 'me',
                'resource': {
                  'raw': enc
                }
              });
          return request.execute(callback);
        });
      }
    }
  };
}

function gappsAuthFn($q){
  var clientid = '998091476581-3kt2sb76hq0ineku14igt131cb7lt4i0.apps.googleusercontent.com',
      scopes = ['https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.send'];
      
  gapi.auth.authorize(
    {
      'client_id': clientid,
      'scope': scopes.join(' '),
      'immediate': true
    }, callback);
    
  function callback(token){
    console.log(token);
  }
}

function fbtodosrvFn($rootScope, $firebaseArray){
	return {
		add: function(obj, ref){
			console.log(obj);
			console.log(ref);
			ref.$add({
				content: obj,
				status: 'Pending',
				timestamp: firebase.database.ServerValue.TIMESTAMP,
				isEditing: false
			}).then(function(e){$rootScope.$broadcast('todoadded')});
		},
		remove: function(obj, ref){
			console.log(obj);
			console.log(ref);
			ref.$remove(obj);
		},
		complete: function(obj, ref){
			console.log(obj);
			console.log(ref);
			ref.$save(obj);
		}
	};
}