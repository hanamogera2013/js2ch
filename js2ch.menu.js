/*
	メニュー
*/
js2ch.Menu = function () {
	this.list_category = [];
	this.cache = {};
};

js2ch.Menu.prototype.add = function (category) {
	this.list_category.push(category);
	this.cache[category.name] = category;
};

js2ch.Menu.prototype.clear = function () {
	this.list_category = [];
};

js2ch.Menu.prototype.find = function (category_name) {
	for(var i = 0; i < this.list_category.length; i++) {
		if (this.list_category[i].name === category_name) return this.list_category[i];
	}
};

js2ch.Menu.prototype.read = function (responseText, callback) {
	this.clear();
	var self = this;
	var index = 0, index2 = 0;
	var arr = responseText.replace(/(\r\n|\r|\n)/g, '').match(/<body[^>]*>(.*)<\/body>/);
	var body = "<div>" + arr[1] + "</div>";
	$(body).find('b').each(function(i, e) {
		var catname = e.innerHTML;
		if (catname in self.cache) {
			var category = self.cache[catname];
			category.changeId(index);
			category.clear();
		} else {
			var category = new js2ch.Category(self, index, catname);
		}
		self.add(category);
		index++;
		while((e = e.nextSibling) != undefined) {
			if (!e.tagName) continue;
			switch(e.tagName.toUpperCase()) {
			case "A":
				var bbsname = e.innerHTML;
				if (bbsname in category.cache) {
					var bbs = category.cache[bbsname];
					bbs.changeId(index2, e.href);
				} else {
					var bbs = new js2ch.Bbs(category, index2, bbsname, e.href);
				}
				category.add(bbs);
				index2++;
				break;
			case "B":
				return;
			}
		}
	});
	if (callback) callback();
};

js2ch.Menu.prototype.save = function (data) {
	var ls = window.localStorage;
	ls.setItem("js2ch.menu.data", data);
};

js2ch.Menu.prototype.load = function (force) {
	this.hide();
	$('#js2ch_menu .title')
		.css('cursor', '')
		.unbind('click');
	var self =this;
	do {
		if (!force) {
			var ls = window.localStorage;
			var data = ls.getItem("js2ch.menu.data");
			if (data) {
				this.read(data, function() {
					self.show();
				});
				break;
			}
		}

		js2ch.util.showLoadingCircle($('#js2ch_menu .contents'));
		this.loadFromUrl(function () {
			js2ch.util.hideLoadingCircle();
			self.show();
		});
	} while(false);
};

js2ch.Menu.prototype.loadFromUrl = function (callback) {
	var self = this;
console.log('MENU loading (' + js2ch.URL_MENU + ')');
	$.ajax({
		url: js2ch.URL_MENU,
		type: 'GET',
		async: true,
		success: function (res) {
			self.read(res.responseText, function () {
				self.save(res.responseText);
				if (callback) callback();
			});
		}
	});
};

js2ch.Menu.prototype.show = function () {
	var self = this;
	js2ch.current_menu = this;
	// タイトル
	$('#js2ch_menu .title')
		.text('カテゴリ一覧')
		.css('cursor', 'pointer')
		.click(function () {
			self.load(true);
		});

	// カテゴリ一覧の作成
	var $table = $('<table/>')
		.addClass('menu_table')
		.appendTo('#js2ch_menu .contents');

	var $colgroup = $('<colgroup/>')
		.appendTo($table);
	for(var i = 0; i < js2ch.COLS_MENU; i++) {
		$('<col/>')
			.css('width', 100)
			.appendTo($colgroup);
	}
	
	// js2ch.COLS_MENU分の列を作成
	for(var i = 0; i < this.list_category.length; i++) {
		if ((i % js2ch.COLS_MENU) == 0) {
			var $row = $('<tr/>').appendTo($table);
		}
		var $cell = $('<td/>')
			.addClass('menu_cell_border')
			.append(this.list_category[i].createHtmlObject())
			.appendTo($row);
	}
};

js2ch.Menu.prototype.findBbs = function (bbs_name) {
	var bbs = undefined;
	for(var i = 0; i < this.list_category.length; i++) {
		if (bbs = this.list_category[i].find(bbs_name)) {
			return bbs;
		}
	}
};

js2ch.Menu.prototype.hide = function () {
	$('#js2ch_menu .contents').empty(); // 子要素を全て削除
};

