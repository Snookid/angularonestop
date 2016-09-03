// function init(){   
//       var CLIENT_ID = '998091476581-3kt2sb76hq0ineku14igt131cb7lt4i0.apps.googleusercontent.com';

//       var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.send'];

//       /**
//       * Check if current user has authorized this application.
//       */
//       function checkAuth() {
//         gapi.auth.authorize(
//           {
//             'client_id': CLIENT_ID,
//             'scope': SCOPES.join(' '),
//             'immediate': true
//           });
//       }
// }

var onestop = angular.module('OneStop', ['firebase', 'ui.router', 'ngCookies', 'angular-loading-bar', 'angular.filter']);
  /*global firebase*/
  /*global angular*/
  /*global gapi*/
  /*global moment*/
onestop.run(function($rootScope, $state, $location, $firebaseAuth, Authenticate, gapiAuth, cfpLoadingBar){
  $rootScope.user = {};
  
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
    cfpLoadingBar.start()
    console.log(Object.keys($rootScope.user));
    console.log(Object.keys($rootScope.user).length);
    if(Object.keys($rootScope.user).length > 0) {
      console.log($rootScope.user);
      cfpLoadingBar.complete();
      return;
    }
    event.preventDefault();
    $firebaseAuth().$onAuthStateChanged(function(firebaseUser){
      Authenticate(firebaseUser);
    });
  
    $rootScope.$on('inituser', function(user){
      cfpLoadingBar.complete();
      gapiAuth;
      $state.go(toState, toParams);
    });
    
  });
});

/*Firebase Config*/
onestop.config(function(){
  var config = {
    apiKey: "AIzaSyAx0hBEWCDpeyvHv3EhPXsFw5w6RfBKTS4",
    authDomain: "project-4293925979119045746.firebaseapp.com",
    databaseURL: "https://project-4293925979119045746.firebaseio.com",
    storageBucket: "https://project-4293925979119045746.firebaseio.com",
  };
  firebase.initializeApp(config);
  
  // gapi.load('client:auth2', function(){
  //   gapi.client.setApiKey(config.apiKey);
  //   gapi.auth2.init({
  //     client_id: idc,
  //     scope: scopes
  //   }).then(function(){
  //     console.log('gapi auth status: '+gapi.auth2.getAuthInstance().isSignedIn.get());
  //     console.log(gapi.auth2.getAuthInstance());
  //     auth2 = gapi.auth2.getAuthInstance();
  //     auth2.isSignedIn.set(true);
  //     auth2.isSignedIn.listen(function(isSignedIn){console.log(isSignedIn);});
  //     auth2.then(function(signedin){console.log(signedin);});
  //   });
  // });
});

/* Loading Bar config */
onestop.config(function(cfpLoadingBarProvider){
  cfpLoadingBarProvider.includeSpinner = true;
  cfpLoadingBarProvider.includeBar = true;
  cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
});


/*Particles JS */
particlesJS.load('particles-js', 'js/particlesjs.json', function() {
  console.log('callback - particles.js config loaded');
});

onestop.config(function(){
  moment.tz.add([
      'America/Los_Angeles|PST PDT|80 70|0101|1Lzm0 1zb0 Op0',
      'America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0',
      'America/Danmarkshavn|LMT WGT WGST GMT|1e.E 30 20 0|01212121212121212121212121212121213|-2a5WJ.k 2z5fJ.k 19U0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 DC0|8',
      "Asia/Manila|PHT PHST JST|-80 -90 -90|010201010|-1kJI0 AL0 cK10 65X0 mXB0 vX0 VK10 1db0|24e6"
  ]);
});

onestop.filter('normalizebtnvalue', function(){
  return function(value){
    var dash = /(-)/g,
        spaces = /\s/g,
        at = /(@)/g;
    return value.replace(dash, '').replace(spaces, '').replace(at, 'at');
  };
});

onestop.filter('formatduration', function(){
  return function(time){
    var hour, dHour, minute, dMinute, second, dSecond, forreportingmin, noelHour, noelMinute, noelSecond;
    hour = (time/3600000);
    minute = (time%3600000)/60000;
    second = (time%3600000)%60000;
//      forgelo  = Math.floor((time/60000)*100)/100; 

    if(hour>=1){
        dHour = ~~hour;
        noelHour = dHour < 10 ? "0"+dHour : dHour; 
        dHour = dHour > 1 ? dHour+" hrs" : dHour+" hr";
        if(minute>0){
           dMinute = ~~minute;
           noelMinute = dMinute < 10 ? "0"+dMinute : dMinute;
//             dMinute = dMinute > 1 ? dMinute+" mins" : dMinute+" min";
           if(second>=1000){
                dSecond = Math.floor(second/1000);
                noelSecond = dSecond < 10 ? "0"+dSecond : dSecond;
//                  dSecond = dSecond > 1 ? dSecond+" secs" : dSecond+" sec";
           } else {noelSecond= "00:"+second; dSecond = second/1000+ " sec";} 
        }
    return noelHour+":"+noelMinute+":"+noelSecond;
    }
    
    if(minute>=1){
        dMinute = ~~minute;
        noelMinute = dMinute < 10 ? "0"+dMinute : dMinute;
//          dMinute = dMinute > 1 ? dMinute+" mins" : dMinute+" min";
        if(second>=1){
                dSecond = Math.floor(second/1000);
                noelSecond = dSecond < 10 ? "0"+dSecond : dSecond;
//                  dSecond = dSecond > 1 ? dSecond+" secs" : dSecond+" sec";
           } else {noelSecond= "00:"+second; dSecond = second/1000+ " sec";} 
    return "00:"+noelMinute+":"+noelSecond;
    }
    
    if(second>=1000){
        dSecond = second/1000;
        console.log(dSecond);
        if(dSecond === 1) return "00:00:01";
          else {
              noelSecond = dSecond; noelSecond = ~~noelSecond;
              noelSecond = noelSecond < 10 ? "0"+noelSecond : noelSecond;
              return "00:00:"+noelSecond+":"+ ~~((dSecond-(~~dSecond))*1000);
          }
      } else return "00:00:00:"+second;
  }
});