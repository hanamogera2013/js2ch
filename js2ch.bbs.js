/*
	BBS
*/
js2ch.Bbs = function (category, id, name, url) {
	this.id = id;
	this.category = category;
	this.name = name;
	this.url = url;
	this.list_thread = [];
//	this.$div = undefined;
	this.bbsitem_id = 'bbsitem_' + this.id;
	this.cache = {};
};

js2ch.Bbs.prototype.changeId = function (id, url) {
	this.id = id;
	this.bbsitem_id = 'bbsitem_' + this.id;
	this.url = url;
};

js2ch.Bbs.prototype.add = function (thread) {
	this.list_thread.push(thread);
	this.cache[thread.datname] = thread;
};

js2ch.Bbs.prototype.clear = function () {
	this.list_thread = [];
};

js2ch.Bbs.prototype.find = function (thread_datname) {
	for(var i = 0; i < this.list_thread.length; i++) {
		if (this.list_thread[i].datname === thread_datname) return this.list_thread[i];
	}
};

js2ch.Bbs.prototype.createHtmlObject = function () {
	var self = this;
	$div = $('<div/>')
		.addClass('bbs_item')
		.css('cursor', 'pointer')
		.attr('id', this.bbsitem_id)
		.html("・" + this.name)
		.click(function () {
			self.load();
		});
	return $div;
};

js2ch.Bbs.prototype.load = function () {
	var self = this;
	$('#js2ch_bbs .title')
		.css('cursor', '')
		.unbind('click');
	$('.select_bbs_item').removeClass('select_bbs_item'); // 選択中をもとに戻す
	$('#' + this.bbsitem_id).addClass('select_bbs_item'); // 選択中にする
	this.hide();
	this.changeTitle();
	js2ch.util.showLoadingCircle($('#js2ch_bbs .contents'));
	this.loadFromUrl(function () {
		js2ch.util.hideLoadingCircle();
		self.show();
		if (js2ch.current_thread) js2ch.current_thread.update();
	});
};

js2ch.Bbs.prototype.loadFromUrl = function (callback) {
	this.clear();
	
	var self = this;
console.log('BBS loading (' + this.url + "subject.txt" + ')');
	$.ajax({
		url: this.url + "subject.txt",
		type: 'GET',
		async: true,
		success: function (data, textStatus) {
			var arr = data.responseText.replace(/(\r\n|\r|\n)/g, '').match(/<body[^>]*>(.*)<\/body>/);
			var text = arr[1];
			if (true) {
/*			
			var index1 = data.responseText.search(/<p>/m);
			var index2 = data.responseText.search(/<\/p>/m);
			if (index1 >=0 && index2 >= 0) {
				var text = data.responseText.substr(index1 + 3, index2 - (index1 + 3));
*/
				var regexp =RegExp(/[0-9]+\.dat&lt;&gt;/g);
				var arr=new Array();
				var indexes = [];
				while((arr = regexp.exec(text)) != null){
					indexes.push(arr.index);
				}
				for(var i = 0; i < indexes.length; i++) {
					if (indexes[i + 1] !== undefined) {
						var line = text.substr(indexes[i], indexes[i + 1] - indexes[i]);
					} else {
						var line = text.substr(indexes[i]);
					}
					var v = line.split(/&lt;&gt;/);
					if (v.length == 2) {
						var datname = v[0].replace(/(^\s+)|(\s+$)/g, ""); // トリム
						var title = v[1].replace(/(^\s+)|(\s+$)/g, ""); // トリム
						var count = 0;
						var results = title.match(/\(([0-9]+)\)\s*$/);
						if (results !== null) {
							count = parseInt(results[1]);
							title = title.substr(0, title.length - results[0].length);
							title = title.replace(/(^\s+)|(\s+$)/g, ""); // トリム
						}
						if (datname in self.cache) {
							var thread = self.cache[datname];
							thread.count = count;
						} else {
							var thread = new js2ch.Thread(self, datname, title, count, self.url);
						}
						self.add(thread);
					} else {
						console.log("format error");
						return;
					}
				}
			}
			if (callback) callback();
		}
	});
};

js2ch.Bbs.prototype.show = function () {
	js2ch.current_bbs = this;

	var self = this;
	this.hide();
	this.changeTitle();
	$('#js2ch_bbs .title')
		.css('cursor', 'pointer')
		.click(function () {
			self.load(true);
		});

	var $contents = $('#js2ch_bbs .contents');
	var $div = $('<div/>')
		.width('100%')
		.height('100%')
		.css('overflow', 'auto')
		.appendTo($contents);
	
	// テーブルの作成
	var $table = $('<table/>')
		.width('100%')
		.addClass('bbs_table')
		.appendTo($div)
		.append(
			$('<colgroup/>')
				.append($('<col/>').css('width', 32))
				.append($('<col/>').css('width', '*'))
				.append($('<col/>').css('width', 32))
		);
	for(var i = 0; i < this.list_thread.length; i++) {
		this.list_thread[i].createHtmlObject(i).appendTo($table);
	}

	// 奇数行、偶数行の装飾
	$('tr:odd', $table).addClass('bbs_odd_line');
	$('tr:even', $table).addClass('bbs_even_line');

	$div.scrollTop(0);
};

js2ch.Bbs.prototype.hide = function () {
	$('#js2ch_bbs .contents').empty(); // 子要素を全て削除
};

js2ch.Bbs.prototype.changeTitle = function () {
	$('#js2ch_bbs .title').html(this.name);
};
