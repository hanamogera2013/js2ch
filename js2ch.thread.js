/*
	Thread
*/
js2ch.Thread = function (bbs, datname, title, count, url) {
	var results = undefined;
	if ((results = datname.match(/^([0-9]+)\.dat$/)) !== null) {
		this.id = results[1];
	} else {
		this.id = datname;
	}
	this.bbs = bbs;
	this.datname = datname;
	this.url = url;
	this.title = title;
	this.count = count;
	this.read_count = -1;
	this.list_res = [];
	this.scrollY = undefined;
	this.bbs_row_id = 'bbs_row_' + this.id;
//	this.$row = undefined;
//	this.$div = undefined;
	this.ref_resno = {};
	this.map_poster = {};
	this.data = undefined;
	this.searchPosterId = undefined;

	// メニューオブジェクトの作成
	this.menu = new js2ch.ThreadMenu(this);
	this.menuItemHistory = new js2ch.ThreadMenuItem(0, this.menu, '履歴');
	this.menuItemWrite = new js2ch.ThreadMenuItem(1, this.menu, '投稿');
	this.menuItemReload = new js2ch.ThreadMenuItem(2, this.menu, '更新');

	this.menuItemHistory.assignFrame(new js2ch.ThreadHistory(this.menuItemHistory));
	this.menuItemWrite.assignFrame(new js2ch.ThreadResForm(this.menuItemWrite));

	this.menu
		.add(this.menuItemHistory)
		.add(this.menuItemWrite)
		.add(this.menuItemReload);
};

js2ch.Thread.prototype.add = function (res) {
	this.list_res.push(res);
};

js2ch.Thread.prototype.update = function () {
	this.menu.update();
};

js2ch.Thread.prototype.refer = function (to_resno, from_resno) {
	if (!(to_resno in this.ref_resno)) {
		this.ref_resno[to_resno] = [];
	}
	this.ref_resno[to_resno].push(from_resno);
};

js2ch.Thread.prototype.poster = function (id, resno) {
	if (!(id in this.map_poster)) {
		this.map_poster[id] = [];
	}
	this.map_poster[id].push(resno);
};

js2ch.Thread.prototype.clear = function () {
	this.list_res = [];
	this.ref_resno = {};
	this.map_poster = {};
};

js2ch.Thread.prototype.updateRow = function () {
	this.count = this.read_count;
	if (this.list_res.length > 0) {
		$('#' + this.bbs_row_id).addClass('reading_bbs_row');
	}
	$('#' + this.bbs_row_id + ' .title_cell div')
		.attr('title', this.title)
		.text(this.title);
	$('#' + this.bbs_row_id + ' .count_cell').text(this.read_count);
};

js2ch.Thread.prototype.updateSign = function () {
	// ブリンクアニメーションは、CSS3で実現
	$('#js2ch_thread .title')
		.removeClass('blink_animation');
	setTimeout(function () {
		$('#js2ch_thread .title')
			.addClass('blink_animation');
	}, 1)
};

js2ch.Thread.prototype.createHtmlObject = function (index) {
	var self = this;
	var $row = $('<tr/>')
		.attr('id', this.bbs_row_id);
	if (this.list_res.length > 0) {
		$row.addClass('reading_bbs_row');
	}
	$row
		.append(
			$('<td/>')
				.addClass('index_cell')
				.text(index + 1)
		)
		.append(
			$('<td/>')
				.addClass('title_cell')
				.append(
					$('<div/>')
						.css('white-space', 'nowrap')
						.css('text-overflow', 'ellipsis')
						.css('overflow', 'hidden')
						.attr('title', this.title)
						.text(this.title)
				)
				.css('cursor', 'pointer')
				.hover(function () {
						$(this).addClass('bbs_row_hover');
					},
					function () {
						$(this).removeClass('bbs_row_hover');
					}
				)
				.click(function () {
					self.load(false);
				})
		)
		.append(
			$('<td/>')
				.addClass('count_cell')
				.text(this.count)
		);
	return $row;
};

js2ch.Thread.prototype.load = function (force) {
	var self = this;
	$('.select_bbs_row').removeClass('select_bbs_row');
	$('#' + this.bbs_row_id).addClass('select_bbs_row');
	this.hide();
	this.changeTitle();
	$('#js2ch_thread .title')
		.css('cursor', '')
		.unbind('click')
		;
	do {
		if (!force) {
			var h = undefined;
			if (h = js2ch.list_history.find(this.bbs.name, this.datname)) {
				if (h.res_count >= this.count) {
					// 履歴から読み込む
					this.read(h.responseText, function () {
						self.updateRow();
						self.show();
					});
					break;
				}
			}
		}

		var org_count = this.read_count;
		js2ch.util.showLoadingCircle($('#js2ch_thread .contents'));
		this.loadFromUrl(function () {
			js2ch.util.hideLoadingCircle();
			self.updateRow();
			self.show();
			if (org_count != self.read_count) {
				self.updateSign();
			}
		});
	} while(false);
};

