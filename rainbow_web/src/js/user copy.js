
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
    const url = "https://sheltered-journey-07706.herokuapp.com/api/v1/guest_creation"; 

    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {
        console.log('login now ...');
        console.log("[DEMO] :: On SDK Ready !");

        // Get a guest account through API
        fetch(proxyurl + url)
        .then(response => response.text())
        .then(function(result) { 
            result = JSON.parse(result);
            if (result['success']==true){
                myRainbowLogin = result['data']['username'];
                myRainbowPassword = result['data']['password'];

                myRainbowLogin = "agent1@sutd.com";
                myRainbowPassword = "Agent1_sutd";

                rainbowSDK.connection.signin(myRainbowLogin, myRainbowPassword)
                .then(function(account) {
                    console.log(myRainbowLogin+" login in successfully!");
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
    };


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

    var conversation_global;

    // Im handler
    let onNewMessageReceived = function(event) {

        // as noted in the documentation, RAINBOW_ONNEWIMMESSAGERECEIVED carries three parameters: Message, Conversation and CC. Let's retrieve them:

        let message = event.detail.message;
        let conversation = event.detail.conversation;   // refer to api "conversation"-web-sdk

        conversation_global = conversation;

        let conversation_id = conversation.id;
        let contact = conversation.contact;

        console.log('conversation id is :' + conversation_id);
        console.log('contact id is : '+contact.id)
        console.log('msg id is : ' + message.id);
        console.log('msg is from : '+ message.from.id);

        appendMessage(`${message.data}`, 'agent');
        console.log('New message >>>>>>>>>>>>>>>>>>: '+ message.data);
    }

    // add event listener
    document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, onNewMessageReceived)


    const messageContainer = document.getElementById('message-container')
    const messageForm = document.getElementById('send-container')
    const messageInput = document.getElementById('message-input')
    messageForm.addEventListener('submit', e=>{
        e.preventDefault()
        const message = messageInput.value
        rainbowSDK.im.sendMessageToConversation(conversation_global, message);
        appendMessage(`${message}`, 'user')
        messageInput.value=''
    })

    // Add HTML tags
    // sender: 'user' or 'agent'
    function appendMessage(message, sender){
        if (sender == 'agent'){
            console.log('sender is agent');
            $('.message-container').append('<li tabindex="1"><img class="agenthead" src="./img/user_head.png"><span class="agent">'+message+'</span></li><br></br>');
        }else if (sender == 'user'){
            console.log('sender is user' );
            $('.message-container').append('<li tabindex="1"><img class="userhead" src="./img/user_head.png"><span class="user">'+message+'</span></li><br></br>');
        }
        $('.menu .message-container').scrollTop(1000000000000);
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

