var apiManager = {};
var request = require('request');
var options = {
    'method':'',
    'url':'',
    'headers': {
      'Content-Type': 'application/json'
    }
}


// Get a guest account, return format (username, password)
apiManager.get_guest_account = function(){
    var header = 'GET';
    var url = 'https://sheltered-journey-07706.herokuapp.com/api/v1/guest_creation';
    
    options.headers = header;
    options.url = url;

    request(options, function (error, response) { 
        if (error) {
            console.log(error);
            return error
        }else{
            console.log(response.body);
            return response.body
        }
      });
}

// Get an agent
// Input: getAgent('insurance', 'english'), return agentId
apiManager.getAgent = function(skill, language){

}

// Update agent availability
// updateAvailability(0)
apiManager.updateAvailability = function(availability){

}


exports.apiManager = apiManager;