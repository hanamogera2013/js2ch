/*
	Lightboxのようなもの

*/
js2ch.Lightbox = function () {
};

js2ch.Lightbox.prototype.createBackgroundLayer = function () {
	var $div = $('<div/>')
		.addClass('lightbox')
		.css('position', 'absolute')
		.css('backgroundColor', 'black')
		.css('opacity', 0.75)
		.css('left', js2ch.popup_offset.x)
		.css('top', js2ch.popup_offset.y)
		.css('width', js2ch.popup_size.w)
		.css('height', js2ch.popup_size.h)
		.css('z-index', 10)
		.hide();
	return $div;
};

js2ch.Lightbox.prototype.show = function () {
};

js2ch.Lightbox.prototype.hide = function () {
	$('.lightbox')
		.empty()
		.hide()
		.unbind('click')
		.remove();
};

/*
	外部HTML表示
*/
js2ch.PopupOutsideLink = function (url, text) {
	this.url = url;
	this.text = text;
};

js2ch.PopupOutsideLink.prototype = new js2ch.Lightbox();

js2ch.PopupOutsideLink.prototype.createLink = function () {
	var self = this;
	var $link = $('<a/>')
		.attr('href', this.url)
		.html(this.text)
		.click(function () {
			js2ch.setLightBox(self);
			return false;
		});
	return $link;
};

js2ch.PopupOutsideLink.prototype.createPopup = function () {
	var scale = js2ch.popup_outside_scale;
	var real_width = 500;
	var real_height = 650;
	var $iframe = $('<iframe/>')
		.addClass('lightbox')
		.css('position', 'absolute')
		.css('backgroundColor', '#e8e8e8')
		.css('width', real_width / scale)
		.css('height', real_height / scale)
		.css('left', -(((real_width / scale) - real_width) / 2) + (js2ch.popup_size.w - real_width) / 2 + js2ch.popup_offset.x)
		.css('top', -(((real_height / scale) - real_height) / 2) + (js2ch.popup_size.h - real_height) / 2 + js2ch.popup_offset.y)
		.css('-ms-transform', 'scale(' + scale + ')')
		.css('-moz-transform', 'scale(' + scale + ')')
		.css('-webkit-transform', 'scale(' + scale + ')')
		.css('z-index', 12)
		.hide();
	return $iframe;
};

js2ch.PopupOutsideLink.prototype.createLoading = function() {
	var x = js2ch.popup_offset.x;
	var y = js2ch.popup_offset.y;
	var w = js2ch.popup_size.w;
	var h = js2ch.popup_size.h;
	var $loading = $('<div/>')
		.addClass('loading_circle2')
		.addClass('lightbox');
	$loading
		.appendTo('body')
		.css('left', x + (w - $loading.width()) / 2)
		.css('top', y + (h - $loading.height()) / 2)
		.css('z-index', 11)
		.hide();
	return $loading;
};

js2ch.PopupOutsideLink.prototype.show = function () {
	var self = this;
	var bg = this.createBackgroundLayer();
	this.createBackgroundLayer()
		.click(function () {
			js2ch.removeLightBox();
		})
		.appendTo('body')
		.fadeIn('slow');
	this.createLoading()
		.show();
//		.fadeIn('slow');
	this.createPopup()
		.attr('src', self.url)
		.appendTo('body')
		.load(function () {
			var self = this;
			$('.loading_circle2').fadeOut('fast', function () {
				$(self).fadeIn('slow');
			});
		});
};

/*
	画像表示用
*/
js2ch.PopupImageLink = function ($image) {
	this.$image = $image;
};

js2ch.PopupImageLink.prototype = new js2ch.Lightbox();

js2ch.PopupImageLink.prototype.attachLink = function ($image) {
	var self = this;
	$image
		.css('cursor', 'pointer')
		.click(function () {
			js2ch.setLightBox(self);
			return false;
		});
	
};

js2ch.PopupImageLink.prototype.createPopup = function () {
	var real_width = 500;
	var real_height = 650;
	var border_width = 8;
	var scale = 1;

	var image = this.$image.get(0);
	if (image.width > real_width || image.height > real_height) {
		if ((image.width / real_width) > (image.height / real_height)) {
			var real_height = parseInt(image.height * real_width / image.width);
		} else {
			var real_width = parseInt(image.width * real_height / image.height);
		}
	} else {
		var real_width = image.width;
		var real_height = image.height;
	}

	var $image = $('<img/>')
		.addClass('lightbox')
		.css('position', 'absolute')
		.css('backgroundColor', '#e8e8e8')
		.css('padding', 10)
		.css('width', real_width / scale)
		.css('height', real_height / scale)
		.css('left', -(((real_width / scale) - real_width) / 2) + (js2ch.popup_size.w - real_width) / 2 + js2ch.popup_offset.x - border_width)
		.css('top', -(((real_height / scale) - real_height) / 2) + (js2ch.popup_size.h - real_height) / 2 + js2ch.popup_offset.y - border_width)
		.css('z-index', 12)
		.attr('src', this.$image.attr('src'))
		.hide();
	return $image;
};

