gamecfg = {
	/*游戏单元格宽度*/
	'grid_width'		: '50',
	/*游戏单元格高度*/
	'grid_height'		: '48',
	/*提示次数*/
	'tip_count'			: 3
};

$(document).ready(function(){
	var answer;
	var tip;
	var current_x;
	var current_y;
	var usedtip;

	var level = Math.ceil(Math.random()*89);
	gameinit( level , 0 );

	function gameinit( level , flag ){
		$('#game').html('');
		//获取关卡数
		$.getJSON({
				type:"GET",
				url: 'level/' + level + '.json',
				dataType: "json",
				success: function(data){
					answer	= data.answer;
					tip		= data.tip;
					$('#btn_tip span').text( gamecfg.tip_count );
					usedtip = 0;
					for( i=0; i<answer.length ; i++)
					{
						row = $('<tr></tr>').appendTo('#game');
						for(j=0;j< answer[i].length;j++){
							word = answer[i].substr( j , 1 );
							if( word == '0' ){
								$('<td></td>')
									.css({'width':gamecfg.grid_width,'height':gamecfg.grid_height})
									.addClass('none')
									.appendTo( row )
							}
							else{
								if( flag == 1 ){
									input = $('<input>').attr({
											'type': 'text',
											'maxlength': '1',
											'size': '1',
											'value'	: word
										}).css({'width':gamecfg.grid_width,'height':gamecfg.grid_height});
								}
								else{
									input = $('<input>').attr({
											'type': 'text',
											'maxlength': '1',
											'size': '1',
											'value'	: ''
										}).css({'width':gamecfg.grid_width,'height':gamecfg.grid_height});

								}
								$('<td></td>')
								.append( input )
								.css({'width':gamecfg.grid_width,'height':gamecfg.grid_height,"background-color":"white"})
								.attr('id','grid-' + (i+1) + '-' + (j+1) )
								.appendTo( row );
							}
						}
					}
					if( flag &&  window.confirm('您已完成本局游戏，是否要重新开始本局游戏？')){
						gameinit( level , 0 );
					}
				},
				error:function(){
					alert('本局游戏不存在，请重新选择！');
					return false;
				}
		});
	}

	$(document).on("focus", '#game input' , function(){
		$('#game input').removeClass('sel selh selv');
		$('#tip_h').html('无');
		$('#tip_v').html('无');

		$(this).addClass( 'sel' ).select();

		//纵横高亮
		sid = $(this).parent().attr('id');
		t = sid.split('-');
		current_x = t[1];
		current_y = t[2];

		//提示
		pos = highlight( current_x , current_y );
		if( typeof( tip['h'][pos['h']] ) == 'string'){
			str = '<a id="edit" href="#" onclick="loc( \'' + current_x + '\' , \'' + current_y + '\' , \'h\' );edit();">' + tip['h'][pos['h']] + '</a>';
			$('#tip_h').html( str ).addClass('selv');
		};
		if( typeof( tip['v'][pos['v']] ) == 'string'){
			str = '<a id="edit" href="#" onclick="loc( \'' + current_x + '\' , \'' + current_y + '\' , \'v\' );edit();">' + tip['v'][pos['v']] + '</a>';
			$('#tip_v').html( str ).addClass('selh');
		};
	});

	$(document).on("keydown", '#game input' , function( event ){
		//获取当前的位置
		curx = parseInt(current_x);
		cury = parseInt(current_y);
		switch( event.which ){
			//向左
			case 37: cury--; break;
			//向上
			case 38: curx--; break;
			//向右
			case 39: cury++; break;
			//向下
			case 40: curx++; break;
			//回车
			case 13:
			case 32:
				if( ($('#grid-' + curx + '-' + (cury + 1)).length > 0 && $( '#grid-' + curx + '-' + (cury + 1) + ' input' ).val() == '') || $('#grid-' + (curx+1) + '-' + cury ).length == 0 ){
					cury++;
				}
				else{
					curx++;
				}
				break;
		}
		objGrid_id = '#grid-' + curx + '-' + cury ;
		if( $( objGrid_id ).length > 0){
			$( objGrid_id + ' input' ).focus().select();
		}
	});

	$('#btn_finish').click(function(){
		var iserror = false;
		var fullanswer = '';
		for( var i=0; i<answer.length ; i++){
			for(j=0;j< answer[i].length;j++){
				word = answer[i].substr( j , 1 );
				if( word != '0' ){
					grid = '#grid-' + (i+1) + '-' + (j+1) + ' input';
					if( $( grid ).val() != word ){
						if( $( grid ).val() != '' ){
							$( grid ).addClass('error');
						}
						iserror = true;
					}
					else{
						$( grid ).removeClass();
					}
				}
				fullanswer += word;
			}
		}
		if(!iserror){
			alert('恭喜你，全部正确啦！');
		}
		else{
			alert('很遗憾，还有错误或者没有填完整，请继续努力！');
		}
	});

	$('#btn_restart').click(function(){
		if( window.confirm('是否要重新开始本局游戏？') ){
			gameinit( level , 0 );
		}
	});

	$('#btn_restartnew').click(function(){
		if( window.confirm('是否要退出本局游戏？') ){
			location.reload();
		}
	});

	$('#btn_tip').click(function(){
		var availableTips = gamecfg.tip_count - usedtip ;
		if( availableTips <= 0 ){
			alert('您已没有提示次数了，请求助于百度！');
			return;
		}
		if ( !current_x || !current_y )
		{
			alert('请选中需要提示的单元格');
		}
		else{
			word = answer[current_x-1].substr( current_y-1 ,1 );
			if( word != $('#grid-' + current_x + '-' + current_y + ' input').val() ){
				$('#grid-' + current_x + '-' + current_y + ' input').val( word );
				$('#btn_tip span').text( availableTips - 1 );
				usedtip++;
			}
			else{
				alert('此格已是正确答案，无需使用提示');
			}
		}
	});

	$(window).bind('beforeunload',function(){
		return "关闭或刷新页面会导致游戏进度丢失，是否要继续？";
	});
});

