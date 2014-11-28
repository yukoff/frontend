define([], function () {
    var distance = {
        normal: 0,
        dragging: 0
    };

    document.addEventListener('mousemove', function (event) {
        if (event.which === 1) {
            // Pressing the button, it counts as a drag
            distance.dragging += pixelMovement(event);
        } else {
            distance.normal += pixelMovement(event);
        }
        // console.log('total moved', distance.normal);
    }, true);

    document.addEventListener('dragover', function (event) {
        distance.dragging += dragMovement(event);
        // console.log('total dragged', distance.dragging);
    }, true);

    document.addEventListener('drop', function (event) {
        endDragMovement(event);
    }, true);
    document.addEventListener('dragend', function (event) {
        endDragMovement(event);
    }, true);
    document.addEventListener('dragenter', function (event) {
        enter(event.target);
    }, true);
    document.addEventListener('dragleave', function (event) {
        leave(event.target);
    }, true);

    function pixelMovement(event) {
        var movementX = event.webkitMovementX || event.mozMovementX || event.movementX;
        var movementY = event.webkitMovementY || event.mozMovementY || event.movementY;

        return Math.sqrt(Math.pow(movementX, 2) + Math.pow(movementY, 2));
    }

    var lastDragPosition, enteredElements = [];

    function dragMovement(event) {
        var distance = 0;
        if (lastDragPosition) {
            distance = Math.sqrt(
                Math.pow(lastDragPosition.x - event.screenX, 2) +
                Math.pow(lastDragPosition.y - event.screenY, 2)
            );
        }

        lastDragPosition = {
            x: event.screenX,
            y: event.screenY
        };

        return distance;
    }
    function endDragMovement(event) {
        lastDragPosition = null;
        enteredElements = [];
    }
    function enter(target) {
        if (!~enteredElements.indexOf(target)) {
            enteredElements.push(target);
        }
    }
    function leave(target) {
        if (~enteredElements.indexOf(target)) {
            enteredElements.splice(enteredElements.indexOf(target), 1);
        }
        if (!enteredElements.length) {
            endDragMovement();
        }
    }
});
