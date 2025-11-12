import nunjucks from "nunjucks";
import path from 'node:path';
import dateFilter from 'nunjucks-date-filter'

function initNunjucksEnv(app) {

    let nunjucksEnv = nunjucks.configure('views', {
        express: app, // Express plikacia
        watch: true, // sledovat, ci sa budu menit subory so sablonami
        noCache: true, // skompilovane sablony sa nebudu ukladat do cache
        autoescape: true, // automaticky "escapeovat" vkladane hodnoty premennych do sablon
        // v pripade potreby je tu mozne nastavit globalne premenne
        globals: {},

    });

    // Custom filter pre zistovanie ake roly ma pridelene pouziatel
    nunjucksEnv.addFilter('is_granted', (user, role) => {
        if (!user) return false;
        console.log(user);
        return user.roles.includes(role);
    }, false);

    // filter pre formatovanie datumu
    nunjucksEnv.addFilter('date', dateFilter);

    // spristupnit niektore premenne z requestu vo view templates
    app.use(async function (req, res, next) {
        nunjucksEnv.addGlobal('user', req.session.user);
        nunjucksEnv.addGlobal('messages', await req.consumeFlash('success'));
        nunjucksEnv.addGlobal('errors', await req.consumeFlash('error'));
        next();
    });

    return nunjucksEnv;
}

export {initNunjucksEnv}