function highlight( curx , cury ){
	ret = new Array();
	//right
	x = parseInt(curx);
	y = parseInt(cury);
	while( $('#grid-'+ (x+1) + '-' + y ).length > 0 ){
		$('#grid-'+ (x+1) + '-' + y + ' input' ).addClass('selh');
		x++;
	}

	//left
	x = parseInt(curx);
	y = parseInt(cury);
	while( $('#grid-'+ (x-1) + '-' + y ).length > 0 ){
		$('#grid-'+ (x-1) + '-' + y + ' input' ).addClass('selh');
		x--;
	}
	ret['v'] = x + '-' + y;

	//top
	x = parseInt(curx);
	y = parseInt(cury);
	while( $('#grid-'+ x + '-' + (y-1) ).length > 0 ){
		$('#grid-'+ x + '-' + (y-1) + ' input' ).addClass('selv');
		y--;
	}
	ret['h'] = x + '-' + y;

	//bottom
	x = parseInt(curx);
	y = parseInt(cury);
	while( $('#grid-'+ x + '-' + (y+1) ).length > 0 ){
		$('#grid-'+ x + '-' + (y+1) + ' input' ).addClass('selv');
		y++;
	}
	return ret;
}

var cur_x , cur_y , cur_pos;

function loc( curx, cury , pos ){
	cur_x = curx;
	cur_y = cury;
	cur_pos = pos;
	$('#inputanswer input').focus();
}

function edit(){
	var curx = cur_x;
	var cury = cur_y;
	var pos = cur_pos;

	var str = window.prompt('请输入答案','');
	if( str == "" || str == null )
	{
		return false;
	}
	head = highlight( curx, cury );
	if( pos == 'v' ){
		start = head['v'].split('-');
		start_x = parseInt(start[0]);
		start_y = parseInt(start[1]);

		for( i=0;i<str.length;i++){
			grid = '#grid-' + (start_x + i) + '-' + start_y;
			if( $( grid + ' input').length > 0 ){
				$( grid + ' input').val( str.substr(i,1) );
			}
			else{
				return false;
			}
		}
	}

	if( pos == 'h' ){
		start = head['h'].split('-');
		start_x = parseInt(start[0]);
		start_y = parseInt(start[1]);
		for( i=0;i<str.length;i++){
			grid = '#grid-' + start_x + '-' + (start_y + i);
			if( $( grid + ' input').length > 0 ){
				$( grid + ' input').val( str.substr(i,1) );
			}
			else{
				return false;
			}
		}
	}
	return true;
}