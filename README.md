## futaba catalog NG
����Userscript�͂ӂ��΁������˂�̃J�^���O�Ɍ��ݕ\������Ă��邷�ׂẴX���{���̕�������Ď����āA�o�^����NG���[�h�ɊY������X�����\���ɂ��܂��BNG���[�h�ɂ͐��K�\�������p�ł��܂��B  
�܂��A�X����NG�{�^���ł��̃X���݂̂��\���ɂ�����A�X���{����NG���[�h�ɓo�^������A�X���摜��NG���X�g�ɓo�^���邱�Ƃ��ł��܂��B  

Firefox�̏ꍇ�A[Tampermonkey](https://addons.mozilla.org/ja/firefox/addon/tampermonkey/)���ɃC���X�[�����Ă���X�N���v�g���C���X�g�[�����ĉ������B  
(Greasemonkey��Violentmonkey�ł̓���͖��m�F�ł�)  
Chrome�̏ꍇ�A[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo/)���ɃC���X�[�����Ă���X�N���v�g���C���X�g�[�����ĉ������B  

������Userscript�͒P�̂ŗ��p�\�ł����AFirefox�A�h�I��[KOSHIAN](https://addons.mozilla.org/ja/firefox/user/anonymous-a0bba9187b568f98732d22d51c5955a6/)�i���ϔŊ܂ށj��[�ԕ�Firefox SP](http://toshiakisp.github.io/akahuku-firefox-sp/)�Ƃ̕��p���\�ł��B[�ӂ��N��](http://futakuro.com/)��[�ܕ���](https://toshiaki-gohei.github.io/gohei-mochi/)�Ƃ̕��p�ł͐���ɓ��삵�܂���B  
�����̑���Userscript��Firefox�A�h�I��KOSHIAN�̉��ϔł�[������](https://github.com/akoya-tomo/futaba_auto_reloader_K/wiki/)�̈ꗗ����ǂ����B

## �g����
* NG���[�h�g�p���͂ӂ��΂̃J�^���O���[�h�̐ݒ�Łu�������v��K���ȑ傫��(4�ȏ㐄��)�ɐݒ肵�Ă��������B(���ɐݒ肪�K�v�ł�)
* NG���[�h��[�ݒ�]�{�^�����N���b�N���ĊĎ�������NG���[�h����͂��Ă��������B
|�ŋ�؂�ƕ����̌����w��ł��܂��B(���K�\���g�p�B����ȋL���@\\*?+.^$|()[]{}�@�͑S�Đ��K�\���̃��^�L�����N�^�Ƃ��ĔF������܂��B)  
NG���[�h�͑S���ʂƊe�ʂł��ꂼ��ݒ�ł��܂��B  
* �J�^���O�̃X���Ƀ}�E�X�I�[�o�[�����[NG]�{�^�����\������܂��B���̃{�^�����N���b�N����ƃ��j���[���\������܂��B
  - �u�X��NG�v���N���b�N����Ƃ��̃X������\���ƂȂ�܂��B  
    �u�X��NG�v�ɂ���ƃJ�^���O�̃^�u����邩�A�J�^���O�����[�f���ɖ߂�]�ŃX���ꗗ�Ɉړ�����܂ł͂��̃X������\���ɂȂ�܂��B�i�����[�h�ł͉�������܂���j  
  - �u�{��NG�v���N���b�N����ƃJ�^���O�ɕ\������Ă���X���{����NG���[�h�̐擪�ɓo�^����܂��B
  - �u�摜NG�v���N���b�N����ƃX���摜��NG���X�g�̐擪�ɓo�^����܂��B
* NG���X�g��[�ҏW]�{�^�����N���b�N�����NG�摜�̃��X�g���\������܂��B�R�����g�͎��R�ɏC�����邱�Ƃ��ł��܂��B�ŏI���o���͂���NG�摜���J�^���O�ōŌ�Ɍ��o���ꂽ���t�ł��B

## �C���X�g�[��
[GreasyFork](https://greasyfork.org/ja/scripts/37565-futaba-catalog-ng)�@
[GitHub](https://github.com/akoya-tomo/futaba_catalog_NG/raw/master/futaba_catalog_NG.user.js)

## �ݒ�
�@�\�̓���̓X�N���v�g�`���̑啶���ϐ����G�f�B�^�ŕҏW����ΕύX���邱�Ƃ��ł��܂��B  

* USE\_NG\_IMAGES :�X���摜��NG�@�\��L��������i�f�t�H���g�Ftrue�j  
  - NG���X�g�ɓo�^���ꂽ�X���摜���\���ɂ���@�\��L�������܂��B���̐ݒ�l��false�ɂ���Ɖ摜NG�@�\������������܂��B  
* MAX\_NG\_THREADS :NG�X���̍ő�ێ����i�f�t�H���g�F500�j  
  - �L���\��NG�X���̍ő吔�ł��BNG�X���̋L�������ݒ�l�𒴂���ƌÂ����ɔj������܂��B  
* MAX\_OK\_IMAGES :��NG�摜���̍ő�ێ����i���j�i�f�t�H���g�F500�j  
  - �L���\�Ȕ�NG�摜���̔��̍ő吔�ł��B�摜NG�̕��ׂ��y�����邽�߂ɁANG���X�g�Ƀ}�b�`���Ȃ������X���摜�����L�����Ă��܂��B���̉摜���̋L�������ݒ�l�𒴂���ƌÂ����ɔj������܂��B  

## ���ӎ���
* [futaba thread highlighter K](https://greasyfork.org/ja/scripts/36639-futaba-thread-highlighter-k/)�ƕ��p����ꍇ��rev6�ȏ���C���X�g�[�����āATampermonkey�̃_�b�V���{�[�h����futaba catalog NG�̗D�揇������ɂȂ�悤�ɐݒ肵�Ă��������B
* �摜NG�̔��蕉�ׂ��d�����߁A���ɂ���Ă̓����[�h��̃J�^���O�\�����������ɒx���Ȃ�\��������܂��B���̏ꍇ��USE\_NG\_IMAGES��false�ɐݒ肵�ĉ摜NG�@�\�𖳌��ɂ��Ă��������B

## ���m�̖��
* Tampermonkey�ŗD�揇�����ɐݒ肵�Ă��Ă�����Userscript�̌�Ŏ��s����邱�Ƃ�����B
  - md5�ϊ��̊O�����C�u�������u���E�U�N�����X�N���v�g�X�V��ɍŏ��ɓǂݍ��ނƂ��ɔ������邱�Ƃ�����悤�ł��B��x���C�u������ǂݍ��߂Ύ���̃����[�h����͗D�揇���ɉ�����Userscript�����s����܂��B

## �X�V����
* v1.2.7 2018-03-24
  - KOSHIAN �t�H�[���g���A�h�I���ƕ��p����ƌ듮�삷��s��C��
  - NG���X�g�������NG���X�g�̃X�N���[���ʒu���g�b�v�ɂȂ�悤�ɏC��
* v1.2.6 2018-03-15
  - [KOSHIAN �J�^���O�̉摜���|�b�v�A�b�v�ŕ\�� ��](https://github.com/akoya-tomo/koshian_image_popuper_kai/)�̐V�@�\�ւ̑Ή� 
* v1.2.5 2018-03-10
  - �J�^���O�ȊO��NG�{�^�����\������Ă��܂����Ƃ�����s����C��
  - �ԕ��Ń����[�h��̐V���X����NG�{�^�����\������Ȃ��s����C��
* v1.2.4 2018-03-08
  - NG�摜�̃X�����\������Ă��܂����Ƃ�����s����C��
* v1.2.3 2018-02-28
  - �X���摜��Base64�ϊ��̗�O������ǉ�
  - �ԕ���NG�{�^�����j���[���X���摜�ɉB���s����C��
* v1.2.2 2018-02-24
  - �X���摜���擾���s�����Ƃ��̏������C��
* v1.2.1 2018-02-21
  - NG�����futaba thread highlighter K�̃s�b�N�A�b�v�ɑ������f�����悤�ɕύX
* v1.2.0 2018-02-07
  - �u�摜NG�v�@�\�ǉ�
  - �u�{��NG�v�@�\�ǉ�
* v1.1.0 2018-01-30
  - �u�X��NG�v�@�\�ǉ�
* v1.0.1 2018-01-18
  - futaba thread highlighter(K)�g�p���̓X���b�h�����ݒ��NG���[�h�ݒ�𓯂����тɕύX
* v1.0.0 2018-01-18
  - �V�K�����[�X
