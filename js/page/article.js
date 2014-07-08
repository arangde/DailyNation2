/**
 * Page - Article
 */

var DISQUS_TIMER = null;

(function() {
	'use strict';
	var page = app.registerPage('page-article', { // show an article
		setArticle: function(item) {
			applyArticle(item);
			currentItem = item;
		},
		// initialize the page
		onPageInit: function() {
			scrollBody = new iScroll(find(".contents")[0], {
				useTransition: true,
				vScrollbar: false
			});
			setInterval(function() {
				refreshBodySize();
			},
			500);
		},
		// the page becomes visible
		onPageShow: function() {
			this.onResize();
			setTextSizeFromSetting();
			//applyTrendingArticles();

		},
		// resize all elements according to the screen
		onResize: function() {
			var heightWindow = $(window).height();
			var heightHeader = find(".ui-header").outerHeight();
			var heightFooter = find(".ui-footer").outerHeight();
			find(".ui-content").outerHeight(heightWindow - heightHeader - heightFooter - 45);
			refreshBodySize();
		},
		// get current category
		getCurrentCategory: function() {
			return currentCategory;
		},
		// go to home page
		"$tap:$ .button.back": function() { 
			//$.mobile.changePage("#page-home", {transition: "slideup", reverse: true});
			
			clearInterval(DISQUS_TIMER);

			parent.history.back();

			// remove AdMob Ad View
			window.plugins.AdMob.removeBannerView();

			// AdMob
			setTimeout(function(){
				window.plugins.AdMob.createBannerView({
				'publisherId': 'ca-app-pub-6199053784584414/3377085517',
				'adSize': 'SMART_BANNER'
			},
			function(e) {
				window.plugins.AdMob.requestAd({
					'isTesting': true,
					'extras': {
						'color_bg': 'ffffff',
						'color_bg_top': 'FFFFFF',
						'color_border': 'eaeaea',
						'color_link': '000080',
						'color_text': '808080',
						'color_url': '008000'
					},
				});
			});
			},1000);
			

			return false;
		},
		// show Font-size menu
		"$tap:$ .button.fontsize": function() {
			$("#popup-fontsize").popup('open', {
				positionTo: find(".button.fontsize")
			});
		},
		// show Share menu
		"$tap:$ .button.share": function() {
			$("#popup-share").popup('open', {
				positionTo: find(".button.share")
			});
		},
		// called on font-size select on Font-size menu
		"$tap:#popup-fontsize li a": function(event, src) {
			var id = src.id;
			setTextSize(id);
		},
		// called when the share menu becomes visible
		"$popupafteropen:#popup-share": function() {
			if (currentItem == null) {
				return;
			} {
				
				//$("#popup-share li a#facebook")[0].href = url;
				//$("#popup-share li a#facebook")[0].target = "_blank";
                $("#popup-share li a#facebook").bind("click", function() {
                	var url = 'http://www.facebook.com/sharer.php?u=' + currentItem.link;
                    window.open( url, '_blank');
                });
			} {
				
				//$("#popup-share li a#twitter")[0].href = url;
				//$("#popup-share li a#twitter")[0].target = "_blank";
                $("#popup-share li a#twitter").bind("click", function() {
                    var url = 'http://www.twitter.com/intent/tweet?text=' + currentItem.link;
                    window.open( url, '_blank');
                });
			} {
				
				//$("#popup-share li a#google")[0].href = url;
				//$("#popup-share li a#google")[0].target = "_blank";
				$("#popup-share li a#google").bind("click", function() {
                    var url = 'https://plus.google.com/share?url=' + currentItem.link;
                    window.open( url, '_blank');
                });
			} {
				
				//$("#popup-share li a#linkedin")[0].href = url;
				//$("#popup-share li a#linkedin")[0].target = "_blank";
				$("#popup-share li a#linkedin").bind("click", function() {
                    var url = 'http://www.linkedin.com/shareArticle?mini=true&url=' + currentItem.link;
                    window.open( url, '_blank');
                });
			}
		}
	});
	function find(s) {
		return page.find(s);
	}
	var currentCategory = "News";
	var pager = null;
	var flagLoading = false;
	var articles = [];
	function updateDateTimeOnHeader(date) {
		if (date == null) {
			find(".ui-header .time .value").html("");
			find(".ui-header .date").html("");
			return;
		}
		var strTime = date.toTimeString();
		find(".ui-header .time .value").html(strTime);
		var strDate = date.toDateString();
		find(".ui-header .date").html(strDate);
	}
	var iscrollCategories = new iScroll($("#popup-sections .list")[0], {
		useTransition: true,
		hScrollbar: false,
		vScrollbar: false
	});
	var iscrollSections = new iScroll($("#popup-sections .sub-list")[0], {
		useTransition: true,
		hScrollbar: false,
		vScrollbar: false
	});
	function addSections() {
		var list = $("#popup-sections .list > div");
		var html = "<div id='TopNews'>Top News</div><div id='Photos'>Photos</div><div id='Videos'>Videos</div>"
		var categories = app.data.getSectionCategories();
		for (var i = 0; i < categories.length; i++) {
			var category = categories[i];
			html += "<div id='" + category + "' class='category'>" + category + "</div>";
		}
		list.html(html);
		$("#popup-sections").on("popupafteropen",
		function() {
			iscrollCategories.refresh();
		});
		$("#popup-sections").on("popupafterclose",
		function() {
			$("#popup-sections .sub-list-container").css("left", "23rem");
		});
		UiUtil.addTapListener($("#popup-sections .list > div > div"),
		function() {
			page.onGoCategory(this.id);
		},
		3);
		$("#popup-sections .sub-list-container").on("tap",
		function() {
			$("#popup-sections .sub-list-container").css("left", "23rem");
		});
	}
	var scrollBody = null;
	var currentItem = null;
	var currentContent = "";
	function refreshBodySize() {
		var heightBody = find(".ui-content").height();
		var heightTitle = find(".header").outerHeight();
		find(".contents").height(heightBody - heightTitle);
		splitArticle();
		if (scrollBody != null) {
			scrollBody.refresh();
		}
	}
	function splitArticle() {
		var content = currentContent;
		var jsection1 = find(".section1");
		var jsection2 = find(".section2");
		var jphoto = find(".photo");
		jsection1.html(content);
		var heightTotal = jsection1.height();
		var heightPhoto = jphoto.height();
		var heightAverage = (heightTotal + heightPhoto * 2) / 3;
		jsection2.html("<BR>");
		var heightLine = jsection2.height();
		jsection2.html(""); // count to average
		{
			var parent = jsection1[0];
			var other = jsection2[0];
			var indexSplit = -1;
			var children = [];
			for (var i = 0; i < parent.childNodes.length; i++) {
				var child = parent.childNodes[i];
				children.push(child);
			}
			jsection1.html("");
			for (var i = 0; i < children.length; i++) {
				parent.appendChild(children[i]);
				var height = jsection1.height();
				if (height > heightAverage) {
					indexSplit = i + 1;
					break;
				}
			}
			if (indexSplit >= 0) {
				for (var i = indexSplit; i < children.length; i++) {
					other.appendChild(children[i]);
				}
				var rest = jsection1.height() - heightPhoto - jsection2.height();
				if (rest > 0) {
					var lines = "";
					var c = rest * 2 / heightLine;
					for (var i = 0; i < c; i++) {
						lines += "<BR>";
					}
					jsection2.append(lines);
				}
			}
		}
	}
	function applyArticle(item) {
		var ret = "";
		find(".categoryy").html("&nbsp;" + app.getPage("page-home").getCurrentCategory() + "&nbsp;");
		find(".subcategory").html(item.subCategory.toUpperCase());
		find(".titlee").html(item.title);
		if (item.photo != null) {
			var img = find(".photo img")[0];
			img.src = item.photo.path;
			img.onload = function() { //splitArticle();
			};
			find(".photo .caption").html(item.photo.caption);
		} else {
			var img = find(".photo img")[0];
			img.src = "";
			find(".photo .caption").html("");
		}
		var datePrefix = " ";
		if (item.author != null && item.author != "") {
			find(".author").html("By " + item.author.toUpperCase());
			datePrefix = " | ";
		} else {
			find(".author").html("");
		}
		find(".datee").html(datePrefix + item.articleDate);
		var content = item.story;
		currentContent = content; //splitArticle();
		// DISQUS.reset
		DISQUS.reset({
			reload: true,
			config: function() {
				this.page.url = item.link;
			}
		}); 

		// add dummy wrapper to fix scroll issue.
		DISQUS_TIMER = setInterval(function(){
			$('#disqus_thread').find('#dummy-wrapper').remove().end().prepend('<div id="dummy-wrapper" style="position: absolute;height: 100%;top: 0;width: 100%;left: 0;"></div>');
		}, 1000);

		// remove AdMob Ad View first
		window.plugins.AdMob.removeBannerView();
 
        // AdMob
		window.plugins.AdMob.createBannerView({
			'publisherId': 'ca-app-pub-6199053784584414/3377085517',
			'adSize': 'SMART_BANNER'
		},
		function(e) {
			window.plugins.AdMob.requestAd({
				'isTesting': true,
				'extras': {
					'color_bg': 'ffffff',
					'color_bg_top': 'FFFFFF',
					'color_border': 'eaeaea',
					'color_link': '000080',
					'color_text': '808080',
					'color_url': '008000'
				},
			});
		});
	}
	function setTextSizeFromSetting() {
		var size = 10;
		var textSize = app.data.getFontSize();
		setTextSize(textSize);
	}
	function setTextSize(size) {
		var ja = find(".article");
		ja.removeClass("small");
		ja.removeClass("medium");
		ja.removeClass("big");
		ja.removeClass("huge");
		ja.addClass(size);
	}
	function applyTrendingArticles() {
		var articles = getTrendingArticles();
		var trending = "";
		for(var i=0; i<articles.length; i++) {
			var item = articles[i];
			trending += "<div class='trending-article' id='trending_article_" + i + "'>"
				+ "<div class='photo'><img src='" + item.photo + "' /></div>"
				+ "<div class='category'>" + item.category + "</div>"
				+ "<div class='title'>" + item.title + "</div>"
				+ "</div>";
		}

		$(".trending-articles").html(trending);
	}
})();