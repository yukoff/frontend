import ConfigEditor from 'models/config/main';
import ko from 'knockout';
import 'test/fixtures/one-front-config';
import 'mock/switches';
import templateConfig from 'views/config.scala.html!text';

var yeld = setTimeout;

export default function () {
    var promise = new Promise(function (resolve) {
        document.body.innerHTML += templateConfig
            .replace('@{priority}', 'test')
            .replace('@urlBase(env)', '/')
            .replace(/\@[^\n]+\n/g, '');

        // Mock the time
        jasmine.clock().install();
        new ConfigEditor().init(function () {
            yeld(resolve, 10);
        });
        // There's a network request in the init to get the config, advance time
        jasmine.clock().tick(100);
    });

    function unload () {
        jasmine.clock().uninstall();
        var container = document.querySelector('.toolbar').parentNode;
        ko.cleanNode(container);
        document.body.removeChild(container);
    }

    return {
        loader: promise,
        unload: unload
    };
}
