var xhrPool = [];
$(document).ajaxSend(function (e, jqXHR, options) {
    if (options.url.indexOf('/collection/') === -1) {
        xhrPool.push(jqXHR);
    }
});
$(document).ajaxComplete(function (e, jqXHR, options) {
    if (options.url.indexOf('/collection/') === -1) {
        xhrPool = $.grep(xhrPool, function (x) {
            return x != jqXHR
        });
    }
});
var abort = function () {
    $.each(xhrPool, function (idx, jqXHR) {
        jqXHR.abort();
    });
};
