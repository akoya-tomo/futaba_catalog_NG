// ==UserScript==
// @name        futaba_catalog_NG
// @namespace   https://github.com/akoya-tomo
// @description カタログのスレをＮＧで非表示
// @author      akoya_tomo
// @include     http://*.2chan.net/*/futaba.php?mode=cat*
// @include     https://*.2chan.net/*/futaba.php?mode=cat*
// @version     1.5.2
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require     https://cdn.jsdelivr.net/npm/js-md5@0.7.3/src/md5.min.js
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @license     MIT
// @run-at      document-start
// @icon        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMjHxIGmVAAABXElEQVQ4T8VSTUvDQBRcEcGL0H+QQ3c3KSVtmhRMe5aC4rX+Fb15F/PVUqFSqwcV8SxSPYknUcSDKCqICNZ/YBEv62xcS0CQ5iBOeMm+92beDrsh/w8WMIuFrEdD2kdc8ZAvacvapGoPIWs84IsxJ+J96I6yftYmKLywiInCekFUdirCbJsCzfNiUMwoLdECLQPe2TfH6lhCarDxK8HrKU5UlLfKwu7agvnsUOkJDehBaaMknE1nyIsjYM8ExBkMGSQbkiid0FU6D9uzcv1DHLEB9Wkt3kH3dBNDTpIEd9uVFvdA2o3XiR4cnfIVXojFScDSNAghnnu9qUuLD1jf5Vo5gTN4RETUo66i/w7msTmI3yH64D5fQGnsq5MCcHCNa71VaXpgwAXiUqXpgd1vEOkH5Fv5mt7Qj+WJG01jTZVHh9Ewuvhd3+S32qlOqfLoqO/Xx522M6HSvwQhn8ChorvE+0t7AAAAAElFTkSuQmCC
// ==/UserScript==

/* globals jQuery, md5 */
this.$ = this.jQuery = jQuery.noConflict(true);

