angular.module('orthosearch')
    .factory('$civicrm', ['$http', function($http) {

        var srv = this;
        var civicrmApiKey = '24eIjWlpnu7PJsPQLXvEipkh';
        var civicrmSiteKey = '8c346c9561c7838143f3104e1e70ca09';
        
        srv.getCiviContacts = function(location) {
            
            
            return $http.get('https://www.oao.on.ca/searchapi.php', location)
                .then(function(response) {
                    //console.log(response);
                    
                    var data = response.data
                    return(data);
                });
                
            //return geocode;
        };

        return srv;
    }]);