## futaba catalog NG
このUserscriptはふたば☆ちゃんねるのカタログに現在表示されているすべてのスレ本文の文字列を監視して、登録したNGワードに該当するスレを非表示とします。NGワードには正規表現が利用できます。  

Firefoxの場合、[Tampermonkey](https://addons.mozilla.org/ja/firefox/addon/tampermonkey/)を先にインスールしてからスクリプトをインストールして下さい。  
(GreasemonkeyやViolentmonkeyでの動作は未確認です)  
Chromeの場合、[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)を先にインスールしてからスクリプトをインストールして下さい。  

※その他のUserscriptとKOSHIANアドオン改変版は[こちら](https://github.com/akoya-tomo/futaba_auto_reloader_K/wiki)の一覧からどうぞ

## 使い方
* ふたばのカタログモードの設定で「文字数」を適当な大きさ(4以上推奨)に設定してください。(板毎に設定が必要です)
* NGワードの[設定]ボタンをクリックして監視したいNGワードを入力してください。
|で区切ると複数の語句を指定できます。(正規表現使用可。特殊な記号　\\*?+.^$|()[]{}　は全て正規表現のメタキャラクタとして認識されます。)  
NGワードは全板共通と各板個別でそれぞれ設定できます。  

## インストール
[GreasyFork](https://greasyfork.org/ja/scripts/36639-futaba-catalog-ng)　
[GitHub](https://github.com/akoya-tomo/futaba_catalog_NG/raw/master/futaba_catalog_NG.user.js)

## 注意事項
* Firefox DeveloperEdition 59b1にて[合間合間に](http://toshiakisp.github.io/akahuku-firefox-sp/#others)rev.3及びrev.4preが動作しなくなったことによる緊急リリースの為、最低限の機能しかありません。  
  今後Firefox59で合間合間にが動作しないことが続くときは機能追加していく予定です。  

## 更新履歴
* v1.0.0 2018-01-18
  - 新規リリース
