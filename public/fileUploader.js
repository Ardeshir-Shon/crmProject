$(window).load(function() {
    $("#uploadFile").change(function() {
        var formData = new FormData();
        formData.append('file', this.files[0]);

        $("#files").append($("#fileUploadProgressTemplate").tmpl());
        $("#fileUploadError").addClass("hide");

        $.ajax({
            url: '/echo/json',
            type: 'POST',
            xhr: function() {
                var xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress', function(evt) {
                        var percent = (evt.loaded / evt.total) * 100;
                        $("#files").find(".progress-bar").width(percent + "%");
                    }, false);
                }
                return xhr;
            },
            success: function(data) {
                $("#files").children().last().remove();
                $("#files").append($("#fileUploadItemTemplate").tmpl(data));
                $("#uploadFile").closest("form").trigger("reset");
            },
            error: function() {
                $("#fileUploadError").removeClass("hide").text("خطایی رخ داده است!");
                $("#files").children().last().remove();
                $("#uploadFile").closest("form").trigger("reset");
            },
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }, 'json');
    });
})