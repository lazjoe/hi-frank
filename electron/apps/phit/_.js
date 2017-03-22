// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const clipboard = require('electron').clipboard

$(document).ready( function () {
    //setupEditors()
    let content = clipboard.readHTML()
    $('#annotated-source').append('<div contenteditable=true>'+ content + '</div>')
})

String.prototype.trim=function()
{
     return this.replace(/(^\s*)|(\s*$)/g, '');
}

function translateSource() {
    let source = $('#annotated-source div').html().trim()

    baidu_translate(source, (d)=>{ 
        console.log(d) //d.trans_result



    })   

    // analyze annotated source
    let frame = ''; 
    let corpus = '';

    //let corpusName = 'A'; //$X:A";
    let lc = 0;

    let corpusList = [];
    
    for (let i = 0; i < source.length; i++) {
        
        let c = source.charAt(i);
        
        if (c=='[') {
            lc++;
        } else if (c==']') {
            lc--;
                                
            let corpusName = 'A'+ Math.floor(Math.random()*90000+9999)
            let corpusObj = { 'name': corpusName, 'value': corpus, 'lang': 'zh' };
            
            corpusList.push(corpusObj);
            
            frame = frame + ' ' + corpusName + ' ';
            
            //reset corpus name for next occurrence
            //corpusName = ''+(parseInt(corpusName.charAt(0)) + 1);
            
            corpus = ''; 
        } else {
            if (lc > 0) {
                corpus += c;
            } else {
                frame += c;
            }
        }
        
    }

    console.log('frame: ', frame)

    query = frame
    for (let i in corpusList) {
        console.log(corpusList[i])
        query = query + '\n' + corpusList[i].value
    }

    baidu_translate(query, (d)=>{ 
        console.log(d) //d.trans_result



    })     

    // baidu_translate(source, (d)=>{
    //     $('#annotated-target').val(d.trans_result[0].dst)
    // })  
}

$('#annotated-source').keydown( function(e) {
    if(e.keyCode == 13 && e.ctrlKey) { 
        translateSource()
    }
})

function baidu_translate(query, callback, from, to) {
    if (!query) {
        return null
    }

    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    from = from || 'zh';
    to = to || 'en';

    var appid = '20160614000023332';
    var key = '9KrY22h99MzDRWiJ0Jen';
    var salt = (new Date).getTime();

    var str1 = appid + query + salt + key;
    var sign = MD5(str1);

    $.ajax({
        url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
        type: 'get',
        dataType: 'jsonp',
        data: {
            q: query,
            appid: appid,
            salt: salt,
            from: from,
            to: to,
            sign: sign
        },
        success: function (data) {
            console.log('Received translated result from Baidu:', data);
            callback(data)
        } 
    });
}
