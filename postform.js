(function($, window, document, undefined){

    $.fn.postForm = function(options){
        var obj = $.extend({},$.fn.postForm.defaults,options);
        return this.each(function(){
                
            $(this).on('submit',function(event,data){

                var form = $(event.target);
                var brand_primary = '#428bca';
                var brand_error = '#d9534f';
                var reset = form.attr('form-reset');
                var tinymce = form.attr('tinymce');
                var data = new FormData($(form)[0]),xhrSet = jQuery.ajaxSettings.xhr();
                var url = form.attr('action');

                var feedback = jQuery(".feedback", this);
                var progress_bar = jQuery(".progress-bar", this);
                var icon = jQuery(".feedback > .fa", this);
                var message = jQuery(".feedback > .feedback-message", this);
                var submit_button = jQuery("input[type='submit']", this);

                icon.removeClass('fa-ok fa-remove').addClass('fa-spin fa-cog');
                message.html('Processing...');

                $.ajax({
                    url : url,
                    type: "post",
                    data : data, 
                    dataType: "json",
                    processData: false,  
                    contentType: false,
                    xhr : function(){
                        myXhr = xhrSet;
                        if(myXhr.upload){
                            myXhr.upload.addEventListener("progress",function(prog){
                                var value = ~~((prog.loaded / prog.total) * 100);
                                progress_bar.html(value+'%');
                                progress_bar.css({'width': value+'%'});
                            });
                        }
                        return myXhr;
                    },
                    error: function(jqXHR, textStatus){
                        icon.removeClass('fa-spin fa-cog fa-remove').addClass('fa-warning').css({'color':brand_error});
                        if(textStatus === 'timeout'){     
                            message.html("Check you internet connection and try again").css({'color':brand_error});
                        }else{
                            message.html("Soemthing went wrong. Try again later").css({'color':brand_error});
                        }
                        submit_button.attr('disabled', false);
                        if($.isFunction(obj.error)) {
                           obj.error.call();
                        }
                    },
                    
                    beforeSend: function(data){
                        submit_button.attr('disabled', true);
                        feedback.removeClass('hidden');
                        message.html(data.message).css({'color':brand_primary});
                        progress_bar.html('0%');
                        icon.removeClass('fa-warning fa-ok fa-remove').addClass('fa-spin fa-cog').css({'color':brand_primary});
                        progress_bar.css({'width': '0%'});

                        if($.isFunction(obj.before)) {
                           obj.beforeSubmit.call();
                        }
                    },
                    success: function( data ){
                        if(data.status==true){
                            if(data.message){
                                message.html(data.message).css({'color':brand_primary});
                            }else{
                                message.html('Processed').css({'color':brand_primary});
                            }
                            if($.isFunction(obj.success)) {
                               obj.success.call(undefined, data);
                            }
                            if(reset==true){
                                form[0].reset();
                            }
                            if(data.redirect == true){
                                window.location.href = data.url;
                            }
                            submit_button.attr('disabled', false);
                            icon.removeClass('fa-spin fa-warning fa-cog fa-remove').addClass('fa-check').css({'color':brand_primary});
                        }else{
                            submit_button.attr('disabled', false);
                            message.html(data.message).css({'color':brand_error});
                            icon.removeClass('fa-cog fa-warning fa-spin fa-ok').addClass('fa-remove').css({'color':brand_error});

                            errorsHtml = '<div class="alert alert-danger"><ul>';

                            $.each(data.errors, function(key, value){
                                errorsHtml += '<li>' + value + '</li>'; //showing only the first error.
                            });

                            errorsHtml += '</ul></di>';

                            feedback.html(errorsHtml);
                        };
                    },
                    timeout: 15000 // sets timeout to 3 seconds
                });

                event.preventDefault();
                event.stopPropagation();

            });

        });
    }

    $.fn.postForm.defaults = {};

})(jQuery, window, document);   