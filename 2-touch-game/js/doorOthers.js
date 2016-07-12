// ===================== Пример кода первой двери =======================
/**
 * @class Door0
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door0(number, onUnlock) {
    DoorBase.apply(this, arguments);

    var buttons = [
        this.popup.querySelector('.door-riddle__button_0'),
        this.popup.querySelector('.door-riddle__button_1'),
        this.popup.querySelector('.door-riddle__button_2')
    ];

    buttons.forEach(function(b) {
        b.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
        b.addEventListener('pointerup', _onButtonPointerUp.bind(this));
        b.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
        b.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
    }.bind(this));

    function _onButtonPointerDown(e) {
        e.target.classList.add('door-riddle__button_pressed');
        checkCondition.apply(this);
    }

    function _onButtonPointerUp(e) {
        e.target.classList.remove('door-riddle__button_pressed');
    }

    /**
     * Проверяем, можно ли теперь открыть дверь
     */
    function checkCondition() {
        var isOpened = true;
        buttons.forEach(function(b) {
            if (!b.classList.contains('door-riddle__button_pressed')) {
                isOpened = false;
            }
        });

        // Если все три кнопки зажаты одновременно, то откроем эту дверь
        if (isOpened) {
            this.unlock();
        }
    }
}

// Наследуемся от класса DoorBase
Door0.prototype = Object.create(DoorBase.prototype);
Door0.prototype.constructor = DoorBase;
// END ===================== Пример кода первой двери =======================

