import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Ja',
    localeDesc : '日本語',
    localeCode : 'ja',
    localeRtl  : false,

    Button : {
        'Display hints' : 'ヒントを表示',
        Apply           : '適用',
        Learn           : '学ぶ',
        DownloadTrial   : 'トライアルをダウンロード',
        upgradeGuide    : 'アップグレードガイド',
        documentation   : 'ドキュメント',
        tabJS           : 'JavaScriptの例を表示',
        tabReact        : 'Reactの例を表示',
        tabVue          : 'Vueの例を表示',
        tabAngular      : 'Angularの例を表示'
    },

    Checkbox : {
        Automatically : '自動的に',
        runHints      : '起動時にヒントフローを実行'
    },

    Combo : {
        Theme    : 'テーマ',
        Language : '言語',
        Size     : 'サイズ',
        jumpTo   : 'ジャンプ先'
    },

    FilterField : {
        typeToFilter : 'フィルターするために入力'
    },

    Popup : {
        UsedClasses : 'このデモで使用されるクラス'
    },

    SlideToggle : {
        newDemos : '新規および更新済み'
    },

    Shared : {
        'Locale changed' : 'ロケールが変更されました'
    },

    TextField : {
        Filter : 'フィルター'
    },

    Tooltip : {
        infoButton       : '情報を表示し、テーマまたはロケールを切り替えるにはクリック',
        codeButton       : '組み込みコードエディタを表示するにはクリック',
        hintCheck        : '例を読み込むときにヒントを自動的に表示するにはチェック',
        fullscreenButton : '全画面',
        openInCodePen    : 'CodePenで開く'
    }
};

export default LocaleHelper.publishLocale(locale);
