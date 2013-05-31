/*
	Thread Menu
*/
js2ch.ThreadMenu = function (thread) {
	this.thread = thread;
	this.items = [];
//	this.$div = undefined;
	this.menu_height = undefined;
	this.is_opened = false;
	this.open_menu_item = undefined;
};

js2ch.ThreadMenu.prototype.update = function () {
	for(var i = 0; i < this.items.length; i++) {
		this.items[i].update();
	}
};

js2ch.ThreadMenu.prototype.add = function (menuitem) {
	this.items.push(menuitem);
	return this;
};

js2ch.ThreadMenu.prototype.open = function () {
	var self = this;
	var h = this.menu_height;
	// scrollTopを指定するためには、初期状態を表示してやる必要がある
	$('.threadmenu')
		.css('height', 1)
		.css('top', 1)
		.css('margin-top', -1)
		.show()
		.scrollTop(h - 1)
		.animate(
			{height:h, top:h, marginTop:-h, scrollTop:0},
			{duration: "normal", easing: "swing",
			 complete: function () {
			 	 self.is_opened = true;
			 }
			}
		);
};

js2ch.ThreadMenu.prototype.close = function () {
	var self = this;
	var h = this.menu_height;
	$('.threadmenu')
		.scrollTop(0)
		.animate(
			{height:'hide', top:0, marginTop:0, scrollTop:h},
			{duration: "normal", easing: "swing",
			 complete: function () {
			 	 self.is_opened = false;
			 }
			}
		);
};

js2ch.ThreadMenu.prototype.createMenu = function () {
	var self = this;
	$('.threadmenu').remove();
	this.current_frame = undefined;
	this.is_opened = false;

	var $title = $('#js2ch_thread .title');
	var $contents = $('#js2ch_thread .contents');

	$title.unbind('click');
	var $div = $('<div/>')
		.addClass('threadmenu')
		.css('position', 'relative')
		.css('left', 0)
		.css('top', 0)
		.css('margin-top', 0)
		.css('width', '100%')
		.css('border', 'none')
		.css('padding', 'none')
		.css('background-color', 'gray')
		.css('z-index', '30')
		.css('overflow', 'hidden')
		.css('-moz-box-sizing', 'border-box')
		.css('-webkit-box-sizing', 'border-box')
		.css('-ms-box-sizing', 'border-box')
		.css('box-sizing', 'border-box')
		.hide()
		.appendTo($contents);
	for(var i = 0; i < this.items.length; i++) {
		this.items[i].createMenuItem().appendTo($div);
	}
	this.menu_height = $('.threadmenu').height();
	$title
		.css('cursor', 'pointer')
		.bind('click', function () {
			if (!self.is_opened) {
				self.open();
			} else {
				if (self.open_menu_item !== undefined) {
					self.open_menu_item.close(function () {
						self.close();
					});
				} else {
					self.close();
				}
			}
		});
};

js2ch.ThreadMenu.prototype.createFrames = function () {
	var $contents = $('#js2ch_thread .contents');
	for(var i = 0; i < this.items.length; i++) {
		var $frame = this.items[i].createFrame();
		if ($frame) {
			$frame.appendTo($contents);
		}
	}
};

/*
	Thread Menu Item
*/
js2ch.ThreadMenuItem = function (id, menu, title) {
	this.id = id;
	this.menu = menu;
	this.title = title;
//	this.$div = undefined;
	this.threadmenuitem_id = 'threadmenuitem_id_' + this.id;
	this.is_opened = undefined;
	this.assignedFrame = undefined;
};

js2ch.ThreadMenuItem.prototype.update = function () {
	if (this.assignedFrame) {
		this.assignedFrame.update();
	}
};

js2ch.ThreadMenuItem.prototype.createMenuItem = function () {
	var w = Math.floor(60 / this.title.length);
	var $div = $('<div/>')
		.attr('id', this.threadmenuitem_id)
		.css('float', 'left')
		.css('padding', '4px 12px')
//		.css('border', 'solid 1px silver')
//		.css('background-color', 'black')
//		.css('color', 'gray')
		.css('border-radius', 10)
		.css('font-size', '9pt')
		.css('margin', 2)
		.css('width', 60)
		.css('text-align', 'center')
		.addClass('threadmenu_out')
		.hover(
			function () {
				$(this)
					.addClass('threadmenu_over');
			},
			function () {
				$(this)
					.removeClass('threadmenu_over');
			}
		);
	for(var i = 0; i < this.title.length; i++) {
		var $char = $('<div/>')
			.css('width', 30)
			.css('text-align', 'center')
			.text(this.title.substr(i, 1))
			.css('float', 'left')
			.appendTo($div);
		
	}
	return $div;
};

