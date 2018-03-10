// ==UserScript==
// @name        futaba_catalog_NG
// @namespace   https://github.com/akoya-tomo
// @description カタログのスレをＮＧで非表示
// @author      akoya_tomo
// @include     http://*.2chan.net/*/futaba.*
// @include     https://*.2chan.net/*/futaba.*
// @version     1.2.5
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require     https://cdn.jsdelivr.net/npm/js-md5@0.7.3/src/md5.min.js
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
	var USE_NG_IMAGES = true;	//スレ画像のNGを有効化する
	var MAX_NG_THREADS = 500;	//NGスレの最大保持数（板毎）
	var MAX_OK_IMAGES = 500;	//非NG画像名の最大保持数（板毎）

	var serverName = document.domain.match(/^[^.]+/);
	var pathName = location.pathname.match(/[^/]+/);
	var serverFullPath = serverName + "_" + pathName;
	var select_index = -1;
	var imageList,commentList,dateList,images,ng_date,ok_images;

	init();

	function init(){
		initNgNumber();
		if (!isCatalog()) return;
		console.log("futaba_catalog_NG commmon: " +
			GM_getValue("_futaba_catalog_NG_words", ""));
		console.log("futaba_catalog_NG indivisual: " +
			getCurrentIndivValue("NG_words_indiv", ""));
		GM_registerMenuCommand("ＮＧワード編集", editNgWords);
		if (USE_NG_IMAGES) GM_registerMenuCommand("ＮＧリスト編集", editNgList);
		setStyle();
		makeNgMenubar();
		makeConfigUI();
		makeNgListUI();
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
		setIndivValue("NG_numbers_indiv", []);
	}

	/*
	 *カタログ確認
	 */
	function isCatalog(){
		return location.search.match(/mode=cat/) !== null;
	}

	/*
	 * 各板個別NGデータを保存
	 */
	function setIndivValue(target, val) {
		var obj_indiv = getIndivObj(target);
		if (obj_indiv === "") {
			obj_indiv = {};
		}
		obj_indiv[serverFullPath] = val;
		var jsonstring = JSON.stringify(obj_indiv);
		GM_setValue(target, jsonstring);
		//console.log("futaba_catalog_NG: " + target + " updated@" + serverFullPath + " - " + val);
	}

	/*
	 * 各板個別NGデータのオブジェクトを取得
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
		var words_indiv = getCurrentIndivValue("NG_words_indiv", "");
		$("#GM_fcn_ng_words_common").val(words_commmon);
		$("#GM_fcn_ng_words_individual").val(words_indiv);
		var $config_container_ = $("#GM_fcn_config_container");
		$config_container_.fadeIn(100);
	}

	/*
	 * 表示中の板の個別NGデータを取得
	 */
	function getCurrentIndivValue(target, default_val) {
		var indivobj = getIndivObj(target);
		var str_CurrentIndiv;
		if (indivobj !== "") {
			str_CurrentIndiv = indivobj[serverFullPath];
		}
		if (!str_CurrentIndiv) {
			str_CurrentIndiv = default_val;
		}
		return str_CurrentIndiv;
	}

	/*
	 *NGリスト編集画面表示
	 */
	function editNgList() {
		// マウスホイールリロード対策
		$("<div>", {
			id: "GM_fcn_catalog_space"
		}).appendTo("body");
		var position = $(window).scrollTop();
		if ($(window).scrollTop() < 1) {
			$("html, body").scrollTop(1);
		}
		$("html, body").css("overflow", "hidden");

		refreshNgList();
		var $ng_list_container_ = $("#GM_fcn_ng_list_container");
		$ng_list_container_.fadeIn(100);
	}

	/*
	 *NGリスト更新
	 */
	function refreshNgList() {
		imageList = GM_getValue("_futaba_catalog_NG_images", []);
		commentList = GM_getValue("_futaba_catalog_NG_comment", []);
		dateList = GM_getValue("_futaba_catalog_NG_date", []);
		var listCount = imageList.length;
		$(".GM_fcn_ng_list_row").remove();

		for (var i = 0; i < listCount; i++) {
			var row = $("<div>", {
				class: "GM_fcn_ng_list_row",
				click: function(){
					select_index = $(this).index();
					selectNgList();
				}
			}).appendTo("#GM_fcn_ng_list_content");
			row.append(
				$("<div>", {
					class: "GM_fcn_ng_list_image",
					text: imageList[i],
				}),
				$("<div>", {
					class: "GM_fcn_ng_list_comment",
					text: commentList[i],
				}),
				$("<div>", {
					class: "GM_fcn_ng_list_date",
					text: dateList[i],
				}),
				$("<div>", {
					class: "GM_fcn_ng_list_scrl",
				})
			);
		}
		$(".GM_fcn_ng_list_row").css("background-color", "#ffffff");
	}

	/*
	 *NGリスト選択
	 */
	function selectNgList() {
		$(".GM_fcn_ng_list_row").css("background-color", "#ffffff")
			.eq(select_index).css("background-color","#ffecfd");
		$("#GM_fcn_md5").val(imageList[select_index]);
		$("#GM_fcn_comment").val(commentList[select_index]);
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
		if (USE_NG_IMAGES) {
			//NGリスト
			var $ng_list_header = $("<span>", {
				id: "GM_fcn_ng_list_header",
				text: "ＮＧリスト",
				css: {
					"background-color": "#F0E0D6",
					fontWeight: "bolder",
					"padding-right": "16px"
				}
			});
			$ng_words_header.after($ng_list_header);
			//NGリスト編集ボタン
			var $ng_list_button = $("<span>", {
				id: "GM_fcn_edit_ng_list",
				text: "[編集]",
				css: {
					cursor: "pointer",
				},
				click: function() {
					editNgList();
				}
			});
			$ng_list_button.hover(function () {
				$(this).css({ backgroundColor:"#EEAA88" });
			}, function () {
				$(this).css({ backgroundColor:"#F0E0D6" });
			});
			$ng_list_header.append($ng_list_button);
		}
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
				$("<div>").text("ＮＧワード編集").css({
					"background-color": "#ffeeee",
					"padding": "2px",
					"font-weight": "bold"
				}),
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
	* NGリスト編集画面
	*/
	function makeNgListUI() {
		if (!USE_NG_IMAGES) {
			GM_setValue("OK_images_indiv", "");
			return;
		}
		imageList = GM_getValue("_futaba_catalog_NG_images", "");
		commentList = GM_getValue("_futaba_catalog_NG_comment", "");

		var $ng_list_container = $("<div>", {
			id: "GM_fcn_ng_list_container",
			css: {
				position: "fixed",
				"z-index": "1001",
				left: "50%",
				top: "50%",
				"text-align": "center",
				"margin-left": "-475px",
				"margin-top": "-250px",
				"background-color": "rgba(240, 192, 214, 0.95)",
				width: "950px",
				//height: "500px",
				display: "none",
				fontWeight: "normal",
				"box-shadow": "3px 3px 5px #853e52",
				"border": "1px outset",
				"border-radius": "10px",
				"padding": "5px",
			}
		});
		$("#GM_fcn_ng_list_header").append($ng_list_container);
		$ng_list_container.append(
			$("<div>").append(
				$("<div>").text("ＮＧリスト編集").css({
					"background-color": "#ffeeee",
					"padding": "2px",
					"font-weight": "bold"
				}),
				$("<div>").css("margin-top", "1em").append(
					$("<div>").append(
						$("<label>").text("md5：").attr("for", "GM_fcn_md5"),
						$("<input>").attr({
							"id": "GM_fcn_md5",
							"class": "GM_fcn_ng_list_input",
							"readonly": "readonly"
						}).css("width", "360px"),
						$("<label>").text("コメント：").attr("for", "GM_fcn_comment"),
						$("<input>").attr({
							"id": "GM_fcn_comment",
							"class": "GM_fcn_ng_list_input"
						}).css("width", "360px")
					)
				),
				$("<div>").css("margin-top", "1em").append(
					$("<div>").append(
						$("<span>").append(
							$("<input>", {
								class: "GM_fcn_ng_list_button",
								type: "button",
								val: "修正",
								width: "70px",
								click: function(){
									editNgListRow();
								},
							})
						),
						$("<span>").append(
							$("<input>", {
								class: "GM_fcn_ng_list_button",
								type: "button",
								val: "削除",
								width: "70px",
								click: function(){
									deleteNgListRow();
								},
							})
						)
					)
				)
			),
			$("<div>").css("margin-top", "1em").append(
				$("<div>", {
					id: "GM_fcn_ng_list_pane",
				}).append(
					$("<div>", {
						id: "GM_fcn_ng_list_item"
					}).append(
						$("<div>", {
							class: "GM_fcn_ng_list_item",
							text: "md5",
							width: "358px",
						}),
						$("<div>", {
							class: "GM_fcn_ng_list_item",
							text: "コメント",
							width: "258px",
						}),
						$("<div>", {
							class: "GM_fcn_ng_list_item",
							text: "最終検出日",
							width: "98px",
						}),
						$("<div>", {
							class: "GM_fcn_ng_list_item",
							text: "　",
							width: "16px",
						})
					),
					$("<div>", {
						id: "GM_fcn_ng_list_content"
					})
				),
				$("<div>").css({
					"margin-top": "1em",
				}).append(
					$("<span>").css("margin", "0 1em").append(
						$("<input>", {
							class: "GM_fcn_close_button",
							type: "button",
							val: "閉じる",
							click: function(){
								$(".GM_fcn_ng_list_row").css("background-color", "#ffffff");
								$("#GM_fcn_md5").val("");
								$("#GM_fcn_comment").val("");
								$("#GM_fcn_catalog_space").remove();
								$("html, body").css("overflow", "");
								$ng_list_container.fadeOut(100);
								$(".GM_fcn_ng_images").css("display","");
								$(".GM_fcn_ng_images").removeClass("GM_fcn_ng_images");
								hideNgThreads();
							},
						})
					)
				)
			)
		);
		$(".GM_fcn_close_button").css({
			"cursor": "pointer",
			"background-color": "#FFECFD",
			"border": "2px outset #96ABFF",
			"border-radius": "5px",
		}).hover(function() {
			$(this).css("background-color", "#CCE9FF");
		}, function() {
			$(this).css("background-color", "#FFECFD");
		});

		function editNgListRow() {
			if (select_index > -1) {
				commentList[select_index] = $("#GM_fcn_comment").val();
				GM_setValue("_futaba_catalog_NG_comment", commentList);
				$(".GM_fcn_ng_list_comment").eq(select_index).text(commentList[select_index]);
			}
		}

		function deleteNgListRow() {
			if (select_index > -1) {
				imageList.splice(select_index, 1);
				commentList.splice(select_index, 1);
				dateList.splice(select_index, 1);
			}
			$(".GM_fcn_ng_list_row").css("background-color", "#ffffff");
			$("#GM_fcn_md5").val("");
			$("#GM_fcn_comment").val("");
			select_index = -1;
			GM_setValue("_futaba_catalog_NG_images", imageList);
			GM_setValue("_futaba_catalog_NG_comment", commentList);
			GM_setValue("_futaba_catalog_NG_date", dateList);
			refreshNgList();
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
							makeNgButton();
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
		if (location.search.match(/mode=catset/)) return;
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
				"z-index": "100",
				position: "absolute",
				top: "16px",
				left: "0px",
				"min-width": "140px",
				width: "100%",
				"border": "1px outset",
				"border-radius": "5px",
				"padding": "5px",
			}
		});

		$("body > table[border] td").each(function(){
			if (!$(this).children(".GM_fcn_ng_button").length) {
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
			}
		});
	}

	/*
	 *NGボタンメニュー作成
	 */
	function makeNgButtonMenu($button) {
		if (!$button.find(".GM_fcn_ng_menu_item").length) {
			//スレNG
			var $ng_number = $("<div>", {
				class: "GM_fcn_ng_menu_item",
				text: "スレNG",
				css: {
					color: "blue",
					"background-color": "rgba(240, 224, 214, 0.95)",
				}
			});
			//本文NG
			var $ng_word_common = $("<div>", {
				class: "GM_fcn_ng_menu_item",
				text: "本文NG（共通）",
				css: {
					color: "blue",
					"background-color": "rgba(240, 224, 214, 0.95)",
				}
			});
			var $ng_word_indiv = $("<div>", {
				class: "GM_fcn_ng_menu_item",
				text: "本文NG（板別）",
				css: {
					color: "blue",
					"background-color": "rgba(240, 224, 214, 0.95)",
				}
			});
			//画像NG
			var $ng_image = $("<div>", {
				class: "GM_fcn_ng_menu_item",
				text: "画像NG",
				css: {
					color: "blue",
					"background-color": "rgba(240, 224, 214, 0.95)",
				}
			});

			var $td = $button.parent("td");
			var thread_number = $td.children("a:first").length ? $td.children("a:first").attr("href").slice(4,-4) : "";
			var thread_img_obj = $td.find("img:first").length ? $td.find("img:first")[0] : "";
			var thread_comment = $td.find("small:first").length ? $td.find("small:first").text() : "";

			var ng_number = $ng_number.clone();
			var ng_word_common = $ng_word_common.clone();
			var ng_word_indiv = $ng_word_indiv.clone();
			var ng_image = $ng_image.clone();

			ng_number.hover(function () {
				$(this).css("color", "red");
				$(this).css("background-color", "rgba(204, 233, 255, 0.95)");
			}, function () {
				$(this).css("color", "blue");
				$(this).css("background-color", "rgba(240, 224, 214, 0.95)");
			});
			ng_number.click(function () {
				setNgNumber(thread_number);
				$td.addClass("GM_fcn_ng_numbers");
				$td.css("display","none");
			});

			ng_word_common.hover(function () {
				$(this).css("color", "red");
				$(this).css("background-color", "rgba(204, 233, 255, 0.95)");
			}, function () {
				$(this).css("color", "blue");
				$(this).css("background-color", "rgba(240, 224, 214, 0.95)");
			});
			ng_word_common.click(function () {
				var words = GM_getValue("_futaba_catalog_NG_words", "");
				words = addNgWord(words, thread_comment);
				GM_setValue("_futaba_catalog_NG_words", words);
				$td.addClass("GM_fcn_ng_words");
				$td.css("display","none");
			});

			ng_word_indiv.hover(function () {
				$(this).css("color", "red");
				$(this).css("background-color", "rgba(204, 233, 255, 0.95)");
			}, function () {
				$(this).css("color", "blue");
				$(this).css("background-color", "rgba(240, 224, 214, 0.95)");
			});
			ng_word_indiv.click(function () {
				var words = getCurrentIndivValue("NG_words_indiv", "");
				words = addNgWord(words, thread_comment);
				setIndivValue("NG_words_indiv", words);
				$td.addClass("GM_fcn_ng_words");
				$td.css("display","none");
			});

			ng_image.hover(function () {
				$(this).css("color", "red");
				$(this).css("background-color", "rgba(204, 233, 255, 0.95)");
			}, function () {
				$(this).css("color", "blue");
				$(this).css("background-color", "rgba(240, 224, 214, 0.95)");
			});
			ng_image.click(function () {
				hideNgImageThread(thread_img_obj, thread_comment, $td);
			});

			if (thread_number) {
				$button.children(".GM_fcn_ng_menu").append(ng_number);
			}
			if (thread_comment) {
				$button.children(".GM_fcn_ng_menu").append(ng_word_common);
				$button.children(".GM_fcn_ng_menu").append(ng_word_indiv);
			}
			if (thread_img_obj && USE_NG_IMAGES) {
				$button.children(".GM_fcn_ng_menu").append(ng_image);
			}
		}
		$button.children(".GM_fcn_ng_menu").css("display", "block");
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
		 *NGワード追加
		 */
		function addNgWord(ng_words, new_ng_word) {
			if (new_ng_word && ng_words) {
				ng_words = new_ng_word + "|" + ng_words;
			} else {
				ng_words += new_ng_word;
			}
			return ng_words;
		}
		/*
		 *スレ画像NG
		 */
		function hideNgImageThread(img_obj, comment, $td) {
			var data = getBase64(img_obj);
			//console.log("futaba_catalog_NG: data = " + data);
			if (!data) {
				alert("スレ画像の取得に失敗しました");
				return;
			}
			var hexHash = md5(data);
			//console.log("futaba_catalog_NG: hexHash = " + hexHash);
			setNgListObj("_futaba_catalog_NG_images", hexHash);
			setNgListObj("_futaba_catalog_NG_comment", comment);
			setNgListObj("_futaba_catalog_NG_date", getDate());
			$td.addClass("GM_fcn_ng_images");
			$td.css("display","none");
			// 非NG画像リストからNG画像を削除
			var ok_images = getCurrentIndivValue("OK_images_indiv", []);
			var img_num = parseInt($td.find("img").attr("src").match(/(\d+)s\.jpg$/)[1]);
			var index = ok_images.indexOf(img_num);
			if (index > -1) {
				ok_images.splice(index, 1);
				setIndivValue("OK_images_indiv", ok_images);
			}

			function setNgListObj(target, val) {
				var obj_ng = GM_getValue(target, "");
				if (obj_ng === ""){
					obj_ng = [];
				}
				obj_ng.unshift(val);
				if (obj_ng.length > MAX_NG_THREADS) {
					obj_ng.pop();
				}
				GM_setValue(target, obj_ng);
			}
		}
	}

	 /*
	 *Base64取得
	 */
	function getBase64(img_obj){
		if (!img_obj) return;
		if (!img_obj.complete || !img_obj.width || !img_obj.height) return;
		// canvasを生成してimg要素を反映
		var cvs = document.createElement("canvas");
		cvs.width  = img_obj.width;
		cvs.height = img_obj.height;
		var ctx = cvs.getContext("2d");
		ctx.drawImage(img_obj, 0, 0);
		// canvasをBase64化
		var data;
		try {
			data = cvs.toDataURL("image/jpeg");
		} catch (e) {
			console.log("futaba_catalog_NG toDataURL error: " + img_obj.src);
			return;
		}
    	if (data.substr(0,23) !== "data:image/jpeg;base64,"){
			console.log("futaba_catalog_NG toDataURL abnormal: " + img_obj.src + ", " + data);
			return;
		}
		return data;
	}

	 /*
	 *日付取得
	 */
	function getDate() {
		var now = new Date();
		var date = ("" + (now.getFullYear())).slice(-2) + "/" +
			("0" + (now.getMonth() + 1)).slice(-2) + "/" +
			("0" + now.getDate()).slice(-2);
		return date;
	}

	/*
	 *カタログを検索してＮＧスレを非表示
	 */
	function hideNgThreads(isWordsChanged) {
		var Start = new Date().getTime();//count parsing time
		var words = "";
		var words_common = GM_getValue("_futaba_catalog_NG_words", "");
		var words_indiv = getCurrentIndivValue("NG_words_indiv", "");
		var numbers = getCurrentIndivValue("NG_numbers_indiv", []);
		images = GM_getValue("_futaba_catalog_NG_images", "");
		ng_date = GM_getValue("_futaba_catalog_NG_date", "");
		ok_images = getCurrentIndivValue("OK_images_indiv", []);

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
		//console.dir("futaba catalog NG: images.length = " + images.length);
		try {
			var re = new RegExp(words, "i");
		}
		catch (e) {
			alert("NGワードのパターンが無効です\n\n" + e);
			editNgWords();
			return;
		}
		if (isWordsChanged) {
			$(".GM_fcn_ng_words").css("display","");
			$(".GM_fcn_ng_words").removeClass("GM_fcn_ng_words");
		}
		if (words !== "") {
			$("body > table[border] td small").each(function(){
				if (re.test($(this).text())) {
					if ($(this).parent("a").length) {		//文字スレ
						$(this).parent().parent("td").addClass("GM_fcn_ng_words");
						$(this).parent().parent("td").css("display","none");
					} else {
						$(this).parent("td").addClass("GM_fcn_ng_words");
						$(this).parent().parent("td").css("display","none");
					}
				}
			});
		}
		if (isWordsChanged) {
			console.log('futaba_catalog_NG - Parsing@' + serverFullPath + ': '+((new Date()).getTime()-Start) +'msec');//log parsing time
			return;
		}
		if (numbers.length) {
			$("body > table[border] td a").each(function(){
				var href_num = $(this).attr("href").slice(4,-4);
				if (numbers.indexOf(href_num) > -1){
					$(this).parent("td").addClass("GM_fcn_ng_numbers");
					$(this).parent("td").css("display","none");
				}
			});
		}
		if (images.length) {
			$("body > table[border] td a img").each(function(){
				var img_src = $(this).attr("src").match(/(\d+)s\.jpg$/);
				if (img_src) {
					var img_num = parseInt(img_src[1]);
					if (ok_images.indexOf(img_num) == -1) {
						var img_obj = $(this)[0];
						var data = getBase64(img_obj);
						if (data) {
							var hexHash = md5(data);
							var images_index = images.indexOf(hexHash);
							if (images_index > -1){
								$(this).parent().parent("td").addClass("GM_fcn_ng_images");
								$(this).parent().parent("td").css("display","none");
								ng_date[images_index] = getDate();
							} else if (hexHash.length == 32) {
								ok_images.unshift(img_num);
							} else {
								console.log("futaba_catalog_NG hexHash abnormal: " + img_num + ", " + hexHash);
							}
						} else {
							// 画像読込完了確認
							var img = new Image();
							img.onload = function() {
								var img_num = parseInt($(this).attr("src").match(/(\d+)s\.jpg$/)[1]);
								var data = getBase64($(this)[0]);
								if (data) {
									var hexHash = md5(data);
									var images_index = images.indexOf(hexHash);
									if (images_index > -1){
										$(img_obj).parent().parent("td").addClass("GM_fcn_ng_images");
										$(img_obj).parent().parent("td").css("display","none");
										ng_date[images_index] = getDate();
									} else if (hexHash.length == 32) {
										ok_images.unshift(img_num);
									} else {
										console.log("futaba_catalog_NG hexHash abnormal: " + img_num + ", " + hexHash);
									}
								} else {
									console.log("futaba_catalog_NG img.onload data abnormal: " + img_num);
								}
							};
							img.src = $(this)[0].src;
						}
					}
				}
			});
			GM_setValue("_futaba_catalog_NG_date", ng_date);
			if (ok_images.length > MAX_OK_IMAGES) {
				ok_images.splice(MAX_OK_IMAGES);
			}
			setIndivValue("OK_images_indiv", ok_images);
		} else if (USE_NG_IMAGES) {
			$("body > table[border] td a img").each(function(){
				var img_src = $(this).attr("src").match(/(\d+)s\.jpg$/);
				if (img_src) {
					var img_num = parseInt(img_src[1]);
					if (ok_images.indexOf(img_num) == -1) {
						ok_images.unshift(img_num);
					}
				}
			});
			if (ok_images.length > MAX_OK_IMAGES) {
				ok_images.splice(MAX_OK_IMAGES);
			}
			setIndivValue("OK_images_indiv", ok_images);
		}
		console.log("futaba_catalog_NG: ok_images.length = " + ok_images.length);
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
			//NG画像
			".GM_fcn_ng_images {" +
			"  display: none;" +
			"}" +
			//NGボタン
			".GM_fcn_ng_button {" +
			"  font-size: small;" +
			"}" +
			//NGメニュー
			".GM_fcn_ng_menu {" +
			"  font-size: medium;" +
			"}" +
			//NGメニュー項目
			".GM_fcn_ng_menu_item {" +
			"  padding: 5px;" +
			"  z-index: 1;" +
			"  cursor: pointer;" +
			"}" +
			//NGリストラベル
			".GM_fcn_ng_list_label {" +
			"  display: inline-block;" +
			"  width: 100px;" +
			"}" +
			//NGリスト入力
			".GM_fcn_ng_list_input {" +
			"  margin-right: 16px;" +
			"}" +
			//NGリストボタン
			".GM_fcn_ng_list_button {" +
			"  margin-right: 16px;" +
			"}" +
			//NGリスト枠
			"#GM_fcn_ng_list_pane {" +
			"  width: 738px;" +
			"  height: 308px;" +
			"  margin-left: 105px;" +
			"  border-width: 1px;" +
			"  border-style: solid;" +
			"  background-color: #eee;" +
			"}" +
			//NGリスト項目
			".GM_fcn_ng_list_item {" +
			"  display: inline-block;" +
			"  height: 20px;" +
			"  border-width: 1px;" +
			"  border-style: solid;" +
			"}" +
			//NGリストコンテンツ
			"#GM_fcn_ng_list_content {" +
			"  width: 738px;" +
			"  height: 286px;" +
			"  overflow-x: hidden;" +
			"  overflow-y: auto;" +
			"}" +
			//NGリスト行
			".GM_fcn_ng_list_row {" +
			"  width: 738px;" +
			"  height: 22px;" +
			"  cursor: pointer;" +
			"}" +
			//NGリスト画像
			".GM_fcn_ng_list_image {" +
			"  display: inline-block;" +
			"  width: 358px;" +
			"  height: 20px;" +
			"  border-width: 1px;" +
			"  border-style: solid;" +
			"  overflow: hidden;" +
			"  white-space: nowrap;" +
			"  text-overflow: ellipsis;" +
			"}" +
			//NGリストコメント
			".GM_fcn_ng_list_comment {" +
			"  display: inline-block;" +
			"  width: 253px;" +
			"  height: 20px;" +
			"  padding-left: 5px;" +
			"  border-width: 1px;" +
			"  border-style: solid;" +
			"  overflow: hidden;" +
			"  white-space: nowrap;" +
			"  text-overflow: ellipsis;" +
			"}" +
			//NGリスト日時
			".GM_fcn_ng_list_date {" +
			"  display: inline-block;" +
			"  width: 98px;" +
			"  height: 20px;" +
			"  border-width: 1px;" +
			"  border-style: solid;" +
			"  overflow: hidden;" +
			"  white-space: nowrap;" +
			"  text-overflow: ellipsis;" +
			"}" +
			//NGリストスクロールバー
			".GM_fcn_ng_list_scrl {" +
			"  display: inline-block;" +
			"  min-width: 16px;" +
			"  min-height: 22px;" +
			"  border-width: 0px 1px;" +
			"  border-style: solid;" +
			"}" +
			//カタログ下スペース
			"#GM_fcn_catalog_space {" +
			"  min-height: 2000px;" +
			"}";
		GM_addStyle(css);
	}

})(jQuery);

