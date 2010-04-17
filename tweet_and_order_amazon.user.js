//// -*- mode: javascript; coding: utf-8 -*-
// ==UserScript==
// @name           Tweet and order Amazon
// @author         noriaki
// @namespace      noriaki
// @description    quick post message to twitter on amazon
// @license        MIT License
// @version        0.1.0
// @released       2010-04-15 23:00:00
// @updated        2010-04-17 22:31:00
// @compatible     Greasemonkey 0.8.0+
// @include        http://www.amazon.co.jp/*
// @require        http://github.com/noriaki/gm-update-checker/raw/master/gm-update-checker.js
// @resource       img-twitter http://github.com/noriaki/tweet_and_order_amazon/raw/master/twitter_logo_outline.png
// @resource       img-settings http://github.com/noriaki/tweet_and_order_amazon/raw/master/settings.png
// ==/UserScript==
;

if(window !== window.top || window !== window.parent ||
   document.getElementsByTagName("body")[0].getAttribute("class") !== "dp") return;

var conf = new ConfigHelper(),
    img_twitter = GM_getResourceURL('img-twitter'),
    img_settings = GM_getResourceURL('img-settings');

var save_aid = (function(conf) {
    return function(aid) {
        conf.val("amazon_affiliate_id", aid);
        return conf.val("amazon_affiliate_id");
    };
})(conf);

/**
 * loader.js
 *  via. http://d.hatena.ne.jp/holidays-l/20070923/p1
 * -- turnaround and minify for greasemonkey by noriaki --
 **/
(function(entries){function defined(prop){try{return unsafeWindow[prop]!==undefined;}catch(e){}
return false;}
function loadScript(src){var script=document.createElement('script');script.type='text/javascript';script.src=src;(document.getElementsByTagName('head').item(0)||document.body).appendChild(script);}
var onComplete;(function doNextEntry(){var entry=entries.shift();if(!entry){return onComplete&&onComplete();}
if(typeof entry=='string'||entry instanceof String){entry={'window':entry};}
for(var prop in entry){if(prop=='window'||!defined(prop)){loadScript(entry[prop]);}}
var timer=setInterval(function(){for(var prop in entry){if(!defined(prop)){return;}}
clearInterval(timer);doNextEntry();},99);})();return function(callback){return function(){var args=arguments;onComplete=function(){callback.apply(callback,args);};}};})
([
    "http://plugins.jquery.com/files/jquery.cookie.js.txt",
    { "twttr": "http://platform.twitter.com/anywhere.js?id=PAlDWDCgTmPSBP3GKFu3w&v=1" }
])
(function(uw) {
    // main processing

    var $ = uw.jQuery;
    uw.twttr.anywhere("1", function(twitter) {

        var asin = $("#ASIN").attr("value"),
            title = $("#btAsinTitle").text(),
            aid = $.cookie("amazon_affiliate_id");
        if(aid === undefined || aid === null) aid = "twitter-amazon";
        var url = build_url(asin, aid);

        $("#handleBuy").before(
            $("<div>").attr({ id: "tweet_box_placeholder" })
            .css('background', 'transparent url(' + img_twitter + ') no-repeat scroll 0 100%')
            .append(
                $("<div>").attr({ id: "taoa_settings"})
                .append(
                    $("<a>").attr({ id: "taoa_settings_button", href: "javascript:void(0);" }).text("settings")
                    .css('background',
                         'transparent url(' + img_settings + ') no-repeat scroll 0 50%')
                    .click(function(e) {
                        $("#taoa_settings_detail").slideToggle();
                    })
                )
                .append(
                    $("<form>").attr({ id: "taoa_settings_detail", action: "javascript:void(0);" })
                    .append(
                        $("<label>").attr({ "for": "taoa_amazon_affiliate_id" }).text("アソシエイトID")
                    )
                    .append(
                        $("<input type='text'>").attr({ id: "taoa_amazon_affiliate_id" }).val(aid)
                    )
                    .append("-22")
                    .append(
                        $("<input type='submit'>").val("save and update")
                        .click(function(e) {
                            $.cookie("amazon_affiliate_id", $("#taoa_amazon_affiliate_id").val(), {
                                expires: new Date(2030,1,1), path: "/"
                            });
                            $("#tweet_box_placeholder").slideUp();
                            $(".twitter-anywhere-tweet-box").remove();
                            bitly(build_url($("#taoa_amazon_affiliate_id").val()), function(shorturl) {
                                build_tweetbox(shorturl);
                                $("#tweet_box_placeholder").slideDown();
                            });
                        })
                        .submit(function(e) { $(this).click(); })
                    )
                )
            )
        );
        bitly(url, build_tweetbox);

        function build_tweetbox(shorturl) {
            twitter("#tweet_box_placeholder").tweetBox({
                height: 50,
                label: "この商品についてツイートする？",
                defaultContent: "" + title + " - " + shorturl + " #amazon"
            });
        }
    });

    function build_url(asin, aid) {
        return [ "http://www.amazon.co.jp/gp/product/", asin, aid !== "" ? "?tag=" + aid + "-22" : "" ].join("");
    }
    function bitly(longurl, callback) {
        var name = "noriaki",
            key = "R_de256fdb37d50c6e6df5e611c1a4c220";
        $.ajax({
            url: "http://api.bit.ly/v3/shorten",
            dataType: "jsonp",
            data: {
                login: name,
                apiKey: key,
                format: "json",
                longUrl: longurl
            },
            success: function(res) {
                if(res.status_code !== 200) return false;
                callback(res.data.url);
            }
        });
    }

})(unsafeWindow);

function log() {
    if(unsafeWindow.console) unsafeWindow.console.log(arguments);
}


new UpdateChecker({
    script_name: 'Tweet and order Amazon'
    ,script_url: 'http://github.com/noriaki/tweet_and_order_amazon/raw/master/tweet_and_order_amazon.user.js'
    ,current_version: '0.1.0'
    ,more_info_url: 'http://blog.fulltext-search.biz/archives/2010/04/greasemonkey-tweet-and-order-amazon.html'
});


GM_addStyle(<><![CDATA[
    #tweet_box_placeholder {
        width: 525px;
        margin: 5px auto;
    }

    #taoa_settings {
        text-align: right;
    }

    #taoa_settings_button {
        padding: 2px 0 2px 24px;
        color: #666;
    }

    #taoa_settings_detail {
        display: none;
        padding: 5px 0;
    }

    #taoa_settings_detail, #taoa_settings_detail input {
        font-size: 90%;
    }

    #taoa_settings_detail input {
        margin: 0 5px;
    }

    #taoa_amazon_affiliate_id {
        width: 80px;
    }
]]></>);
