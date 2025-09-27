import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'No',
    localeDesc : 'Norsk',
    localeCode : 'no',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Vis hint',
        Apply           : 'Bruk',
        Learn           : 'Lær',
        DownloadTrial   : 'Last ned prøveversjon',
        upgradeGuide    : 'Oppgraderingsveiledning',
        documentation   : 'Dokumentasjon',
        tabJS           : 'Vis JavaScript-eksempler',
        tabReact        : 'Vis React-eksempler',
        tabVue          : 'Vis Vue-eksempler',
        tabAngular      : 'Vis Angular-eksempler'
    },

    Checkbox : {
        Automatically : 'Automatisk',
        runHints      : 'Kjør hintflyt ved oppstart'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Språk',
        Size     : 'Størrelse',
        jumpTo   : 'Hopp til'
    },

    FilterField : {
        typeToFilter : 'Skriv for å filtrere'
    },

    Popup : {
        UsedClasses : 'Klasser brukt i denne demoen'
    },

    SlideToggle : {
        newDemos : 'Nye og oppdaterte'
    },

    Shared : {
        'Locale changed' : 'Språk endret'
    },

    TextField : {
        Filter : 'Filter'
    },

    Tooltip : {
        infoButton       : 'Klikk for å vise info og bytte tema eller språk',
        codeButton       : 'Klikk for å vise den innebygde kodeeditoren',
        hintCheck        : 'Merk for å automatisk vise hint når eksempelet lastes',
        fullscreenButton : 'Fullskjerm',
        openInCodePen    : 'Åpne i CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
