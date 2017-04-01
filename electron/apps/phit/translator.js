
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
    var sign = require('../../static/md5').MD5(str1);

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
