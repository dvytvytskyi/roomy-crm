import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Eu',
    localeDesc : 'Euskara',
    localeCode : 'eu-ES',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Aholkuak bistaratu',
        Apply           : 'Aplikatu',
        Learn           : 'Ikasi',
        DownloadTrial   : 'Deskargatu Proba',
        upgradeGuide    : 'Eguneratzeko Gida',
        documentation   : 'Dokumentazioa',
        tabJS           : 'Erakutsi JavaScript adibideak',
        tabReact        : 'Erakutsi React adibideak',
        tabVue          : 'Erakutsi Vue adibideak',
        tabAngular      : 'Erakutsi Angular adibideak'
    },

    Checkbox : {
        Automatically : 'Automatikoki',
        runHints      : 'Exekutatu pista-fluxua hasieran'
    },

    Combo : {
        Theme    : 'Gaia',
        Language : 'Hizkuntza',
        Size     : 'Tamaina',
        jumpTo   : 'Joan hona'
    },

    FilterField : {
        typeToFilter : 'Idatzi iragazteko'
    },

    Popup : {
        UsedClasses : 'Demo honetan erabilitako klaseak'
    },

    SlideToggle : {
        newDemos : 'Berriak eta eguneratuak'
    },

    Shared : {
        'Locale changed' : 'Tokiko hizkuntza aldatu da'
    },

    TextField : {
        Filter : 'Iragazi'
    },

    Tooltip : {
        infoButton       : 'Klik egin informazioa erakusteko eta gaia edo tokiko hizkuntza aldatzeko',
        codeButton       : 'Klik egin barneko kode editorea erakusteko',
        hintCheck        : 'Markatu adibidea kargatzean aholkuak automatikoki bistaratzeko',
        fullscreenButton : 'Pantaila osoa',
        openInCodePen    : 'Ireki CodePen-en'
    }
};

export default LocaleHelper.publishLocale(locale);