js2ch.ThreadMenuItem.prototype.open = function (callback) {
	var self = this;
	if (this.menu.open_menu_item !== undefined) {
		this.menu.open_menu_item.close(function () {
			self.open(callback);
		});
		return;
	}

	if (this.assignedFrame) {
		this.assignedFrame.open(function () {
			self.is_opened = true;
			self.menu.open_menu_item = self;
			if (callback) callback();
		});
	}
	$('#' + this.threadmenuitem_id)
		.addClass('threadmenu_select');
};

js2ch.ThreadMenuItem.prototype.close = function (callback) {
	var self = this;
	if (this.assignedFrame) {
		this.assignedFrame.close(function () {
			self.is_opened = false;
			self.menu.open_menu_item = undefined;
			if (callback) callback();
		});
	}
	$('#' + this.threadmenuitem_id)
		.removeClass('threadmenu_select');
};

js2ch.ThreadMenuItem.prototype.createFrame = function () {
	this.is_opened = false;
	if (this.assignedFrame) {
		return this.assignedFrame.createFrame();
	}
};


js2ch.ThreadMenuItem.prototype.assignFrame = function (frame) {
	this.assignedFrame = frame;
};

js2ch.ThreadMenuItem.prototype.setClickEvent = function (callback) {
	var self = this;
	$('#' + this.threadmenuitem_id)
		.css('cursor', 'pointer')
		.bind('click', function () {
			if (self.assignedFrame) {
				if (!self.is_opened) {
					self.open();
				} else {
					self.close();
				}
			}
			if (callback) callback();
		});
};

/*
	Thread Menu Assign Frame
*/
js2ch.ThreadMenuAssignFrame = function (menuItem) {
	this.menuItem = menuItem;
};

js2ch.ThreadMenuAssignFrame.prototype.open = function (callback) {
};

js2ch.ThreadMenuAssignFrame.prototype.close = function (callback) {
};

js2ch.ThreadMenuAssignFrame.prototype.createFrame = function () {
};

js2ch.ThreadMenuAssignFrame.prototype.update = function () {
};

