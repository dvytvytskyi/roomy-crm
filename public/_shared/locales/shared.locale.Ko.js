import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'Ko',
    localeDesc : '한국어',
    localeCode : 'ko',
    localeRtl  : false,

    Button : {
        'Display hints' : '힌트 표시',
        Apply           : '적용',
        Learn           : '배우기',
        DownloadTrial   : '체험판 다운로드',
        upgradeGuide    : '업그레이드 가이드',
        documentation   : '문서',
        tabJS           : 'JavaScript 예제 보기',
        tabReact        : 'React 예제 보기',
        tabVue          : 'Vue 예제 보기',
        tabAngular      : 'Angular 예제 보기'
    },

    Checkbox : {
        Automatically : '자동으로',
        runHints      : '시작 시 힌트 흐름 실행'
    },

    Combo : {
        Theme    : '테마',
        Language : '언어',
        Size     : '크기',
        jumpTo   : '이동하기'
    },

    FilterField : {
        typeToFilter : '필터링하려면 입력하세요'
    },

    Popup : {
        UsedClasses : '이 데모에서 사용된 클래스'
    },

    SlideToggle : {
        newDemos : '새로운 및 업데이트된'
    },

    Shared : {
        'Locale changed' : '로케일 변경됨'
    },

    TextField : {
        Filter : '필터'
    },

    Tooltip : {
        infoButton       : '정보를 표시하고 테마 또는 로케일을 전환하려면 클릭하세요',
        codeButton       : '내장 코드 편집기를 표시하려면 클릭하세요',
        hintCheck        : '예제를 로드할 때 힌트를 자동으로 표시하려면 선택하세요',
        fullscreenButton : '전체 화면',
        openInCodePen    : 'CodePen에서 열기'
    }
};

export default LocaleHelper.publishLocale(locale);
