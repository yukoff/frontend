import ko from 'knockout';

ko.components.loaders.unshift({
    loadTemplate: function (name, templateConfig, callback) {
        if (typeof templateConfig !== 'object' || !('text' in templateConfig)) {
            callback(null);
            return;
        }

        System.import(templateConfig.text + '!text').then(function (text) {
            callback(ko.utils.parseHtmlFragment(text));
        });
    },
    loadViewModel: function (name, templateConfig, callback) {
        if (typeof templateConfig !== 'object' || !('jspm' in templateConfig)) {
            callback(null);
            return;
        }

        System.import('./' + templateConfig.jspm).then(function (Component) {
            Component = Component.default;
            callback(function (params, componentInfo) {
                return new Component(params, componentInfo.element);
            });
        });
    }
});
ko.components.register('fronts-widget', {
    viewModel: { jspm: 'widgets/fronts' },
    template: { text: 'widgets/fronts.html' }
});
ko.components.register('latest-widget', {
    viewModel: { jspm: 'widgets/latest' },
    template: { text: 'widgets/latest.html' }
});
ko.components.register('search-controls', {
    viewModel: {
        createViewModel: function (params) {
            return params.context.$data;
        }
    },
    template: { text: 'widgets/search_controls.html' }
});
ko.components.register('collection-widget', {
    viewModel: {
        createViewModel: function (params) {
            return params.context.$data;
        }
    },
    template: { text: 'widgets/collection.html' }
});
ko.components.register('clipboard-widget', {
    viewModel: { jspm: 'widgets/clipboard' },
    template: { text: 'widgets/clipboard.html' }
});
ko.components.register('modal-dialog', {
    viewModel: {
        createViewModel: function (params) {
            return params.modal;
        }
    },
    template: { text: 'widgets/modal_dialog.html' }
});
ko.components.register('confirm_breaking_changes', {
    viewModel: {
        createViewModel: function (params) {
            return params;
        }
    },
    template: { text: 'widgets/confirm_breaking_changes.html' }
});
ko.components.register('text_alert', {
    viewModel: {
        createViewModel: function (params) {
            return params;
        }
    },
    template: { text: 'widgets/text_alert.html' }
});
ko.components.register('select_snap_type', {
    viewModel: {
        createViewModel: function (params) {
            return params;
        }
    },
    template: { text: 'widgets/select_snap_type.html' }
});
ko.bindingHandlers.ownerClass = {
    init: function (element, valueAccessor) {
        var owner = valueAccessor();
        if (owner.registerElement) {
            owner.registerElement(element);
        }
    }
};
