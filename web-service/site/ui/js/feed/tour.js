hopscotch.registerHelper('addOverlay', function () {
    $('body').append('<div id="cover"></div>');
    $('html, body,#slider').animate({scrollTop: 0}, 0);
    var menu_a = $('.accordion > li > a');

    menu_a.children('img').removeClass('down_arrow');
    menu_a.removeClass('active');
    menu_a.next().stop(true, true).slideUp('normal');
    $('body').addClass('stop-scrolling');
});

hopscotch.registerHelper('removeOverlay', function () {
    $('#cover').remove();
    $('body').removeClass('stop-scrolling');
    $('html, body,#slider').animate({scrollTop: 0}, 0);
});

var titles_1 = [], contents_1 = [], titles_2 = [], contents_2 = [], nextBtn, prevBtn, doneBtn, skipBtn, closeTooltip;
switch (translation_param) {
    case "en":
        titles_1 = ["Settings", "Search", "Social Networks", "Language", "Topics", "Original", "Type", "Unique", "Date", "Sort", "Feed", "Dashboard", "Social Item"];
        contents_1 = ["Click to toggle settings tab.", "Search for content with a specific keyword / hashtag.", "Filter content based on source(s).", "Filter content based on language.", "Define certain topics.", "Define source of item.", "Define type of items.", "Define if items are unique", "Define time window.", "Define sort criteria.", "Inspect social feed.", "Track a various collection of analytics.", "This is a individual social item with all the contained information."];
        titles_2 = ["Settings", "Search", "Social Networks", "Language", "Topics", "Original", "Type", "Unique", "Date", "Feed", "Dashboard", "Posts", "Users", "Reach", "Endorsements", "Timeline", "Social Mix", "Heatmap", "Users Locations", "Active Users", "Entities"];
        contents_2 = ["Click to toggle settings tab.", "Search for content with a specific keyword / hashtag.", "Filter content based on source(s).", "Filter content based on language.", "Define certain topics.", "Define source of item.", "Define type of items.", "Define if items are unique", "Define time window.", "Inspect social feed.", "Track a various collection of analytics.", "The number of posts made.", "The number of users made one or more posts.", "The number of users read one or more posts.", "The number of likes", "The number of posts in time.", "Source Analysis of posts, users, reach, endorsement.", "Location Analysis of posts.", "Location Analysis of users.", "Top influencers", "Top entities."];
        nextBtn = "Next", prevBtn = "Back", doneBtn = "Done", skipBtn = "Skip", closeTooltip = "Close";
        break;
    case "el":
        titles_1 = ["Ρυθμίσεις", "Αναζήτηση", "Κοινωνικά Δίκτυα", "Γλώσσα", "Θέματα", "Πηγή", "Τύπος", "Μοναδικά", "Ημερομηνία", "Ταξινόμηση", "Ροή", "Πίνακας", "Δημοσίευση"];
        contents_1 = ["Εμφάνισε / Κρύψε το μενού.", "Αναζήτηση με συγκεκριμένη ετικέτα.", "Φιλτράρισε το περιοχόμενο αναλόγως το Κοινωνικό Δίκτυο.", "Φιλτράρισε το περιοχόμενο αναλόγως τη γλώσσα.", "Καθόρισε ένα θέμα.", "Καθόρισε την πηγή.", "Καθόρισε τον τύπο.", "Καθόρισε αν οι δημοσιεύσεις είναι μοναδικές", "Καθόρισε το χρονικό παράθυρο.", "Καθόρισε το κριτήριο ταξινόμησης.", "Επίβλεψε την ροή των δημοσιεύσευων.", "Δες μια σειρά από στατιστικά.", "Αυτή είναι μια δημοσίευση με όλη την πληροφορία."];
        titles_2 = ["Ρυθμίσεις", "Αναζήτηση", "Κοινωνικά Δίκτυα", "Γλώσσα", "Θέματα", "Πηγή", "Τύπος", "Μοναδικά", "Ημερομηνία", "Ροή", "Πίνακας", "Δημοσιεύσεις", "Χρήστες", "Θέαση", "Φιλοφρονήσεις", "Χρονοδιάγραμμα", "Κοινωνικά Δίκτυα", "Χάρτης Σημείων", "Τοποθεσία Χρηστών", "Ενεργοί Χρήστες", "Οντότητες"];
        contents_2 = ["Εμφάνισε / Κρύψε το μενού.", "Αναζήτηση με συγκεκριμένη ετικέτα.", "Φιλτράρισε το περιοχόμενο αναλόγως το Κοινωνικό Δίκτυο.", "Φιλτράρισε το περιοχόμενο αναλόγως τη γλώσσα.", "Καθόρισε ένα θέμα.", "Καθόρισε την πηγή.", "Καθόρισε τον τύπο.", "Καθόρισε αν οι δημοσιεύσεις είναι μοναδικές", "Καθόρισε το χρονικό παράθυρο.", "Επίβλεψε την ροή των δημοσιεύσευων.", "Δες μια σειρά από στατιστικά.", "Ο αριθμός των δημοσιεύσεων.", "Ο αριθμός των χρηστών.", "Ο αριθμός των χρηστών που διάβασαν μια δημοσίευση.", "Ο αριθμός των φιλοφρονήσεων.", "Ο αριθμός των δημοσιεύσεων ανά χρόνο.", "Ανάλυση σε επίπεδο Κοινωνικού Δικτύου για τις δημοσιεύσεις, τους χρήστες, την θέαση και τις φιλοφρονήσεις.", "Ανάλυση τοποθεσίας δημοσιεύσεων.", "Ανάλυση τοποθεσίας χρηστών.", "Χρήστες με τις περισσότερες δημοσιεύσεις.", "Κορυφαίες οντότητες."];
        nextBtn = "Επόμενο", prevBtn = "Προηγούμενο", doneBtn = "Τέλος", skipBtn = "Παράβλεψη", closeTooltip = "Κλείσιμο";
        break;
    case "it":
        titles_1 = ["Impostazioni", "Cerca", "Social Networks", "Lingua", "Temi", "Originale", "Tipo", "Unique", "Data", "Ordina", "Feed", "Bacheca", "Contenuto sociale/argomento"];
        contents_1 = ["Clicca per passare al/attivare il pannello impostazioni.", "Cerca per una specifica parola chiave o hashtag.", "Filtra il contenuto in base alla fonte.", "Filtra il contenuto in base alla lingua.", "Definisci un tema.", "Definisci la fonte dell'argomento.", "Definisci l'oggetto.", "Define if items are unique", "Definisci I criteri di ordinamento.", "Definisci I criteri di ordinamento.", "Monitora social feed.", "Vedi le statistiche.", "Questo è un contenuto individuale con relative informazioni ."];
        titles_2 = ["Impostazioni", "Cerca", "Social Networks", "Lingua", "Temi", "Originale", "Tipo", "Unique", "Data", "Feed", "Bacheca", "Posts", "Utenti", "Consultati", "Approvati", "Orario", "Reti sociali", "Mappa di calore web", "Posizione dell'utente", "Utenti attivi", "Entità"];
        contents_2 = ["Clicca per passare al/attivare il pannello impostazioni.", "Cerca per una specifica parola chiave o hashtag.", "Filtra il contenuto in base alla fonte.", "Filtra il contenuto in base alla lingua.", "Definisci un tema.", "Definisci la fonte dell'argomento.", "Definisci l'oggetto.", "Define if items are unique", "Definisci I criteri di ordinamento.", "Monitora social feed.", "Vedi le statistiche.", "Numero di post.", "Numero di utenti autori di uno o più post.", "Numero di utenti lettori di uno o più post.", "Numero di approvazioni.", "Numero di post in un determinato tempo.", "Analisi di post, utenti, consultati, approvati.", "Analisi della posizione dei post.", "Analisi della posizione degli utenti.", "Top influencers.", " Top entità."];
        nextBtn = "Successivo", prevBtn = "Indietro", doneBtn = "Fine", skipBtn = "Ignora", closeTooltip = "Chiudi";
        break;
    case "tr":
        titles_1 = ["Ayarlar", "Ara", "Sosyal Ağlar", "Dil", "Konular", "Orijinal", "Tur", "Unique", "Tarih", "Sirala", "Feed", "Panel", "Orijinal"];
        contents_1 = ["Ayarlar sekmesine geçmek için tıkla.", "Belirli bir anahtar kelime veya hashtag ile ilgili içerik ara.", "İçeriği kaynaklara göre filtrele.", "İçeriği dile göre filtrele.", "Belirli konular tanımla.", "Öğenin kaynağını tanımla.", "Öğe türünü tanımla.", "Define if items are unique", "Zaman penceresi tanımla.", "Sıralama kriterini belirle.", "Sosyal girdileri denetle.", "İstatistikleri takip et.", "Bu bireysel sosyal öğe tüm bilgileri içerir."];
        titles_2 = ["Ayarlar", "Ara", "Sosyal Ağlar", "Dil", "Konular", "Orijinal", "Tur", "Unique", "Tarih", "Feed", "Panel", "Gönderiler", "Kullanıcılar", "Ulaşılan", "Onaylananlar", "Zaman tüneli", "Sosyal Karışım", "Isı haritası", "Konum", "Aktif kullanıcılar", "Girişler"];
        contents_2 = ["Ayarlar sekmesine geçmek için tıkla.", "Belirli bir anahtar kelime veya hashtag ile ilgili içerik ara.", "İçeriği kaynaklara göre filtrele.", "İçeriği dile göre filtrele.", "Belirli konular tanımla.", "Öğenin kaynağını tanımla.", "Öğe türünü tanımla.", "Define if items are unique", "Zaman penceresi tanımla.", "Sosyal girdileri denetle.", "İstatistikleri takip et.", "Gönderilerin sayısı.", "Gönderi yapan kullanıcı sayısı.", "Gönderi okuyan kullanıcı sayısı.", "Beğenilerin sayısı.", "Belirli bir zaman aralığında yapılan gönderilerin sayısı.", "Gönderi, kullanıcı, erişim ve onayların Kaynak Analizi.", "Gönderilerin konum analizi.", "Kullanıcıların konum analizi.", "En etkileyiciler.", "En iyi girdiler."];
        nextBtn = "İleri", prevBtn = "Geri", doneBtn = "Tamamlandı", skipBtn = "Atla", closeTooltip = "Kapat";
        break;
    case "es":
        titles_1 = ["Ajustes", "Buscar", "Redes sociales", "Idioma", "Temas", "Original", "Tipo", "Unique", "Fecha", "Ordenar", "Alimentar", "Tablero", "Publicación"];
        contents_1 = ["Haga clic para activar la pestaña de configuración.", "Buscar contenido con una palabra clave / hashtag específico", "Filtrar contenido basado en la fuente (s).", "Filtrar contenido basado en el lenguaje.", "Filtrar contenido basado en el lenguaje", "Ajuste la fuente.", "Definir tipo de artículos.", "Define if items are unique", "Establecer la ventana de tiempo.", "Definir los criterios de clasificación.", "Inspeccionar Social de alimentación.", "Ver una serie de estadísticas.", "Se trata de una publicación con toda la información."];
        titles_2 = ["Ajustes", "Buscar", "Redes sociales", "Idiom", "Temas", "Original", "Tipo", "Unique", "Fecha", "Alimentar", "Tablero", "Mensajes", "Usuarioas", "Sobrepasado", "Atenciones", "Calendario", "Mezcla Social", "Mapa de puntos", "Ubicación del usuario", "Los usuarios activos", "Entidades"];
        contents_2 = ["Haga clic para activar la pestaña de configuración.", "Buscar contenido con una palabra clave / hashtag específico", "Filtrar contenido basado en la fuente (s).", "Filtrar contenido basado en el lenguaje.", "Filtrar contenido basado en el lenguaje", "Ajuste la fuente.", "Definir tipo de artículos.", "Define if items are unique", "Establecer la ventana de tiempo.", "Inspeccionar Social de alimentación.", "Ver una serie de estadísticas.", "El número de publicaciones.", "El número de usuarios que publicó uno o más mensajes.", "El número de usuarios que leen una publicación.", "El número de 'me gusta'", "El número de publicaciones por tiempo.", "Análisis fuente de los mensajes, los usuarios, alcance, atenciones.", "Análisis del lugar de las publicaciones.", "Análisis ubicación de los usuarios.", "Lo más influyentes.", "Top entidades."];
        nextBtn = "Siguiente", prevBtn = "Volver", doneBtn = "Hecho", skipBtn = "Omitir", closeTooltip = "Cerrar";
        break;
    case "ca":
        titles_1 = ["Configuració", "Cerca", "Xarxes Socials ", "Idioma", "Temes", "Original", "Tipus", "Unique", "Data", "Ordena", "Introdueix dades", "Escriptori", "Element social "];
        contents_1 = ["Feu clic per activar la pestanya de configuració.", "Cerca contingut per mitjà d'una paraula clau o hashtag.", "Flitra el contingut en funció de la font.", "Filtra el contingut en funció de l'idioma.", "Defineix certs temes", "Defineix la font de l'article.", "Defineix tipus d'articles.", "Define if items are unique", "Defineix la finestra temporal.", "Defineix els criteris d'ordenació.", "Inspecciona les xarxes socials.", "Realitza el seguiment d'un recull variat de dades analítiques.", "Aquest és un element social individual amb tota la informació vinculada."];
        titles_2 = ["Configuració", "Cerca", "Xarxes Socials", "Idioma", "Temes", "Original", "Tipus", "Unique", "Data", "Feed", "Escriptori", "Publicacions", "Usuaris", "Involucrats", "Adhesions", "Termini", "Xarxes socials", "Mapa web", "Localització dels usuaris", "Usuaris actius", "Entitats"];
        contents_2 = ["Feu clic per activar la pestanya de configuració.", "Cerca contingut per mitjà d'una paraula clau o hashtag.", "Flitra el contingut en funció de la font.", "Filtra el contingut en funció de l'idioma.", "Defineix certs temes", "Defineix la font de l'article.", "Defineix tipus d'articles.", "Define if items are unique", "Defineix la finestra temporal.", "Inspecciona les xarxes socials.", "Realitza el seguiment d'un recull variat de dades analítiques.", "Nombre de publicacions realitzades.", "Nombre d'usuaris que hagin realitzat una o més publicacions.", "Nombre d'usuaris que hagin llegit una o més publicacions.", "Nombre de M'agrades.", "Nombre de publicacions a la cronologia.", "Anàlisi de les fonts de publicacions, usuaris, abast i adhesions.", "Anàlisi de la localització de les publicacions.", "Anàlisi de la localització dels usuaris.", "Els més influents.", "Entitats més actives."];
        nextBtn = "Següent", prevBtn = "Endarrere", doneBtn = "Fet", skipBtn = "Omet", closeTooltip = "Tanca";
        break;
    default:
        titles_1 = ["Settings", "Search", "Social Networks", "Language", "Topics", "Original", "Type", "Unique", "Date", "Sort", "Feed", "Dashboard", "Social Item"];
        contents_1 = ["Click to toggle settings tab.", "Search for content with a specific keyword / hashtag.", "Filter content based on source(s).", "Filter content based on language.", "Define certain topics.", "Define source of item.", "Define type of items.", "Define if items are unique", "Define time window.", "Define sort criteria.", "Inspect social feed.", "Track a various collection of analytics.", "This is a individual social item with all the contained information."];
        titles_2 = ["Settings", "Search", "Social Networks", "Language", "Topics", "Original", "Type", "Unique", "Date", "Feed", "Dashboard", "Posts", "Users", "Reach", "Endorsements", "Timeline", "Social Mix", "Heatmap", "Users Locations", "Active Users", "Entities"];
        contents_2 = ["Click to toggle settings tab.", "Search for content with a specific keyword / hashtag.", "Filter content based on source(s).", "Filter content based on language.", "Define certain topics.", "Define source of item.", "Define type of items.", "Define if items are unique", "Define time window.", "Inspect social feed.", "Track a various collection of analytics.", "The number of posts made", "The number of users made one or more posts", "The number of users read one or more posts.", "The number of likes", "The number of posts in time.", "Source Analysis of posts, users, reach, endorsement.", "Location Analysis of posts.", "Location Analysis of users.", "Top influencers.", "Top entities."];
        nextBtn = "Next", prevBtn = "Back", doneBtn = "Done", skipBtn = "Skip", closeTooltip = "Close";
}

