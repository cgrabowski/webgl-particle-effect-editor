PEE = PEE || {};

PEE.settingGraph = (function ($, window, undefined) {

    return function (settingTainer, min, max, key, val, name, master) {

        var slider = settingTainer.find('.ui-slider'),
            rect = $('<rect>'),
            $svg = $(svg('svg')),
            $rect = $(svg('rect')),
            ht = settingTainer.height() * 3,
            wt = settingTainer.width() - 16; // $('.mCSB_scrollTools').width();

        $svg.data('slider', slider)
            .height(ht).width(wt);
        $rect.attr({
            height: ht,
            width: $svg.width(),
            fill: '#000',
            stroke: '#FFF',
            'stroke-width': 2
        })
            .on('mouseout', function (event) {
            return false;
        })
            .appendTo($svg);
        for (var ht = 0; ht < $rect.attr('height'); ht += $rect.attr('height') / 5) {

            var $line = $(svg('line')),
                wt = $rect.attr('width');
            $line.attr({
                x1: 0,
                y1: ht,
                x2: wt,
                y2: ht,
                stroke: '#FFF',
                'stoke-width': 1
            })
                .on('mouseout', function (event) {
                return false;
            })
                .appendTo($svg);
        }

        for (wt = 0; wt < $rect.attr('width'); wt += $rect.attr('width') / 5) {

            $line = $(svg('line')),
                ht = $rect.attr('height');
            $line.attr({
                x1: wt,
                y1: 0,
                x2: wt,
                y2: ht,
                stroke: '#FFF',
                'stoke-width': 1
            })
                .appendTo($svg);
        }

        slider.siblings('span').css('visibility', 'hidden');
        slider.replaceWith($svg);

        plotPoint($svg, 2, ht * 0.25);
        plotPoint($svg, wt - 2, ht * 0.25);
        plotPoint($svg, 2, ht * 0.75);
        plotPoint($svg, wt - 2, ht * 0.75);

        connectTheDots($svg, 'max');
        connectTheDots($svg, 'min');

        $('line').on('mouseout', function (event) {
            return false;
        });

        $svg.on('mousedown', function (event) {
            if (event.target.tagName === 'circle') {
                if (event.which === 3) {
                    if ($(event.target).data('lineR') && $(event.target).data('lineL')) {
                        var type = ($(event.target)[0].classList.contains('maxpoint')) ? 'max' : 'min';
                        $(event.target).remove();
                        connectTheDots($svg, type);
                    }
                } else {
                    $movingCircle = $(event.target);
                }
            } else {
                var $point = plotPoint($svg, event.offsetX, event.offsetY),
                    type = $point[0].classList.contains('maxpoint') ? 'max' : 'min';

                connectTheDots($svg, type);
                $movingCircle = $point;
            }

            return false;
        });

        $svg.on('mousemove', function (event) {
            moveCircle(event);
            event.stopImmediatePropagation();
            return false;
        }).on('mouseup', function (event) {
            $movingCircle = null;
            return false;
        }).on('contextmenu', function (event) {
            return false;
        });

        var $movingCircle;
        function moveCircle (event) {
            if ($svg.width() < event.offsetX + 2
                || $svg.height() < event.offsetY + 2) {
                $movingCircle = null;
            }
            if ($movingCircle) {

                $movingCircle.attr('cy', event.offsetY);

                if ($movingCircle.data('lineR') && $movingCircle.data('lineL')) {
                    $movingCircle.attr('cx', event.offsetX);
                }

                if ($movingCircle.data('lineR')) {
                    $movingCircle.data('lineR').attr({
                        x1: event.offsetX,
                        y1: event.offsetY
                    });
                }
                if ($movingCircle.data('lineL')) {
                    $movingCircle.data('lineL').attr({
                        x2: event.offsetX,
                        y2: event.offsetY
                    });
                }
                var type = $movingCircle[0].classList.contains('maxpoint') ? 'max' : 'min';
                connectTheDots($svg, type);
            }
            return false;
        }

        function plotPoint ($svg, cx, cy) {
            var type = (cy < $svg.height() / 2) ? 'maxpoint' : 'minpoint';

            var $newPoint = $(svg('circle')).attr({
                class: type,
                cx: cx,
                cy: cy,
                stroke: '#FFF',
                'stroke-width': 1,
                fill: '#FFF',
                r: 4
            });

            $newPoint.appendTo($svg);

            return $newPoint;
        }
    };

    function connectTheDots ($svg, type) {
        var obj = {};

        $svg.find('.' + type + 'point').each(function (index, element) {
            var $ele = $(element);
            obj[$ele.attr('cx')] = $ele;
        });

        $svg.find('.' + type + 'point').remove();
        $svg.find('.' + type + 'line').remove();

        if (Object.keys(obj).length > 1) {
            var keys = Object.keys(obj).sort(function (a, b) {
                return a - b;
            });
            keys.forEach(function (element, index, array) {
                if (keys[index + 1]) {
                    var x1 = keys[index],
                        y1 = obj[keys[index]].attr('cy'),
                        x2 = keys[index + 1],
                        y2 = obj[keys[index + 1]].attr('cy'),
                        line = plotLine($svg, type + 'line', x1, y1, x2, y2);

                    obj[keys[index]].data('lineR', line);
                    obj[keys[index + 1]].data('lineL', line);
                } else {
                    obj[keys[index]].data('lineL', line);
                }
            });
        }

        for (var key in obj) {
            $svg.append(obj[key]);
        }
    }

    function plotLine ($svg, type, x1, y1, x2, y2) {
        return $(svg('line')).attr({
            class: type,
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2,
            stroke: (type === 'maxline') ? '#F00' : '#00F',
            'stroke-width': 2,
            m: (y2 - y1) / (x2 - x1),
            b: -(((y2 - y1) / (x2 - x1) * x2) - y2)

        }).on('mouseout', function (event) {
            return false;
        }).appendTo($svg);
    }

    function svg (tag) {
        return document.createElementNS('http://www.w3.org/2000/svg', tag);
    }

}(jQuery, window));
