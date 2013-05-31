/*
	Res
*/
js2ch.Res = function (thread, no, title, author, mail, date, id, be, text) {
	this.thread = thread;
	this.no = no;
	this.title = title;
	this.author = author;
	this.mail = mail;
	this.date = date;
	this.id = id;
	this.be = be;
	this.org_text = text;
//	this.top = undefined;

	// 投稿者ID
	this.thread.poster(this.id, this.no);

	// レスアンカーの置き換え
	var self = this;
	var $div = $('<div/>')
		.html(text);
	$('a', $div)
		.each(function (i, e) {
			var results = undefined;
			if ((results = $(e).text().match(/^>>([0-9]+)$/)) !== null) {
				var res_no = results[1];
				self.thread.refer(res_no, self.no);
				$(e)
					.attr('href', '#' + res_no)
					.removeAttr('target');
			}
		});
	text = $div.html();
	
	// レス内URLの取得
	this.list_url_info = [];
	var regexp = RegExp(/(\S+):\/\/([^:\/]+)(:(\d+))?(\/[^#\s]*)(#(\S+))?/g);
	var indexes = [];
	var results = undefined;
	while((results = regexp.exec(text)) != null){
		this.list_url_info.push(results);
	}

	// レス内画像URLの取得
	this.list_image = [];
	for(var i = 0; i < this.list_url_info.length; i++) {
		var url = this.list_url_info[i][0];
		var protocol = this.list_url_info[i][1];
		if ((protocol == 'http' || protocol == 'ttp') && url.match(/\.(jpg|jpeg|png|gif)$/i)) {
			if (protocol == 'ttp') {
				url = 'h' + url;
			}
			var inline_image = new js2ch.ResInlineImage(this, this.list_image.length, url);
			this.list_image.push(inline_image);
		}
	}

	// レス内URLを置換する
	var new_text = '';
	var prev_index = 0;
	var $div = $('<div/>')
		.css('padding', '4px 0px 0px 0px');
	for(var i = 0; i < this.list_url_info.length; i++) {
		var url_info = this.list_url_info[i];
		var org_url = url_info[0];
		var domain = url_info[2];
		var protocol = url_info[1];
		var index = url_info.index;
		if (prev_index != index) {
			$div.append(text.substr(prev_index, index - prev_index));
		}
		if (protocol == 'http' || protocol == 'ttp') {
			if (protocol == 'ttp') {
				var real_url = 'h' + org_url;
			} else {
				var real_url = org_url;
			}
			url_info.link = undefined;
			var linked = false;
			/* Youtube、ニコニコ動画、その他外部URLのリンク */
			if (domain === 'www.youtube.com') {
				var results = org_url.match(/v=([0-9a-zA-Z\-_]+)/);
				if (results != null) {
					url_info.link = new js2ch.PopupYoutubeLink(real_url, org_url, results[1]);
					$div.append(url_info.link.createLink());
				}
			} else if (domain === 'youtu.be') {
				var results = org_url.match(/youtu\.be\/([0-9a-zA-Z\-_]+)/);
				if (results != null) {
					url_info.link = new js2ch.PopupYoutubeLink(real_url, org_url, results[1]);
					$div.append(url_info.link.createLink());
				}
			} else if (domain === 'www.nicovideo.jp') {
				var results = org_url.match(/\/(sm[0-9]+)/);
				if (results != null) {
					url_info.link = new js2ch.PopupNicovideoLink(real_url, org_url, results[1]);
					$div.append(url_info.link.createLink());
				}
			}
			if (url_info.link === undefined) {
				url_info.link = new js2ch.PopupOutsideLink(real_url, org_url);
				$div.append(url_info.link.createLink());
			}
		} else {
			$div.append(org_url);
		}
		prev_index = index + org_url.length;
	}
	$div.append(text.substr(prev_index));
	this.text = $div.html();
	
	// レスアンカーをスクロール用に書き換える
	$("a[href^='#']", $div).each(function (i, e) {
		var arr = $(e).attr('href').match(/#([0-9]+)/);
		if (arr == null) return;
		$(e).click(function () {
			var results = $(this).attr('href').match(/#([0-9]+)/);
			self.scrollToRes(parseInt(results[1]));
			return false;
		});
	});
	this.$div = $div;
	this.$cell = undefined;
};

js2ch.Res.prototype.scrollToRes = function (resno) {
	var res = this.thread.list_res[resno - 1];
	if (res) {
		var $thread_div = $('#js2ch_thread .contents .threadtable');
		var scrollY = (res.$cell.offset().top - $thread_div.offset().top) + $thread_div.scrollTop();
		$thread_div.animate({
			scrollTop: scrollY
		}, 500, 'swing');
	}
};

js2ch.Res.prototype.createResLink = function (resno) {
	var self = this;
	$link = $('<a/>')
		.attr('href', '#' + resno)
		.css('padding', '4px 1px')
		.text(">>" + resno)
		.click(function () {
			$('.tooltip').remove();
			var results = $(this).attr('href').match(/#([0-9]+)/);
			self.scrollToRes(parseInt(results[1]));
			return false;
		});
	return $link;
};

js2ch.Res.prototype.createHtmlObject = function () {
	var $cell = $('<td/>');
//	var cell = row.insertCell(-1);
	var self = this;

	if (this.no in this.thread.ref_resno) {
		var ref_count = this.thread.ref_resno[this.no].length;
	} else {
		var ref_count = 0;
	}
	if (this.id in this.thread.map_poster) {
		var post_count = this.thread.map_poster[this.id].length;
	} else {
		var post_count = 0;
	}

	var res_color = 'black';
	if (ref_count > 10) {
		res_color = '#f00';
	} else if (ref_count > 5) {
		res_color = '#a00';
	} else if (ref_count > 0) {
		res_color = '#000';
	}

	var post_class = '';
//	var post_color = 'black';
	if (post_count > 5) {
		post_class = 'poster_heavy';
	} else if (post_count > 2) {
		post_class = 'poster_middle';
	} else if (post_count > 1) {
		post_class = 'poster_light';
	}
	var arr = this.id.split(':');
	var poster_id = arr[1];
	poster_id = poster_id.split('/').join('_');
	poster_id = poster_id.split('+').join('-');

	$reslink = $('<span/>')
		.attr('name', this.no)
		.css('color', res_color)
		.text(this.no);
	if (ref_count > 0) {
		$reslink
			.css('cursor', 'pointer')
			.css('font-weight', 'bold')
			.mouseover(function () {
				$('.tooltip').remove();
				var left = $(this).offset().left;
				var top = $(this).offset().top + 12;

				$(this)
					.bind('mouseout', function () {
						console.log('フェードイン中mouseout');
						$('.tooltip').remove();
					});

				var $link = $(this);
				var timer_id = undefined;
				var $div = $('<div/>')
					.css('top', top)
					.css('left', left)
					.append('参照<br/>')
					.addClass('tooltip')
					.appendTo('body')
					.hide()
					.fadeIn('slow', function () {
						// 表示が完了したら
						$link.unbind('mouseout');
						$link.bind('mouseout', function (event) {
							if (timer_id != undefined) {
								return;
							}
							timer_id = setTimeout(function () {
								console.log('リンクから外れた');
								$('.tooltip').fadeOut('slow', function () {
									$(this).remove();
									timer_id = undefined;
								});
							}, 500);
						});
					})
					.mouseover(function () {
						if (timer_id != undefined) {
							clearTimeout(timer_id);
							timer_id = undefined;
							$link.unbind('mouseout');
						}
						$(this).bind('mouseout', function (event) {
							console.log('mouseout.target', event.target.tagName);
							console.log('mouseout.relatedTarget', event.relatedTarget.tagName);
							if (event.relatedTarget.parentNode === this && event.target === this) {
								return false;
							}
							if (event.relatedTarget === this && event.target.parentNode === this) {
								return false;
							}
							if (event.relatedTarget.parentNode === this && event.target.parentNode === this) {
								return false;
							}
							console.log('ツールチップから外れた');
							$(this).unbind('mouseout');
							$(this).fadeOut('slow', function () {
								$(this).remove();
							});
						});
					});
				for(var i = 0; i < self.thread.ref_resno[self.no].length; i++) {
					var resno = self.thread.ref_resno[self.no][i];
					$div
						.append(self.createResLink(resno))
						.append(' ');
				}

			})
	}
	var post_index = 0;
	var have_post_next = false;
	var post_count = this.thread.map_poster[this.id].length;
	if (post_count > 1) {
		post_index = js2ch.util.array_search(this.no, this.thread.map_poster[this.id]);
		have_post_next = (post_index !== false) && (parseInt(post_index) < (post_count - 1));
		if (have_post_next) {
			var post_next_no = this.thread.map_poster[this.id][parseInt(post_index) + 1];
		}
	}

 
	$cell
//		.width('100%')
		.addClass('res')
		.append($reslink)
		.append(" : " + this.author + " : " + this.date + ' ')
		.append(
			// IDの部分
			$('<span/>')
				.attr('name', this.no)
				.addClass(post_class)
				.addClass('post_id_' + poster_id)
				.css('cursor', (post_count > 1) ? 'pointer' : '')
				.attr('title', (post_count > 1) ? ('' + (parseInt(post_index) + 1) + '回目/' + post_count) + '回中': '')
				.text(this.id)
				.click(function () {
console.log("start");
console.log("self = " + self);
console.log("self.thread.searchPosterId = " + self.thread.searchPosterId);
console.log("poster_id = " + poster_id);
console.log("post_count = " + post_count);
console.log("have_post_next = " + have_post_next);
					if (self.thread.searchPosterId !== poster_id) {
						// 反転解除
						$('.poster_heavy_reverse').removeClass('poster_heavy_reverse');
						$('.poster_middle_reverse').removeClass('poster_middle_reverse');
						$('.poster_light_reverse').removeClass('poster_light_reverse');
						if (post_count > 1) {
							// 反転設定
							$('.' + 'post_id_' + poster_id + '.poster_heavy').addClass('poster_heavy_reverse');
							$('.' + 'post_id_' + poster_id + '.poster_middle').addClass('poster_middle_reverse');
							$('.' + 'post_id_' + poster_id + '.poster_light').addClass('poster_light_reverse');
							// このレスを一番上に移動する
							self.scrollToRes(parseInt(self.no));
						}
						self.thread.searchPosterId = poster_id;
					} else {
						if (post_count > 1 && have_post_next) {
							// 次へ移動する
							self.scrollToRes(parseInt(post_next_no));
						} else {
							// 反転解除
							$('.poster_heavy_reverse').removeClass('poster_heavy_reverse');
							$('.poster_middle_reverse').removeClass('poster_middle_reverse');
							$('.poster_light_reverse').removeClass('poster_light_reverse');
							self.thread.searchPosterId = undefined;
						}
					}
console.log("self.thread.searchPosterId = " + self.thread.searchPosterId);
					return false;
				})
		)
		.append(' ' + this.be + "<br/>")
		.append(this.$div);

	if (this.list_image.length > 0) {
		$cell.append('<br/>');
		for(var i = 0; i < this.list_image.length; i++) {
			this.list_image[i].createHtmlObject().appendTo($cell);
		}
	}
	this.$cell = $cell;
	return $cell;
};

/*
	Res内イメージ
*/
js2ch.ResInlineImage = function (res, index, src) {
	this.res = res;
	this.index = index;
	this.src = src;
//	this.image = undefined;
	this.image_id = 'img_' + this.res.no + '_' + this.index;
	this.div_id = 'divimg_' + this.res.no + '_' + this.index;
	this.link = undefined;
//	this.$div = undefined;
	this.$image = undefined;
	this.$object = undefined;
};

js2ch.ResInlineImage.prototype.createHtmlObject = function () {
	var self = this;
	var $div = $('<div/>')
		.attr('id', this.div_id)
		.addClass('res_inlineimage');

	this.$image = $('<img/>')
		.attr('id', this.image_id)
		.load(function () {
			// 読み込み完了したら、実際に表示されるイメージを作成する
			var h = this.height;
			var w = this.width;
			if (h > w) {
				var hh = 100;
				var ww = Math.floor(100 * w / h);
			} else {
				var hh = Math.floor(100 * h / w);
				var ww = 100;
			}
			
			
			var $inline_image = $('<img/>')
				.width(ww)
				.height(hh)
				.attr('src', self.src)
				.appendTo($div);

			self.link = new js2ch.PopupImageLink($(this));
			self.link.attachLink($inline_image);
			
		})
		.attr('src', this.src);
	return $div;
};