var tour = {
    id: "tour",
    showCloseButton: true,
    showPrevButton: true,
    scrollDuration: 0,
    i18n: {
        nextBtn: nextBtn,
        prevBtn: prevBtn,
        doneBtn: doneBtn,
        skipBtn: skipBtn,
        closeTooltip: closeTooltip
    },
    steps: [
        {
            title: titles_1[0],
            content: contents_1[0],
            target: "#menu",
            placement: "bottom",
            yOffset: 10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#ff-search").offset().top}, 0);
            }
        },
        {
            title: titles_1[1],
            content: contents_1[1],
            target: "#ff-search",
            placement: "right",
            yOffset: -18,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $(".ff-filter-holder").offset().top}, 0);
            }
        },
        {
            title: titles_1[2],
            content: contents_1[2],
            target: ".ff-filter-holder",
            placement: "right",
            yOffset: 20,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop4").offset().top}, 0);
            }
        },
        {
            title: titles_1[3],
            content: contents_1[3],
            target: "#hop4",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop10").offset().top}, 0);
            }
        },
        {
            title: titles_1[4],
            content: contents_1[4],
            target: "#hop10",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop8").offset().top}, 0);
            }
        },
        {
            title: titles_1[5],
            content: contents_1[5],
            target: "#hop8",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop9").offset().top}, 0);
            }
        },
        {
            title: titles_1[6],
            content: contents_1[6],
            target: "#hop9",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop12").offset().top}, 0);
            }
        },
        {
            title: titles_1[7],
            content: contents_1[7],
            target: "#hop12",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop11").offset().top}, 0);
            }
        },
        {
            title: titles_1[8],
            content: contents_1[8],
            target: "#hop11",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop5").offset().top}, 0);
            }
        },
        {
            title: titles_1[9],
            content: contents_1[9],
            target: "#hop5",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop6").offset().top}, 0);
            }
        },
        {
            title: titles_1[10],
            content: contents_1[10],
            target: "#hop6",
            placement: "top",
            yOffset: -15,
            xOffset: 35,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop7").offset().top}, 0);
            }
        },
        {
            title: titles_1[11],
            content: contents_1[11],
            target: "#hop7",
            placement: "top",
            yOffset: -10,
            xOffset: 30,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: 0}, 0);
            }
        },
        {
            title: titles_1[12],
            content: contents_1[12],
            target: "#tiles li",
            placement: "right",
            yOffset: 50,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
        }
    ],
    onStart: ["addOverlay"],
    onEnd: ["removeOverlay"],
    onClose: ["removeOverlay"]
};

