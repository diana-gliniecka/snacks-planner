import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Recipe, Ingredient, RecipeIngredient

DATABASE_URL = "sqlite:///./party_planner.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Session = sessionmaker(bind=engine)


def seed():
    Base.metadata.create_all(bind=engine)
    db = Session()

    # Clear existing data
    db.query(RecipeIngredient).delete()
    db.query(Recipe).delete()
    db.query(Ingredient).delete()
    db.commit()

    # --- Ingredients ---
    def ing(name, category, unit):
        i = Ingredient(name=name, category=category, default_unit=unit)
        db.add(i)
        return i

    W = "Warzywa i owoce"
    N = "Nabiał"
    M = "Mięso i ryby"
    A = "Alternatywy mięsa"
    P = "Pieczywo"
    S = "Przyprawy i sosy"
    D = "Suche produkty"
    I = "Inne"

    liscie_salaty       = ing("liście sałaty",          W, "g")
    pomidor             = ing("pomidor",                 W, "szt")
    suszone_pomidory    = ing("suszone pomidory",        D, "g")
    majonez             = ing("majonez",                 S, "łyżka")
    musztarda           = ing("musztarda",               S, "łyżeczka")
    ocet                = ing("ocet",                    S, "łyżka")
    cukier              = ing("cukier",                  D, "łyżeczka")
    sol                 = ing("sól",                     S, "szczypta")
    pieprz              = ing("pieprz",                  S, "szczypta")
    kurczak_wege        = ing("kurczak wegetariański",   A, "g")
    parmezan            = ing("parmezan",                N, "g")

    mielona_wolowina    = ing("mielona wołowina",        M, "g")
    bulka_burger        = ing("bułka do burgera",        P, "szt")
    salata_lodowa       = ing("sałata lodowa",           W, "g")
    cheddar             = ing("cheddar",                 N, "g")
    ketchup             = ing("ketchup",                 S, "łyżka")

    pomidorki           = ing("pomidorki koktajlowe",    W, "szt")
    mozzarella          = ing("mozzarella świeża",       N, "g")
    bazylia             = ing("świeża bazylia",          W, "szt")
    oliwa               = ing("oliwa z oliwek",          S, "łyżka")
    glazura_bals        = ing("glazura balsamiczna",     S, "łyżka")

    hummus              = ing("hummus",                  D, "g")
    marchewka           = ing("marchewka",               W, "g")
    ogurek              = ing("ogórek",                  W, "g")
    papryka             = ing("papryka",                 W, "g")
    papryka_mielona     = ing("papryka słodka mielona",  S, "łyżeczka")

    pierś_kurczaka      = ing("pierś z kurczaka",        M, "g")
    czerwona_cebula     = ing("czerwona cebula",         W, "g")

    awokado             = ing("awokado",                 W, "szt")
    chipsy_tortilla     = ing("chipsy tortilla",         D, "g")
    sok_limonki         = ing("sok z limonki",           S, "łyżka")
    kolendra            = ing("świeża kolendra",         W, "g")
    chili               = ing("chili",                   S, "szczypta")

    kolba_kukurydzy     = ing("kolba kukurydzy",         W, "szt")
    maslo               = ing("masło",                   N, "g")

    bagietka            = ing("bagietka",                P, "szt")
    czosnek             = ing("czosnek",                 W, "szt")

    cukinia             = ing("cukinia",                 W, "g")
    pieczarki           = ing("pieczarki",               W, "g")
    cebula              = ing("cebula",                  W, "g")
    tofu                = ing("tofu",                    A, "g")
    sos_sojowy          = ing("sos sojowy",              S, "łyżka")
    miod                = ing("miód",                    S, "łyżka")
    olej                = ing("olej roślinny",           S, "łyżka")
    majonez_weganski    = ing("majonez wegański",        S, "łyżka")

    db.flush()

    # --- Recipes ---
    def recipe(name, party_types, diet_tags, effort, cost, servings, notes, instructions=None, group_name=None):
        r = Recipe(
            name=name,
            party_types=party_types,
            diet_tags=diet_tags,
            effort_level=effort,
            cost_per_person=cost,
            base_servings=servings,
            notes=notes,
            instructions=instructions,
            group_name=group_name,
        )
        db.add(r)
        return r

    def ri(rec, ingr, qty, unit, qtype, note=None):
        db.add(RecipeIngredient(
            recipe=rec,
            ingredient=ingr,
            quantity=qty,
            unit=unit,
            quantity_type=qtype,
            display_note=note,
        ))

    # 1 — Sałatka Cezar z kurczakiem wegetariańskim
    r1 = recipe("Sałatka Cezar z kurczakiem wegetariańskim",
                "wnetrze,ogrod", "wegetarianskie", 2, 3.50, 4,
                "Sos wymieszać osobno, dodać tuż przed podaniem",
                instructions="1. Wymieszaj majonez, musztardę, kilka kropli octu, cukier, sól i pieprz — to sos.\n2. Kurczaka wegetariańskiego podsmaż na patelni do zrumienienia.\n3. Liście sałaty porwij, pomidory pokrój w ćwiartki, suszone pomidory posiekaj.\n4. Wszystko wyłóż na talerz, polej sosem tuż przed podaniem.\n5. Na wierzch zetrzyj parmezan.",
                group_name="Sałatka Cezar")
    ri(r1, liscie_salaty,    200,  "g",        "exact")
    ri(r1, pomidor,          3,    "szt",      "exact")
    ri(r1, suszone_pomidory, 30,   "g",        "exact")
    ri(r1, majonez,          3,    "łyżka",    "exact")
    ri(r1, musztarda,        1,    "łyżeczka", "exact")
    ri(r1, ocet,             None, None,       "descriptive", "kilka kropli")
    ri(r1, cukier,           None, None,       "to_taste")
    ri(r1, sol,              None, None,       "to_taste")
    ri(r1, pieprz,           None, None,       "to_taste")
    ri(r1, kurczak_wege,     200,  "g",        "exact")
    ri(r1, parmezan,         50,   "g",        "exact")

    # 2 — Klasyczne burgery z grilla
    r2 = recipe("Klasyczne burgery z grilla",
                "grill", "miesne", 2, 5.00, 1,
                "Kotlety grillować po 4–5 minut z każdej strony",
                instructions="1. Mieloną wołowinę przypraw solą i pieprzem, uformuj kotlety.\n2. Grilluj kotlety po 4–5 minut z każdej strony.\n3. Pod koniec połóż na każdym kotlecie plaster cheddara i poczekaj aż się rozpuści.\n4. Bułki lekko opiecz na grillu.\n5. Złóż burgera: bułka, sałata, pomidor, kotlet, ketchup i musztarda.",
                group_name="Burgery")
    ri(r2, mielona_wolowina, 150, "g",        "exact")
    ri(r2, bulka_burger,     1,   "szt",      "exact")
    ri(r2, salata_lodowa,    30,  "g",        "exact")
    ri(r2, pomidor,          1,   "szt",      "exact")
    ri(r2, cheddar,          30,  "g",        "exact")
    ri(r2, ketchup,          1,   "łyżka",    "exact")
    ri(r2, musztarda,        1,   "łyżeczka", "exact")
    ri(r2, sol,              None, None,      "to_taste")
    ri(r2, pieprz,           None, None,      "to_taste")

    # 3 — Szaszłyki caprese
    r3 = recipe("Szaszłyki caprese",
                "grill,wnetrze,ogrod,koktajl", "wegetarianskie", 1, 2.50, 2,
                "Nabijać na wykałaczki lub małe patyczki do szaszłyków",
                instructions="1. Mozzarellę pokrój w kostkę wielkości pomidorków.\n2. Na wykałaczkę nabij kolejno: pomidorek, listek bazylii, kostkę mozzarelli.\n3. Skrop oliwą i szczyptą soli.\n4. Tuż przed podaniem polej glazurą balsamiczną.",
                group_name="Szaszłyki caprese")
    ri(r3, pomidorki,    6,    "szt",   "exact")
    ri(r3, mozzarella,   100,  "g",     "exact")
    ri(r3, bazylia,      6,    "szt",   "exact")
    ri(r3, oliwa,        1,    "łyżka", "exact")
    ri(r3, sol,          None, None,    "to_taste")
    ri(r3, glazura_bals, None, None,    "descriptive", "skropić przed podaniem")

    # 4 — Hummus z pitą i warzywami
    r4 = recipe("Hummus z warzywami",
                "wnetrze,ogrod,koktajl", "wegetarianskie,weganskie", 1, 1.50, 1,
                "Podawać na dużym talerzu, warzywa ułożyć wokół hummusu",
                instructions="1. Marchewkę, ogórka i paprykę pokrój w słupki.\n2. Hummus przełóż na środek dużego talerza, skrop oliwą i posyp papryką mieloną.\n3. Ułóż warzywa wokół hummusu.",
                group_name="Hummus z warzywami")
    ri(r4, hummus,          50,   "g",        "exact")
    ri(r4, marchewka,       50,   "g",        "exact")
    ri(r4, ogurek,          50,   "g",        "exact")
    ri(r4, papryka,         40,   "g",        "exact")
    ri(r4, oliwa,           None, None,       "descriptive", "skropić przed podaniem")
    ri(r4, papryka_mielona, None, None,       "to_taste")

    # 5 — Guacamole z chipsami tortilla
    r7 = recipe("Guacamole z chipsami tortilla",
                "wnetrze,koktajl", "wegetarianskie,weganskie", 1, 2.00, 4,
                "Przygotować tuż przed podaniem, żeby awokado nie ściemniało",
                instructions="1. Awokado przekrój, wyjmij pestki, wydrąż łyżką miąższ do miski.\n2. Rozgnieć widelcem na w miarę gładką masę.\n3. Dodaj sok z limonki, drobno posiekaną cebulę czerwoną, kolendrę, sól i chili.\n4. Wymieszaj i od razu podawaj z chipsami tortilla.",
                group_name="Guacamole")
    ri(r7, awokado,        2,    "szt",   "exact")
    ri(r7, chipsy_tortilla,150,  "g",     "exact")
    ri(r7, sok_limonki,    1,    "łyżka", "exact")
    ri(r7, czerwona_cebula,40,   "g",     "exact")
    ri(r7, kolendra,       None, None,    "to_taste")
    ri(r7, sol,            None, None,    "to_taste")
    ri(r7, chili,          None, None,    "to_taste")

    # 8 — Kolby kukurydzy z grilla
    r8 = recipe("Kolby kukurydzy z grilla",
                "grill", "wegetarianskie,weganskie", 1, 1.00, 2,
                "Grillować 15–20 minut, obracając co kilka minut",
                instructions="1. Kolby kukurydzy posmaruj masłem, posól i popieprz.\n2. Grilluj na średnim ogniu 15–20 minut, obracając co kilka minut.\n3. Przed podaniem przeciąć kolbę na pół.\n4. Podawaj od razu z grilla.",
                group_name="Kukurydza z grilla")
    ri(r8, kolba_kukurydzy, 1,    "szt",  "exact")
    ri(r8, maslo,           10,   "g",    "exact")
    ri(r8, sol,             None, None,   "to_taste")
    ri(r8, pieprz,          None, None,   "to_taste")

    # 8 — Bruschetta z pomidorami
    r10 = recipe("Bruschetta z pomidorami",
                 "wnetrze,ogrod,koktajl", "wegetarianskie,weganskie", 2, 1.50, 4,
                 "Chleb opiec tuż przed podaniem, żeby pozostał chrupiący",
                 instructions="1. Pomidory pokrój w kostkę.\n2. Odstaw na 5 minut i odlej nadmiar soku.\n3. Dodaj posiekane liście bazylii, czosnek przeciśnięty przez praskę, sól i pieprz do smaku.\n4. Bagietkę pokrój w skośne plastry i opiecz w tosterze lub na grillu.\n5. Skrop grzanki oliwą i nałóż mieszankę pomidorową.\n6. Na wierzch dodaj kilka listków bazylii dla ozdoby.",
                 group_name="Bruschetta")
    ri(r10, bagietka,  1,    "szt",   "exact")
    ri(r10, pomidor,   3,    "szt",   "exact")
    ri(r10, czosnek,   3,    "szt",   "exact", "ząbki")
    ri(r10, oliwa,     2,    "łyżka", "exact")
    ri(r10, bazylia,   None, None,    "to_taste")
    ri(r10, sol,       None, None,    "to_taste")

    # 9 — Sałatka Cezar wegańska
    r9 = recipe("Sałatka Cezar wegańska",
                "wnetrze,ogrod", "weganskie", 2, 3.50, 4,
                "Sos wymieszać osobno, dodać tuż przed podaniem",
                instructions="1. Wymieszaj majonez wegański, musztardę, kilka kropli octu, cukier, sól i pieprz — to sos.\n2. Liście sałaty porwij, pomidory pokrój w ćwiartki, suszone pomidory posiekaj.\n3. Wszystko wyłóż na talerz, polej sosem tuż przed podaniem.",
                group_name="Sałatka Cezar")
    ri(r9, liscie_salaty,    200,  "g",     "exact")
    ri(r9, pomidor,          3,    "szt",   "exact")
    ri(r9, suszone_pomidory, 30,   "g",     "exact")
    ri(r9, majonez_weganski, 3,    "łyżka", "exact")
    ri(r9, musztarda,        1,    "łyżeczka", "exact")
    ri(r9, ocet,             None, None,    "descriptive", "kilka kropli")
    ri(r9, cukier,           None, None,    "to_taste")
    ri(r9, sol,              None, None,    "to_taste")
    ri(r9, pieprz,           None, None,    "to_taste")

    # 10 — Sałatka Cezar z kurczakiem
    r10b = recipe("Sałatka Cezar z kurczakiem",
                "wnetrze,ogrod", "miesne", 2, 4.00, 4,
                "Sos wymieszać osobno, dodać tuż przed podaniem",
                instructions="1. Wymieszaj majonez, musztardę, kilka kropli octu, cukier, sół i pieprz — to sos.\n2. Pierś z kurczaka usmaż na patelni lub z grilla, pokrój w paski.\n3. Liście sałaty porwij, pomidory pokrój w ćwiartki, suszone pomidory posiekaj.\n4. Wszystko wyłóż na talerz, ułóż kurczaka, polej sosem tuż przed podaniem.\n5. Na wierzch zetrzyj parmezan.",
                group_name="Sałatka Cezar")
    ri(r10b, liscie_salaty,    200,  "g",        "exact")
    ri(r10b, pomidor,          3,    "szt",      "exact")
    ri(r10b, suszone_pomidory, 30,   "g",        "exact")
    ri(r10b, majonez,          3,    "łyżka",    "exact")
    ri(r10b, musztarda,        1,    "łyżeczka", "exact")
    ri(r10b, ocet,             None, None,       "descriptive", "kilka kropli")
    ri(r10b, cukier,           None, None,       "to_taste")
    ri(r10b, sol,              None, None,       "to_taste")
    ri(r10b, pieprz,           None, None,       "to_taste")
    ri(r10b, pierś_kurczaka,   200,  "g",        "exact")
    ri(r10b, parmezan,         50,   "g",        "exact")

    # 11 — Szaszłyki wegańskie z tofu
    r11 = recipe("Szaszłyki wegańskie z tofu",
                 "grill", "weganskie,wegetarianskie", 2, 2.50, 7,
                 "Marynować minimum 1-2 godziny przed grillowaniem",
                 instructions="1. Pokrojone składniki nałóż na wykałaczki.\n2. Wymieszaj sos sojowy, musztardę, miód, olej i czosnek.\n3. Szaszłyki włóż do marynaty do lodówki na minimum 1-2h.\n4. Grilluj około 10 min.",
                 group_name="Szaszłyki warzywne")
    ri(r11, papryka,       200, "g",     "exact", "czerwona")
    ri(r11, papryka,       280, "g",     "exact", "żółta lub pomarańczowa")
    ri(r11, cukinia,       280, "g",     "exact")
    ri(r11, pieczarki,     200, "g",     "exact", "małe")
    ri(r11, cebula,        200, "g",     "exact")
    ri(r11, tofu,          180, "g",     "exact")
    ri(r11, sos_sojowy,    3,   "łyżka", "exact", "najlepiej ciemny")
    ri(r11, musztarda,     3,   "łyżka", "exact", "miodowa, Dijon lub ostra")
    ri(r11, miod,          2,   "łyżka", "exact")
    ri(r11, olej,          3,   "łyżka", "exact")
    ri(r11, czosnek,       3,   "szt",   "exact", "ząbki, przeciśnięte przez praskę")

    # 12 — Szaszłyki z kurczakiem z warzywami
    r12 = recipe("Szaszłyki z kurczakiem z warzywami",
                 "grill", "miesne", 2, 3.50, 7,
                 "Marynować minimum 1-2 godziny przed grillowaniem",
                 instructions="1. Pokrojone składniki nałóż na wykałaczki.\n2. Wymieszaj sos sojowy, musztardę, miód, olej i czosnek.\n3. Szaszłyki włóż do marynaty do lodówki na minimum 1-2h.\n4. Grilluj około 10 min.",
                 group_name="Szaszłyki warzywne")
    ri(r12, papryka,        200, "g",     "exact", "czerwona")
    ri(r12, papryka,        280, "g",     "exact", "żółta lub pomarańczowa")
    ri(r12, cukinia,        280, "g",     "exact")
    ri(r12, pieczarki,      200, "g",     "exact", "małe")
    ri(r12, cebula,         200, "g",     "exact")
    ri(r12, pierś_kurczaka, 350, "g",     "exact")
    ri(r12, sos_sojowy,     3,   "łyżka", "exact", "najlepiej ciemny")
    ri(r12, musztarda,      3,   "łyżka", "exact", "miodowa, Dijon lub ostra")
    ri(r12, miod,           2,   "łyżka", "exact")
    ri(r12, olej,           3,   "łyżka", "exact")
    ri(r12, czosnek,        3,   "szt",   "exact", "ząbki, przeciśnięte przez praskę")

    db.commit()
    print("Baza danych wypełniona danymi. Dodano 12 przepisów z instrukcjami i grupami.")


if __name__ == "__main__":
    seed()
