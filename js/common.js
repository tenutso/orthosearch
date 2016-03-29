(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
angular.module('orthosearch', ['google.places', 'ui.bootstrap.typeahead'])
   .config(function($httpProvider) {


   })
   .controller('OrthoSearchController', ['$http', '$q', '$civicrm', function($http, $q, $civicrm) {

      var vm = this;
      vm.model = {};

      vm.addresses = {};
      vm.memberships = {};
      vm.newArray = [];


      vm.title = "Find an OAO Orthodontist";

      var civicrmApiKey = '24eIjWlpnu7PJsPQLXvEipkh';
      var civicrmSiteKey = '8c346c9561c7838143f3104e1e70ca09';





      vm.getMatches = function(query) {
         vm.address='';
         var deferred = $q.defer()
         var results = [];
         $http.get('https://www.oao.on.ca/sites/all/modules/civicrm/extern/rest.php', {
               params: {
                  'sequential': 1,
                  'entity': 'contact',
                  'json': 1,
                  'action': 'get',
                  'key': civicrmSiteKey,
                  'api_key': civicrmApiKey,
                  'options[limit]': '25',
                  //'api_membership_getValue':2,
                  'api.membership.get[membership_type_id]': 1,
                  'api.membership.get[status_id]': 2,

                  'last_name': "%" + query + "%",
                  //'api.membership.getValue[return]': 'status_id',

                  //'api.membership.get[status_id>]': 0,
                  //'api_membership_get[values][0][membership_type_id]': 1,

               }
            })
            .then(function(contacts) {
               //console.log(contacts);
               contacts.data.values.forEach(function(data) {
                  //console.log(data);
                  if (data.api_membership_get.count > 0) {
                     results.push({
                        'value': data.contact_id,
                        'display': data.display_name
                     });
                  }

               });
               deferred.resolve(results);


            }),
            function(error) {
               console.log(error);
            };
         return deferred.promise;
      };

      vm.getLocation = function(val) {
         vm.lastname='';
         return $http.get('//maps.googleapis.com/maps/api/geocode/json', {
            params: {
               address: val + ',ON+Canada',
               sensor: true,
               components: 'country:CA',
               //region:'ca',
               //address:'Ontario'
               //'key':'AIzaSyClJgbgurDmz0Jzojhap-05JkOBB2TgSv8'

            }
         }).then(function(response) {

            return response.data.results.map(function(item) {

               var geoResults = {
                  'display': item.formatted_address,
                  'value': item.geometry.location.lat + '|' + item.geometry.location.lng
               };
               //console.log(geoResults);
               return geoResults;
            });
         });
      };

      vm.findByLocation = function(model) {
         console.log(model);
         var location = {};
         vm.noSearchResults = false;    
         
         if (!model.address && !model.last_name) {
            vm.contactDetails='';
            vm.noSearchResults = true;
            return;
         }
         
         if (model.address) {
            var geo= model.address.value.split("|");
            location = { params: {
         
                  entity: 'getNearbyOrtho',
                  longitude: geo[1],
                  latitude: geo[0],
                  distance: 10,
                  last_name: model.last_name
               }
            }
         } else {
            location = { params: {
                  entity: 'getNearbyOrtho',
                  last_name: model.last_name
               }
            }
         }
         
         
         $civicrm.getCiviContacts(location).then(function(data) {
            vm.contactDetails = data;
            
            if (!vm.contactDetails.length ) {
               vm.noSearchResults = true;
            }
            console.log(data);
         });


      };
      
   }]);

},{}]},{},[1]);