var tour2 = {
    id: "tour2",
    showCloseButton: true,
    showPrevButton: true,
    scrollDuration: 0,
    i18n: {
        nextBtn: nextBtn,
        prevBtn: prevBtn,
        doneBtn: doneBtn,
        skipBtn: skipBtn,
        closeTooltip: closeTooltip
    },
    steps: [
        {
            title: titles_2[0],
            content: contents_2[0],
            target: "#menu",
            placement: "bottom",
            yOffset: 10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#ff-search").offset().top}, 0);
            }
        },
        {
            title: titles_2[1],
            content: contents_2[1],
            target: "#ff-search",
            placement: "right",
            yOffset: -18,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $(".ff-filter-holder").offset().top}, 0);
            }
        },
        {
            title: titles_2[2],
            content: contents_2[2],
            target: ".ff-filter-holder",
            placement: "right",
            yOffset: 20,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop4").offset().top}, 0);
            }
        },
        {
            title: titles_2[3],
            content: contents_2[3],
            target: "#hop4",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop10").offset().top}, 0);
            }
        },
        {
            title: titles_2[4],
            content: contents_2[4],
            target: "#hop10",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop8").offset().top}, 0);
            }
        },
        {
            title: titles_2[5],
            content: contents_2[5],
            target: "#hop8",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop9").offset().top}, 0);
            }
        },
        {
            title: titles_2[6],
            content: contents_2[6],
            target: "#hop9",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop12").offset().top}, 0);
            }
        },
        {
            title: titles_2[7],
            content: contents_2[7],
            target: "#hop12",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop11").offset().top}, 0);
            }
        },
        {
            title: titles_2[8],
            content: contents_2[8],
            target: "#hop11",
            placement: "right",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            }
            ,
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop5").offset().top}, 0);
            }
        },
        {
            title: titles_2[9],
            content: contents_2[9],
            target: "#hop6",
            placement: "top",
            yOffset: -15,
            xOffset: 35,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: $("#hop7").offset().top}, 0);
            }
        },
        {
            title: titles_2[10],
            content: contents_2[10],
            target: "#hop7",
            placement: "top",
            yOffset: -10,
            xOffset: 30,
            zindex: 10,
            onShow: function () {
                $('html, body').animate({scrollTop: 0}, 0);
            },
            onNext: function () {
                $('#slider').animate({scrollTop: 0}, 0);
            }
        },
        {
            title: titles_2[11],
            content: contents_2[11],
            target: "#posts_num",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#posts_num").offset().top - 10});
            }
        },
        {
            title: titles_2[12],
            content: contents_2[12],
            target: "#users_num",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#users_num").offset().top - 10});
            }
        },
        {
            title: titles_2[13],
            content: contents_2[13],
            target: "#reach_num",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#reach_num").offset().top - 10});
            }
        },
        {
            title: titles_2[14],
            content: contents_2[14],
            target: "#endo_num",
            placement: "left",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#endo_num").offset().top - 10});
            }
        },
        {
            title: titles_2[15],
            content: contents_2[15],
            target: "#timeline_head",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#timeline_head").offset().top - 10});
            }
        },
        {
            title: titles_2[16],
            content: contents_2[16],
            target: "#socialmix_head",
            placement: "left",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#socialmix_head").offset().top - 20});
            }
        },
        {
            title: titles_2[17],
            content: contents_2[17],
            target: "#heatmap_head",
            placement: "left",
            yOffset: -10,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#heatmap_head").offset().top - 20});
            }
        },
        {
            title: titles_2[18],
            content: contents_2[18],
            target: "#usersloc_head",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#usersloc_head").offset().top - 10});
            }
        },
        {
            title: titles_2[19],
            content: contents_2[19],
            target: "#activeuser_head",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#activeuser_head").offset().top - 10});
            }
        },
        {
            title: titles_2[20],
            content: contents_2[20],
            target: "#tags_head",
            placement: "bottom",
            yOffset: 0,
            xOffset: 0,
            zindex: 10,
            onShow: function () {
                $('html,body').animate({scrollTop: $("#tags_head").offset().top - 10});
            }
        }
    ],
    onStart: ["addOverlay"],
    onEnd: ["removeOverlay"],
    onClose: ["removeOverlay"]
};

