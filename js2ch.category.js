/*
	カテゴリー
*/
js2ch.Category = function (menu, id, name) {
	this.menu = menu;
	this.id = id;
	this.menusubitem_id = 'menusubitem_' + id;
	this.name = name;
	this.list_bbs = [];
	this.cache = {};
};

js2ch.Category.prototype.changeId = function (id) {
	this.id = id;
	this.menusubitem_id = 'menusubitem_' + id;
};

js2ch.Category.prototype.add = function (bbs) {
	this.list_bbs.push(bbs);
	this.cache[bbs.name] = bbs;
};

js2ch.Category.prototype.clear = function () {
	this.list_bbs = [];
};

js2ch.Category.prototype.find = function (bbs_name) {
	for(var i = 0; i < this.list_bbs.length; i++) {
		if (this.list_bbs[i].name === bbs_name) return this.list_bbs[i];
	}
};

js2ch.Category.prototype.createHtmlObject = function () {
	var self = this;
	$div = $('<div/>')
		.html(this.name)
		.attr('id', this.menusubitem_id)
		.css('cursor', 'pointer')
		.click(function () {
			self.showExpand();
		});
	return $div;
};

js2ch.Category.prototype.showExpand = function () {
	js2ch.current_category = this;

	// 影付きのセルをもとに戻す
	$('.menu_cell_row_shadow')
		.removeClass('menu_cell_row_shadow');
	// 選択状態のセルをもとに戻す
	$('.menu_cell_select')
		.addClass('menu_cell_border')
		.removeClass('menu_cell_select')
		.removeClass('menu_cell_select_border');
	// BBS一覧の行を削除
	$('.bbs_row').remove();

	// セルを選択状態にする
	var $cell = $('#' + this.menusubitem_id).parents('td').eq(0);
	$cell
		.addClass('menu_cell_select')
		.removeClass('menu_cell_border')
		.addClass('menu_cell_select_border');

	// 選択セルの行のセルに影をつける(選択状態のセルは別途)
	var cell = $cell.get(0);
	var $row = $('#' + this.menusubitem_id).parents('tr').eq(0);
	$('td', $row).each(function (i, e) {
		if (e === cell) return;
		$(e).addClass('menu_cell_row_shadow');
	});

	// BBS一覧のセルの作成
	var $new_row = $('<tr/>')
		.insertAfter($row)
		.addClass('bbs_row');

	var $new_cell = $('<td/>')
		.addClass('menu_bbs_border')
		.addClass('menu_cell_bbs')
		.attr('colSpan', js2ch.COLS_MENU)
		.appendTo($new_row);

	// BBS一覧の作成
	var $div = $('<div/>');
	for(var i = 0; i < this.list_bbs.length; i++) {
		this.list_bbs[i].createHtmlObject()
			.hover(function () {
					$(this).addClass('menu_item_hover');
				},
				function () {
					$(this).removeClass('menu_item_hover');
				}
			)
			.appendTo($div);
	}
	$div
		.css('padding', 0)
		.appendTo($new_cell)
		.hide()
		.animate(
			{height: 'show'},
			{duration: "normal", easing: "swing"}
		);
};
