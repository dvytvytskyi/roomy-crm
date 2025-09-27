import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'LT',
    localeDesc : 'Lietuvių',
    localeCode : 'lt-LT',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Rodyti užuominas',
        Apply           : 'Taikyti',
        Learn           : 'Sužinoti',
        DownloadTrial   : 'Atsisiųsti bandomąją versiją',
        upgradeGuide    : 'Atnaujinimo vadovas',
        documentation   : 'Dokumentacija',
        tabJS           : 'Rodyti JavaScript pavyzdžius',
        tabReact        : 'Rodyti React pavyzdžius',
        tabVue          : 'Rodyti Vue pavyzdžius',
        tabAngular      : 'Rodyti Angular pavyzdžius'
    },

    Checkbox : {
        Automatically : 'Automatiškai',
        runHints      : 'Paleisti užuominų srautą paleidžiant'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Kalba',
        Size     : 'Dydis',
        jumpTo   : 'Pereiti į'
    },

    FilterField : {
        typeToFilter : 'Įveskite filtravimui'
    },

    Popup : {
        UsedClasses : 'Klasės, naudojamos šiame demonstraciniame'
    },

    SlideToggle : {
        newDemos : 'Nauji ir atnaujinti'
    },

    Shared : {
        'Locale changed' : 'Kalba pakeista'
    },

    TextField : {
        Filter : 'Filtruoti'
    },

    Tooltip : {
        infoButton       : 'Spustelėkite, kad parodytumėte informaciją ir pakeistumėte temą arba kalbą',
        codeButton       : 'Spustelėkite, kad parodytumėte įmontuotą kodo redaktorių',
        hintCheck        : 'Pažymėkite, kad automatiškai rodytumėte užuominas įkeliant pavyzdį',
        fullscreenButton : 'Visas ekranas',
        openInCodePen    : 'Atidaryti CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
