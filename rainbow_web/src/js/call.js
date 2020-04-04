
/* Wait for the page to load */
$(function() {
    console.log("[DEMO] :: Rainbow Application started!");

    // Update the variables below with your applicationID and applicationSecret strings
    var applicationID = "7f4b50f0571a11eabb3887f44e39165a",
        applicationSecret = "233R0q88Qs6qxERc8gBXLEEJK4nWky0Xur7A0J2I9K2S77n3gb3aZrKtLK97D26l";

    var myRainbowLogin,myRainbowPassword;

    /* Bootstrap the SDK */
    angular.bootstrap(document, ["sdk"]).get("rainbowSDK");

    // Stupid CORS
    // read this :https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const createGuestUrl = "https://sheltered-journey-07706.herokuapp.com/api/v1/guest_creation"; 
    const routingEngineUrl = "https://sheltered-journey-07706.herokuapp.com/db/route";
    const setAvailabilituUrl = "https://sheltered-journey-07706.herokuapp.com/db/agent/"

    const selectedLanguage = document.getElementById('language')
    const selectedService = document.getElementById('service')
    const selectButton = document.getElementById('call-button')
    const cancelButton = document.getElementById('cancel-button')
    const selectionBox = document.getElementById('selection-box')

    // Disable all buttons before guest login
    banButtons(true)

    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {
        console.log("[DEMO] :: On SDK Ready !");

        // Get guest account
        fetch(proxyurl + createGuestUrl)
        .then(response => response.text())
        .then(function(result) { 
            result = JSON.parse(result);
            if (result['success']==true){
                myRainbowLogin = result['data']['username'];
                myRainbowPassword = result['data']['password'];

                // Sign in to rainbow
                rainbowSDK.connection.signin(myRainbowLogin, myRainbowPassword)
                .then(function(account) {
                    console.log(myRainbowLogin+" login in successfully!");
                    banButtons(false)

                    // Promp customers to choose service and language upon successful login
                    selectButton.addEventListener("click", function(){
                        console.log(selectedLanguage.value + ' and ' + selectedService.value);

                        banButtons(true)
        
                        fetch(proxyurl+routingEngineUrl+"/"+selectedLanguage.value+"+"+selectedService.value)
                          .then(response => response.text())
                          .then(function(result) {
                            console.log('result is : '+result)
                            result = JSON.parse(result);

                            if (result['success']==true){
                                if (result['data'].hasOwnProperty('selectedAgent')){
                                    alert('No available agent !');
                                    banButtons(false)
                                }else{
                                    console.log('agent is found')
                                    agent_id = result['data']['selectedAgent']
                                    // agent_id = "5e532bccb4528b74a00c92f9";
                                    console.log('agent id is '+agent_id)
                                    // setAgentAvailabiliy(agent_id, 1)
                                    rainbowSDK.contacts.searchById(agent_id).then(function(contact) {
                                        
                                        var res = rainbowSDK.webRTC.callInAudio(contact);
                                        if(res.label === "OK") {
                                            console.log('call is inited, waiting for agent to answer');
                                        }
                                        cancelButton.addEventListener("click", function(){
                                            rainbowSDK.webRTC.release(res)
                                            console.log('cancel clicked')
                                            alert('Call released');
                                        })
                                        rainbowSDK.conversations.openConversationForContact(contact).then(function(conversation){
                                            rainbowSDK.im.sendMessageToConversation(conversation, "Hi agent "+agent_id);
                                        })        
                                    });            
                                }
                            }
                          })
                          .catch(error => console.log('error', error));
                    })
                })
                .catch(function(err) {
                    console.log(myRainbowLogin + " login failed. " + err);
                });
            }else{
                alert('Fail to register guest account');
            }
        })
        .catch((error) => {
            console.log('error', error);
            alert(error);
        });
    }


    function banButtons(yesNo){
        selectButton.disabled = yesNo;
        selectedLanguage.disabled = yesNo;
        selectedService.disabled = yesNo;
    }

    /* Callback for handling the event 'RAINBOW_ONCONNECTIONSTATECHANGED' */
    var onLoaded = function onLoaded() {
        console.log("[DEMO] :: On SDK Loaded !");

        rainbowSDK
            .initialize(applicationID, applicationSecret)
            .then(function() {
                console.log("[DEMO] :: Rainbow SDK is initialized!");
            })
            .catch(function(err) {
                console.log("[DEMO] :: Something went wrong with the SDK...", err);
            });

            if(rainbowSDK.webRTC.canMakeAudioVideoCall()) {
                console.log(' Web allows AudioVideocall')
            }
    
            if(rainbowSDK.webRTC.hasACamera()) {
                console.log('camera is available');
            }
    
            if(rainbowSDK.webRTC.hasAMicrophone()) {
                console.log('mic is available');
            }
    };


    function setAgentAvailabiliy(agent_id, availability){
        var requestOptions = {
            method: 'PUT',
            redirect: 'follow'
        };

        fetch(proxyurl+ setAvailabilituUrl + agent_id + '/availability/' + availability, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result+'\n set ' + agent_id + ' to availability ' + availability))
        .catch(error => console.log('error', error));

    }


    var onWebRTCCallChanged = function onWebRTCCallChanged(event) {
        /* Listen to WebRTC call state change */
        let call = event.detail;

        if (call.status.value === "incommingCall") {
            console.log('new incoming call');

            if (call.remoteMedia === 3) {
                console.log('it is video call');
                // The incoming call is of type audio + video
                rainbowSDK.webRTC.answerInVideo(call);
                var result = rainbowSDK.webRTC.showLocalVideo();
                console.log('result is '+result);

                rainbowSDK.webRTC.showRemoteVideo(call);
                console.log('call answered');

            } else if (call.remoteMedia === 1) {
                console.log('it is audio call');
                rainbowSDK.webRTC.answerInAudio(call);
                console.log('call answered');
            }
        }
    };

    /* Subscribe to WebRTC call change */
    document.addEventListener(rainbowSDK.webRTC.RAINBOW_ONWEBRTCCALLSTATECHANGED, onWebRTCCallChanged)

    /* Listen to the SDK event RAINBOW_ONREADY */
    document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady)

    /* Listen to the SDK event RAINBOW_ONLOADED */
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded)

    /* Load the SDK */
    rainbowSDK.load();
});

