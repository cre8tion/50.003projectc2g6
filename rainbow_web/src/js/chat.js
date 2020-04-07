/* Wait for the page to load */
$(function () {
    console.log("[DEMO] :: Rainbow Application started!");

    // Update the variables below with your applicationID and applicationSecret strings
    var applicationID = "7f4b50f0571a11eabb3887f44e39165a",
        applicationSecret = "233R0q88Qs6qxERc8gBXLEEJK4nWky0Xur7A0J2I9K2S77n3gb3aZrKtLK97D26l";

    var myRainbowLogin, myRainbowPassword;
    const toggleButton = document.getElementById('toggle');
    toggleButton.disabled = true;
    const language = toggleButton.value;

    /* Bootstrap the SDK */
    angular.bootstrap(document, ["sdk"]).get("rainbowSDK");

    // Stupid CORS
    // read this :https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const createGuestUrl = "https://sheltered-journey-07706.herokuapp.com/api/v1/guest_creation";
    const routingEngineUrl = "https://sheltered-journey-07706.herokuapp.com/db/route";
    const setAvailabilituUrl = "https://sheltered-journey-07706.herokuapp.com/db/agent/";
    const sendButton = document.getElementById('send-button');
    var conversation_global, agent_id_global;

    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {
        console.log("[DEMO] :: On SDK Ready ! Login now");

        // Get guest account
        fetch(proxyurl + createGuestUrl)
            .then(response => response.text())
            .then(function (result) {
                result = JSON.parse(result);
                if (result['success'] == true) {
                    myRainbowLogin = result['data']['username'];
                    myRainbowPassword = result['data']['password'];

                    // Sign in to rainbow
                    rainbowSDK.connection.signin(myRainbowLogin, myRainbowPassword)
                        .then(async function (account) {
                            console.log(myRainbowLogin + " login in successfully!");

                            // Get agent skill 
                            var skill = UrlParm.parm('skill');
                            console.log(skill);
                            appendMessage('Selected service is ' + skill + ', language is ' + language, 'agent');
                            appendMessage('Checking for available agent. Please wait.', 'agent');

                            var found = false;
                            while (!found) {
                                var requestUrl;
                                if (skill=='general'){
                                    requestUrl = proxyurl + routingEngineUrl + "/" + language;
                                }else{
                                    requestUrl = proxyurl + routingEngineUrl + "/" + language + '+' +skill;
                                }

                                console.log('request url is '+requestUrl);
                                fetch(requestUrl)
                                    .then(response => response.text())
                                    .then(function (result) {
                                        console.log('result is : ' + result)
                                        result = JSON.parse(result);

                                        if (result['success'] == true) {
                                            var status = result['data']['status'];
                                            if (status == 0) {
                                                appendMessage('No desired agent online, please try again later', 'agent')
                                                found = true;
                                            }else if (status == 1){
                                                found = true;
                                                agent_id = result['data']['selectedAgent']
                                                console.log('agent is found. id is ' + agent_id)
                                                appendMessage('Agent is found id: ' + agent_id, 'agent')
                                                appendMessage('Thank you for waiting.', 'agent')
                                                
                                                rainbowSDK.contacts.searchById(agent_id).then(function (contact) {
                                                    rainbowSDK.conversations.openConversationForContact(contact).then(function (conversation) {
                                                        rainbowSDK.im.sendMessageToConversation(conversation, "Hi agent " + agent_id);
                                                        setAgentAvailabiliy(agent_id, 2)
                                                        sendButton.disabled = false;
                                                        agent_id_global = agent_id;
                                                    })
                                                });
                                            }else if (status == 2){
                                                appendMessage('Agents are busy now, please wait ...' ,'agent')
                                            }
                                        }
                                    })
                                    .catch(error => console.log('error', error));
                                await sleep(10000)
                                console.log('wait 10s');
                            }

                        })
                        .catch(function (err) {
                            console.log(myRainbowLogin + " login failed. " + err);
                        });
                } else {
                    alert('Fail to register guest account');
                }
            })
            .catch((error) => {
                console.log('error', error);
            });
    }

    /* Callback for handling the event 'RAINBOW_ONCONNECTIONSTATECHANGED' */
    var onLoaded = function onLoaded() {
        console.log("[DEMO] :: On SDK Loaded !");

        rainbowSDK
            .initialize(applicationID, applicationSecret)
            .then(function () {
                console.log("[DEMO] :: Rainbow SDK is initialized!");
            })
            .catch(function (err) {
                console.log("[DEMO] :: Something went wrong with the SDK...", err);
            });

        if (rainbowSDK.webRTC.canMakeAudioVideoCall()) {
            console.log(' Web allows AudioVideocall')
        }

        if (rainbowSDK.webRTC.hasACamera()) {
            console.log('camera is available');
        }

        if (rainbowSDK.webRTC.hasAMicrophone()) {
            console.log('mic is available');
        }
    };


    // Im handler
    let onNewMessageReceived = function (event) {

        let message = event.detail.message;
        let conversation = event.detail.conversation; // refer to api "conversation"-web-sdk

        conversation_global = conversation;

        let conversation_id = conversation.id;
        let contact = conversation.contact;

        console.log('conversation id is :' + conversation_id);
        console.log('contact id is : ' + contact.id)
        console.log('msg id is : ' + message.id);
        console.log('msg is from : ' + message.from.id);

        appendMessage(`${message.data}`, 'agent');
        console.log('New message >>>>>>>>>>>>>>>>>>: ' + message.data);
    }

    document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, onNewMessageReceived)

    const messageContainer = document.getElementById('message-container')
    const messageForm = document.getElementById('send-container')
    const messageInput = document.getElementById('message-input')
    messageForm.addEventListener('submit', e => {
        e.preventDefault()
        const message = messageInput.value
        if (message != '') {
            rainbowSDK.im.sendMessageToConversation(conversation_global, message);
            appendMessage(`${message}`, 'user')
            messageInput.value = ''
        }
    })

    // Exit button listener
    const exitButton = document.getElementById('exit')
    exitButton.onclick = async function () {
        if (confirm('Are you sure to exit?')) {
            var language_code = getLanguageCode();

            if(agent_id_global == null){
                window.location = '../'+language_code+'/faq.html';
            }else{
                setAgentAvailabiliy(agent_id_global,1)
                console.log(agent_id_global+' to 1')
                await sleep(1000)
                window.location = '../'+language_code+'/feedback.html?id='+agent_id_global;
            }           
        }
    }

    // Call API to se agent availability
    function setAgentAvailabiliy(agent_id, availability) {
        var requestOptions = {
            method: 'PUT',
            redirect: 'follow'
        };

        fetch(proxyurl + setAvailabilituUrl + agent_id + '/availability/' + availability, requestOptions)
            .then(response => response.text())
            .then(result => console.log(result + '\n set ' + agent_id + ' to availability ' + availability))
            .catch(error => console.log('error', error));
    }

    // Add HTML tags
    // sender: 'user' or 'agent'
    function appendMessage(message, sender) {
        if (sender == 'agent') {
            console.log('sender is agent');
            $('.message-container').append('<li tabindex="1"><img class="agenthead" src="../img/user_head.png"><span class="agent">' + message + '</span><br></br></li>');
        } else if (sender == 'user') {
            console.log('sender is user');
            $('.message-container').append('<li tabindex="1"><img class="userhead" src="../img/user_head.png"><span class="user">' + message + '</span><br></br></li>');
        }
        $('.menu .message-container').scrollTop(1000000000000);
    }

    // Sleep function
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Return language code of current page
    function getLanguageCode(){
        var code;
        if (language == 'english'){
            code = 'en'
        }else if(language == 'chinese'){
            code = 'zh'
        }else{
            code = 'ms'
        }
        return code;
    }


    // Parse URl, and get chosen category 
    UrlParm = function () {
        var data, index;
        (function init() {
            data = [];
            index = {};
            var u = window.location.search.substr(1);
            if (u != '') {
                var parms = decodeURIComponent(u).split('&');
                for (var i = 0, len = parms.length; i < len; i++) {
                    if (parms[i] != '') {
                        var p = parms[i].split("=");
                        if (p.length == 1 || (p.length == 2 && p[1] == '')) { // p | p=
                            data.push(['']);
                            index[p[0]] = data.length - 1;
                        } else if (typeof (p[0]) == 'undefined' || p[0] == '') { // =c | =
                            data[0] = [p[1]];
                        } else if (typeof (index[p[0]]) == 'undefined') { // c=aaa
                            data.push([p[1]]);
                            index[p[0]] = data.length - 1;
                        } else { // c=aaa
                            data[index[p[0]]].push(p[1]);
                        }
                    }
                }
            }
        })();
        return {
            parm: function (o) {
                try {
                    return (typeof (o) == 'number' ? data[o][0] : data[index[o]][0]);
                } catch (e) {}
            }
        }
    }();

    /* Listen to the SDK event RAINBOW_ONREADY */
    document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady)

    /* Listen to the SDK event RAINBOW_ONLOADED */
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded)

    /* Load the SDK */
    rainbowSDK.load();
});