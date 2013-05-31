//<?

/* xdomainajaxのSQLを変更する。フックするので、jquery.xdomainajax.jsよりも早くロードしてね */
jQuery.ajax = (function(_ajax){
	return function(o) {
		/*
        'select * from html where url="{URL}" and xpath="*"'
        ↓
        'select * from html where url="{URL}" and charset="shift_jis" and xpath="*"'
		*/
		o.data.q = o.data.q.replace('and xpath', 'and compat="html5" and charset="shift_jis" and xpath');
		return _ajax.apply(this, arguments);
	};
})(jQuery.ajax);

js2ch = (function () {
	return {
		URL_MENU : "http://menu.2ch.net/bbsmenu.html",
		COLS_MENU : 6,
		KEEP_THREAD : 100,
		menu : undefined,
		div_menu : undefined,
		div_bbs : undefined,
		div_thread : undefined,
		list_history: undefined,

		current_menu : undefined,
		current_category : undefined,
		current_bbs : undefined,
		current_thread : undefined,
		current_lightbox : undefined,

		util : {},
		popup_offset : {x:0, y:0},
		popup_size : {w:0, hy:0},
		popup_outside_scale : 0,
		
		timer_id1 : undefined,
		timer_id2 : undefined,
		timer_id3 : undefined,
		__PROP_END__ : null
	};
})();

js2ch.init = function (opt) {
	js2ch.popup_offset.x = opt.popupLeft;
	js2ch.popup_offset.y = opt.popupTop;
	js2ch.popup_size.w = opt.popupWidth;
	js2ch.popup_size.h = opt.popupHeight;
console.log("js2ch.popup_offset.x = " + js2ch.popup_offset.x);
console.log("js2ch.popup_offset.y = " + js2ch.popup_offset.y);
console.log("js2ch.popup_size.w = " + js2ch.popup_size.w);
console.log("js2ch.popup_size.h = " + js2ch.popup_size.h);
	js2ch.popup_outside_scale = opt.outsideScale;

	js2ch.div_menu = opt.divMenu;
	js2ch.div_bbs = opt.divBbs;
	js2ch.div_thread = opt.divThread;
console.log("js2ch.popup_outside_scale = " + js2ch.popup_outside_scale);
console.log("js2ch.div_menu = " + js2ch.div_menu);
console.log("js2ch.div_bbs = " + js2ch.div_bbs);
console.log("js2ch.div_thread = " + js2ch.div_thread);

	js2ch.list_history = new js2ch.HistoryList();
	js2ch.menu = new js2ch.Menu();
	js2ch.menu.load(false);
};

js2ch.setLightBox = function(lightbox) {
	js2ch.removeLightBox();
	js2ch.current_lightbox = lightbox;
	js2ch.current_lightbox.show();
};

js2ch.removeLightBox = function() {
	if (js2ch.current_lightbox) {
		js2ch.current_lightbox.hide();
	}
	js2ch.current_lightbox = undefined;
};

js2ch.util.array_count = function (arr) {
	var count = 0;
	for(var i in arr) count++;
	return count;
};

js2ch.util.array_search = function (needle, haystack, strict) {
	if (strict) {
		for(var i in haystack) {
			if (needle === haystack[i]) {
				return i;
			}
		}
	} else {
		for(var i in haystack) {
			if (needle == haystack[i]) {
				return i;
			}
		}
	}
	return false;
};

js2ch.util.showLoadingCircle = function ($contents) {
	$('<div/>')
		.css('position', 'relative')
		.css('width', $contents.width())
		.css('height', $contents.height())
		.css('display', 'table-cell')
		.css('vertical-align', 'middle')
		.addClass('loading_circle')
		.appendTo($contents)
		.append(
			$('<div/>')
				.addClass('loading_animation')
		);
};

js2ch.util.hideLoadingCircle = function () {
	$('.loading_circle')
		.remove();
}
//?>