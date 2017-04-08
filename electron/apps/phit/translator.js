const { MD5 } = require('../../static/md5')

class Translator {
    constructor () {
        this.sourceLang = 'zh'
        this.targetLang = 'en'
        this.lines = null
        this.resultHandler = null
        this.name = null
    }

    translate(lines, callback, from, to) {
        from = from || this.sourceLang;
        to = to || this.targetLang;
        callback = callback || this.resultHandler

        if (!callback) {
            console.warn('No result handler set for translator.')
        }

        let query = this._generateQuery(lines)
        this.lines = lines
        this._translate(query, this._translated, from, to)
    }

    _generateQuery(lines) {
   
    }

    _translate(query, callback, from, to) {
        if (typeof callback != 'function') {
            return null
        }

        // implement in subclass
    }

    _translated(data) {
        // pack results into standard formats

        // pass it to result handler
        this.resultHandler(data)
    }

}

class BaiduTranslator extends Translator {
    constructor() {
        super()
        this.name = 'Baidu'
    }

    /** return a string representing the frame and corpus list for all lines */
    _generateQuery(lines) {
        let query = ''
        for (let line of lines) {
            query += line.frame.source + '\n'
            line.frame.translator = this.name
            for (let corpus of line.corpusList) {
                query += corpus.source + '\n'
                corpus.translator = this.name
            }
        }
        return query.trim()
    }

    _translate(query, callback, from, to) {

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
            success: (data) => {
                console.log('Received translated result from Baidu:', data);
                callback.call(this, data)
            } 
        });
    }

    _translated(data) {
        // pack results into standard formats
        let i = 0
        for (let line of this.lines) {
            line.frame.target = data.trans_result[i++].dst
            for (let corpus of line.corpusList) {
                corpus.target = data.trans_result[i++].dst
            }
        }

        // pass it to result handler
        this.resultHandler(this.lines)
    }
}

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

exports.baidu_translate = baidu_translate
exports.BaiduTranslator = BaiduTranslator
