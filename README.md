## futaba catalog NG
このUserscriptはふたば☆ちゃんねるのカタログに現在表示されているすべてのスレ本文の文字列を監視して、登録したNGワードに該当するスレを非表示にします。NGワードには正規表現が利用できます。  
また、スレのNGボタンでそのスレのみを非表示にしたり、スレ本文をNGワードに登録したり、スレ画像をNGリストに登録することもできます。  

Firefoxの場合、[Tampermonkey](https://addons.mozilla.org/ja/firefox/addon/tampermonkey/)を先にインスールしてからスクリプトをインストールして下さい。  
(GreasemonkeyやViolentmonkeyでの動作は未確認です)  
Chromeの場合、[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo/)を先にインスールしてからスクリプトをインストールして下さい。  

※その他のUserscriptとKOSHIANアドオン改変版は[こちら](https://github.com/akoya-tomo/futaba_auto_reloader_K/wiki/)の一覧からどうぞ

## 使い方
* NGワード使用時はふたばのカタログモードの設定で「文字数」を適当な大きさ(4以上推奨)に設定してください。(板毎に設定が必要です)
* NGワードの[設定]ボタンをクリックして監視したいNGワードを入力してください。
|で区切ると複数の語句を指定できます。(正規表現使用可。特殊な記号　\\*?+.^$|()[]{}　は全て正規表現のメタキャラクタとして認識されます。)  
NGワードは全板共通と各板個別でそれぞれ設定できます。  
* カタログのスレにマウスオーバーすると[NG]ボタンが表示されます。このボタンをクリックするとメニューが表示されます。
  - 「スレNG」をクリックするとそのスレが非表示となります。  
    「スレNG」にするとカタログのタブを閉じるか、カタログ左上の[掲示板に戻る]でスレ一覧に移動するまではそのスレが非表示になります。（リロードでは解除されません）  
  - 「本文NG」をクリックするとカタログに表示されているスレ本文がNGワードの先頭に登録されます。
  - 「画像NG」をクリックするとスレ画像がNGリストの先頭に登録されます。
* NGリストの[編集]ボタンをクリックするとNG画像のリストが表示されます。コメントは自由に修正することができます。最終検出日はそのNG画像がカタログで最後に検出された日付です。

## インストール
[GreasyFork](https://greasyfork.org/ja/scripts/37565-futaba-catalog-ng)　
[GitHub](https://github.com/akoya-tomo/futaba_catalog_NG/raw/master/futaba_catalog_NG.user.js)

## 設定
機能の動作はスクリプト冒頭の大文字変数をエディタで編集すれば変更することができます。  

* USE\_NG\_IMAGES :スレ画像のNG機能を有効化する（デフォルト
true）  
  - NGリストに登録されたスレ画像を非表示にする機能を有効化します。この設定値をfalseにすると画像NG機能が無効化されます。  
* MAX\_NG\_THREADS :NGスレの最大保持数（デフォルト：500）  
  - 記憶可能なNGスレの最大数です。NGスレの記憶数が設定値を超えると古い順に破棄されます。  
* MAX\_OK\_IMAGES :非NG画像名の最大保持数（板毎）（デフォルト：500）  
  - 記憶可能な非NG画像名の板毎の最大数です。画像NGの負荷を軽減するために、NGリストにマッチしなかったスレ画像名を記憶しています。この画像名の記憶数が設定値を超えると古い順に破棄されます。  

## 注意事項
* [futaba thread highlighter K](https://greasyfork.org/ja/scripts/36639-futaba-thread-highlighter-k/)と併用する場合はrev6以上をインストールして、Tampermonkeyのダッシュボードからfutaba catalog NGの優先順序が先になるように設定してください。
* 画像NGの判定負荷が重いため、環境によってはリロード後のカタログ表示完了が非常に遅くなる可能性があります。その場合はUSE\_NG\_IMAGESをfalseに設定して画像NG機能を無効にしてください。

## 既知の問題
* Tampermonkeyで優先順序を先に設定していても他のUserscriptの後で実行されることがある。
  - md5変換の外部ライブラリをブラウザ起動後に最初に読み込むときに発生することがあるようです。一度ライブラリを読み込めば次回のリロードからは優先順序に沿ってUserscriptが実行されます。

## 更新履歴
* v1.1.0 2018-01-30
  - 「スレNG」機能追加
* v1.0.1 2018-01-18
  - futaba thread highlighter(K)使用時はスレッド検索設定とNGワード設定を同じ並びに変更
* v1.0.0 2018-01-18
  - 新規リリース
