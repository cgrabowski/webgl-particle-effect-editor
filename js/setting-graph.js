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
                .on('mouseout', function (event) {
                return false;
            })
                .appendTo($svg);
        }

        var maxHeight = max[2] + 0.5 * (max[2] - min[0]),
            minHeight = min[0] - 0.5 * (max[2] - min[0]);

        plotLine($svg, 'maxline', 0, wt, ht * 0.25, ht * 0.25)
        plotLine($svg, 'minline', 0, wt, ht * 0.75, ht * 0.75)
        /*
         $maxLine = $(svg('line')).attr({
         class: 'maxline',
         x1: 0,
         x2: wt,
         y1: ht * 0.25,
         y2: ht * 0.25,
         stroke: '#F00',
         'stoke-width': 2,
         m: (y2 - y1) / (x2 - x1),
         b: -((m * x2) - y2)
         }),
         $minLine = $(svg('line')).attr({
         class: 'minline',
         x1: 0,
         x2: wt,
         y1: ht * 0.75,
         y2: ht * 0.75,
         stroke: '#00F',
         'stoke-width': 2,
         m: (y2 - y1) / (x2 - x1),
         b: -((m * x2) - y2)
         });                    
         
         
         $maxLine.appendTo($svg);
         $minLine.appendTo($svg);
         */

        slider.replaceWith($svg);

        $svg.on('mousedown', function (event) {
            if (event.which === 3) {
                return false;
            }
            var $circle = $(svg('circle'));
            $circle.attr({
                cx: event.offsetX,
                cy: event.offsetY,
                stroke: '#FFF',
                'stroke-width': 1,
                fill: '#FFF',
                r: 3
            });
            $circle.appendTo(this);



            movingCircle = $circle[0];

            $circle.on('contextmenu', function (event) {
                $(this).remove();
                return false;
            })
                .on('mousedown', function (event) {
                movingCircle = this;
                return false;
            })
                .on('mouseout', function (event) {
                return false;
            })
                .on('mousemove', function (event) {
                //return moveCircle(event);
            });

            return false;
        });

        $svg.on('mouseout', function (event) {
            movingCircle = false;
        })
            .on('mousemove', function (event) {
            return moveCircle(event);
            event.stopImmediatePropagation();
        })
            .on('mouseup', function (event) {
            movingCircle = false;
        })
            .on('contextmenu', function (event) {
            return false;
        });

        var movingCircle;
        function moveCircle (event) {
            if ($svg.width() < event.offsetX + 5
                || $svg.height() < event.offsetY + 5) {
                movingCircle = null;
            }
            if (movingCircle) {
                $(movingCircle).attr('cx', event.offsetX);
                $(movingCircle).attr('cy', event.offsetY);
            }
            return false;
        }

    };

    function plotLine ($svg, type, x1, x2, y1, y2) {
        $(svg('line')).attr({
            class: type,
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2,
            stroke: (type === 'maxline') ? '#F00' : '#00F',
            'stroke-width': 2,
            m: (y2 - y1) / (x2 - x1),
            b: -(((y2 - y1) / (x2 - x1) * x2) - y2)
        }).appendTo($svg);
    }

    function svg (tag) {
        return document.createElementNS('http://www.w3.org/2000/svg', tag);
    }

}(jQuery, window));
