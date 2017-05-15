/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function message(str) {
    window.alert(str);
}

function connect() {
    jQuery.sap.require('sap.m.MessageBox');
    var self = this;
    var ServiceURL = '';
    var ServiceLogin = '';
    var ServicePassword = '';
    var s = Service.getInstance(ServiceURL, ServiceLogin, ServicePassword);
    $.when(s.getMenu()).done(function (menu) {
        console.debug('menu=' + JSON.stringify(menu));
        sap.m.MessageBox.success(
                JSON.stringify(menu), {
            title: "MenuItem",
            actions: [sap.m.MessageBox.Action.OK],
            onClose: function () {
            }
        });
    }).fail(function (err) {
        console.log("err=" + err);
        sap.m.MessageBox.error(
                JSON.stringify(err), {
            title: "MenuItem",
            actions: [sap.m.MessageBox.Action.OK],
            onClose: function () {
            }
        });
    });
}
;
;

