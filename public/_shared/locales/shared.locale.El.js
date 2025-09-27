import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'El',
    localeDesc : 'Ελληνικά',
    localeCode : 'el',
    localeRtl  : false,

    Button : {
        'Display hints' : 'Εμφάνιση υποδείξεων',
        Apply           : 'Εφαρμογή',
        Learn           : 'Μάθετε',
        DownloadTrial   : 'Λήψη δοκιμής',
        upgradeGuide    : 'Οδηγός Αναβάθμισης',
        documentation   : 'Τεκμηρίωση',
        tabJS           : 'Εμφάνιση παραδειγμάτων JavaScript',
        tabReact        : 'Εμφάνιση παραδειγμάτων React',
        tabVue          : 'Εμφάνιση παραδειγμάτων Vue',
        tabAngular      : 'Εμφάνιση παραδειγμάτων Angular'
    },

    Checkbox : {
        Automatically : 'Αυτόματα',
        runHints      : 'Εκτέλεση ροής υποδείξεων κατά την εκκίνηση'
    },

    Combo : {
        Theme    : 'Θέμα',
        Language : 'Γλώσσα',
        Size     : 'Μέγεθος',
        jumpTo   : 'Μετάβαση σε'
    },

    FilterField : {
        typeToFilter : 'Πληκτρολογήστε για φιλτράρισμα'
    },

    Popup : {
        UsedClasses : 'Κλάσεις που χρησιμοποιούνται σε αυτή την επίδειξη'
    },

    SlideToggle : {
        newDemos : 'Νέα και ενημερωμένα'
    },

    Shared : {
        'Locale changed' : 'Η τοπική ρύθμιση άλλαξε'
    },

    TextField : {
        Filter : 'Φίλτρο'
    },

    Tooltip : {
        infoButton       : 'Κάντε κλικ για να εμφανίσετε πληροφορίες και να αλλάξετε θέμα ή τοπική ρύθμιση',
        codeButton       : 'Κάντε κλικ για να εμφανίσετε τον ενσωματωμένο επεξεργαστή κώδικα',
        hintCheck        : 'Επιλέξτε για να εμφανίζονται αυτόματα υποδείξεις κατά τη φόρτωση του παραδείγματος',
        fullscreenButton : 'Πλήρης οθόνη',
        openInCodePen    : 'Άνοιγμα στο CodePen'
    }
};

export default LocaleHelper.publishLocale(locale);
