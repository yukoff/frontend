import ko from 'knockout';
import _ from 'underscore';

class ModalDialog {
    constructor() {
        this.isOpen = ko.observable(false);

        this.templateName = ko.observable();
        this.templateData = ko.observable();
    }

    confirm(config) {
        var dialog = this;

        return new Promise(function (resolve, reject) {
            dialog.templateData(_.extend(config.data, {
                ok: function () {
                    dialog.isOpen(false);
                    resolve();
                },
                cancel: function () {
                    dialog.isOpen(false);
                    reject();
                }
            }));
            dialog.templateName(config.name);
            dialog.isOpen(true);
        });
    }
}

export default new ModalDialog();