/**
 * @class Door1
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door1(number, onUnlock) {
    DoorBase.apply(this, arguments);

    // ==== Напишите свой код для открытия второй двери здесь ====
    var locks = [].slice.call(this.popup.querySelectorAll('.locks-riddle__lock'));
    var keys = [].slice.call(this.popup.querySelectorAll('.locks-riddle__key'));
    var dropAreas = [];
    var pointerData = {};
    var DROP_TIMEOUT = 50;

    keys.forEach(function(key) {
        key.addEventListener('pointerdown', _onKeyPointerDown.bind(this));
        key.addEventListener('pointermove', _onContainerPointerMove.bind(this));
        key.addEventListener('pointerup', _onContainerPointerUp.bind(this));
        key.addEventListener('pointercancel', _onContainerPointerUp.bind(this));
    }, this);

    locks.forEach(function(lock) {
        var rect = lock.getBoundingClientRect();
        dropAreas.push({
            fromX: rect.left,
            toX: rect.right,
            fromY: rect.top,
            toY: rect.bottom,
            color: lock.classList.contains('locks-riddle__lock_color_yellow') ? 'yellow' : 'blue',
            dropped: false
        });
    });

    function _onKeyPointerDown(e) {
        pointerData[e.pointerId] = {
            startX: e.clientX,
            startY: e.clientY,
            target: e.target,
            color: e.target.classList.contains('locks-riddle__key_color_yellow') ? 'yellow' : 'blue'
        };
        e.target.classList.add('locks-riddle__key_dragging');
        e.target.setPointerCapture(e.pointerId);
    }

    function _onContainerPointerMove(e) {
        var pointer = pointerData[e.pointerId];

        if (!pointer) {
            return;
        }

        pointer.currentX = e.clientX;
        pointer.currentY = e.clientY;
        updatePosition(pointer);
    }

    function _onContainerPointerUp(e) {
        var pointerId = e.pointerId;
        var data = pointerData[pointerId];

        e.target.releasePointerCapture(e.pointerId);

        if (!data) {
            return;
        }

        // Проверяем правильно ли отпущен ключ
        var droppedArea = dropAreas.filter(function(dropArea) {
            return !dropArea.dropped &&
                dropArea.color === data.color &&
                data.currentX >= dropArea.fromX && data.currentX <= dropArea.toX &&
                data.currentY >= dropArea.fromY && data.currentY <= dropArea.toY;
        })[0];

        if (droppedArea) {
            droppedArea.dropped = true;
            checkCondition.apply(this);
            setTimeout(function() {
                droppedArea.dropped = false;
                restorePosition(pointerId);
            }, DROP_TIMEOUT);
        } else {
            restorePosition(pointerId);
        }
    }

    function updatePosition(pointer) {
        requestAnimationFrame(function() {
            pointer.target.style.transform = 'translate(' + [pointer.currentX - pointer.startX, pointer.currentY - pointer.startY].join('px, ') + 'px)';
        });
    }

    function restorePosition(pointerId) {
        requestAnimationFrame(function() {
            var data = pointerData[pointerId];
            data.target.style.transform = '';
            data.target.classList.remove('locks-riddle__key_dragging');
        });
    }

    function checkCondition() {
        if (dropAreas.every(function(dropArea) { return dropArea.dropped; })) {
            this.unlock();
        }
    }
    // ==== END Напишите свой код для открытия второй двери здесь ====
}
Door1.prototype = Object.create(DoorBase.prototype);
Door1.prototype.constructor = DoorBase;

/**
 * @class Door2
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door2(number, onUnlock) {
    DoorBase.apply(this, arguments);

    // ==== Напишите свой код для открытия третей двери здесь ====
    var buttons = [].slice.call(this.popup.querySelectorAll('.door-riddle__button'));
    var vesselCover = this.popup.querySelector('.door-riddle__vessel-cover');
    var buttonsPressed = 0;
    var level = 0;
    var decreaseTimer = null;
    var pressTimerByPointerId = {};

    var PRESS_INCREASE = 4;
    var TIMER_DECREASE = 2;
    var DECREASE_INTERVAL = 300;
    var SECOND_PRESS_TIMEOUT = 100;

    buttons.forEach(function(button) {
        button.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
        button.addEventListener('pointerup', _onButtonPointerUp.bind(this));
        button.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
        button.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
    }, this);

    function _onButtonPointerDown(e) {
        buttonsPressed++;

        pressTimerByPointerId[e.pointerId] = setTimeout(function() {
            buttonsPressed = 0;
        }, SECOND_PRESS_TIMEOUT);

        if (buttonsPressed === 2) {
            level += PRESS_INCREASE;
            buttonsPressed = 0;
        }

        if (!decreaseTimer && level > 0) {
            decreaseTimer = setTimeout(decreaseLevelByTime, DECREASE_INTERVAL);
        }

        e.target.classList.add('door-riddle__button_pressed');

        updateVesselLevel();
        checkCondition.apply(this);
    }

    function _onButtonPointerUp(e) {
        e.target.classList.remove('door-riddle__button_pressed');
        clearTimeout(pressTimerByPointerId[e.pointerId]);
        buttonsPressed = 0;
    }

    function decreaseLevelByTime() {
        level -= TIMER_DECREASE;
        if (level < 0) {
            level = 0;
            clearTimeout(decreaseTimer);
            decreaseTimer = null;
        } else {
            decreaseTimer = setTimeout(decreaseLevelByTime, DECREASE_INTERVAL);
        }
        updateVesselLevel();
    }

    function updateVesselLevel() {
        vesselCover.style.top = (100 - level) + '%';
    }

    function checkCondition() {
        if (level >= 100) {
            clearTimeout(decreaseTimer);
            decreaseTimer = null;
            this.unlock();
        }
    }
    // ==== END Напишите свой код для открытия третей двери здесь ====
}
Door2.prototype = Object.create(DoorBase.prototype);
Door2.prototype.constructor = DoorBase;

/**
 * Сундук
 * @class Box
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Box(number, onUnlock) {
    DoorBase.apply(this, arguments);

    // ==== Напишите свой код для открытия сундука здесь ====
    // Для примера сундук откроется просто по клику на него
    this.popup.addEventListener('click', function() {
        this.unlock();
    }.bind(this));
    // ==== END Напишите свой код для открытия сундука здесь ====

    this.showCongratulations = function() {
        alert('Поздравляю! Игра пройдена!');
    };
}
Box.prototype = Object.create(DoorBase.prototype);
Box.prototype.constructor = DoorBase;
