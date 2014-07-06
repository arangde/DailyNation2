/**
 * Page - Video
 */

(function() {'use strict';

	var page = app.registerPage('page-video', {

		// initialize page layouts
		onPageInit: function() {
			$("#page-video-header.date").html((new Date()).toDateString());
		},

		// resize all elements according to the screen
		onResize: function() {
			var heightWindow = $(window).height();
			var heightHeader = $("#page-video-header").outerHeight();
			var heightFooter = $("#page-video-footer" ).outerHeight();
			$("#page-video-contents").css("height", heightWindow - heightHeader - heightFooter - 45);
		},

		// called when the page becomes visible
		onPageShow: function() {
			this.onResize();
			addSections();
			updateArticles();
		},

		// called when the page becomes invisible
		onPageHide: function() {
			$("#page-video-contents").html("");
		},

		// back button
		"$tap:#page-video-header .back": function() {
			$.mobile.changePage("#page-home", {transition: "slideup", reverse: true});
			
		},

		// go to another section
		onGoSection: function(name) {
			currentCategory = name;
			updateArticles();
		},

		// Update Button on Sections Popup
		"$tap:#popup-videosections .update": function() {
			updateArticles(true);
		}
	});

	var videos = null;
	var slider = null;
	var flagLoading = false;

	//var currentCategory = app.getPage('page-home').getCurrentCategory();
	var currentCategory = "youtube";

	function updateArticles(flagUpdate) {
		flagLoading = true;
		$.mobile.showPageLoadingMsg();
		$("#page-video-body .empty").hide();
		app.data.get(currentCategory, function(data) {
			$.mobile.hidePageLoadingMsg();
			flagLoading = false;
			// make the articles content
			refreshVideoList(data);
		}, function(msg) {
			$.mobile.hidePageLoadingMsg();
			flagLoading = false;
			// failed
			console.log("Video list load Fail: " + msg);
		}, flagUpdate);
	}

	function refreshVideoList() {
	
	}

	function updateTitle() {
		/*var index = slider.data('fotorama').activeIndex;
		var item = videos[index];*/
	}

	function addSections() {
		var list = $("#popup-videosections .list > div");
		var html = "<div id='youtube'>Youtube</div>"
		var sections = app.data.getSections();
		for (var i = 0; i < sections.length; i++) {
			var section = sections[i];
			html += "<div id='" + section + "'>" + app.data.getSectionTitle(section) + "</div>";
		}
		list.html(html);
		var iscroll = new iScroll($("#popup-videosections .list")[0], {useTransition: true, hScrollbar:false, vScrollbar: false});
		$("#popup-videosections").on("popupafteropen", function() {
			iscroll.refresh();
		});

		UiUtil.addTapListener($("#popup-videosections .list > div > div"), function() {
			if (flagLoading) {
				return;
			}
			page.onGoSection(this.id);
			$("#popup-videosections").popup("close");
		}, 3);
		
	}

})();


jQuery(document).ready(function($) {
    
});