// ==UserScript==
// @name        futaba_catalog_NG
// @namespace   https://github.com/akoya-tomo
// @description カタログのスレをＮＧで非表示
// @author      akoya_tomo
// @include     http://*.2chan.net/*/futaba.*
// @include     https://*.2chan.net/*/futaba.*
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
	var MAX_NG_THREADS = 500;	//NGスレの最大保持数

	var serverName = document.domain.match(/^[^.]+/);
	var pathName = location.pathname.match(/[^/]+/);
	var serverFullPath = serverName + "_" + pathName;

	init();

	function init(){
		initNgNumber();
		if (!isCatalog()) return;
		console.log("futaba_catalog_NG commmon: " +
			GM_getValue("_futaba_catalog_NG_words", ""));
		console.log("futaba_catalog_NG indivisual: " +
			getCurrentIndivValue("NG_words_indiv"));
		GM_registerMenuCommand("ＮＧワード編集", editNgWords);
		setStyle();
		makeNgMenubar();
		makeConfigUI();
		makeNgButton();
		hideNgThreads();
		check_akahuku_reload();
	}

	/*
	 *NG番号初期化
	 */
	function initNgNumber(){
		if (window.name && isCatalog()) return;
		window.name = location.href;
		var input_indiv_num = [];
		setIndivValue("NG_numbers_indiv", input_indiv_num);
	}

	/*
	 *カタログ確認
	 */
	function isCatalog(){
		return location.search.match(/mode=cat/) != null;
	}

	/*
	 * 板毎の個別NGデータを保存
	 */
	function setIndivValue(target, val) {
		var obj_indiv = getIndivObj(target);
		if (obj_indiv === "") {
			obj_indiv = {};
		}
		obj_indiv[serverFullPath] = val;
		var jsonstring = JSON.stringify(obj_indiv);
		GM_setValue(target, jsonstring);
		console.log("futaba_catalog_NG: " + target + " updated@" + serverFullPath + " - " + val);
	}

	/*
	 * 板毎の個別NGデータのオブジェクトを取得
	 */
	function getIndivObj(target) {
		var indivVal = GM_getValue(target, "");
		var obj_indiv;
		if (indivVal !== "") {
			obj_indiv = JSON.parse(indivVal);
		}
		else {
			obj_indiv = "";
		}
		return obj_indiv;
	}

	/*
	 *NGワード設定画面表示
	 */
	function editNgWords(){
		var words_commmon = GM_getValue("_futaba_catalog_NG_words", "");
		var words_indiv = getCurrentIndivValue("NG_words_indiv");
		$("#GM_fcn_ng_words_common").val(words_commmon);
		$("#GM_fcn_ng_words_individual").val(words_indiv);
		var $config_container_ = $("#GM_fcn_config_container");
		$config_container_.fadeIn(100);
	}

	/*
	 * 表示中の板の個別NGデータの取得
	 */
	function getCurrentIndivValue(target) {
		var indivobj = getIndivObj(target);
		var str_CurrentIndiv;
		if (indivobj !== "") {
			str_CurrentIndiv = indivobj[serverFullPath];
		}
		if (!str_CurrentIndiv) {
			str_CurrentIndiv = "";
		}
		return str_CurrentIndiv;
	}

	/*
	 * NGワードを設定
	 */
	function setNgWords() {
		var input_common = $("#GM_fcn_ng_words_common").val();
		var input_indiv = $("#GM_fcn_ng_words_individual").val();
		GM_setValue("_futaba_catalog_NG_words", input_common);
		console.log("futaba_catalog_NG: common NGword updated - " + input_common);
		setIndivValue("NG_words_indiv", input_indiv);
		$("#GM_fcn_config_container").fadeOut(100);
		hideNgThreads(true);
	}

	/*
	 *NGメニューバーの設定
	 */
	function makeNgMenubar() {
		var $ng_menubar_area = $("<div>", {
			id: "GM_fcn_ng_menubar",
			css: {
				"background-color": "#F0E0D6"
			}
		});
		var $ng_words_header = $("<span>", {
			id: "GM_fcn_ng_words_header",
			text: "ＮＧワード",
			css: {
				"background-color": "#F0E0D6",
				fontWeight: "bolder",
				"padding-right": "16px"
			}
		});
		$("body > table[border]").before($ng_menubar_area);
		$ng_menubar_area.append($ng_words_header);
		//設定ボタン
		var $ng_words_button = $("<span>", {
			id: "GM_fcn_config_ng_words",
			text: "[設定]",
			css: {
				cursor: "pointer",
			},
			click: function() {
				editNgWords();
			}
		});
		$ng_words_button.hover(function () {
			$(this).css({ backgroundColor:"#EEAA88" });
		}, function () {
			$(this).css({ backgroundColor:"#F0E0D6" });
		});
		$ng_words_header.append($ng_words_button);
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
		$("#GM_fcn_ng_words_header").append($config_container);
		$config_container.append(
			$("<div>").append(
				$("<div>").text("スレ本文に含まれる語句を入力してください。 | を挟むと複数指定できます。正規表現使用可。")
			),
			$("<div>").css("margin-top", "1em").append(
				$("<div>").append(
					$("<label>").text("全板共通").attr("for", "GM_fcn_ng_words_common"),
					$("<input>").attr({
						"id": "GM_fcn_ng_words_common",
						"class": "GM_fcn_input"
					}).css("width", "54em"),
					$("<span>").append(
						$("<input>", {
							class: "GM_fcn_config_button",
							type: "button",
							val: "区切り文字挿入",
							click: function(){
								insertDelimiter("GM_fcn_ng_words_common");
							},
						})
					)
				),
				$("<div>").append(
					$("<label>").text("各板個別").attr("for", "GM_fcn_ng_words_individual"),
					$("<input>").attr({
						"id": "GM_fcn_ng_words_individual",
						"class": "GM_fcn_input"
					}).css("width", "54em"),
					$("<span>").append(
						$("<input>", {
							class: "GM_fcn_config_button",
							type: "button",
							val: "区切り文字挿入",
							click: function(){
								insertDelimiter("GM_fcn_ng_words_individual");
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
							setNgWords();
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
							hideNgThreads();
						}
					}, 10);
				}
			});
		});
		observer.observe(target, config);
	}

	/*
	 *カタログのスレにNGボタン設置
	 */
	function makeNgButton() {
		//NGボタン
		var $ng_button = $("<span>", {
			class: "GM_fcn_ng_button",
			text: "[NG]",
			css: {
				color: "blue",
				cursor: "pointer",
				opacity: "0",
				position: "relative",
			},
		});
		//NGボタンメニュー
		var $ng_button_menu = $("<div>", {
			class: "GM_fcn_ng_menu",
			css: {
				"background-color": "rgba(240, 192, 214, 0.95)",
				display: "none",
				"z-index": "1",
				position: "absolute",
				top: "16px",
				left: "0px",
				"min-width": "120px",
				width: "100%",
				"border": "1px outset",
				"border-radius": "5px",
				"padding": "5px",
			}
		});

		$("body > table[border] td").each(function(){
			var $clone_ng_button = $ng_button.clone();
			var $clone_ng_button_menu = $ng_button_menu.clone();

			$clone_ng_button.hover(function () {
				$(this).css("color", "red");
			}, function () {
				$(this).css("color", "blue");
			});
			$clone_ng_button.on('click',function(){
				makeNgButtonMenu($clone_ng_button);
			});
			$(this).hover(function () {
				$clone_ng_button.css("opacity", "1");
			}, function () {
				$clone_ng_button.css("opacity", "0");
				$clone_ng_button_menu.css("display", "none");
			});

			$clone_ng_button.append($clone_ng_button_menu);
			$(this).append($clone_ng_button);
		});
	}

	/*
	 *NGボタンメニュー作成
	 */
	function makeNgButtonMenu($button) {
		if (!$button.find(".GM_fcn_ng_number_button").length) {
			var thread_href = "";
			//スレNG
			var $ng_number = $("<div>", {
				class: "GM_fcn_ng_number_button",
				text: "スレNG",
				css: {
					color: "blue",
					"background-color": "rgba(240, 224, 214, 0.95)",
					cursor: "pointer",
					"z-index": "1",
					"padding": "5px",
				}
			});

			var $td = $button.parent("td");
			var thread_number = $td.children("a:first").attr("href").slice(4,-4);
			//console.log("thread_number = " + thread_number);
			var ng_number = $ng_number.clone();

			ng_number.hover(function () {
				$(this).css("color", "red");
				$(this).css("background-color", "rgba(204, 233, 255, 0.95)");
			}, function () {
				$(this).css("color", "blue");
				$(this).css("background-color", "rgba(240, 224, 214, 0.95)");
			});
			ng_number.click(function () {
				hideNgNumberThread(thread_number, $td);
			});

			$button.children(".GM_fcn_ng_menu").append(ng_number);
		}
		$button.children(".GM_fcn_ng_menu").css("display", "block");
		/*
		 *スレ番号NG
		 */
		function hideNgNumberThread(number, $td) {
			setNgNumber(number);
			$td.addClass("GM_fcn_ng_numbers");
		}
	}

	 /*
	 *NG番号セット
	 */
	function setNgNumber(number) {
		var obj_ng_number = getIndivObj("NG_numbers_indiv");
		if (obj_ng_number === ""){
			obj_ng_number = {};
		}
		if (!obj_ng_number[serverFullPath]) {
			obj_ng_number[serverFullPath] = [];
		}
		obj_ng_number[serverFullPath].push(number);
		if (obj_ng_number[serverFullPath].length > MAX_NG_THREADS) {
			obj_ng_number[serverFullPath].shift();
		}
		var jsonstring = JSON.stringify(obj_ng_number);
		GM_setValue("NG_numbers_indiv", jsonstring);
	}

	/*
	 *カタログを検索してＮＧスレを非表示
	 */
	function hideNgThreads(isWordsChanged) {
		var Start = new Date().getTime();//count parsing time
		var words = "";
		var words_common = GM_getValue("_futaba_catalog_NG_words", "");
		var words_indiv = getCurrentIndivValue("NG_words_indiv");
		var numbers = getCurrentIndivValue("NG_numbers_indiv");

		if( words_common !== "" ) {
			words += words_common;
			if( words_indiv !== "" ) {
				words += "|" + words_indiv;
			}
		}
		else {
			words += words_indiv;
		}
		//console.log(words);
		//console.dir(numbers);
		try {
			var re = new RegExp(words, "i");
		}
		catch (e) {
			alert("NGワードのパターンが無効です\n\n" + e);
			editWords();
			return;
		}
		if (isWordsChanged) {
			$(".GM_fcn_ng_words").removeClass("GM_fcn_ng_words");
		}
		if (words !== "") {
			$("body > table[border] td small").each(function(){
				if (re.test($(this).text())) {
					if ($(this).parent("a").length) {		//文字スレ
						$(this).parent().parent("td").addClass("GM_fcn_ng_words");
					} else {
						$(this).parent("td").addClass("GM_fcn_ng_words");
					}
				}
			});
		}
		if (numbers.length && !isWordsChanged) {
			$("body > table[border] td a").each(function(){
				var href_num = $(this).attr("href").slice(4,-4);
				if (numbers.indexOf(href_num) > -1){
					$(this).parent("td").addClass("GM_fcn_ng_numbers");
				}
			});
		}
		console.log('futaba_catalog_NG - Parsing@' + serverFullPath + ': '+((new Date()).getTime()-Start) +'msec');//log parsing time
	}

	 /*
	 *スタイル設定
	 */
	function setStyle() {
		var css =
			//NGワード
			".GM_fcn_ng_words {" +
			"  display: none;" +
			"}" +
			//NG番号
			".GM_fcn_ng_numbers {" +
			"  display: none;" +
			"}" +
			//NGボタン
			".GM_fcn_ng_button {" +
			"  font-size: small;" +
			"}" +
			//NGメニュー
			".GM_fcn_ng_menu {" +
			"  font-size: medium;" +
			"}";
		GM_addStyle(css);
	}

})(jQuery);
