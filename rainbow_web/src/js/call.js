/* Wait for the page to load */
$(function () {
    console.log("[DEMO] :: Rainbow Application started!");

    // Update the variables below with your applicationID and applicationSecret strings
    var applicationID = "7f4b50f0571a11eabb3887f44e39165a",
        applicationSecret = "233R0q88Qs6qxERc8gBXLEEJK4nWky0Xur7A0J2I9K2S77n3gb3aZrKtLK97D26l";

    var myRainbowLogin, myRainbowPassword;
    var agent_id_global;

    /* Bootstrap the SDK */
    angular.bootstrap(document, ["sdk"]).get("rainbowSDK");

    // Stupid CORS
    // read this :https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const createGuestUrl = "https://sheltered-journey-07706.herokuapp.com/api/v1/guest_creation";
    const routingEngineUrl = "https://sheltered-journey-07706.herokuapp.com/db/route";
    const setAvailabilituUrl = "https://sheltered-journey-07706.herokuapp.com/db/agent/"

    const toggleButton = document.getElementById('toggle');
    toggleButton.disabled = true;

    const language = toggleButton.value;
    const language_code = getLanguageCode();
    
    const callButton = document.getElementById('call-button');
    const cancelButton = document.getElementById('cancel-button');
    const logMsg = document.getElementById('logMsg');

    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {
        console.log("[DEMO] :: On SDK Ready !");

        // Get guest account
        console.log('getting guest account');
        console.log(proxyurl + createGuestUrl);
        fetch(proxyurl + createGuestUrl)
            .then(response => response.text())
            .then(function (result) {
                result = JSON.parse(result);
                if (result['success'] == true) {
                    myRainbowLogin = result['data']['username'];
                    myRainbowPassword = result['data']['password'];

                    console.log('Account is '+myRainbowLogin + '\n Password is '+myRainbowPassword);

                    // Sign in to rainbow
                    rainbowSDK.connection.signin(myRainbowLogin, myRainbowPassword)
                        .then(function (account) {
                            console.log(myRainbowLogin + " login in successfully!");
                            var skill = UrlParm.parm('skill');
                            console.log('selected skill is '+skill);

                            callButton.disabled = false;
                            logMsg.innerHTML = "Please click call";

                            
                            var requestUrl;
                            if (skill == 'general') {
                                requestUrl = proxyurl + routingEngineUrl + "/" + language;
                            } else {
                                requestUrl = proxyurl + routingEngineUrl + "/" + language + '+' + skill;
                            }
                            console.log('routing url is '+requestUrl);

                            callButton.addEventListener('click', async function () {
                                var found = false;
                                callButton.disabled = true;

                                while(!found){
                                    fetch(requestUrl)
                                    .then(response => response.text())
                                    .then(function (result) {
                                        console.log('result is : ' + result)
                                        result = JSON.parse(result);

                                        if (result['success'] == true) {
                                            var status = result['data']['status'];
                                            if (status == 0) {
                                                found = true;                                                   
                                                alert('No desired agent online, please try again later');
                                                window.location = '../'+language_code+'/faq.html';
                                            } else if (status == 1) {
                                                found = true;
                                                agent_id = result['data']['selectedAgent'];
                                                agent_id_global = agent_id;
                                                setAgentAvailabiliy(agent_id, 2)
                                                console.log('agent found, id is ' + agent_id)
                                                rainbowSDK.contacts.searchById(agent_id).then(function (contact) {

                                                    var res = rainbowSDK.webRTC.callInAudio(contact);
                                                    if (res.label === "OK") {
                                                        logMsg.innerHTML = 'Call is successfully initiated';
                                                        cancelButton.disabled = false;
                                                    }
                                                });
                                            }else if(status ==2){
                                                logMsg.innerHTML = 'Agents are busy, you are added to queue, please wait.'
                                            }
                                        }
                                    })
                                    .catch(error => console.log('error', error));
                           
                                    await sleep(10000)
                                    console.log('wait 10s');
                                }

                            })
                            

                            // Look for available agent

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
                logMsg.innerHTML = 'Failed to login server, please try again.';
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

    // cancel button event listener
    cancelButton.onclick = async function () {

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

    // Sleep function
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Check current language
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
    
    // Set agent availability
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


    // var onWebRTCCallChanged = function onWebRTCCallChanged(event) {
    //     /* Listen to WebRTC call state change */
    //     let call = event.detail;

    //     if (call.status.value === "incommingCall") {
    //         console.log('new incoming call');

    //         if (call.remoteMedia === 3) {
    //             console.log('it is video call');
    //             // The incoming call is of type audio + video
    //             rainbowSDK.webRTC.answerInVideo(call);
    //             var result = rainbowSDK.webRTC.showLocalVideo();
    //             console.log('result is ' + result);

    //             rainbowSDK.webRTC.showRemoteVideo(call);
    //             console.log('call answered');

    //         } else if (call.remoteMedia === 1) {
    //             console.log('it is audio call');
    //             rainbowSDK.webRTC.answerInAudio(call);
    //             console.log('call answered');
    //         }
    //     }
    // };

    // /* Subscribe to WebRTC call change */
    // document.addEventListener(rainbowSDK.webRTC.RAINBOW_ONWEBRTCCALLSTATECHANGED, onWebRTCCallChanged)

    /* Listen to the SDK event RAINBOW_ONREADY */
    document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady)

    /* Listen to the SDK event RAINBOW_ONLOADED */
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded)

    /* Load the SDK */
    rainbowSDK.load();

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


});