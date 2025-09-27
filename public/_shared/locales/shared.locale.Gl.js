import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Gl',
    localeDesc : 'Galego',
    localeCode : 'gl-ES',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Mostrar suxestións',
        Apply           : 'Aplicar',
        Learn           : 'Aprender',
        DownloadTrial   : 'Descargar proba',
        upgradeGuide    : 'Guía de actualización',
        documentation   : 'Documentación',
        tabJS           : 'Mostrar exemplos de JavaScript',
        tabReact        : 'Mostrar exemplos de React',
        tabVue          : 'Mostrar exemplos de Vue',
        tabAngular      : 'Mostrar exemplos de Angular'
    },

    Checkbox : {
        Automatically : 'Automáticamente',
        runHints      : 'Executar o fluxo de suxestión ao iniciar'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Idioma',
        Size     : 'Tamaño',
        jumpTo   : 'Saltar a'
    },

    FilterField : {
        typeToFilter : 'Escribe para filtrar'
    },

    Popup : {
        UsedClasses : 'Clases usadas nesta demostración'
    },

    SlideToggle : {
        newDemos : 'Novos e actualizados'
    },

    Shared : {
        'Locale changed' : 'Idioma cambiado'
    },

    TextField : {
        Filter : 'Filtro'
    },

    Tooltip : {
        infoButton       : 'Fai clic para mostrar información e cambiar o tema ou o idioma',
        codeButton       : 'Fai clic para mostrar o editor de código integrado',
        hintCheck        : 'Marcar para mostrar automaticamente as suxestións ao cargar o exemplo',
        fullscreenButton : 'Pantalla completa',
        openInCodePen    : 'Abrir en CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
