PEE = PEE || {};

PEE.settingGraph = (function ($, window, undefined) {

    function svg (tag) {
        return document.createElementNS('http://www.w3.org/2000/svg', tag);
    }

    return function (settingTainer, name, master) {

        var emitter = settingTainer.closest('.toolbar').data('emitter'),
            effect = (emitter.length) ? emitter[0].effect : emitter.effect,
            $svg = $(svg('svg')),
            $rect = $(svg('rect')),
            ht = settingTainer.height() * 3,
            wt = settingTainer.width() - 25;

        $svg.addClass('graph-svg')
            .appendTo(settingTainer)
            .data('name', name)
            .data('slider', settingTainer.find('.ui-slider'))
            .data('aspect', ht / wt)
            .attr({
            height: ht,
            width: wt
        });

        $rect.attr({
            height: ht,
            width: wt,
            fill: '#000',
            stroke: '#FFF',
            'stroke-width': 2
        })
            .on('mouseout', function (event) {
            return false;
        })
            .appendTo($svg);

        $($svg.closest('.toolbar-tainer')[0]).on('resize', function (event, ui) {
            var $this = $(this),
                $svg = $this.find('svg'),
                $rect = $svg.find('rect'),
                ow = $svg.attr('width'),
                nw = $this.find('.setting-tainer').width() - 10,
                oh = $svg.attr('height'),
                nh = nw * $svg.data('aspect');
            $svg.attr({
                width: nw,
                height: nw * $svg.data('aspect')
            });

            $svg.find('rect').attr({
                width: nw,
                height: nw * $svg.data('aspect') - 2,
                fill: '#000'
            });
            $svg.find('.gridline-horiz').attr({
                x2: nw
            });
            $svg.each(function (index, element) {
                for (var i = 0, ht = 0; ht < $rect.attr('height'); ht += $rect.attr('height') / 5) {
                    $line = $($(element).find('.gridline-horiz')[i++]),
                        wt = $rect.attr('width');
                    $line.attr({
                        x1: 0,
                        y1: ht,
                        x2: wt,
                        y2: ht,
                        stroke: '#FFF',
                        'stoke-width': 1
                    });
                }
                for (var i = 0, wt = 0; wt < $rect.attr('width'); wt += $rect.attr('width') / 5) {
                    $line = $($(element).find('.gridline-vert')[i++]),
                        ht = $rect.attr('height');
                    $line.attr({
                        x1: wt,
                        y1: 0,
                        x2: wt,
                        y2: ht,
                        stroke: '#FFF',
                        'stoke-width': 1
                    });
                }
                $(element).find('circle').each(function (index, element) {
                    $(element).attr({
                        cx: $(element).attr('cx') * (nw / ow),
                        cy: $(element).attr('cy') * (nh / oh)
                    });
                });
                connectTheDots($(element), 'max');
                connectTheDots($(element), 'min');
            });
        });

        for (var ht = 0; ht < $rect.attr('height'); ht += $rect.attr('height') / 5) {

            var $line = $(svg('line')),
                wt = $rect.attr('width');
            $line.attr({
                class: 'gridline-horiz',
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
                class: 'gridline-vert',
                x1: wt,
                y1: 0,
                x2: wt,
                y2: ht,
                stroke: '#FFF',
                'stoke-width': 1
            })
                .appendTo($svg);
        }

        var setting = $svg.closest('.setting-tainer').data('name'),
            flag = setting.toUpperCase() + '_BIT';

        if ($svg.closest('.toolbar').data('master')) {

            var gConfig = effect.opts.graphablesConfig || 0,
                minData = effect.opts['min' + setting.capitalize() + 'Graph'],
                maxData = effect.opts['max' + setting.capitalize() + 'Graph'];

        } else {
            var gConfig = emitter.opts.graphablesConfig,
                minData = emitter.opts['min' + setting.capitalize() + 'Graph'],
                maxData = emitter.opts['max' + setting.capitalize() + 'Graph'];

        }

        // on init make graph or slider visible based on graphablesConfig
        if (gConfig & PEE.ParticleEffect.GRAPHABLE_FLAGS[flag]) {
            $svg.css('display', 'block');
            $svg.data('slider').css('display', 'none');
            $svg.siblings('.max-span')
                .detach()
                .removeClass('max-span')
                .addClass('max-span-left')
                .insertBefore(settingTainer.find('h5'));
            $svg.siblings('.min-span').detach().insertAfter($svg);
            $svg.parent().css('padding-bottom', '6px');

        } else {
            $svg.css('display', 'none');
            $svg.data('slider').css('display', 'block');

        }

        // plot left-most and right-most points for both the min and max lines
        // this provides a little padding between the points and the
        // edge of the graph
        plotPoint($svg, 4, (-minData[1] + 1) / 2 * ht, 'minpoint');
        plotPoint($svg, wt - 4, (-minData[minData.length - 3] + 1) / 2 * ht, 'minpoint');
        plotPoint($svg, 4, (-maxData[1] + 1) / 2 * ht, 'maxpoint');
        plotPoint($svg, wt - 4, (-maxData[maxData.length - 3] + 1) / 2 * ht, 'maxpoint');

        // plot points from saved graph data (except for left- and right-most points
        for (var i = 4; i < minData.length - 5; i += 4) {
            plotPoint($svg, minData[i] * $svg.width(), (-minData[i + 1] + 1) / 2 * ht, 'minpoint');
        }

        for (var i = 4; i < maxData.length - 5; i += 4) {
            plotPoint($svg, maxData[i] * $svg.width(), (-maxData[i + 1] + 1) / 2 * ht, 'maxpoint');
        }

        connectTheDots($svg, 'max');
        connectTheDots($svg, 'min');

        // if not master and channel is set to useMaster, darken all the graph elements
        if (!master) {
            var emitter = $(settingTainer.closest('.toolbar')[0]).data('emitter');
            if (!(PEE.ParticleEffect.CHANNEL_FLAGS[name.toUpperCase() + '_BIT'] & emitter.opts.channelConfig)) {

                $svg.css('color', '#303030')
                    .find('.ui-slider, .ui-slider-handle').css('background-color', '#303030')
                    .andSelf().find('.ui-slider-handle').css('background-color', '#303030');

                $svg.find('.gridline-horiz, .gridline-vert').attr('stroke', '#303030');                
                $svg.find('rect, .minline, .maxline').attr('stroke-width', '0');
                $svg.find('circle').attr({'stroke-width': 0, r: 0});

            }
        }

        $('line').on('mouseout', function (event) {
            return false;
        });

        $svg.on('mousedown', function (event) {
            if (event.target.tagName === 'circle') {
                if (event.which === 3 && $(event.target).data('lineR') && $(event.target).data('lineL')) {
                    var type = ($(event.target)[0].classList.contains('maxpoint')) ? 'max' : 'min';

                    event.target.parentNode.removeChild(event.target);
                    delete event.target;
                    connectTheDots($svg, type);
                } else {
                    $movingPoint = $(event.target);
                }
            } else if (event.which !== 3) {
                var $point = plotPoint($svg, event.offsetX, event.offsetY),
                    type = $point[0].classList.contains('maxpoint') ? 'max' : 'min';

                connectTheDots($svg, type);
                $movingPoint = $point;
            }

            return false;
        });

        $svg.on('mousemove create', function (event) {

            movePoint(event);

            //[x1, y1, min limit, max limit, x2, y2, V m, b, x3, y3, V m, b, [...]]

            if (master) {
                var min = effect.opts['min' + name.capitalize() + 'Graph'],
                    max = effect.opts['max' + name.capitalize() + 'Graph'];
            } else {
                var min = emitter.opts['min' + name.capitalize() + 'Graph'],
                    max = emitter.opts['max' + name.capitalize() + 'Graph'];
            }

            // rebuild the graph data array based on point locations
            $svg.find('.minpoint').each(function (index, element) {
                min[index * 4] = element.getAttribute('cx') / $svg.width();
                min[index * 4 + 1] = -(element.getAttribute('cy') / ($svg.height() * 0.5) - 1);
            });

            min.length = $svg.find('.minpoint').length * 4;

            for (var k = 6; k < min.length + 1; k += 4) {
                // slope
                min[k] = (min[k - 1] - min[k - 5]) / (min[k - 2] - min[k - 6]);

                // y intercept
                min[k + 1] = -(min[k] * min[k - 2] - min[k - 1]);
            }

            // rebuild the graph data array based on point locations
            $svg.find('.maxpoint').each(function (index, element) {
                max[index * 4] = element.getAttribute('cx') / $svg.width();
                max[index * 4 + 1] = -(element.getAttribute('cy') / ($svg.height() * 0.5) - 1);
            });

            max.length = $svg.find('.maxpoint').length * 4;

            for (var k = 6; k < max.length + 1; k += 4) {
                // slope
                max[k] = (max[k - 1] - max[k - 5]) / (max[k - 2] - max[k - 6]);

                // y intercept
                max[k + 1] = -(max[k] * max[k - 2] - max[k - 1]);
            }

        }).on('mouseup', function (event) {
            $movingPoint = null;
            return false;
        }).on('contextmenu', function (event) {
            return false;
        });

        $svg.trigger('create');

        var $movingPoint;

        function movePoint (event) {
            if ($svg.width() < event.offsetX + 2 || $svg.height() < event.offsetY + 2) {
                $movingPoint = null;

            }
            if ($movingPoint) {
                $movingPoint.attr('cy', event.offsetY);

                if ($movingPoint.data('lineR') && $movingPoint.data('lineL')) {
                    $movingPoint.attr('cx', event.offsetX);

                }
                if ($movingPoint.data('lineR')) {
                    $movingPoint.data('lineR').attr({
                        x1: event.offsetX,
                        y1: event.offsetY
                    });

                }
                if ($movingPoint.data('lineL')) {
                    $movingPoint.data('lineL').attr({
                        x2: event.offsetX,
                        y2: event.offsetY
                    });

                }
                var type = $movingPoint[0].classList.contains('maxpoint') ? 'max' : 'min';
                connectTheDots($svg, type);

            }
            return false;
        }

        function plotPoint ($svg, cx, cy, type) {
            if (!type) {
                type = (cy < $svg.height() / 2) ? 'maxpoint' : 'minpoint';
            }

            var $newPoint = $(svg('circle')).attr({
                class: type,
                cx: cx,
                cy: cy,
                stroke: '#FFF',
                'stroke-width': 1,
                fill: '#FFF',
                r: 4
            })
                .data('ocx', cx)
                .data('ocy', cy);

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

}(jQuery, window));
