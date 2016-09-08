/*-----------------------------------

    ----- Page Animation ------

--------------------------------------*/

jQuery(document).ready(function(event){
  var isAnimating = false,
    newLocation = '';
    firstLoad = false;

  //trigger smooth transition from the actual page to the new one
  $('body').on('click', '[data-type="page-transition"]', function(event){
    event.preventDefault();
    //detect which page has been selected
    var newPage = $(this).attr('href');
    //if the page is not already being animated - trigger animation
    if( !isAnimating ) changePage(newPage, true);
    firstLoad = true;
  });

  //detect the 'popstate' event - e.g. user clicking the back button
  $(window).on('popstate', function() {
  	if( firstLoad ) {
      /*
      Safari emits a popstate event on page load - check if firstLoad is true before animating
      if it's false - the page has just been loaded
      */
      var newPageArray = location.pathname.split('/'),
        //this is the url of the page to be loaded
        newPage = newPageArray[newPageArray.length - 1];

      if( !isAnimating  &&  newLocation != newPage ) changePage(newPage, false);
    }
    firstLoad = true;
	});

	function changePage(url, bool) {
    isAnimating = true;
    // trigger page animation
    $('body').addClass('page-is-changing');
    $('.cd-loading-bar').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
    	loadNewContent(url, bool);
      newLocation = url;
      $('.cd-loading-bar').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
    });
    //if browser doesn't support CSS transitions
    if( !transitionsSupported() ) {
      loadNewContent(url, bool);
      newLocation = url;
    }
	}

	function loadNewContent(url, bool) {
		url = ('' == url) ? 'index.html' : url;
  	var newSection = 'cd-'+url.replace('.html', '');
  	var section = $('<div class="cd-main-content '+newSection+'"></div>');

  	section.load(url+' .cd-main-content > *', function(event){
      // load new content and replace <main> content with the new one
      $('main').html(section);
      //if browser doesn't support CSS transitions - dont wait for the end of transitions
      var delay = ( transitionsSupported() ) ? 1200 : 0;
      setTimeout(function(){
        //wait for the end of the transition on the loading bar before revealing the new content
        ( section.hasClass('cd-about') ) ? $('body').addClass('cd-about') : $('body').removeClass('cd-about');
        $('body').removeClass('page-is-changing');
        $('.cd-loading-bar').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          isAnimating = false;
          $('.cd-loading-bar').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
        });

        if( !transitionsSupported() ) isAnimating = false;
      }, delay);

      if(url!=window.location && bool){
        //add the new page to the window.history
        //if the new page was triggered by a 'popstate' event, don't add it
        window.history.pushState({path: url},'',url);
      }
		});
  }

  function transitionsSupported() {
    return $('html').hasClass('csstransitions');
  }
});

/*-----------------------------------

    ----- Smart Navigation ------

--------------------------------------*/
jQuery(document).ready(function($){
	// browser window scroll (in pixels) after which the "menu" link is shown
	var offset = 300;

	var navigationContainer = $('#cd-nav'),
		mainNavigation = navigationContainer.find('#cd-main-nav ul');

	//hide or show the "menu" link
	checkMenu();
	$(window).scroll(function(){
		checkMenu();
	});

	//open or close the menu clicking on the bottom "menu" link
	$('.cd-nav-trigger').on('click', function(){
		$(this).toggleClass('menu-is-open');
		//we need to remove the transitionEnd event handler (we add it when scolling up with the menu open)
		mainNavigation.off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend').toggleClass('is-visible');

	});

	function checkMenu() {
		if( $(window).scrollTop() > offset && !navigationContainer.hasClass('is-fixed')) {
			navigationContainer.addClass('is-fixed').find('.cd-nav-trigger').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
				mainNavigation.addClass('has-transitions');
			});
		} else if ($(window).scrollTop() <= offset) {
			//check if the menu is open when scrolling up
			if( mainNavigation.hasClass('is-visible')  && !$('html').hasClass('no-csstransitions') ) {
				//close the menu with animation
				mainNavigation.addClass('is-hidden').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
					//wait for the menu to be closed and do the rest
					mainNavigation.removeClass('is-visible is-hidden has-transitions');
					navigationContainer.removeClass('is-fixed');
					$('.cd-nav-trigger').removeClass('menu-is-open');
				});
			//check if the menu is open when scrolling up - fallback if transitions are not supported
			} else if( mainNavigation.hasClass('is-visible')  && $('html').hasClass('no-csstransitions') ) {
					mainNavigation.removeClass('is-visible has-transitions');
					navigationContainer.removeClass('is-fixed');
					$('.cd-nav-trigger').removeClass('menu-is-open');
			//scrolling up with menu closed
			} else {
				navigationContainer.removeClass('is-fixed');
				mainNavigation.removeClass('has-transitions');
			}
		}
	}
});

// ---------------// Variables //---------------//
// ----------------------------------------------------------------//
var unsplashAPI = "https://api.unsplash.com/users/nathananderson/photos/?client_id=1fc3cf0554dd08f8491af5cd37ac945bebde6b5032613d61419f2b92ddde1d9a&per_page=20";
var popularPhotos = {
  order_by: "popular",
  format: "json"
};
var latestPhotos = {
  order_by: "latest",
  format: "json"
};
var oldestPhotos = {
  order_by: "oldest",
  format: "json"
};

// ----------------------------------------------------------------//
// ---------------// Unsplash Photos //---------------//
// ----------------------------------------------------------------//
var gallery;

function displayPhotos(data) {
    var photoData = '';
    $.each(data, function(i, photo) {
      photoData += '<a class="tile"' + 'data-sub-html="#' + photo.id + '"' + 'data-src="' + photo.urls.regular + '">' + '<img alt class="photo" src="' + photo.urls.regular + '">';
    });
    // Putitng into HTML
		photoData += '</a>';
    $('#photoBox').html(photoData);
    //-----------------------------------//
    // -------  Calling Lightbox ------- //
    //-----------------------------------//
				// If gallery exists already, destroy it (needed for sorting)
    if (gallery) {gallery.data('lightGallery').destroy(true);}
    gallery = $('#photoBox').lightGallery({
      selector: '.tile',
      download: false,
      counter: false,
      zoom: false,
      thumbnail: false,
      mode: 'lg-fade'
    });
  } // End Displayphotos function

// Show popular photos on pageload
$.getJSON(unsplashAPI, popularPhotos, displayPhotos);


// Button Click Changes
$('button').click(function() {
  $('button').removeClass("active");
  $(this).addClass("active");
}); // End button

// var hightUrl = data.images.standard_resolution.url.replace("s640x640","s1080x1080");

// Button Click Changes
$('button').click(function() {
  $('button').removeClass("active");
  $(this).addClass("active");
}); // End button
