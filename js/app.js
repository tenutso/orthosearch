angular.module('orthosearch', ['ngAnimate', 'google.places', 'ui.bootstrap'])
   .config(function($httpProvider) {


   })
   .controller('OrthoSearchController', ['$location', '$http', '$q', '$civicrm', function($location, $http, $q, $civicrm) {

      var vm = this;
      vm.model = {};

      vm.title = "Find an OAO Orthodontist";

      var civicrmApiKey = '24eIjWlpnu7PJsPQLXvEipkh';
      var civicrmSiteKey = '8c346c9561c7838143f3104e1e70ca09';

      vm.getMatches = function(query) {
         vm.address = '';
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
               //console.log(error);
            };
         return deferred.promise;
      };

      vm.getLocation = function(val) {
         vm.lastname = '';
         return $http.get('//maps.googleapis.com/maps/api/geocode/json', {
            params: {
               address: val + ',ON+Canada',
               sensor: true,
               components: 'country:CA',
               //region:'ca',
               //address:'Ontario'
               'key':'AIzaSyABSK99WEUFyRt7XsuCNyLXeRO1Q7UBCo0'

            }
         }).then(function(response) {

            return response.data.results.map(function(item) {

               var geoResults = {
                  'display': item.formatted_address,
                  'value': item.geometry.location.lat + '|' + item.geometry.location.lng,
                  'geolat': item.geometry.location.lat,
                  'geolng': item.geometry.location.lng
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
         vm.showResultsForAddress = '';
         vm.showResultsForName = '';

         // What happen if both form fields are empty
         if (!model.address && !model.last_name) {
            vm.contactDetails = '';
            vm.noSearchResults = true;
            return;
         }

         // Are we submitting an address or just a last name?
         if (model.address) {
            location = {
               params: {
                  entity: 'getNearbyOrtho',
                  longitude: model.address.geolng,
                  latitude: model.address.geolat,
                  distance: 10,
                  last_name: model.last_name
               }
            }
            vm.showResultsForAddress = model.address.display;
            vm.showResultsForName = model.last_name;
         }
         else {
            location = {
               params: {
                  entity: 'getNearbyOrtho',
                  last_name: model.last_name
               }
            }
            vm.showResultsForName = model.last_name;
         }


         $civicrm.getCiviContacts(location).then(function(data) {
            vm.contactDetails = data;

            if (!vm.contactDetails.length) {
               vm.noSearchResults = true;
            }
            vm.totalItems = vm.contactDetails.length;
            vm.currentPage=1;
            vm.itemsPerPage=10;
            //console.log(vm.contactDetails);
         });
      };

      vm.pageChanged = function(page) {
         //console.log(page);
      }
      
      // Handle URL params and simulate a form submission via URL GET params
      //console.log($location.search());
      var urlParams = $location.search();

      if ('last_name' in urlParams || 'address' in urlParams) {
         
         var params = {};
   
         if ('last_name' in urlParams) {
            params['last_name'] = urlParams.last_name;
            //vm.last_name = urlParams.last_name;
         }
   
         if ('address' in urlParams && 'geolat' in urlParams && 'geolng' in urlParams) {
            params['address'] = {};
            params['address']['geolat'] = urlParams.geolat;
            params['address']['geolng'] = urlParams.geolng;
            params['address']['display'] = urlParams.address;
            vm.address = urlParams.address;
         }
         
         vm.findByLocation(params);

      }

   }]);