js2ch.PopupImageLink.prototype.show = function () {
	var self = this;
	this.createBackgroundLayer()
		.click(function () {
			js2ch.removeLightBox();
		})
		.appendTo('body')
		.fadeIn('slow');
	this.createPopup()
		.appendTo('body')
		.fadeIn('slow');
};

/*
	動画表示用(Youtube)
*/
js2ch.PopupYoutubeLink = function (url, text, movie_id) {
	this.url = url;
	this.text = text;
	this.movie_id = movie_id;
};

js2ch.PopupYoutubeLink.prototype = new js2ch.Lightbox();

js2ch.PopupYoutubeLink.prototype.createLink = function () {
	var self = this;
	var $link = $('<a/>')
		.attr('href', this.url)
		.html(this.text)
		.click(function () {
			js2ch.setLightBox(self);
//			self.show();
			return false;
		});
	return $link;
};

js2ch.PopupYoutubeLink.prototype.createPopup = function () {
	var real_width = 425;
	var real_height = 355;
	var border_width = 8;
	var scale = 1;
	var url = 'http://www.youtube.com/v/' + this.movie_id;

	var $div = $('<div/>')
		.addClass('lightbox')
		.css('position', 'absolute')
		.css('backgroundColor', '#e8e8e8')
		.css('padding', 10)
		.css('width', real_width / scale)
		.css('height', real_height / scale)
		.css('left', -(((real_width / scale) - real_width) / 2) + (js2ch.popup_size.w - real_width) / 2 + js2ch.popup_offset.x - border_width)
		.css('top', -(((real_height / scale) - real_height) / 2) + (js2ch.popup_size.h - real_height) / 2 + js2ch.popup_offset.y - border_width)
		.css('z-index', 12)
		.hide()
		.append(
			$('<object/>')
				.width(real_width)
				.height(real_height)
				.append(
					$('<param/>')
						.attr('name', 'movie')
						.attr('value', url)
				)
				.append(
					$('<embed/>')
						.attr('src', url)
						.attr('type', 'application/x-shockwave-flash')
						.width(real_width)
						.height(real_height)
				)
		);
	return $div;
};

js2ch.PopupYoutubeLink.prototype.show = function () {
	var self = this;
	this.createBackgroundLayer()
		.click(function () {
			js2ch.removeLightBox();
//			self.hide();
		})
		.appendTo('body')
		.fadeIn('slow', function() {
			
		});
	this.createPopup()
		.appendTo('body')
		.show();
};

/*
	動画表示用(ニコニコ動画)
*/
js2ch.PopupNicovideoLink = function (url, text, movie_id) {
	this.url = url;
	this.text = text;
	this.movie_id = movie_id;
	this.width = 320;
	this.height = 320;
};

js2ch.PopupNicovideoLink.prototype = new js2ch.Lightbox();

js2ch.PopupNicovideoLink.prototype.createLink = function () {
	var self = this;
	var $link = $('<a/>')
		.attr('href', this.url)
		.html(this.text)
		.click(function () {
			js2ch.setLightBox(self);
//			self.show();
			return false;
		});
	return $link;
};

js2ch.PopupNicovideoLink.prototype.getUrl = function () {
	var real_width = this.width;
	var real_height = this.height;
	var url = 'http://ext.nicovideo.jp/thumb_watch/' + this.movie_id + '?w=' + real_width + '&h=' + real_height;
	return url;
};

js2ch.PopupNicovideoLink.prototype.createPopup = function () {
	var real_width = this.width;
	var real_height = this.height;
	var border_width = 8;
	var scale = 1;

	var $div = $('<div/>')
		.addClass('lightbox')
		.addClass('div_nicoplayer')
		.css('position', 'absolute')
		.css('backgroundColor', '#e8e8e8')
		.css('padding', 10)
		.css('width', real_width / scale)
		.css('height', real_height / scale)
		.css('left', -(((real_width / scale) - real_width) / 2) + (js2ch.popup_size.w - real_width) / 2 + js2ch.popup_offset.x - border_width)
		.css('top', -(((real_height / scale) - real_height) / 2) + (js2ch.popup_size.h - real_height) / 2 + js2ch.popup_offset.y - border_width)
		.css('z-index', 12)
		.hide();
//		.append(script);
/*
	var $script = $('<script/>')
		.attr('type', 'text/javascript')
		.attr('src', url)
		.appendTo($div);
*/
	return $div;
};

js2ch.PopupNicovideoLink.prototype.show = function () {
	var self = this;
	this.createBackgroundLayer()
		.click(function () {
			js2ch.removeLightBox();
//			self.hide();
		})
		.appendTo('body')
		.fadeIn('slow', function() {
			
		});

	var $popup = this.createPopup();
	var popup = $popup.get(0);

	document._write = document.write;
	document.write = function (s) {
		document.write = document._write;
		$('.div_nicoplayer').html(s);
	};
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = this.getUrl();
	popup.appendChild(script);
	$('body').get(0).appendChild(popup);

	$popup.show();
};
