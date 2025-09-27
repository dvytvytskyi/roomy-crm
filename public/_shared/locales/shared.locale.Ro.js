import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Ro',
    localeDesc : 'Română',
    localeCode : 'ro',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Afișează sugestii',
        Apply           : 'Aplică',
        Learn           : 'Învățați',
        DownloadTrial   : 'Descarcă versiunea de încercare',
        upgradeGuide    : 'Ghid de actualizare',
        documentation   : 'Documentație',
        tabJS           : 'Afișează exemple JavaScript',
        tabReact        : 'Afișează exemple React',
        tabVue          : 'Afișează exemple Vue',
        tabAngular      : 'Afișează exemple Angular'
    },

    Checkbox : {
        Automatically : 'Automat',
        runHints      : 'Rulați fluxul de sugestii la pornire'
    },

    Combo : {
        Theme    : 'Temă',
        Language : 'Limbă',
        Size     : 'Dimensiune',
        jumpTo   : 'Salt la'
    },

    FilterField : {
        typeToFilter : 'Tastează pentru a filtra'
    },

    Popup : {
        UsedClasses : 'Clase utilizate în această demonstrație'
    },

    SlideToggle : {
        newDemos : 'Noi și actualizate'
    },

    Shared : {
        'Locale changed' : 'Limba a fost schimbată'
    },

    TextField : {
        Filter : 'Filtru'
    },

    Tooltip : {
        infoButton       : 'Click pentru a afișa informații și a schimba tema sau limba',
        codeButton       : 'Click pentru a afișa editorul de cod încorporat',
        hintCheck        : 'Bifați pentru a afișa automat sugestiile la încărcarea exemplului',
        fullscreenButton : 'Ecran complet',
        openInCodePen    : 'Deschide în CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
