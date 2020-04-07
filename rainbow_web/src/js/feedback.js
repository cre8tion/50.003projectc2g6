$(function () {

    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const feedbackurl = "https://sheltered-journey-07706.herokuapp.com/db/agent/"
    const submitButton = document.getElementById('submit');

    const toggleButton = document.getElementById('toggle');
    toggleButton.disabled = true;
    const language = toggleButton.value;
    var language_code = getLanguageCode();

    submitButton.onclick = function(){
        var rating = 5;
        for(i=1; i <= 5; i++){
            var ratingButton = document.getElementById('rating'+i);
            if (ratingButton.checked){
                console.log(ratingButton.value);
                rating = ratingButton.value;
            }
        }

        var agent_id = UrlParm.parm('id');
        var requestOptions = {
            method: 'PUT',
        };

        console.log('calling api: ' + proxyurl + feedbackurl + agent_id + '/rating/' + rating);

        fetch(proxyurl + feedbackurl + agent_id + '/rating/' + rating, requestOptions)
            .then(response => response.text())
            .then(function (result){
                result = JSON.parse(result);
                if(result['success'] == true){
                    alert('Thank you for your feedback!');
                    window.location = '../'+language_code+'/index.html';
                }else{
                    alert('Feedback submitssion failed.');
                }
            })
            .catch(error => console.log('error', error));
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

    // Parse URl, and get agent id
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

})