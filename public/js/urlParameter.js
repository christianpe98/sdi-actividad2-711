function createAlert(id,msg)
{
    if (msg != '') {
        var html="<div id=\"alerta\" class='alert alert-danger alert-dismissible fade in'>\n" +
            "  <a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>\n" +
            msg +"</div>";
        $("#"+id).html(html);
    }
};

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' :
        decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function throwAlertError(id)
{
    var msg=getUrlParameter('error');
    createAlert(id,msg);
}

