import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Lv',
    localeDesc : 'Latviešu',
    localeCode : 'lv-LV',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Parādīt norādes',
        Apply           : 'Piemērot',
        Learn           : 'Mācīties',
        DownloadTrial   : 'Lejupielādēt izmēģinājuma versiju',
        upgradeGuide    : 'Atjaunināšanas ceļvedis',
        documentation   : 'Dokumentācija',
        tabJS           : 'Parādīt JavaScript piemērus',
        tabReact        : 'Parādīt React piemērus',
        tabVue          : 'Parādīt Vue piemērus',
        tabAngular      : 'Parādīt Angular piemērus'
    },

    Checkbox : {
        Automatically : 'Automātiski',
        runHints      : 'Palaist norāžu plūsmu startēšanas laikā'
    },

    Combo : {
        Theme    : 'Tēma',
        Language : 'Valoda',
        Size     : 'Izmērs',
        jumpTo   : 'Pāriet uz'
    },

    FilterField : {
        typeToFilter : 'Rakstiet, lai filtrētu'
    },

    Popup : {
        UsedClasses : 'Šajā demonstrācijā izmantotās klases'
    },

    SlideToggle : {
        newDemos : 'Jauni un atjaunināti'
    },

    Shared : {
        'Locale changed' : 'Valoda mainīta'
    },

    TextField : {
        Filter : 'Filtrs'
    },

    Tooltip : {
        infoButton       : 'Noklikšķiniet, lai parādītu informāciju un pārslēgtu tēmu vai valodu',
        codeButton       : 'Noklikšķiniet, lai parādītu iebūvēto koda redaktoru',
        hintCheck        : 'Atzīmējiet, lai automātiski parādītu norādes, ielādējot piemēru',
        fullscreenButton : 'Pilnekrāna režīms',
        openInCodePen    : 'Atvērt CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
