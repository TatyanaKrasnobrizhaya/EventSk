Do prázdneho adresára stiahneme obsah repozitára:

```
git clone https://gitlab.umb.sk/wete-2/cms.git ./
```

Nainštalujeme javascriptové balíčky:

```
npm install
```

Docker sa používa na jednoduché programovanie.Docker slúži na balenie, poskytovanie a spúšťanie aplikácií v izolovaných kontajneroch, čím poskytuje jednoduchú prenosnosť, správu závislostí a efektívne využívanie zdrojov, čo uľahčuje vývoj, nasadzovanie a škálovanie aplikácií.
Preto ho používam.

docker compose up -d

docker compose down

./backup.sh

./restore.sh


http://localhost:3000
http://localhost:8000



git remote add origin https://gitlab.umb.sk/wete-2/projekty-2023/wete2-tatyana.krasnobrizhaya.git
git add .
git commit -m ""
git push --set-upstream origin --all