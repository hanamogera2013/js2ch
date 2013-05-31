
js2ch.History = function (bbs_name, thread_dat, responseText, thread_title, res_count, position, data, lastdate) {
	this.bbs_name = bbs_name;
	this.thread_dat = thread_dat;
	this.thread_title = thread_title;
	this.responseText = responseText;
	this.res_count = res_count;
	this.position = position;
	this.lastdate = lastdate;
	
	this.key = bbs_name + "\t" + thread_dat;
};

js2ch.History.prototype.createHtmlObject = function () {
	var self = this;
	var is_update = false;
	var res_count = this.res_count;
	do {
		var bbs = js2ch.menu.findBbs(this.bbs_name);
		if (!bbs) break;
		var thread = bbs.find(this.thread_dat);
		if (!thread) break;
		if (this.res_count >= thread.count) break;
		res_count = thread.count;
		is_update = true;
	} while(false);
	
	var $row = $('<tr/>')
		.css('cursor', 'pointer')
		.hover(function () {
				$(this).addClass('bbs_row_hover');
			},
			function () {
				$(this).removeClass('bbs_row_hover');
			}
		)
		.append(
			$('<td/>')
				.append(
					$('<div/>')
						.css('white-space', 'nowrap')
						.css('text-overflow', 'ellipsis')
						.css('overflow', 'hidden')
						.css('text-align', 'center')
						.text(this.bbs_name)
				)
		)
		.append(
			$('<td/>')
				.append(
					$('<div/>')
						.css('white-space', 'nowrap')
						.css('text-overflow', 'ellipsis')
						.css('overflow', 'hidden')
						.css('text-align', 'left')
						.attr('title', this.thread_title)
						.html('' + (is_update ? '<b>' : '') + this.thread_title + (is_update ? '</b>' : ''))
				)
		)
		.append(
			$('<td/>')
				.css('text-align', 'right')
				.text(res_count)
		)
		.click(function () {
			var bbs = js2ch.menu.findBbs(self.bbs_name);
			if (!bbs) return;
			var thread = bbs.find(self.thread_dat);
			if (!thread) return;
			thread.load(false);
		});
	return $row;
};

/*
	History List
*/
js2ch.HistoryList = function () {
	this.map_history = {};
};

js2ch.HistoryList.prototype.add = function (history_obj) {
	while (js2ch.util.array_count(this.map_history) >= js2ch.KEEP_THREAD) {
		for (var key in this.map_history) {
			delete this.map_history[key];
			break;
		}
	}
	if (history_obj.key in this.map_history) {
		delete this.map_history[history_obj.key];
	}
	this.map_history[history_obj.key] = history_obj;
};

js2ch.HistoryList.prototype.getList = function () {
	var list = [];
	for (var key in this.map_history) {
		list.push(this.map_history[key]);
	}
	return list.reverse();
};


js2ch.HistoryList.prototype.clear = function () {
	this.map_history = {};
};

js2ch.HistoryList.prototype.find = function (bbs_name, thread_dat) {
	var key = "" + bbs_name + "\t" + thread_dat;
	return this.map_history[key];
};

