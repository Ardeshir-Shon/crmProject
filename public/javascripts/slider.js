var loadslider;

$(window).load(function() {
    // Just a helper i use
    $.fn.presence = function() {
        return this.length !== 0 ? this : null;
    };
    var init_start_at = 25;
    var init_end_at = 75;
    var loaded = false;
    //Here's the code
    loadslider = function() {
        if (loaded)
            return;
        loaded = true;
        $('#slider').slider({
            range: true,
            min: 0,
            max: 100,
            values: [init_start_at, init_end_at],
            slide: function(event, ui) {
                // Allow time for exact positioning
                setTimeout(function() {
                    $(ui.handle).attr('title', ui.value).tooltip('fixTitle').tooltip('show');
                }, 1);
            },
            create: function(event, ui) {
                var target = $(event.target);
                var handles = $(event.target).find('a');
                var container, wait;

                // Wait for the slider to be in position
                (wait = function() {
                    if ((container = target.parents('.content')).presence() != null) {
                        handles.eq(0).tooltip({
                            animation: false,
                            placement: 'top',
                            trigger: 'manual',
                            container: container,
                            title: init_start_at
                        }).tooltip('show');
                        handles.eq(1).tooltip({
                            animation: false,
                            placement: 'top',
                            trigger: 'manual',
                            container: container,
                            title: init_end_at
                        }).tooltip('show');
                    } else {
                        console.log('not found')
                        setTimeout(wait, 50);
                    }
                })();
            }
        });

        $('#slider2').slider({
            range: true,
            min: 0,
            max: 100,
            values: [init_start_at, init_end_at],
            slide: function(event, ui) {
                // Allow time for exact positioning

                setTimeout(function() {
                    $(ui.handle).attr('title', ui.value).tooltip('fixTitle').tooltip('show');
                }, 1);

            },
            create: function(event, ui) {
                var target = $(event.target);
                var handles = $(event.target).find('a');
                var container, wait;

                // Wait for the slider to be in position
                (wait = function() {
                    if ((container = target.parents('.content2')).presence() != null) {
                        handles.eq(0).tooltip({
                            animation: false,
                            placement: 'top',
                            trigger: 'manual',
                            container: container,
                            title: init_start_at
                        }).tooltip('show');
                        handles.eq(1).tooltip({
                            animation: false,
                            placement: 'top',
                            trigger: 'manual',
                            container: container,
                            title: init_end_at
                        }).tooltip('show');
                    } else {
                        console.log('not found')
                        setTimeout(wait, 50);
                    }
                })();
            }
        });


        $('#slider3').slider({
            range: true,
            min: 0,
            max: 100,
            values: [init_start_at, init_end_at],
            slide: function(event, ui) {
                // Allow time for exact positioning
                setTimeout(function() {
                    $(ui.handle).attr('title', ui.value).tooltip('fixTitle').tooltip('show');
                }, 1);

            },
            create: function(event, ui) {
                var target = $(event.target);
                var handles = $(event.target).find('a');
                var container, wait;

                // Wait for the slider to be in position
                (wait = function() {
                    if ((container = target.parents('.content3')).presence() != null) {
                        handles.eq(0).tooltip({
                            animation: false,
                            placement: 'top',
                            trigger: 'manual',
                            container: container,
                            title: init_start_at
                        }).tooltip('show');
                        handles.eq(1).tooltip({
                            animation: false,
                            placement: 'top',
                            trigger: 'manual',
                            container: container,
                            title: init_end_at
                        }).tooltip('show');
                    } else {
                        console.log('not found')
                        setTimeout(wait, 50);
                    }
                })();
            }
        });
    }



    // $('#coloredSlider').slider({
    //     range: true,
    //     min: 0,
    //     max: 100,
    //     values: [init_start_at, init_end_at],
    //     slide: function(event, ui) {
    //         // Allow time for exact positioning
    //         setTimeout(function() {
    //             $(ui.handle).attr('title', ui.value).tooltip('fixTitle').tooltip('show');
    //             refreshSwatch();
    //         }, 1);
    //         refreshSwatch();
    //     },
    //     create: function(event, ui) {
    //         var target = $(event.target);
    //         var handles = $(event.target).find('a');
    //         var container, wait;

    //         // Wait for the slider to be in position
    //         (wait = function() {
    //             if ((container = target.parents('.content4')).presence() != null) {
    //                 handles.eq(0).tooltip({
    //                     animation: false,
    //                     placement: 'top',
    //                     trigger: 'manual',
    //                     container: container,
    //                     title: init_start_at
    //                 }).tooltip('show');
    //                 handles.eq(1).tooltip({
    //                     animation: false,
    //                     placement: 'top',
    //                     trigger: 'manual',
    //                     container: container,
    //                     title: init_end_at
    //                 }).tooltip('show');
    //             } else {
    //                 console.log('not found')
    //                 setTimeout(wait, 50);
    //             }
    //         })();
    //     }
    // });
});

// function getTheColor(colorVal) {
//     var theColor = "";
//     if (colorVal < 100) {
//         myRed = 255;
//         myGreen = parseInt(((colorVal * 2) * 255) / 100);
//     } else {
//         myRed = parseInt(((100 - colorVal) * 2) * 255 / 100);
//         myGreen = 255;
//     }
//     theColor = "rgb(" + myRed + "," + myGreen + ",0)";
//     return (theColor);
// }

// function refreshSwatch() {
//     var coloredSlider = $("#coloredSlider").slider("value"),
//         myColor = getTheColor(coloredSlider);

//     $("#coloredSlider .ui-slider-range").css("background-color", myColor);

//     $("#coloredSlider .ui-state-default, .ui-widget-content .ui-state-default").css("background-color", myColor);
// }

// $(function() {
//     $("#coloredSlider").slider({
//         orientation: "horizontal",
//         range: "min",
//         max: 100,
//         value: 0,
//         slide: refreshSwatch,
//         change: refreshSwatch
//     });
// });