js2ch.Thread.prototype.read = function (responseText, callback) {
	this.clear();

	var index1 = responseText.search(/<body>/m);
	var index2 = responseText.search(/<\/body>/m);
	if (index1 >=0 && index2 >= 0) {
		var text = responseText.substr(index1 + 6, index2 - (index1 + 6));
		text = text.replace(/<b>/g, "");
		text = text.replace(/<\/b>/g, "");
		text = text.replace(/<b\/>/g, "");

		var no = undefined;
		var lines = text.split(/(\r\n|\n|\r)/);
		for(var i in lines) {
			var text = lines[i];
			if (text.match(/^\s*$/)) continue;

			var index = text.search(/&lt;&gt;/m);
			if (index < 0) {
				console.log("format error text=(" + text + ")");
			}
			var author = text.substr(0, index).replace(/(^\s+)|(\s+$)/g, ""); // トリム
			text = text.substr(index + 8);

			var index = text.search(/&lt;&gt;/m);
			if (index < 0) {
				console.log("format error text=(" + text + ")");
			}
			var mail = text.substr(0, index).replace(/(^\s+)|(\s+$)/g, ""); // トリム
			text = text.substr(index + 8);

			var index = text.search(/&lt;&gt;/m);
			if (index < 0) {
				console.log("format error text=(" + text + ")");
			}
			var deleted_text = "";
			var date_id = text.substr(0, index).replace(/(^\s+)|(\s+$)/g, ""); // トリム
			var v = date_id.split(/ +/);
			if (v.length == 3) {
				var date = v[0] + " " + v[1];
				var id = v[2];
				var be = "";
			} else if (v.length == 4) {
				var date = v[0] + " " + v[1];
				var id = v[2];
				var be = v[3];
			} else if (v.length == 5) {
				var date = v[0] + " " + v[1];
				var id = v[2];
				var be = v[3] + " " + v[4];
			} else if (v.length == 2) {
				// 「うふ～ん」はこうだった
				var date = "";
				var id = v[1];
				var deleted_text = v[0];
				console.log("May be deleted (" + date_id + ")");
				var deleted_text = deleted_text + "&lt;&gt;";
			} else {
				console.log("format error date_id=(" + date_id + ")");
			}
			text = text.substr(index + 8);

			if (this.list_res.length == 0) {
				var index = text.search(/&lt;&gt;/m);
				if (index < 0) {
					console.log("format error text=(" + text + ")");
				}
				var res_text = text.substr(0, index).replace(/(^\s+)|(\s+$)/g, ""); // トリム
				text = text.substr(index + 8);
			} else {
				var index = text.search(/&lt;&gt;$/m);
				if (index < 0) {
					console.log("format error text=(" + text + ")");
				}
				var res_text = text.substr(0, index).replace(/(^\s+)|(\s+$)/g, ""); // トリム
				text = text.substr(index + 8);
			}
			
			if (text.substr(0, this.title.length) == this.title) {
				var title = text.substr(0, this.title.length);
				var text = text.substr(this.title.length);
			} else if (deleted_text.length > 0 && text.substr(0, deleted_text.length) == deleted_text) {
				// 「うふ～ん」はこうだった
				var title = text.substr(0, deleted_text.length);
				var text = text.substr(deleted_text.length);
			} else {
				var title = "";
			}

			var no = this.list_res.length + 1;
			var res = new js2ch.Res(this, no, title, author, mail, date, id, be, res_text);
			this.add(res);
		}
		this.read_count = this.list_res.length;
	}
	// 履歴に追加
	var h = new js2ch.History(this.bbs.name, this.datname, responseText, this.title, this.read_count, new Date());
	js2ch.list_history.add(h);
	if (callback) callback();
}

js2ch.Thread.prototype.loadFromUrl = function (callback) {
//	this.clear();
	
	var self = this;
	var org_count = this.count;
console.log('Thread loading (' + this.url + "dat/" + this.datname + ')');
	$.ajax({
		url: this.url + "dat/" + this.datname,
		type: 'GET',
		async: true,
		success: function (data, textStatus) {
			self.read(data.responseText, callback);
		}
	});
};

js2ch.Thread.prototype.show = function () {
	js2ch.current_thread = this;

	var self = this;
	this.hide();
	this.changeTitle();

	this.menu.createMenu();
	// メニューに関連づいているフレームを作成
	this.menu.createFrames();
	// メニューにイベントを貼り付ける
	this.menuItemReload.setClickEvent(function () {
		self.load(true);
	});
	
	var $div = $('<div/>')
		.addClass('threadtable')
		.width('100%')
		.height('100%')
		.css('overflow', 'auto')
		.scroll(function () {
			self.scrollY = $(this).scrollTop();
		})
		.appendTo('#js2ch_thread .contents');

	var $table = $('<table/>')
		.width('100%')
		.appendTo($div)
		.append(
			$('<colgroup/>')
				.append($('<col/>').css('width', 1))
				.append($('<col/>').css('width', '*'))
				.append($('<col/>').css('width', 1))
		);
	
	for(var i = 0; i < this.list_res.length; i++) {
		$('<tr/>')
			.appendTo($table)
			.append('<td/>')
			.append(this.list_res[i].createHtmlObject())
			.append('<td/>');
	}
	if (this.scrollY !== undefined) {
		$div.scrollTop(this.scrollY);
	} else {
		$div.scrollTop(0);
	}
};

js2ch.Thread.prototype.hide = function () {
	$('.writeform_frame').remove();
	$('#js2ch_thread .contents').empty(); // 子要素を全て削除
};

js2ch.Thread.prototype.changeTitle = function () {
	$('#js2ch_thread .title').text(this.title);
};
