jQuery(function($) {
    var asin = $.query.get("asin"),
        title = $.query.get("title"),
        aid = $.query.get("aid");

    if(!(/^\d+$/).test(asin)) return error("Invalid ASIN code.");

    twttr.anywhere("1", function(twitter) {
        bitly(build_url(asin, aid), function(shorturl) {
            twitter("#tweet_box_placeholder").tweetBox({
                height: 50,
                label: "この商品についてツイートする？",
                defaultContent: [
                    "", title, " - ", shorturl, " #amazon"
                ].join("")
            });
        });
    });

});

function build_url(asin, aid) {
    return [ "http://www.amazon.co.jp/gp/product/", asin,
        aid !== "" ? "?tag=" + aid + "-22" : "" ].join("");
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
function error(message) {
    $("#error_message").text(message);
    return false;
}