window.onload = () => {
    // nastavim akciu pre vsetky tlacidla like na stranke. Teda vsetky elementy, ktore maju nastaveny atribut
    // data-action na hodnoty add-like.
    document.querySelectorAll("[data-action='add-like']").forEach((elm) => {
        elm.onclick = async (event) => {
            // event.currentTarget obsahuje element, ktoreho sa udalost tyka. POZOR: event.target nemusi obsahovat totozny element
            let targetElm = event.currentTarget;
            // zistim hodnotu z atributu data-post-id tlacidla, na ktore som klikol.

            // objekt dataset obsahuje zoznam hodnot definovanych atributmi data-*
            let postId = targetElm.dataset.postId;

            // volanie metodou POST adresy pre zmenu hodnotenia prispevku (pockam na vysledok volania - odpoved)
            let res = await fetch(`/post/add_like/${postId}`, {method: 'POST'});

            // na zaklade toho, ci je odpoved v poriadku (kod 200) alebo sa vyskytla chyba nastavim pozadie elementu
            if (res.status === 200) {
                // odobrat pripadne nastavenie pozadia
                targetElm.classList.remove("bg-info", "bg-danger");
                // pridat nove nastavenie pozadia
                targetElm.classList.add("bg-success");
            } else {
                // inak bude cervene
                // odobrat pripadne nastavenie pozadia
                targetElm.classList.remove("bg-info", "bg-success");
                // pridat nove nastavenie pozadia
                targetElm.classList.add("bg-danger");
            }

            // telo odpovede (predpokladam, ze je vo formate JSON) skonvertujem na objekt (pockam na vysledok)
            let jsonRes = await res.json();

            // hodnotu atributu message z objektu odpovede zapisem do prislusneho elementu
            document.getElementById(`post-rating-${postId}`).innerHTML = jsonRes.message;
        }
    });
}