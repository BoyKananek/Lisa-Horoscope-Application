// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'


angular.module('App', ["ionic","ngCordovaOauth"])

.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl:'views/home/home.html'
    })
    .state('profile',{
      url: '/profile',
      templateUrl:'views/profile/profile.html'
    })
    .state('horoscope',{
      url:'/horoscope',
      templateUrl:'views/horoscope/horoscope.html'
    });
  $urlRouterProvider.otherwise('/home');
})


.controller('NavCtrl',function($scope,$location,$state,$http,$templateCache,$ionicPopup){
  var fbLoginSuccess = function (userData) {
      //facebookConnectPlugin.api(userData['authResponse']['userID']+"/?fields=id,email,first_name,last_name",["email"],
      facebookConnectPlugin.api("me/?fields=id,email,first_name,last_name",["email"],
      function (result) {
          var alertPopup = $ionicPopup.alert({
             title: 'Login Successful',
             template: 'Hello '+ result["first_name"] +" "+result["last_name"]
          });
          $state.go('profile');
          $scope.id = result["id"];
          $scope.token = result["token"];
          $scope.email = result["email"];
          $scope.name = result["first_name"] +" "+result["last_name"];
          var dataObj = {
            id: $scope.id,
            token:$scope.token,
            email: $scope.email,
            name: $scope.name
          };
          var res = $http.post('https://lisahoroscope.herokuapp.com/api/users',dataObj);
          res.success(function(data,status,header,config){
            //alert("Save users name Successful");
          });
          res.error(function(data,status,headers,config){
             //alert("failure message:" + JSON.stringify({data:data}));
          });

          // saving to databases
          $scope.id ='';
          $scope.token ='';
          $scope.email='';
          $scope.name='';
          //$state.go('profile');

      },
      function (error) {
          alert("Failed: " + error);
      });
  }
  $scope.loginFacebook = function(){
    facebookConnectPlugin.login(["public_profile","email"],
        fbLoginSuccess,
        function (error) {
          var alertPopup = $ionicPopup.alert({
             title: 'Login failure',
             template: 'Please type again'
          });

        }
    );
  }
})

.service('BDService',function(){
  var userZodiac;
  this.save = function(zodiac){
    userZodiac = zodiac;
  }
  this.get = function(){
    return userZodiac;
  }

})


.controller('profileCtrl',function($scope,$state,$http,$templateCache,$ionicPopup,BDService,dateFilter){

  $scope.logoutFacebook = function(){
    facebookConnectPlugin.logout(function(result){
      //alert("logout");
      var alertPopup = $ionicPopup.alert({
         title: 'Bye Bye',
         template: 'Logout from application'
      });
      $state.go('home');
    },function(err){
      //alert("logout err: "+err);
      var alertPopup = $ionicPopup.alert({
         title: 'Alert',
         template: 'Logout failure, please try again'
      });
    });
  }
  $scope.submitData = function(){
    var inputText = document.getElementById("dateInput").value;
    if (inputText == ""){
      //alert("Please enter your birth date....");
      var alertPopup = $ionicPopup.alert({
         title: 'Alert',
         template: 'Please enter your birth date .....'
      });
    }
    else{
      $state.go('horoscope');
      $scope.month = parseInt(dateFilter($scope.birthdate,'MM'),10);
      $scope.day = parseInt(dateFilter($scope.birthdate,'dd'),10);
      if($scope.month == 12 && $scope.day >= 22 || $scope.month == 1 && $scope.day == 1){
        BDService.save("Capricorn");

      }
      else if ($scope.month == 1 && $scope.day >= 20 || $scope.month == 2 && $scope.day <= 18){
        BDService.save("Aquarius");

      }
      else if ($scope.month == 2 && $scope.day >= 19 || $scope.month == 3 && $scope.day <= 20){
        BDService.save("Pisces");

      }
      else if ($scope.month == 3 && $scope.day >= 21 || $scope.month == 4 && $scope.day <= 19){
        BDService.save("Aries");

      }
      else if ($scope.month == 4 && $scope.day >= 20 || $scope.month == 5 && $scope.day <= 20){
        BDService.save("Taurus");

      }
      else if ($scope.month == 5 && $scope.day >= 21 || $scope.month == 6 && $scope.day <= 21){
        BDService.save("Gemini");

      }
      else if ($scope.month == 6 && $scope.day >= 22 || $scope.month == 7 && $scope.day <= 22){
        BDService.save("Cancer");

      }
      else if ($scope.month == 7 && $scope.day >= 23 || $scope.month == 8 && $scope.day <= 22){
        BDService.save("Leo");

      }
      else if ($scope.month == 8 && $scope.day >= 23 || $scope.month == 9 && $scope.day <= 22){
        BDService.save("Virgo");

      }
      else if ($scope.month == 9 && $scope.day >= 23 || $scope.month == 10 && $scope.day <= 22){
        BDService.save("Libra");

      }
      else if ($scope.month == 10 && $scope.day >= 23 || $scope.month == 11 && $scope.day <= 21){
        BDService.save("Scorpio");

      }
      else if ($scope.month == 11 && $scope.day >= 22 || $scope.month == 12 && $scope.day <= 21){
        BDService.save("Sagittarius");

      }

    }
    //BDService.save($scope.day,$scope.month);
    //condition find sign of zodiac and query to api
    //and send to views/horoscope/horoscope.html
  }
})

.controller('horoCtrl',function($scope,$state,$http,$templateCache,BDService,$ionicPopup){
  $scope.zodiac = BDService.get();
  $http.get("https://lisahoroscope.herokuapp.com/api/horoscope/"+$scope.zodiac).then(function(response){
    $scope.daily = response.data.Daily_Horoscope;
    $scope.weekly = response.data.Weekly_Horoscope;
    $scope.monthly = response.data.Monthly_Horoscope;
    $scope.love = response.data.Love;
    $scope.career = response.data.Career;
    $scope.wellness = response.data.Wellness;
    $scope.icon = response.data.Icon;
  });
  $scope.shareFB = function(){
    facebookConnectPlugin.getLoginStatus(
        function (status) {
            //alert("current status: " + JSON.stringify(status));
            facebookConnectPlugin.showDialog(
            {
                method: "feed",
                picture:'http://www.lisaguru.com',
                name:'Lisa Horoscope',
                message: $scope.zodiac,
                caption: 'Lets\' see your horoscope ',
                description: 'https://lisahoroscope.herokuapp.com/view/horoscope/'+$scope.zodiac
            },
            function (response) {
              //alert(JSON.stringify(response))
              //alert("Post!");
              var alertPopup = $ionicPopup.alert({
                 title: 'Successful',
                 template: 'Post! on Facebook already.'
              });
            },
            function (response) {
              //alert(JSON.stringify(response))
            }
          );
        }
    );
  }
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