/*
	Thread Res Form

*/
js2ch.ThreadResForm = function (menuItem) {
	this.menuItem = menuItem;
	this.thread = menuItem.menu.thread;
	var v = this.thread.datname.split('.');
	var id = v[0];
	var v = this.thread.bbs.url.match(/(\S+):\/\/([^:\/]+)(:(\d+))?(\/[^#\s]*)(#(\S+))?/);
	var protocol = v[1];
	var domain = v[2];
	var path = v[5];
	this.url = protocol + '://' + domain + '/test/read.cgi' + path + id + '/1';
//	this.$div = undefined;
	this.threadmenu_frame_id = 'threadmenu_frame_id_' + this.menuItem.id;
	this.height = 400;
//	this.is_show = false;
//	this.menu_height = undefined;
};

js2ch.ThreadResForm.prototype = new js2ch.ThreadMenuAssignFrame();

js2ch.ThreadResForm.prototype.open = function (callback) {
	var self = this;
	var h = this.height;
	var offset = this.menuItem.menu.menu_height;
	$('#' + this.threadmenu_frame_id)
		.css('height', 1)
		.css('margin-top', -1)
		.css('top', offset + 1)
		.css('opacity', 0.7)
		.show()
		.animate(
			{height:h, top:h + offset, marginTop:-h},
			{duration: "slow", easing: "swing", 
			 complete:
				function () {
					$('.writeform_frame')
						.css('top', $(this).offset().top)
						.css('left', $(this).offset().left)
						.css('height', $(this).height())
						.css('width', $(this).width())
						.animate(
							{ opacity: 'show'},
							{ duration: 'slow', easing: 'swing', 
							  complete: function () { if (callback) callback(); }
							}
						);
				}
			}
		);
};

js2ch.ThreadResForm.prototype.close = function (callback) {
	var self = this;
	var h = this.height;
	var offset = this.menuItem.menu.menu_height;
	$('.writeform_frame')
		.animate(
			{ opacity: 'hide'},
			{ duration: 'slow', easing: 'swing', 
			  complete: function () {
					$('#' + self.threadmenu_frame_id)
						.animate(
							{height:'hide', top:offset, marginTop:0},
							{duration: "slow", easing: "swing", 
							 complete:
								function () {
									if (callback) callback();
								}
							}
						);
				}
			}
		);
};

js2ch.ThreadResForm.prototype.createFrame = function () {
	$('.writeform_frame').remove();
	var self = this;
//	var offset = 40;
	var $div = $('<div/>')
		.attr('id', this.threadmenu_frame_id)
		.addClass('writeform')
		.css('position', 'relative')
		.css('left', 0)
		.css('top', 0)
		.css('height', 0)
		.css('margin-top', 0)
		.css('width', '100%')
		.css('border', 'none')
		.css('padding', 'none')
		.css('background-color', 'gray')
		.css('z-index', '20')
		.css('overflow', 'hidden')
		.css('-moz-box-sizing', 'border-box')
		.css('-webkit-box-sizing', 'border-box')
		.css('-ms-box-sizing', 'border-box')
		.css('box-sizing', 'border-box')
		.css('box-shadow', '0px 8px 8px #000')
		.hide();
	var scale = .75;
	$('<div/>')
		.css('position', 'absolute')
		.addClass('writeform_frame')
		.append(
			$('<iframe/>')
				.attr('name', 'writeform')
				.css('position', 'relative')
				.css('width', '' + (100 / scale) + '%')
				.css('height', '' + (100 / scale) + '%')
				.css('-ms-transform', 'scale(' + scale + ')')
				.css('-moz-transform', 'scale(' + scale + ')')
				.css('-webkit-transform', 'scale(' + scale + ')')
				.css('border', 'none')
				.css('padding', 'none')
				.css('left', '-' + (100 / scale * (1- scale) / 2) + '%')
				.css('top', '-' + (100 / scale * (1- scale) / 2) + '%')
		//		.css('margin-left', '-' + (100 / scale * (1- scale) / 2) + '%')
		//		.css('margin-top', '-' + (100 / scale * (1- scale) / 2) + '%')
				.css('-moz-box-sizing', 'border-box')
				.css('-webkit-box-sizing', 'border-box')
				.css('-ms-box-sizing', 'border-box')
				.css('box-sizing', 'border-box')
				.attr('src', this.url)
				.ready(function () {
					self.menuItem.setClickEvent();
				})
		)
		.appendTo('body')
		.css('z-index', '21')
		.hide();
	return $div;

};

/*
	Thread History

*/
js2ch.ThreadHistory = function (menuItem) {
	this.menuItem = menuItem;
	this.thread = menuItem.menu.thread;
	this.threadmenu_frame_id = 'threadmenu_frame_id_' + this.menuItem.id;
	this.height = 200;
};

js2ch.ThreadHistory.prototype = new js2ch.ThreadMenuAssignFrame();

js2ch.ThreadHistory.prototype.open = function (callback) {
	var self = this;
	var h = this.height;
	var offset = this.menuItem.menu.menu_height;
	$('#' + this.threadmenu_frame_id)
		.css('height', 1)
		.css('margin-top', -1)
		.css('top', offset + 1)
		.show()
		.scrollTop(h - 1)
		.animate(
			{height:h, top:h + offset, marginTop:-h, scrollTop:0},
			{duration: "slow", easing: "swing", 
			 complete:
				function () {
//					$(this).css('box-shadow', '0px 8px 8px #000');
					if (callback) callback();
				}
			}
		);
};

js2ch.ThreadHistory.prototype.close = function (callback) {
	var self = this;
	var h = this.height;
	var offset = this.menuItem.menu.menu_height;
	$('#' + this.threadmenu_frame_id)
//		.css('box-shadow', 'none')
		.animate(
			{height:'hide', top:offset, marginTop:0, scrollTop:h},
			{duration: "slow", easing: "swing", 
			 complete:
				function () {
					if (callback) callback();
				}
			}
		);
};

js2ch.ThreadHistory.prototype.createFrame = function () {
	var self = this;
//	var offset = 40;
	var $div = $('<div/>')
		.attr('id', this.threadmenu_frame_id)
		.addClass('threadhistory')
		.css('position', 'relative')
		.css('left', 0)
		.css('top', 0)
		.css('height', 0)
		.css('margin-top', 0)
		.css('width', '100%')
		.css('border', 'none')
		.css('padding', 'none')
		.css('background-color', 'silver')
		.css('z-index', '20')
		.css('overflow', 'hidden')
		.css('-moz-box-sizing', 'border-box')
		.css('-webkit-box-sizing', 'border-box')
		.css('-ms-box-sizing', 'border-box')
		.css('box-sizing', 'border-box')
		.css('box-shadow', '0px 8px 8px #000')
		.hide();
	var $div_scroll = $('<div/>')
		.css('width', '100%')
		.css('height', this.height)
		.css('overflow', 'auto')
		.appendTo($div);
	var $table = $('<table/>')
		.width('100%')
		.css('font-size', '9pt')
		.appendTo($div_scroll)
		.append(
			$('<colgroup/>')
				.append($('<col/>').css('width', 110))
				.append($('<col/>').css('width', ''))
				.append($('<col/>').css('width', 32))
		);
	var list = js2ch.list_history.getList();
	for(var i = 0; i < list.length; i++) {
		list[i].createHtmlObject().appendTo($table);
	}
	$('tr:odd', $table).css('background-color', 'white');
	$('tr:even', $table).css('background-color', '#e8e8e8');
	
	self.menuItem.setClickEvent();
	return $div;

};

js2ch.ThreadMenuAssignFrame.prototype.update = function () {
	var self = this;
	if (this.menuItem.is_opened) {
		this.menuItem.close(function () {
			$('#' + self.threadmenu_frame_id).replaceWith(self.createFrame());
			self.menuItem.open();
		});
	} else {
		$('#' + this.threadmenu_frame_id).replaceWith(this.createFrame());
	}
};

