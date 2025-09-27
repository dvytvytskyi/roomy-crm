import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Pt',
    localeDesc : 'Português',
    localeCode : 'pt',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Exibir dicas',
        Apply           : 'Aplicar',
        Learn           : 'Aprender',
        DownloadTrial   : 'Baixar Versão de Avaliação',
        upgradeGuide    : 'Guia de Atualização',
        documentation   : 'Documentação',
        tabJS           : 'Mostrar exemplos de JavaScript',
        tabReact        : 'Mostrar exemplos de React',
        tabVue          : 'Mostrar exemplos de Vue',
        tabAngular      : 'Mostrar exemplos de Angular'
    },

    Checkbox : {
        Automatically : 'Automaticamente',
        runHints      : 'Executar fluxo de dicas na inicialização'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Idioma',
        Size     : 'Tamanho',
        jumpTo   : 'Ir para'
    },

    FilterField : {
        typeToFilter : 'Digite para filtrar'
    },

    Popup : {
        UsedClasses : 'Classes usadas nesta demonstração'
    },

    SlideToggle : {
        newDemos : 'Novos e atualizados'
    },

    Shared : {
        'Locale changed' : 'Localidade alterada'
    },

    TextField : {
        Filter : 'Filtrar'
    },

    Tooltip : {
        infoButton       : 'Clique para mostrar informações e alternar tema ou localidade',
        codeButton       : 'Clique para mostrar o editor de código embutido',
        hintCheck        : 'Marque para exibir automaticamente dicas ao carregar o exemplo',
        fullscreenButton : 'Tela cheia',
        openInCodePen    : 'Abrir no CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
