import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'FrFr',
    localeDesc : 'Français (France)',
    localeCode : 'fr-FR',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Afficher les indices',
        Apply           : 'Appliquer',
        Learn           : 'Apprendre',
        DownloadTrial   : "Télécharger l'essai",
        upgradeGuide    : 'Guide de mise à niveau',
        documentation   : 'Documentation',
        tabJS           : 'Afficher des exemples JavaScript',
        tabReact        : 'Afficher des exemples React',
        tabVue          : 'Afficher des exemples Vue',
        tabAngular      : 'Afficher des exemples Angular'
    },

    Checkbox : {
        Automatically : 'Automatiquement',
        runHints      : "Exécuter le flux d'indices au démarrage"
    },

    Combo : {
        Theme    : 'Thème',
        Language : 'Langue',
        Size     : 'Taille',
        jumpTo   : 'Aller à'
    },

    FilterField : {
        typeToFilter : 'Tapez pour filtrer'
    },

    Popup : {
        UsedClasses : 'Classes utilisées dans cette démo'
    },

    SlideToggle : {
        newDemos : 'Nouveaux et mis à jour'
    },

    Shared : {
        'Locale changed' : 'Paramètres régionaux modifiés'
    },

    TextField : {
        Filter : 'Filtrer'
    },

    Tooltip : {
        infoButton       : 'Cliquez pour afficher les infos et changer le thème ou la langue',
        codeButton       : "Cliquez pour afficher l'éditeur de code intégré",
        hintCheck        : "Cochez pour afficher automatiquement les indices lors du chargement de l'exemple",
        fullscreenButton : 'Plein écran',
        openInCodePen    : 'Ouvrir dans CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
