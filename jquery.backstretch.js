/*
 * jQuery Backstretch
 * Version 1.3
 * http://srobbin.com/jquery-plugins/jquery-backstretch/
 *
 * Add a dynamically-resized background image to the page
 *
 * Copyright (c) 2011 Scott Robbin (srobbin.com)
 * Dual licensed under the MIT and GPL licenses.
*/

(function($) {

    $.backstretch = function(src, options, callback) {
        
        var defaultSettings = {
            centeredX: true,         // Should we center the image on the X axis?
            centeredY: true,         // Should we center the image on the Y axis?
            speed: 0,                // fadeIn speed for background after image loads (e.g. "fast" or 500)
            constrain: false         // If true, the image will not be stretched beyond its original dimensions
        },
        container = $("#backstretch"),
        settings = container.data("settings") || defaultSettings, // If this has been called once before, use the old settings as the default
        existingSettings = container.data('settings'),
        rootElement = ("onorientationchange" in window) ? $(document) : $(window), // hack to acccount for iOS position:fixed shortcomings
        imgRatio, imgWidth, imgHeight, bgImg, bgWidth, bgHeight, bgOffset, bgCSS;
                
        // Extend the settings with those the user has provided
        if(options && typeof options == "object") $.extend(settings, options);
        
        // Just in case the user passed in a function without options
        if(options && typeof options == "function") callback = options;
    
        // Initialize
        $(document).ready(_init);
  
        // For chaining
        return this;
    
        function _init() {
            // Prepend image, wrapped in a DIV, with some positioning and zIndex voodoo
            if(src) {
                var img;
                
                // If this is the first time that backstretch is being called
                if(container.length == 0) {
                    container = $("<div />").attr("id", "backstretch")
                                            .css({left: 0, top: 0, position: "fixed", overflow: "hidden", zIndex: -999999, margin: 0, padding: 0, height: "100%", width: "100%"});
                } else {
                    // Prepare to delete any old images
                    container.find("img").addClass("deleteable");
                }
                
                img = $("<img />")
                    .css({position: "absolute", display: "none", margin: 0, padding: 0, border: "none", zIndex: -999999})
                    .bind("load", function(e) {                                          
                        var self = $(this);

                        self.css({width: "auto", height: "auto"});
                        imgWidth = this.width || $(e.target).width();
                        imgHeight = this.height || $(e.target).height();
                        imgRatio = imgWidth / imgHeight;
                        
                        _adjustBG(function() {
                            self.fadeIn(settings.speed, function(){
                                // Remove the old images, if necessary.
                                container.find('.deleteable').remove();
                                // Callback
                                if(typeof callback == "function") callback();
                            });
                        });
                    })
                    .appendTo(container);
                 
                // Append the container to the body, if it's not already there
                if($("body #backstretch").length == 0) {
                    $("body").append(container);
                }
                
                // Attach the settings
                container.data("settings", settings);
                    
                img.attr("src", src); // Hack for IE img onload event
                // Adjust the background size when the window is resized or orientation has changed (iOS)
                $(window).resize(_adjustBG);
            }
        }
            
        function _adjustBG(fn) {
            try {
                bgCSS = {left: 0, top: 0}
                var rootWidth = rootElement.width(),
                    rootHeight = rootElement.height()
                bgWidth = (!settings.constrain || rootWidth < imgWidth) ? rootWidth : imgWidth;
                bgHeight = bgWidth / imgRatio;
                
                if (settings.constrain && bgHeight > imgHeight) {
                    bgHeight = imgHeight;
                    bgWidth = bgHeight * imgRatio;
                }
                
                // Center the image
                
                if (settings.centeredY) $.extend(bgCSS, {top: ((rootHeight - bgHeight) / 2) + "px"});
                if (settings.centeredX) $.extend(bgCSS, {left: ((rootWidth - bgWidth) / 2) + "px"});

                $("#backstretch, #backstretch img")
                    .width(bgWidth)
                    .height(bgHeight)
                    .filter("#backstretch")
                    .css(bgCSS);
                
            } catch(err) {
                // IE7 seems to trigger _adjustBG before the image is loaded.
                // This try/catch block is a hack to let it fail gracefully.
            }
      
            // Executed the passed in function, if necessary
            if (typeof fn == "function") fn();
        }
    };
  
})(jQuery);