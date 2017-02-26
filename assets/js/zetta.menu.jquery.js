/*!*
 * jQuery plugin Zetta Menu
 * @author nK http://codecanyon.net/user/nKdev
 * @description Zetta Menu - mega dropdown menu plugin.
 * 
 * @similar Pure CSS3 Zetta Menu - http://codecanyon.net/item/zetta-menu-css3-mega-drop-down-menu/7667949?ref=nKdev
 */
(function($) {
  // animation test
  $.extend($.support, {
    animation: (function() {
      if(window.opera && opera.toString() == "[object Opera]") { return false; }

      var animation = false,
        animationstring = 'animation',
        keyframeprefix = '',
        domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
        pfx  = '',
        elm = document.createElement('div');

      if( elm.style.animationName !== undefined ) { animation = true; }    

      if( animation === false ) {
        for( var i = 0; i < domPrefixes.length; i++ ) {
          if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
            pfx = domPrefixes[ i ];
            animationstring = pfx + 'Animation';
            keyframeprefix = '-' + pfx.toLowerCase() + '-';
            animation = true;
            break;
          }
        }
      }
      return animation;
    }())
  });

  $.fn.zettaMenu = function(method) {
    var namespace = 'zettaMenu';
    
    // plugin class that does all work
    window[namespace] = function(obj, settings) {
      var base = this;

      // default settings
      base.settings = {
        sticky: false,
        showOn: 'click', // hover, click, toggle
        intentHide: 200 // ms
      }
      
      // extending with settings parameter
      if (settings) {
        for(var k in settings) {
          if(typeof settings[k] == 'object') {
            $.extend(base.settings[k], settings[k]);
          } else {
            base.settings[k] = settings[k];
          }
        }
      }

      base.obj = obj; // actual DOM element
      base.$obj = $(obj); // jQuery version of DOM element

      // drop objects
      base.$divDrop = base.$obj.find('> ul > li > div, > ul > li > div > ul li > div');
      base.$liDrop = base.$divDrop.parent().find('> a'); // li with drop children

      // init method
      var _init = function () {
        // remove zm-css class
        base.$obj.removeClass('zm-css');
        
        // call to bind events on DOM element
        _bindEvents();
      }
 
      // public destroy method
      base.destroy = function() {
        // unbind events
        base.$liDrop.off('.' + namespace);
        base.$liDrop.parent().off('.' + namespace);
        $(document).off('.' + namespace);

        // object destruction
        base.$obj.removeData(namespace);
        delete base;
      }

      // show menu subs
      function effectEnd($this) {
        if($this.hasClass('zm-effect-on')) {
          $this.removeClass('zm-effect-on');
        }
        else if ($this.hasClass('zm-effect-off')) {
          $this.removeClass('zm-open zm-effect-off');
        }
      }

      function showSub($this) {
        if($this.hasClass('zm-open')) {
          return;
        }

        var $thisSub = $('> div', $this);
        $this.removeClass('zm-effect-off').addClass('zm-open zm-effect-on');
        
        if(!$.support.animation || $thisSub.css('animation').indexOf('none') !== -1) {
          effectEnd($this);
        }
      }

      function hideSub($this, force) {
        $this.each(function() {
          if($(this).hasClass('zm-effect-on') || $(this).hasClass('zm-effect-off') || $('.zm-effect-on', $(this))[0] || (!force && this.parentElement.querySelector(':hover') === this)) {
            return;
          }

          var $thisSub = $(this).find('> div');
          $(this).addClass('zm-effect-off').removeClass('zm-effect-on');
          if(!$.support.animation || $thisSub.css('animation').indexOf('none') !== -1) {
            effectEnd($(this));
          }
        });
      }
      
      // plugin events
      var _bindEvents = function() {
        // click events
        if(base.settings.showOn == 'click') {
          base.$liDrop.on('click.' + namespace, function(e) {
            var li = $(this).parent();
            if(li.hasClass('zm-open')) {
              // hide current
              hideSub(li, true);
            } else {
              // show current
              showSub(li);

              // hide siblings
              hideSub(li.siblings('.zm-open'));

              // hide siblings
              hideSub(li.siblings().find('.zm-open'));

              // hide multi column siblings
              hideSub(li.parent().siblings().find('.zm-open'));

              // prevent follow a link
              e.preventDefault();
              e.stopPropagation();
            }
          });
          base.$liDrop.parent().on('mouseleave.' + namespace, function() {
            // event code here
            hideSub($(this), true);
          });
        }
        // toggle events
        else if(base.settings.showOn == 'toggle') {
          base.$liDrop.on('click.' + namespace, function(e) {
            var li = $(this).parent();
            if(li.hasClass('zm-open')) {
              // hide current
              hideSub(li, true);
            } else {
              // show current
              showSub(li);

              // hide siblings
              hideSub(li.siblings('.zm-open'));

              // hide siblings
              hideSub(li.siblings().find('.zm-open'));

              // hide multi column siblings
              hideSub(li.parent().siblings().find('.zm-open'));

              // prevent follow a link
              e.preventDefault();
              e.stopPropagation();
            }
          });
        }
        // hover events
        else {
          base.$liDrop.on('mouseenter.' + namespace, function(e) {
            // add opened class and prevent follow a link
            showSub($(this).parent());
            e.preventDefault();
            e.stopPropagation();
          });
          base.$liDrop.parent().on('mouseleave.' + namespace, function() {
            // remove opened class after mouse leave
            hideSub($(this), true);
          });
        }

        // close sub menus when click on document
        $(document).on('click.' + namespace + ' touchstart.' + namespace, function(e) {
          (function($this){
            setTimeout(function() {
              hideSub($this);
            }, base.settings.intentHide);
          }(base.$liDrop.parent()))
        });

        // animation end
        base.$divDrop.on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
          // remove animation classes
          effectEnd($(this).parent());

          // hide sub if mouse leave
          if(base.settings.showOn == 'hover' || base.settings.showOn == 'click') {
            hideSub($(this).parent());
          }
        });

        // sticky menu
        if(base.settings.sticky) {
          var zmPos = base.$obj.offset(),

              // clone to stop content jumping when main menu gors to fixed position
              zmCloned = base.$obj.clone().css('visibility', 'hidden').hide();
              // remove unnecessary drops
              zmCloned.find('ul > li > div, input, .zm-switch').remove();
              zmCloned.insertAfter(base.$obj)

          $(window).on('scroll.' + namespace, function() {
            var stickyOn = $(this).scrollTop() >= zmPos.top;
            
            if(stickyOn) {
              base.$obj.addClass('zm-fixed');
              zmCloned.show();
            }
            else {
              base.$obj.removeClass('zm-fixed');
              zmCloned.hide();
            }
          }).scroll();
        }
      }
      
      // calling init
      _init();
    }
    
    // Method calling logic
    return this.each(function() {
      if (typeof $(this).data(namespace) == 'undefined') {
        // Create plugin for this element
        $(this).data(namespace, new window[namespace](this, method));
      } else if (typeof $(this).data(namespace) == 'object' && typeof method == 'undefined') {
        $.error('This element already has jQuery.' + namespace);
      } else if (typeof $(this).data(namespace) == 'object' && typeof $(this).data(namespace)[method] == 'function') {
        // Element has a plugin and method, call it
        $(this).data(namespace)[method].apply(this, Array.prototype.slice.call(arguments, 1));
      } else {
        $.error('Method ' + method + ' does not exist on jQuery.' + namespace);
      }
    });
  }
})(jQuery);