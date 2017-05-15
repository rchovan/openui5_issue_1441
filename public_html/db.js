jQuery.sap.require('sap.m.MessageBox');
var Service = (function () {
    var instance;
    /**
     * Vytvorenie instancie Database singletonu
     * @param {type} serviceUrl
     * @param {type} serviceLogin
     * @param {type} servicePassword
     * @returns {db_L2.createInstance.dbAnonym$1}
     */
    function createInstance(serviceUrl, serviceLogin, servicePassword) {
        this.serviceUrl = serviceUrl;
        this.serviceLogin = serviceLogin;
        this.servicePassword = servicePassword;


        this.metaData = null;

        //destroy model if already exists (po pridani tohto sa appka nesekne)
        if (this.oModel != null) {
            this.oModel.destroy();
        }

        this.oModel = new sap.ui.model.odata.v2.ODataModel(this.serviceUrl, {
            user: serviceLogin,
            password: servicePassword,
            withCredentials: true,
            disableHeadRequestForToken: true,
            useBatch: false
        });
//        this.oModel.refreshSecurityToken();
        var oData = this.oModel;
        var that = this;

        this.metadata_loaded = new $.Deferred();

        this.oModel.attachMetadataFailed(function (error) {
            var err;
            console.debug("metadata failed");
            //_handleError(error.mParameters.statusCode, error.mParameters.statusText);
            sap.ui.core.BusyIndicator.hide();
            err = {
                statusCode: error.mParameters.statusCode,
                statusText: error.mParameters.statusText
            };
            that.metadata_loaded.reject(err);
        });

        this.oModel.attachMetadataLoaded(function (para) {
            console.debug("metadata loaded");
            that.metaData = oData.getServiceMetadata();//boolean premenna
            sap.ui.core.BusyIndicator.hide();
            that.metadata_loaded.resolve();
        });

        this.oModel.attachBatchRequestSent(function (para) {
            //sap.ui.core.BusyIndicator.show(0);
            console.debug("batch request sent (" + para.mParameters.ID + ")");
            console.debug("method:" + para.mParameters.method);
            console.debug("url:" + para.mParameters.url);

        });

        this.oModel.attachRequestSent(function (para) {
            sap.ui.core.BusyIndicator.show(0);
            console.debug("request sent (" + para.mParameters.ID + ")");
            console.debug("method:" + para.mParameters.method);
            console.debug("url:" + para.mParameters.url);
        });

        this.oModel.attachBatchRequestCompleted(function (para) {
            //          that.oModel.refresh(true, true, null);
            //          sap.ui.core.BusyIndicator.hide();
            console.debug("batch request completed (" + para.mParameters.ID + ")");
        });

        this.oModel.attachBatchRequestFailed(function (para) {
//            sap.ui.core.BusyIndicator.hide();
            console.debug("batch request failed (" + para.mParameters.ID + ")");
        });

        this.oModel.attachRequestCompleted(function (para) {
            that.oModel.refresh(true, true, null);
            sap.ui.core.BusyIndicator.hide();
            console.debug("request completed (" + para.mParameters.ID + ")");
        });

        this.oModel.attachRequestFailed(function (para) {
            sap.ui.core.BusyIndicator.hide();
            console.debug("request failed (" + para.mParameters.ID + ")");
        });

        //private
        _handleError = function (errorCode, errorText) {
            if (errorCode === 0 && errorText === "") {
//                sap.m.MessageBox.show("HTTP request failed\n Check internet connection.");
                sap.m.MessageBox.error(
                        g_main_app.i18n("registrationHTTPFailed"), {
                    title: g_main_app.i18n("GeneralError"),
                    actions: [sap.m.MessageBox.Action.OK],
                    onClose: function () {
                    }
                });
            } else {
                sap.m.MessageBox.error(
                        errorText, {
                            title: g_main_app.i18n("GeneralError"),
                            actions: [sap.m.MessageBox.Action.OK],
                            onClose: function () {
                            }
                        });
            }

        };

        _addSlashBeforePath = function (sPath) {
            var temp = "/" + sPath;
            return temp;
        };

        //public
        return {
            getMenu: function () {
                var deferr = $.Deferred();
                $.when(that.metadata_loaded).done(function () {
                    that.oModel.read("/MenuItemSet", {
                        success: function (param, oResponse) {
                            deferr.resolve(param);
                        },
                        error: function (err) {
                            deferr.reject(err);
                        }
                    });
                }).fail(function (err) {
                    deferr.reject(err);
                });
                return deferr;
            }
        }
    }
    return {
        /**
         * Singleton ktory zabezpecuje komunikaciu so serverom.
         * getInstance vrati instanciu tejto triedy, ak este nebola vytvorena, vytvori ju
         * @param {string} serviceUrl - url sluzby
         * @param {string} serviceLogin - prihlasovacie meno
         * @param {string} servicePassword - prihlasovacie heslo
         * @returns {db_L2.createInstance.dbAnonym$1}
         */
        getInstance: function (serviceUrl, serviceLogin, servicePassword) {
            if (!instance) {
                instance = createInstance(serviceUrl, serviceLogin, servicePassword);
            }
            return instance;
        },
        /**
         * Znicenie singleton
         * destroyInstance znici instanciu, potrebne pri odhlaseni
         * @returns {undefined}
         */
        destroyInstance: function () {
            if (instance) {
                instance = null;
            }
        }
    };
})();