(function ($) {
	/**
	 *	設定
	 */
	var USE_NG_IMAGES = true;				// スレ画像のNGを有効にする
	var MAX_NG_THREADS = 500;				// NGスレの最大保持数（板毎）
	var MAX_OK_IMAGES = 500;				// 非NG画像名の最大保持数（板毎）
	var HIDE_CATALOG_BEFORE_LOAD = false;	// ページの読み込みが完了するまでカタログを隠す
	var USE_NG_THREAD_CLEAR_BUTTON = false;	// スレNGのクリアボタンを使用する

	var serverName = document.domain.match(/^[^.]+/);
	var pathName = location.pathname.match(/[^/]+/);
	var serverFullPath = serverName + "_" + pathName;
	var selectIndex = -1;
	var imageList, commentList, dateList, images, ngDate, okImages;

	if (HIDE_CATALOG_BEFORE_LOAD) {
		hideCatalog();
	} else {
		$(init);
	}

	function init(){
		clearNgNumber();
		console.log("futaba_catalog_NG commmon: " +	// eslint-disable-line no-console
			GM_getValue("_futaba_catalog_NG_words", ""));
		console.log("futaba_catalog_NG indivisual: " +	// eslint-disable-line no-console
			getCurrentIndivValue("NG_words_indiv", ""));
		GM_registerMenuCommand("ＮＧワード編集", editNgWords);
		if (USE_NG_IMAGES) GM_registerMenuCommand("ＮＧリスト編集", editNgList);
		GM_registerMenuCommand("スレＮＧクリア", confirmClearNgNumber);
		setStyle();
		makeNgMenubar();
		makeConfigUI();
		makeNgListUI();
		makeNgButton();
		hideNgThreads();
		checkAkahukuReload();
		listenKoshianDelEvent();
		listenFthPickupEvent();
	}

	/**
	 * NG番号クリア
	 * @param {boolern} forced 強制的にクリアするか
	 */
	function clearNgNumber(forced) {
		if (!forced && window.name) return;
		window.name = location.href;
		setIndivValue("NG_numbers_indiv", []);
	}

	/**
	 * 各板個別NGデータを保存
	 * @param {string} target 保存するNG名
	 * @param {string|Array} val 保存するNGデータ
	 */
	function setIndivValue(target, val) {
		var indivObj = getIndivObj(target);
		if (indivObj === "") {
			indivObj = {};
		}
		indivObj[serverFullPath] = val;
		var jsonString = JSON.stringify(indivObj);
		GM_setValue(target, jsonString);
		//console.log("futaba_catalog_NG: " + target + " updated@" + serverFullPath + " - " + val);
	}

	/**
	 * 各板個別NGデータのオブジェクトを取得
	 * @param {string} target 取得するNG名
	 * @return {object} 取得したNGデータ
	 */
	function getIndivObj(target) {
		var indivVal = GM_getValue(target, "");
		var indivObj = "";
		if (indivVal !== "") {
			indivObj = JSON.parse(indivVal);
		}
		return indivObj;
	}

	/**
	 * NGワード編集メニュー表示
	 */
	function editNgWords(){
		var wordsCommon = GM_getValue("_futaba_catalog_NG_words", "");
		var wordsIndiv = getCurrentIndivValue("NG_words_indiv", "");
		$("#GM_fcn_ng_words_common").val(wordsCommon);
		$("#GM_fcn_ng_words_individual").val(wordsIndiv);
		var $configContainer = $("#GM_fcn_config_container");
		$configContainer.fadeIn(100);
	}

	/**
	 * 現在の板の個別NGデータを取得
	 * @param {string} target NGデータ名
	 * @param {string|Array} defaultVal NGデータが未定義のときの既定値
	 * @return {string|Array} 現在の板の個別NGデータ
	 */
	function getCurrentIndivValue(target, defaultVal) {
		var indivObj = getIndivObj(target);
		var currentIndivVal;
		if (indivObj !== "") {
			currentIndivVal = indivObj[serverFullPath];
		}
		if (!currentIndivVal) {
			currentIndivVal = defaultVal;
		}
		return currentIndivVal;
	}

	/**
	 * NGリスト編集メニュー表示
	 */
	function editNgList() {
		// マウスホイールリロード対策
		$("<div>", {
			id: "GM_fcn_catalog_space"
		}).appendTo("body");
		if ($(window).scrollTop() < 1) {
			$("html, body").scrollTop(1);
		}
		$("html, body").css("overflow", "hidden");

		refreshNgList();
		var $ngListContainer = $("#GM_fcn_ng_list_container");
		$ngListContainer.fadeIn(100);
	}

	/**
	 * スレNGクリア確認
	 */
	function confirmClearNgNumber() {
		if (confirm("この板のスレNGを全てクリアします。\nよろしいですか？")) {
			$(".GM_fcn_ng_numbers").each(function(){
				$(this).removeClass("GM_fcn_ng_numbers");
				$(this).css("display","");
			});
			clearNgNumber(true);
		}
	}

	/**
	 * NGリスト更新
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
				click: function(){	// eslint-disable-line no-loop-func
					selectIndex = $(this).index();
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

	/**
	 * NGリスト選択
	 */
	function selectNgList() {
		$(".GM_fcn_ng_list_row").css("background-color", "#ffffff")
			.eq(selectIndex).css("background-color","#ffecfd");
		$("#GM_fcn_md5").val(imageList[selectIndex]);
		$("#GM_fcn_comment").val(commentList[selectIndex]);
	}

	/**
	 * NGメニューバー作成
	 */
	function makeNgMenubar() {
		var $ngMenubarArea = $("<div>", {
			id: "GM_fcn_ng_menubar",
			css: {
				"background-color": "#F0E0D6"
			}
		});
		var $ngWordsHeader = $("<span>", {
			id: "GM_fcn_ng_words_header",
			text: "ＮＧワード",
			css: {
				"background-color": "#F0E0D6",
				fontWeight: "bolder",
				"padding-right": "16px"
			}
		});
		$("body > table[border]").before($ngMenubarArea);
		$ngMenubarArea.append($ngWordsHeader);
		// 設定ボタン
		var $ngWordsButton = $("<span>", {
			id: "GM_fcn_config_ng_words",
			text: "[設定]",
			css: {
				cursor: "pointer",
			},
			click: function() {
				editNgWords();
			}
		});
		$ngWordsButton.hover(function () {
			$(this).css({ backgroundColor:"#EEAA88" });
		}, function () {
			$(this).css({ backgroundColor:"#F0E0D6" });
		});
		$ngWordsHeader.append($ngWordsButton);

		if (USE_NG_THREAD_CLEAR_BUTTON) {
			// スレNG
			var $ngThreadHeader = $("<span>", {
				id: "GM_fcn_ng_thread_header",
				text: "スレＮＧ",
				css: {
					"background-color": "#F0E0D6",
					fontWeight: "bolder",
					"padding-right": "16px"
				}
			});
			$ngWordsHeader.after($ngThreadHeader);
			// スレNGクリアボタン
			var $ngThreadClearButton = $("<span>", {
				id: "GM_fcn_ng_thread_clear_button",
				text: "[クリア]",
				css: {
					cursor: "pointer",
				},
				click: function() {
					confirmClearNgNumber();
				}
			});
			$ngThreadClearButton.hover(function () {
				$(this).css({ backgroundColor:"#EEAA88" });
			}, function () {
				$(this).css({ backgroundColor:"#F0E0D6" });
			});
			$ngThreadHeader.append($ngThreadClearButton);
		}

		if (USE_NG_IMAGES) {
			// NGリスト
			var $ngListHeader = $("<span>", {
				id: "GM_fcn_ng_list_header",
				text: "ＮＧリスト",
				css: {
					"background-color": "#F0E0D6",
					fontWeight: "bolder",
					"padding-right": "16px"
				}
			});
			$ngWordsHeader.after($ngListHeader);
			// NGリスト編集ボタン
			var $ngListButton = $("<span>", {
				id: "GM_fcn_edit_ng_list",
				text: "[編集]",
				css: {
					cursor: "pointer",
				},
				click: function() {
					editNgList();
				}
			});
			$ngListButton.hover(function () {
				$(this).css({ backgroundColor:"#EEAA88" });
			}, function () {
				$(this).css({ backgroundColor:"#F0E0D6" });
			});
			$ngListHeader.append($ngListButton);
		}
	}

	/**
	 * NGワード編集メニュー作成
	 */
	function makeConfigUI() {
		var $configContainer = $("<div>", {
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
		$("#GM_fcn_ng_words_header").append($configContainer);
		$configContainer.append(
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
							$configContainer.fadeOut(100);
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

		/**
		 * カーソル位置にデリミタ挿入
		 * @param {string} id デリミタを挿入する入力欄のID名
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

	/**
	 * NGワードをセット
	 */
	function setNgWords() {
		var inputCommon = $("#GM_fcn_ng_words_common").val();
		var inputIndiv = $("#GM_fcn_ng_words_individual").val();
		GM_setValue("_futaba_catalog_NG_words", inputCommon);
		console.log("futaba_catalog_NG: common NGword updated - " + inputCommon);	// eslint-disable-line no-console
		setIndivValue("NG_words_indiv", inputIndiv);
		$("#GM_fcn_config_container").fadeOut(100);
		hideNgThreads(true);
	}

	/**
	 * NGリスト編集メニュー作成
	 */
	function makeNgListUI() {
		if (!USE_NG_IMAGES) {
			GM_setValue("OK_images_indiv", "");
			return;
		}
		imageList = GM_getValue("_futaba_catalog_NG_images", "");
		commentList = GM_getValue("_futaba_catalog_NG_comment", "");

		var $ngListContainer = $("<div>", {
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
		$("#GM_fcn_ng_list_header").append($ngListContainer);
		$ngListContainer.append(
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
									editSelectedRow();
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
									deleteSelectedRow();
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
								$("#GM_fcn_ng_list_content").scrollTop(0);
								$("#GM_fcn_catalog_space").remove();
								$("html, body").css("overflow", "");
								$ngListContainer.fadeOut(100);
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

		/**
		 * NGリスト選択行コメント修正
		 */
		function editSelectedRow() {
			if (selectIndex > -1) {
				commentList[selectIndex] = $("#GM_fcn_comment").val();
				GM_setValue("_futaba_catalog_NG_comment", commentList);
				$(".GM_fcn_ng_list_comment").eq(selectIndex).text(commentList[selectIndex]);
			}
		}

		/**
		 * NGリスト選択行削除
		 */
		function deleteSelectedRow() {
			if (selectIndex > -1) {
				imageList.splice(selectIndex, 1);
				commentList.splice(selectIndex, 1);
				dateList.splice(selectIndex, 1);
			}
			$(".GM_fcn_ng_list_row").css("background-color", "#ffffff");
			$("#GM_fcn_md5").val("");
			$("#GM_fcn_comment").val("");
			selectIndex = -1;
			GM_setValue("_futaba_catalog_NG_images", imageList);
			GM_setValue("_futaba_catalog_NG_comment", commentList);
			GM_setValue("_futaba_catalog_NG_date", dateList);
			refreshNgList();
		}
	}

	/**
	 * 赤福の動的リロードの状態を取得
	 */
	function checkAkahukuReload() {
		var target = $("#akahuku_catalog_reload_status").get(0);
		if (target) {
			checkAkahukuReloadStatus();
		} else {
			document.addEventListener("AkahukuContentApplied", () => {
				target = $("#akahuku_catalog_reload_status").get(0);
				if (target) checkAkahukuReloadStatus();
			});
		}

		var status = "";
		function checkAkahukuReloadStatus() {
			var config = { childList: true };
			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {	// eslint-disable-line no-unused-vars
					if (target.textContent == status) return;
					status = target.textContent;
					if (status == "完了しました" || status == "アンドゥしました" || status == "リドゥしました") {
						makeNgButton();
						hideNgThreads();
						$("body").attr("__fcn_catalog_visibility", "visible");
						$("body > table[border] > tbody").css("opacity", "1");
						$("#GM_fth_highlighted_threads").css("visibility", "visible");
					} else if (HIDE_CATALOG_BEFORE_LOAD && status !== "") {
						$("body").attr("__fcn_catalog_visibility", "hidden");
						$("body > table[border] > tbody").css("opacity", "0");
						$("#GM_fth_highlighted_threads").css("visibility", "hidden");
					}
				});
			});
			observer.observe(target, config);
		}
	}

	/**
	 * カタログのスレにNGボタン作成
	 */
	function makeNgButton() {
		// カタログソートが「設定」なら作成しない
		if (location.search.match(/mode=catset/)) return;
		// NGボタン
		var $ngButton = $("<span>", {
			class: "GM_fcn_ng_button",
			text: "[NG]",
			css: {
				color: "blue",
				cursor: "pointer",
				display: "none",
				position: "relative",
			},
		});
		// NGボタンメニュー
		var $ngButtonMenu = $("<div>", {
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
				var $cloneNgButton = $ngButton.clone();
				var $cloneNgButtonMenu = $ngButtonMenu.clone();

				$cloneNgButton.hover(function () {
					$(this).css("color", "red");
				}, function () {
					$(this).css("color", "blue");
				});
				$cloneNgButton.on("click",function(){
					makeNgButtonMenu($(this));
				});
				$(this).hover(function () {
					$cloneNgButton.css("display", "inline");
					$cloneNgButton.siblings(".KOSHIAN_response_increase").css("display", "none");
				}, function () {
					$cloneNgButton.css("display", "none");
					$cloneNgButtonMenu.css("display", "none");
					$cloneNgButton.siblings(".KOSHIAN_response_increase").css("display", "inline");
				});

				$cloneNgButton.append($cloneNgButtonMenu);
				$(this).append($cloneNgButton);
			}
		});
	}

	/**
	 * NGボタンメニュー作成
	 * @param {jQuery} $button メニューを作成するNGボタンのjQueryオブジェクト
	 */
	function makeNgButtonMenu($button) {
		if (!$button.find(".GM_fcn_ng_menu_item").length) {
			// スレNG
			var $ngNumber = $("<div>", {
				class: "GM_fcn_ng_menu_item",
				text: "スレNG",
				css: {
					color: "blue",
					"background-color": "rgba(240, 224, 214, 0.95)",
				}
			});
			// 本文NG
			var $ngWordCommon = $("<div>", {
				class: "GM_fcn_ng_menu_item",
				text: "本文NG（共通）",
				css: {
					color: "blue",
					"background-color": "rgba(240, 224, 214, 0.95)",
				}
			});
			var $ngWordIndiv = $("<div>", {
				class: "GM_fcn_ng_menu_item",
				text: "本文NG（板別）",
				css: {
					color: "blue",
					"background-color": "rgba(240, 224, 214, 0.95)",
				}
			});
			// 画像NG
			var $ngImage = $("<div>", {
				class: "GM_fcn_ng_menu_item",
				text: "画像NG",
				css: {
					color: "blue",
					"background-color": "rgba(240, 224, 214, 0.95)",
				}
			});

			var $td = $button.parent();
			var threadNumber = $td.children("a:first").length ? $td.children("a:first").attr("href").slice(4,-4) : "";
			var threadImgObj = $td.find("img:first").length ? $td.find("img:first")[0] : "";
			var threadComment = $td.find("small:first, .GM_fth_pickuped_caption, .GM_fth_opened_caption").length ? $td.find("small:first, .GM_fth_pickuped_caption, .GM_fth_opened_caption").text() : "";

			var $cloneNgNumber = $ngNumber.clone();
			var $cloneNgWordCommon = $ngWordCommon.clone();
			var $cloneNgWordIndiv = $ngWordIndiv.clone();
			var $cloneNgImage = $ngImage.clone();

			$cloneNgNumber.hover(function () {
				$(this).css("color", "red");
				$(this).css("background-color", "rgba(204, 233, 255, 0.95)");
			}, function () {
				$(this).css("color", "blue");
				$(this).css("background-color", "rgba(240, 224, 214, 0.95)");
			});
			$cloneNgNumber.click(function () {
				addNgNumber(threadNumber);
				$td.addClass("GM_fcn_ng_numbers");
				$td.css("display","none");
				if ($td.hasClass("GM_fth_pickuped") || $td.hasClass("GM_fth_opened")) {
					hideNgThreads();
				}
			});

			$cloneNgWordCommon.hover(function () {
				$(this).css("color", "red");
				$(this).css("background-color", "rgba(204, 233, 255, 0.95)");
			}, function () {
				$(this).css("color", "blue");
				$(this).css("background-color", "rgba(240, 224, 214, 0.95)");
			});
			$cloneNgWordCommon.click(function () {
				var words = GM_getValue("_futaba_catalog_NG_words", "");
				words = addNgWord(words, threadComment);
				GM_setValue("_futaba_catalog_NG_words", words);
				$td.addClass("GM_fcn_ng_words");
				$td.css("display","none");
				if ($td.hasClass("GM_fth_pickuped") || $td.hasClass("GM_fth_opened")) {
					hideNgThreads();
				}
			});

			$cloneNgWordIndiv.hover(function () {
				$(this).css("color", "red");
				$(this).css("background-color", "rgba(204, 233, 255, 0.95)");
			}, function () {
				$(this).css("color", "blue");
				$(this).css("background-color", "rgba(240, 224, 214, 0.95)");
			});
			$cloneNgWordIndiv.click(function () {
				var words = getCurrentIndivValue("NG_words_indiv", "");
				words = addNgWord(words, threadComment);
				setIndivValue("NG_words_indiv", words);
				$td.addClass("GM_fcn_ng_words");
				$td.css("display","none");
				if ($td.hasClass("GM_fth_pickuped") || $td.hasClass("GM_fth_opened")) {
					hideNgThreads();
				}
			});

			$cloneNgImage.hover(function () {
				$(this).css("color", "red");
				$(this).css("background-color", "rgba(204, 233, 255, 0.95)");
			}, function () {
				$(this).css("color", "blue");
				$(this).css("background-color", "rgba(240, 224, 214, 0.95)");
			});
			$cloneNgImage.click(function () {
				hideNgImageThread(threadImgObj, threadComment, $td);
				if ($td.hasClass("GM_fth_pickuped") || $td.hasClass("GM_fth_opened")) {
					hideNgThreads();
				}
			});

			if (threadNumber) {
				$button.children(".GM_fcn_ng_menu").append($cloneNgNumber);
			}
			if (threadComment) {
				$button.children(".GM_fcn_ng_menu").append($cloneNgWordCommon);
				$button.children(".GM_fcn_ng_menu").append($cloneNgWordIndiv);
			}
			if (threadImgObj && USE_NG_IMAGES) {
				$button.children(".GM_fcn_ng_menu").append($cloneNgImage);
			}
		}
		$button.children(".GM_fcn_ng_menu").css("display", "block");

		/**
		 * NGワード追加
		 * @param {string} ngWords 追加前のNGワード
		 * @param {string} newNgWord 追加するNGワード
		 * @return {string} 追加後のNGワード
		 */
		function addNgWord(ngWords, newNgWord) {
			newNgWord = newNgWord.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
			if (newNgWord && ngWords) {
				ngWords = newNgWord + "|" + ngWords;
			} else {
				ngWords += newNgWord;
			}
			return ngWords;
		}

		/**
		 * スレ画像NG
		 * @param {HTMLImageElement} imgObj NGにするスレ画像のimg要素
		 * @param {string} comment NG画像のコメント
		 * @param {jQuery} $td NGにするスレ画像の親td要素のjQueryオブジェクト
		 */
		function hideNgImageThread(imgObj, comment, $td) {
			var data = convertDataURI(imgObj);
			//console.log("futaba_catalog_NG - data: " + data);
			if (!data) {
				alert("スレ画像の取得に失敗しました");
				return;
			}
			var hexHash = md5(data);
			//console.log("futaba_catalog_NG - hexHash: " + hexHash);
			addNgListObj("_futaba_catalog_NG_images", hexHash);
			addNgListObj("_futaba_catalog_NG_comment", comment);
			addNgListObj("_futaba_catalog_NG_date", getDate());
			$td.addClass("GM_fcn_ng_images");
			$td.css("display","none");
			// 非NG画像リストからNG画像を削除
			var okImages = getCurrentIndivValue("OK_images_indiv", []);
			var imgNumber = parseInt($td.find("img").attr("src").match(/(\d+)s\.jpg$/)[1]);
			var index = okImages.indexOf(imgNumber);
			if (index > -1) {
				okImages.splice(index, 1);
				setIndivValue("OK_images_indiv", okImages);
			}

			/**
			 * NGリストにNGデータを追加
			 * @param {string} target NGデータを追加するNGリスト名
			 * @param {string} val NGリストへ追加するNGデータ
			 */
			function addNgListObj(target, val) {
				var ngListObj = GM_getValue(target, "");
				if (ngListObj === ""){
					ngListObj = [];
				}
				ngListObj.unshift(val);
				if (ngListObj.length > MAX_NG_THREADS) {
					ngListObj.pop();
				}
				GM_setValue(target, ngListObj);
			}
		}
	}

	/**
	 * NG番号追加
	 * @param {string} number 追加するNG番号
	 */
	function addNgNumber(number) {
		var ngNumberObj = getIndivObj("NG_numbers_indiv");
		if (ngNumberObj === ""){
			ngNumberObj = {};
		}
		if (!ngNumberObj[serverFullPath]) {
			ngNumberObj[serverFullPath] = [];
		}
		ngNumberObj[serverFullPath].push(number);
		if (ngNumberObj[serverFullPath].length > MAX_NG_THREADS) {
			ngNumberObj[serverFullPath].shift();
		}
		var jsonString = JSON.stringify(ngNumberObj);
		GM_setValue("NG_numbers_indiv", jsonString);
	}

	/**
	 * dataURI変換
	 * @param {HTMLImageElement} imgObj dataURIに変換する画像のimg要素
	 * @return {string} 変換したdataURI文字列
	 */
	function convertDataURI(imgObj){
		if (!imgObj || !imgObj.complete || !imgObj.width || !imgObj.height) return;
		// canvasを生成してimg要素を反映
		var cvs = document.createElement("canvas");
		cvs.width = imgObj.width;
		cvs.height = imgObj.height;
		var ctx = cvs.getContext("2d");
		ctx.drawImage(imgObj, 0, 0);
		// canvasをdataURI化
		var data;
		try {
			data = cvs.toDataURL("image/jpeg");
		} catch (e) {
			console.error("futaba_catalog_NG - dataURI convert error: src=" + imgObj.src + ", error=" + e);	// eslint-disable-line no-console
			return;
		}
		if (data.substr(0,23) !== "data:image/jpeg;base64,"){
			console.error("futaba_catalog_NG - dataURI abnormal: src=" + imgObj.src + ", dataURI=" + data);	// eslint-disable-line no-console
			return;
		}
		return data;
	}

	/**
	 * 日付取得
	 * @return {string} 現在の日付の文字列 yy/mm/dd
	 */
	function getDate() {
		var now = new Date();
		var date = ("" + (now.getFullYear())).slice(-2) + "/" +
			("0" + (now.getMonth() + 1)).slice(-2) + "/" +
			("0" + now.getDate()).slice(-2);
		return date;
	}

	/**
	 * カタログを検索してNGスレを非表示
	 * @param {boolean} isWordsChanged NGワードを変更したか
	 */
	function hideNgThreads(isWordsChanged) {
		var Start = new Date().getTime();//count parsing time
		var words = "";
		var wordsCommon = GM_getValue("_futaba_catalog_NG_words", "");
		var wordsIndiv = getCurrentIndivValue("NG_words_indiv", "");
		var numbers = getCurrentIndivValue("NG_numbers_indiv", []);
		images = GM_getValue("_futaba_catalog_NG_images", "");
		ngDate = GM_getValue("_futaba_catalog_NG_date", "");
		okImages = getCurrentIndivValue("OK_images_indiv", []);

		// NGワード
		if( wordsCommon !== "" ) {
			words += wordsCommon;
			if( wordsIndiv !== "" ) {
				words += "|" + wordsIndiv;
			}
		}
		else {
			words += wordsIndiv;
		}
		//console.log(words);
		//console.dir(numbers);
		//console.dir("futaba_catalog_NG - images.length: " + images.length);
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
			console.log("futaba_catalog_NG - Parsing@" + serverFullPath + ": "+((new Date()).getTime()-Start) +"msec");	// eslint-disable-line no-console
			return;
		}

		// NG番号
		if (numbers.length) {
			$("body > table[border] td > a:first-of-type").each(function(){
				var hrefNum = $(this).attr("href").slice(4,-4);
				if (numbers.indexOf(hrefNum) > -1){
					$(this).parent("td").addClass("GM_fcn_ng_numbers");
					$(this).parent("td").css("display","none");
				}
			});
		}

		// NG画像
		if (images.length) {
			$("body > table[border] td > a:first-of-type > img").each(function(){
				var imgSrc = this.src.match(/(\d+)s\.jpg$/);
				if (imgSrc) {
					var imgNumber = parseInt(imgSrc[1]);
					if (okImages.indexOf(imgNumber) == -1) {
						var data = convertDataURI(this);
						if (data) {
							var hexHash = md5(data);
							var imagesIndex = images.indexOf(hexHash);
							if (imagesIndex > -1){
								$(this).parent().parent("td").addClass("GM_fcn_ng_images");
								$(this).parent().parent("td").css("display","none");
								ngDate[imagesIndex] = getDate();
							} else if (hexHash.length == 32) {
								okImages.unshift(imgNumber);
							} else {
								console.error("futaba_catalog_NG - hexHash abnormal: image No." + imgNumber + ", hexHash: " + hexHash);	// eslint-disable-line no-console
							}
						} else {
							// スレ画像読込完了確認
							this.onload = () => {
								this.onload = null;
								imgNumber = parseInt(this.src.match(/(\d+)s\.jpg$/)[1]);
								data = convertDataURI(this);
								if (data) {
									var hexHash = md5(data);
									var imagesIndex = images.indexOf(hexHash);
									if (imagesIndex > -1){
										$(this).parent().parent("td").addClass("GM_fcn_ng_images");
										$(this).parent().parent("td").css("display","none");
										ngDate[imagesIndex] = getDate();
										GM_setValue("_futaba_catalog_NG_date", ngDate);
									} else if (hexHash.length == 32) {
										okImages.unshift(imgNumber);
									} else {
										console.error("futaba_catalog_NG - hexHash abnormal: image No." + imgNumber + ", hexHash: " + hexHash);	// eslint-disable-line no-console
									}
								} else {
									console.error("futaba_catalog_NG - image data abnormal: image No." + imgNumber);	// eslint-disable-line no-console
								}
							};
							if (this.complete && this.width && this.height && this.onload) {
								$(this).trigger("load");
							}
						}
					}
				}
			});
			GM_setValue("_futaba_catalog_NG_date", ngDate);
			if (okImages.length > MAX_OK_IMAGES) {
				okImages.splice(MAX_OK_IMAGES);
			}
			setIndivValue("OK_images_indiv", okImages);
		} else if (USE_NG_IMAGES) {
			$("body > table[border] td a img").each(function(){
				var imgSrc = this.src.match(/(\d+)s\.jpg$/);
				if (imgSrc) {
					var imgNumber = parseInt(imgSrc[1]);
					if (okImages.indexOf(imgNumber) == -1) {
						okImages.unshift(imgNumber);
					}
				}
			});
			if (okImages.length > MAX_OK_IMAGES) {
				okImages.splice(MAX_OK_IMAGES);
			}
			setIndivValue("OK_images_indiv", okImages);
		}
		//console.log("futaba_catalog_NG - okImages.length: " + okImages.length);
		console.log("futaba_catalog_NG - Parsing@" + serverFullPath + ": "+((new Date()).getTime()-Start) +"msec");	// eslint-disable-line no-console
	}

	/**
	 * KOSHIAN delイベント監視
	 */
	function listenKoshianDelEvent() {
		document.addEventListener("KOSHIAN_del", () => {
			// delされたスレをNG登録して非表示
			$(".KOSHIAN_del").each(function(){
				var threadNumber = $(this).children("a:first").length ? $(this).children("a:first").attr("href").slice(4,-4) : "";
				if (threadNumber) {
					addNgNumber(threadNumber);
				}
				$(this).addClass("GM_fcn_ng_numbers");
				$(this).css("display","none");
				$(this).removeClass("KOSHIAN_del");
			});
			hideNgThreads();
		});
	}

	/**
	 * futaba thread highlighter Kピックアップイベント監視
	 */
	function listenFthPickupEvent() {
		document.addEventListener("FutabaTH_pickup", () => {
			// ピックアップされたスレにNGボタンをセット
			$(".GM_fth_pickuped, .GM_fth_opened").each(function() {
				var $ngButton = $(this).children(".GM_fcn_ng_button");
				if ($ngButton.length) {
					var $ngButtonMenu = $ngButton.children(".GM_fcn_ng_menu");
					$ngButton.hover(function() {
						$(this).css("color", "red");
					}, function () {
						$(this).css("color", "blue");
					});
					$ngButton.on("click",function() {
						makeNgButtonMenu($ngButton);
					});
					$(this).hover(function () {
						$ngButton.css("display", "inline");
						$ngButton.siblings(".KOSHIAN_response_increase").css("display", "none");
					}, function () {
						$ngButton.css("display", "none");
						$ngButtonMenu.css("display", "none");
						$ngButton.siblings(".KOSHIAN_response_increase").css("display", "inline");
					});
				}
			});
		});
	}

	/**
	 * カタログ非表示
	 */
	function hideCatalog() {
		setCatalogHiddenStyle();
		$(function() {
			$("body").attr("__fcn_catalog_visibility", "hidden");
			$("#GM_fth_highlighted_threads").css("visibility", "hidden");
			init();
		});
		$(window).on("load", function() {
			$("body").attr("__fcn_catalog_visibility", "visible");
			setCatalogShownStyle();
			$("#GM_fth_highlighted_threads").css("visibility", "visible");
		});
	}

	/**
	 * カタログ非表示スタイル設定
	 */
	function setCatalogHiddenStyle() {
		var css =
			"body > table[border] {" +
			"  opacity: 0;" +
			"}";
		GM_addStyle(css);
	}

	/**
	 * カタログ表示スタイル設定
	 */
	function setCatalogShownStyle() {
		var css =
			"body > table[border] {" +
			"  opacity: 1;" +
			"}";
		GM_addStyle(css);
	}

	/**
	 * スタイル設定
	 */
	function setStyle() {
		var css =
			// NGワード
			".GM_fcn_ng_words {" +
			"  display: none;" +
			"}" +
			// NG番号
			".GM_fcn_ng_numbers {" +
			"  display: none;" +
			"}" +
			// NG画像
			".GM_fcn_ng_images {" +
			"  display: none;" +
			"}" +
			// NGボタン
			".GM_fcn_ng_button {" +
			"  font-size: small;" +
			"}" +
			// NGメニュー
			".GM_fcn_ng_menu {" +
			"  font-size: medium;" +
			"}" +
			// NGメニュー項目
			".GM_fcn_ng_menu_item {" +
			"  padding: 5px;" +
			"  z-index: 1;" +
			"  cursor: pointer;" +
			"}" +
			// NGリストラベル
			".GM_fcn_ng_list_label {" +
			"  display: inline-block;" +
			"  width: 100px;" +
			"}" +
			// NGリスト入力
			".GM_fcn_ng_list_input {" +
			"  margin-right: 16px;" +
			"}" +
			// NGリストボタン
			".GM_fcn_ng_list_button {" +
			"  margin-right: 16px;" +
			"}" +
			// NGリスト枠
			"#GM_fcn_ng_list_pane {" +
			"  width: 738px;" +
			"  height: 308px;" +
			"  margin-left: 105px;" +
			"  border-width: 1px;" +
			"  border-style: solid;" +
			"  background-color: #eee;" +
			"}" +
			// NGリスト項目
			".GM_fcn_ng_list_item {" +
			"  display: inline-block;" +
			"  height: 20px;" +
			"  border-width: 1px;" +
			"  border-style: solid;" +
			"}" +
			// NGリストコンテンツ
			"#GM_fcn_ng_list_content {" +
			"  width: 738px;" +
			"  height: 286px;" +
			"  overflow-x: hidden;" +
			"  overflow-y: auto;" +
			"}" +
			// NGリスト行
			".GM_fcn_ng_list_row {" +
			"  width: 738px;" +
			"  height: 22px;" +
			"  cursor: pointer;" +
			"}" +
			// NGリスト画像
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
			// NGリストコメント
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
			// NGリスト日時
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
			// NGリストスクロールバー
			".GM_fcn_ng_list_scrl {" +
			"  display: inline-block;" +
			"  min-width: 16px;" +
			"  min-height: 22px;" +
			"  border-width: 0px 1px;" +
			"  border-style: solid;" +
			"}" +
			// カタログ下スペース
			"#GM_fcn_catalog_space {" +
			"  min-height: 2000px;" +
			"}";
		GM_addStyle(css);
	}

})(jQuery);
