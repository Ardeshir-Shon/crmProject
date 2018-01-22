var isDone;
$('.upload-btn').on('click', function() {
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
});

$("#nextOfFile").hide();
$("#nextOfParam").hide();
$("#nextOfRange").hide();
$("#loginAlert").hide();
$("#signUpAlert").hide();
$("#results").hide();

$('#upload-input').on('change', function() {

    var files = $(this).get(0).files;

    if (files.length > 0) {
        // create a FormData object which will be sent as the data payload in the
        // AJAX request
        var formData = new FormData();

        // loop through all the selected files and add them to the formData object
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            // add the files to formData object for the data payload
            formData.append('uploads[]', file, file.name);
        }

        $.ajax({
            url: '/upload/'+getCookie("userID"),
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                console.log('upload successful!\n' + data.path+" "+data.tid);
                document.cookie="path="+data.path+"; path=/";
                document.cookie="tid="+data.tid+"; path=/";

            },
            xhr: function() {
                // create an XMLHttpRequest
                var xhr = new XMLHttpRequest();

                // listen to the 'progress' event
                xhr.upload.addEventListener('progress', function(evt) {

                    if (evt.lengthComputable) {
                        // calculate the percentage of upload completed
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);

                        // update the Bootstrap progress bar with the new percentage
                        $('.progress-bar').text(percentComplete + '%');
                        $('.progress-bar').width(percentComplete + '%');

                        // once the upload reaches 100%, set the progress bar text to done
                        if (percentComplete === 100) {
                            $('.progress-bar').html('<i class="fa fa-check-circle" aria-hidden="true"></i>&nbsp  بارگذاری شد');
                            isDone = true;
                            $("#nextOfFile").show();
                        }
                    }
                }, false);
                return xhr;
            }
        });
    }
});

$('#paramSubmit').one('click', function() {
    var data = {}
    var R = $('#RParam').val();
    var F = $('#FParam').val();
    var M = $('#MParam').val();

    data.R = R;
    data.F = F;
    data.M = M;

    $.ajax({
        url: "/RFMParam",
        data: JSON.stringify(data),
        contentType: 'application/json',
        type: "POST",
        success: (data) => {
            $("#nextOfParam").show();
            data = data.reverse();
            dataStr = data.toString()
            console.log("reverse dataStr is: " + dataStr);
            dataArray = dataStr.split(",");
            var element = $("#results");
            for (i = 0; i < dataArray.length; i++) {
                var id = "desc" + i;
                var stringId = "#" + id;
                element.clone().attr("id", id).insertAfter(element).show();
                $(stringId).find("#clusterText").text(dataArray[i]);
                $(stringId).find("#download").attr("href", "/download/" + (dataArray.length - i));

            }
        }
    });
});

$('#rangeSubmit').on('click', function() {
    var data = {}
    var rRange = $('#slider').slider("values");
    var fRange = $('#slider2').slider("values");
    var mRange = $('#slider3').slider("values");

    data.rRange = rRange;
    data.fRange = fRange;
    data.mRange = mRange;

    $.ajax({
        url: "/RFMRange",
        data: JSON.stringify(data),
        contentType: 'application/json',
        type: "POST",
        success: (data) => {
            $("#nextOfRange").show();
            $("#allPlots").find("iframe").eq(0).attr("src", "/plots/mr.html");
            $("#allPlots").find("iframe").eq(1).attr("src", "/plots/fr.html");
            $("#allPlots").find("iframe").eq(2).attr("src", "/plots/fm.html");
        }
    });
});

$('#signUpSubmit').on('click', function(data) {
    var user = {}
    var name = $('#signUpName').val();
    var email = $('#signUpEmail').val();
    var password = $('#signUpPass1').val();
    var rePassword = $('#signUpPass2').val();

    user.name = name;
    user.email = email;
    user.password = password;
    user.rePassword = rePassword;

    $.ajax({
        url: "/",
        data: JSON.stringify(user),
        contentType: 'application/json',
        type: "POST",
        success: (data) => {
            if (data.error !== "you signed up.") {
                $("#signUpAlert").html(data.error);
                $("#signUpAlert").show();
            } else {
                document.cookie="userID="+data.id.toString();
                document.location.href = "/process/"+ data.id.toString();
            }
        }
    });
});

$('#loginSubmit').on('click', function() {
    var user = {}
    var email = $('#loginEmail').val();
    var password = $('#loginPassword').val();

    user.email = email;
    user.password = password;

    $.ajax({
        url: "/login",
        data: JSON.stringify(user),
        contentType: 'application/json',
        type: "POST",
        success: (data) => {
            if (data.error !== "you logged in!") {
                $("#loginAlert").html(data.error);
                $("#loginAlert").show();
            } else {
                document.location.href = "/dashboard/" + data.idd.toString();
                document.cookie = "userID=" + data.idd.toString();
            }
        }
    });
});

$('#newAnalysis').on('click', function() {
    document.location.href = "/process/" + getCookie("userID");
});

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = document.cookie; //decodeURIComponent(document.cookie);
    // decodedCookie = name;
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}