var xhrPool = [];
$(document).ajaxSend(function (e, jqXHR, options) {
    xhrPool.push(jqXHR);
});
$(document).ajaxComplete(function (e, jqXHR, options) {
    xhrPool = $.grep(xhrPool, function (x) {
        return x != jqXHR
    });
});
var abort = function () {
    $.each(xhrPool, function (idx, jqXHR) {
        jqXHR.abort();
    });
};
