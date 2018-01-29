## futaba catalog NG
このUserscriptはふたば☆ちゃんねるのカタログに現在表示されているすべてのスレ本文の文字列を監視して、登録したNGワードに該当するスレを非表示にします。NGワードには正規表現が利用できます。  
また、スレのNGボタンでそのスレのみを非表示にすることもできます。  

Firefoxの場合、[Tampermonkey](https://addons.mozilla.org/ja/firefox/addon/tampermonkey/)を先にインスールしてからスクリプトをインストールして下さい。  
(GreasemonkeyやViolentmonkeyでの動作は未確認です)  
Chromeの場合、[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)を先にインスールしてからスクリプトをインストールして下さい。  

※その他のUserscriptとKOSHIANアドオン改変版は[こちら](https://github.com/akoya-tomo/futaba_auto_reloader_K/wiki/)の一覧からどうぞ

## 使い方
* ふたばのカタログモードの設定で「文字数」を適当な大きさ(4以上推奨)に設定してください。(板毎に設定が必要です)
* NGワードの[設定]ボタンをクリックして監視したいNGワードを入力してください。
|で区切ると複数の語句を指定できます。(正規表現使用可。特殊な記号　\\*?+.^$|()[]{}　は全て正規表現のメタキャラクタとして認識されます。)  
NGワードは全板共通と各板個別でそれぞれ設定できます。  
* カタログのスレにマウスオーバーすると[NG]ボタンが表示されます。このボタンをクリックして、メニューから「スレNG」をクリックするとそのスレが非表示となります。  
  「スレNG」にするとカタログのタブを閉じるか、カタログ左上の[掲示板に戻る]でスレ一覧に移動するまではそのスレが非表示になります。（リロードでは解除されません）  

## インストール
[GreasyFork](https://greasyfork.org/ja/scripts/37565-futaba-catalog-ng)　
[GitHub](https://github.com/akoya-tomo/futaba_catalog_NG/raw/master/futaba_catalog_NG.user.js)

## 設定
機能の動作はスクリプト冒頭の大文字変数をエディタで編集すれば変更することができます。  

* MAX\_NG\_THREADS:NGスレの最大保持数  
  - 記憶できるNGスレの板毎の最大数です。最大数を超えると古い順に消去されます。  

## 注意事項
* [futaba thread highlighter K](https://greasyfork.org/ja/scripts/36639-futaba-thread-highlighter-k/)と併用する場合はrev6以上をインストールして、Tampermonkeyのダッシュボードからfutaba catalog NGの優先順序が先になるように設定してください。

## 今後の予定
* スレ画像NG機能の追加を予定しています。
  - スレNGの操作が無駄に多いのはメニューで「スレNG」の下に「画像NG」を追加する予定のためです。

## 更新履歴
* v1.0.1 2018-01-18
  - futaba thread highlighter(K)使用時はスレッド検索設定とNGワード設定を同じ並びに変更
* v1.0.0 2018-01-18
  - 新規リリース
