$(document).ready(function() {
    $(".closepop").hide();
    $(".openpop").click(function(e) {
        e.preventDefault();
        $("#plotNext").hide();
        $("#plotPrev").hide();
        var root = $(this).parent();
        root.removeClass("col-sm-6");
        root.addClass("col-sm-12");
        // root.css({ "height": "600px" });
        root.prevAll().eq(1).hide();
        root.prevAll().eq(0).hide();
        root.nextAll().eq(0).hide();
        root.nextAll().eq(1).hide();
        $(this).hide();
        $(".closepop").show();
        // $("#gone2").fadeOut('slow');
        // $("#popup").fadeIn('slow');
    });

    $(".closepop").click(function() {
        // $(this).parent().fadeOut("slow");
        var root = $(this).parent();
        $("#plotNext").show();
        $("#plotPrev").show();
        $(".closepop").hide();
        $(".openpop").show();
        root.removeClass("col-sm-12");
        root.addClass("col-sm-6");
        root.nextAll().eq(0).show();
        root.nextAll().eq(1).show();
        root.prevAll().eq(1).show();
        root.prevAll().eq(0).show();
    });
});