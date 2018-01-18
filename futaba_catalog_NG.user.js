// ==UserScript==
// @name        futaba_catalog_NG
// @namespace   https://github.com/akoya-tomo
// @description カタログのスレをNGワードで非表示（簡易版）
// @author      akoya_tomo
// @include     http://*.2chan.net/*/futaba.php?mode=cat*
// @include     https://*.2chan.net/*/futaba.php?mode=cat*
// @version     1.0.1
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @license     MIT
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

(function ($) {
	/*
	 *	設定
	 */
	var serverName = document.domain.match(/^[^.]+/);
	var pathName = location.pathname.match(/[^/]+/);
	var serverFullPath = serverName + "_" + pathName;

	init();

	function init(){
		console.log("futaba_catalog_NG commmon: " +
			GM_getValue("_futaba_catalog_NG_words", ""));
		console.log("futaba_catalog_NG indivisual: " +
			getCurrentIndivValue());
		GM_registerMenuCommand("ＮＧワード編集", editNG);
		setStyle();
		makeMenubar();
		makeConfigUI();
//		makeNGUI();
		hide_NG_threads();
		check_akahuku_reload();
	}

	/*
	 *設定画面表示
	 */
	function editNG(){
		var word_commmon = GM_getValue("_futaba_catalog_NG_words", "");
		var word_indiv = getCurrentIndivValue();
		$("#GM_fcn_NGword_common").val(word_commmon);
		$("#GM_fcn_NGword_individual").val(word_indiv);
		var $config_container_ = $("#GM_fcn_config_container");
		$config_container_.fadeIn(100);
	}

	/*
	 * 表示中の板の個別ＮＧワードの取得
	 */
	function getCurrentIndivValue() {
		var indivobj = getIndivObj();
		var str_CurrentIndiv;
		if(indivobj !== "") {
			str_CurrentIndiv = indivobj[serverFullPath];
		}
		else {
			str_CurrentIndiv = "";
		}
		return str_CurrentIndiv;
	}

	/*
	 * 板毎の個別ＮＧワードのオブジェクトを取得
	 */
	function getIndivObj() {
		var indivVal = GM_getValue("NG_words_indiv", "");
		var obj_indiv;
		if(indivVal !== "") {
			obj_indiv = JSON.parse(indivVal);
		}
		else {
			obj_indiv = "";
		}
		return obj_indiv;
	}

	/*
	 * ＮＧワードを設定
	 */
	function setNGWords() {
		var input_common = $("#GM_fcn_NGword_common").val();
		var input_indiv = $("#GM_fcn_NGword_individual").val();
		GM_setValue("_futaba_catalog_NG_words", input_common);
		console.log("futaba_catalog_NG: common NGword updated - " + input_common);
		setIndivValue(input_indiv);
		$("#GM_fcn_config_container").fadeOut(100);
		hide_NG_threads(true);
		/*
		 * 板毎の個別ＮＧワードを保存
		 */
		function setIndivValue(val) {
			var obj_indiv = getIndivObj();
			if(obj_indiv === ""){
				obj_indiv = {};
			}
			obj_indiv[serverFullPath] = val;
			var jsonstring = JSON.stringify(obj_indiv);
			GM_setValue("NG_words_indiv", jsonstring);
			console.log("futaba_catalog_NG: indivisual NGword updated@" + serverFullPath + " - " + val);
		}
	}

	/*
	 *メニューバーの設定
	 */
	function makeMenubar() {
		var $menubar_area = $("<div>", {
			id: "GM_fcn_menubar"
		});
		var $menubar_header = $("<div>", {
			id: "GM_fcn_menubar_header",
			text: "ＮＧワード",
			css: {
				"background-color": "#F0E0D6",
				fontWeight: "bolder"
			}
		});
		if ($("#GM_fth_searchword").length) {
			$menubar_header = $("<span>", {
				id: "GM_fcn_menubar_header",
				text: "　ＮＧワード",
				css: {
					"background-color": "#F0E0D6",
					fontWeight: "bolder"
				}
			});
			$("#GM_fth_searchword").after($menubar_header);
		} else {
			$("body > table[border]").before($menubar_area);
			$menubar_area.append($menubar_header);
		}
		//設定ボタン
		var $button = $("<span>", {
			id: "GM_fcn_configNG",
			text: "[設定]",
			css: {
				cursor: "pointer",
			},
			click: function() {
				editNG();
			}
		});
		$button.hover(function () {
			$(this).css({ backgroundColor:"#EEAA88" });
		}, function () {
			$(this).css({ backgroundColor:"#F0E0D6" });
		});
		$menubar_header.append($button);

	}

	/*
	* 設定画面
	*/
	function makeConfigUI() {
		var $config_container = $("<div>", {
			id: "GM_fcn_config_container",
			css: {
				position: "fixed",
				"z-index": "1001",
				left: "50%",
				top: "50%",
				"text-align": "center",
				"margin-left": "-475px",
				"margin-top": "-50px",
				"background-color": "rgba(240, 192, 214, 0.95)",
				width: "950px",
				//height: "100px",
				display: "none",
				fontWeight: "normal",
				"box-shadow": "3px 3px 5px #853e52",
				"border": "1px outset",
				"border-radius": "10px",
				"padding": "5px",
			}
		});
		$("#GM_fcn_menubar_header").append($config_container);
		$config_container.append(
			$("<div>").append(
				$("<div>").text("スレ本文に含まれる語句を入力してください。 | を挟むと複数指定できます。正規表現使用可。")
			),
			$("<div>").css("margin-top", "1em").append(
				$("<div>").append(
					$("<label>").text("全板共通").attr("for", "GM_fcn_NGword_common"),
					$("<input>").attr({
						"id": "GM_fcn_NGword_common",
						"class": "GM_fcn_input"
					}).css("width", "54em"),
					$("<span>").append(
						$("<input>", {
							class: "GM_fcn_config_button",
							type: "button",
							val: "区切り文字挿入",
							click: function(){
								insertDelimiter("GM_fcn_NGword_common");
							},
						})
					)
				),
				$("<div>").append(
					$("<label>").text("各板個別").attr("for", "GM_fcn_NGword_individual"),
					$("<input>").attr({
						"id": "GM_fcn_NGword_individual",
						"class": "GM_fcn_input"
					}).css("width", "54em"),
					$("<span>").append(
						$("<input>", {
							class: "GM_fcn_config_button",
							type: "button",
							val: "区切り文字挿入",
							click: function(){
								insertDelimiter("GM_fcn_NGword_individual");
							},
						})
					)
				)
			),
			$("<div>").css({
				"margin-top": "1em",
			}).append(
				$("<span>").css("margin", "0 1em").append(
					$("<input>", {
						class: "GM_fcn_config_button",
						type: "button",
						val: "更新",
						click: function(){
							setNGWords();
						},
					})
				),
				$("<span>").css("margin", "0 1em").append(
					$("<input>", {
						class: "GM_fcn_config_button",
						type: "button",
						val: "キャンセル",
						click: function(){
							$config_container.fadeOut(100);
						},
					})
				)
			)
		);
		$(".GM_fcn_config_button").css({
			"cursor": "pointer",
			"background-color": "#FFECFD",
			"border": "2px outset #96ABFF",
			"border-radius": "5px",
		}).hover(function() {
			$(this).css("background-color", "#CCE9FF");
		}, function() {
			$(this).css("background-color", "#FFECFD");
		});

		/*
		 * カーソル位置にデリミタ挿入
		 */
		function insertDelimiter(id){
			var $input = $("#" + id);
			var val = $input.val();
			var position = $input[0].selectionStart;
			var newval = val.substr(0, position) + "|" + val.substr(position);
			$input.val(newval);
			$input[0].setSelectionRange(position + 1 ,position + 1);
		}
	}

	/*
	 *赤福の動的リロードの状態を取得
	 */
	function check_akahuku_reload() {
		var target = $("html > body").get(0);
		var config = { childList: true };
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				var nodes = $(mutation.addedNodes);
				if (nodes.attr("border") == "1") {
					var timer = setInterval(function() {
						var status = $("#akahuku_catalog_reload_status").text();
						if (status === "" || status == "完了しました") {
							clearInterval(timer);
							hide_NG_threads();
						}
					}, 10);
				}
			});
		});
		observer.observe(target, config);
	}

	/*
	 *カタログを検索してＮＧワードのスレを非表示
	 */
	function hide_NG_threads(isWordsChanged) {
		var Start = new Date().getTime();//count parsing time
		var words = "";
		var words_common = GM_getValue("_futaba_catalog_NG_words", "");
		var words_indiv = getCurrentIndivValue();
		if( words_common !== "" ) {
			words += words_common;
			if( words_indiv !== "" ) {
				words += "|" + words_indiv;
			}
		}
		else {
			words += words_indiv;
		}
		console.log(words);
		try {
			var re = new RegExp(words, "i");
		}
		catch (e) {
			alert("検索ワードのパターンが無効です\n\n" + e);
			editWords();
			return;
		}
		if( words !== "" ) {
			removeOldNGwords();
			$("body > table[border] td small").each(function(){
				if( $(this).text().match(re) ) {
					if ( $(this).parent("a").length ) {		//文字スレ
						$(this).parent().parent("td").addClass("GM_fcn_NGwords");
					} else {
						$(this).parent("td").addClass("GM_fcn_NGwords");
					}
				}
			});
		}
		else {
			removeOldNGwords();
		}
		function removeOldNGwords() {
			if(isWordsChanged) {
				$(".GM_fcn_NGwords").removeClass("GM_fcn_NGwords");
			}
		}
		console.log('futaba_catalog_NG - Parsing@' + serverFullPath + ': '+((new Date()).getTime()-Start) +'msec');//log parsing time
	}

	 /*
	 *スタイル設定
	 */
	function setStyle() {
		var css =
			//セルの背景色
			".GM_fcn_NGwords {" +
			"  display: none !important;" +
			"}";
		GM_addStyle(css);
	}

})(jQuery);
