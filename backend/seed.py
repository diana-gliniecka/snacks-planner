import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Recipe, Ingredient, RecipeIngredient

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./party_planner.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}


def _make_session():
    engine = create_engine(DATABASE_URL, connect_args=_connect_args)
    Base.metadata.create_all(bind=engine)
    return engine, sessionmaker(bind=engine)()


def seed():
    engine, db = _make_session()

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

    drozdze         = ing("drożdże",                  D, "g")
    maka_pizza      = ing("mąka do pizzy",             D, "g")
    salami          = ing("salami",                    M, "g")
    ser_weganski    = ing("ser wegański do pizzy",     A, "g")
    mozz_starta     = ing("mozzarella (starta)",       N, "g")
    przecier_pom    = ing("przecier pomidorowy",       S, "g")
    oregano_susz    = ing("oregano",                   S, "łyżeczka")

    ciasto_franc    = ing("ciasto francuskie",         I, "szt")
    szynka          = ing("szynka w plastrach",        M, "g")
    ziola_prow      = ing("zioła prowansalskie",       S, "łyżeczka")
    szpinak         = ing("szpinak",                   W, "g")
    feta            = ing("ser feta",                  N, "g")

    jajka           = ing("jajka",                     N, "szt")
    szczypiorek     = ing("szczypiorek",               W, "g")
    burak_gotowany  = ing("buraki gotowane",           W, "g")
    platki_drozdzowe = ing("płatki drożdżowe nieaktywne", I, "łyżka")
    slonecznik      = ing("słonecznik łuskany",        D, "g")
    syrop_klonowy   = ing("syrop klonowy lub agawowy", I, "łyżka")
    rukola          = ing("rukola",                    W, "g")
    melon           = ing("melon",                     W, "szt")
    szynka_parmenska = ing("szynka parmeńska",         M, "g")
    jarmuz          = ing("jarmuż",                    W, "g")
    czosnek_gran    = ing("czosnek granulowany",       S, "łyżeczka")

    losos           = ing("łosoś (sushi-grade)",        M, "g")
    kapary          = ing("kapary",                     S, "g")
    koper           = ing("koper świeży",               W, "g")
    sok_cytryny     = ing("sok z cytryny",              S, "ml")
    arbuz           = ing("arbuz",                      W, "g")
    mieta           = ing("mięta świeża",               W, "g")
    platki_migl     = ing("płatki migdałów",            D, "g")
    halloumi        = ing("halloumi",                   N, "g")
    tymianek        = ing("tymianek świeży",            W, "g")
    skrzydelka      = ing("skrzydełka kurczaka",        M, "g")
    imbir           = ing("imbir świeży",               W, "g")
    olej_sezamowy   = ing("olej sezamowy",              S, "ml")
    ocet_ryzowy     = ing("ocet ryżowy",                S, "ml")
    skrobia         = ing("skrobia ziemniaczana",       D, "g")
    sezam           = ing("sezam",                      D, "g")
    baklazan        = ing("bakłażan",                   W, "g")
    tahini          = ing("tahini",                     D, "g")
    kminek          = ing("kminek mielony",              S, "g")
    natka           = ing("natka pietruszki",           W, "g")
    papryka_wednz   = ing("papryka wędzona",            S, "g")
    lopatka         = ing("łopatka wieprzowa",          M, "g")
    cukier_brazy    = ing("brązowy cukier",             D, "g")
    sos_bbq         = ing("sos BBQ",                    S, "ml")
    tortilla_mini   = ing("mini tortille (8 cm)",       P, "szt")
    kapusta_pek     = ing("kapusta pekińska",           W, "g")
    smetana         = ing("śmietana 18%",               N, "ml")
    jalapeno        = ing("jalapeño",                   W, "szt")
    tarta_bulka     = ing("tarta bułka",                P, "g")
    mielone_w       = ing("mięso mielone wieprzowo-wołowe", M, "g")
    majeranek       = ing("majeranek suszony",          S, "łyżeczka")
    sos_worcest     = ing("sos Worcestershire",         S, "ml")
    soczewica       = ing("soczewica czerwona",         D, "g")
    suszone_pom_olej = ing("suszone pomidory w oleju",  D, "g")
    mleko_rosl      = ing("mleko roślinne",             I, "ml")
    krewetki        = ing("krewetki tygrysie (surowe)", M, "g")
    limonka         = ing("limonka",                    W, "szt")
    cebula_proszek  = ing("cebula w proszku",           S, "łyżeczka")
    ziemniaki       = ing("ziemniaki",                  W, "g")
    ogurek_kiszony  = ing("ogórki kiszone",              W, "g")

    db.flush()

    # --- Recipes ---
    def recipe(name, party_types, diet_tags, effort, cost, servings, notes, instructions=None, group_name=None, is_universal=False):
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
            is_universal=is_universal,
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
                "wnetrze,ogrod", "wegetarianskie", 2, 6.00, 4,
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
                "grill", "miesne", 2, 13.00, 1,
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
                "grill,wnetrze,ogrod,koktajl", "wegetarianskie", 1, 4.00, 2,
                "Nabijać na wykałaczki lub małe patyczki do szaszłyków",
                instructions="1. Mozzarellę pokrój w kostkę wielkości pomidorków.\n2. Na wykałaczkę nabij kolejno: pomidorek, listek bazylii, kostkę mozzarelli.\n3. Skrop oliwą i szczyptą soli.\n4. Tuż przed podaniem polej glazurą balsamiczną.",
                group_name="Szaszłyki caprese",
                is_universal=True)
    ri(r3, pomidorki,    6,    "szt",   "exact")
    ri(r3, mozzarella,   100,  "g",     "exact")
    ri(r3, bazylia,      6,    "szt",   "exact")
    ri(r3, oliwa,        1,    "łyżka", "exact")
    ri(r3, sol,          None, None,    "to_taste")
    ri(r3, glazura_bals, None, None,    "descriptive", "skropić przed podaniem")

    # 4 — Hummus z pitą i warzywami
    r4 = recipe("Hummus z warzywami",
                "wnetrze,ogrod,koktajl", "wegetarianskie,weganskie", 1, 3.00, 1,
                "Podawać na dużym talerzu, warzywa ułożyć wokół hummusu",
                instructions="1. Marchewkę, ogórka i paprykę pokrój w słupki.\n2. Hummus przełóż na środek dużego talerza, skrop oliwą i posyp papryką mieloną.\n3. Ułóż warzywa wokół hummusu.",
                group_name="Hummus z warzywami",
                is_universal=True)
    ri(r4, hummus,          50,   "g",        "exact")
    ri(r4, marchewka,       50,   "g",        "exact")
    ri(r4, ogurek,          50,   "g",        "exact")
    ri(r4, papryka,         40,   "g",        "exact")
    ri(r4, oliwa,           None, None,       "descriptive", "skropić przed podaniem")
    ri(r4, papryka_mielona, None, None,       "to_taste")

    # 5 — Guacamole z chipsami tortilla
    r7 = recipe("Guacamole z chipsami tortilla",
                "wnetrze,koktajl", "wegetarianskie,weganskie", 1, 3.50, 4,
                "Przygotować tuż przed podaniem, żeby awokado nie ściemniało",
                instructions="1. Awokado przekrój, wyjmij pestki, wydrąż łyżką miąższ do miski.\n2. Rozgnieć widelcem na w miarę gładką masę.\n3. Dodaj sok z limonki, drobno posiekaną cebulę czerwoną, kolendrę, sól i chili.\n4. Wymieszaj i od razu podawaj z chipsami tortilla.",
                group_name="Guacamole",
                is_universal=True)
    ri(r7, awokado,        2,    "szt",   "exact")
    ri(r7, chipsy_tortilla,150,  "g",     "exact")
    ri(r7, sok_limonki,    1,    "łyżka", "exact")
    ri(r7, czerwona_cebula,40,   "g",     "exact")
    ri(r7, kolendra,       None, None,    "to_taste")
    ri(r7, sol,            None, None,    "to_taste")
    ri(r7, chili,          None, None,    "to_taste")

    # 8 — Kolby kukurydzy z grilla
    r8 = recipe("Kolby kukurydzy z grilla",
                "grill", "wegetarianskie,weganskie", 1, 3.50, 1,
                "Grillować 15–20 minut, obracając co kilka minut",
                instructions="1. Kolby kukurydzy posmaruj masłem, posól i popieprz.\n2. Grilluj na średnim ogniu 15–20 minut, obracając co kilka minut.\n3. Przed podaniem przeciąć kolbę na pół.\n4. Podawaj od razu z grilla.",
                group_name="Kukurydza z grilla",
                is_universal=True)
    ri(r8, kolba_kukurydzy, 1,    "szt",  "exact")
    ri(r8, maslo,           10,   "g",    "exact")
    ri(r8, sol,             None, None,   "to_taste")
    ri(r8, pieprz,          None, None,   "to_taste")

    # 8 — Bruschetta z pomidorami
    r10 = recipe("Bruschetta z pomidorami",
                 "wnetrze,ogrod,koktajl", "wegetarianskie,weganskie", 2, 3.00, 4,
                 "Chleb opiec tuż przed podaniem, żeby pozostał chrupiący",
                 instructions="1. Pomidory pokrój w kostkę.\n2. Odstaw na 5 minut i odlej nadmiar soku.\n3. Dodaj posiekane liście bazylii, czosnek przeciśnięty przez praskę, sól i pieprz do smaku.\n4. Bagietkę pokrój w skośne plastry i opiecz w tosterze lub na grillu.\n5. Skrop grzanki oliwą i nałóż mieszankę pomidorową.\n6. Na wierzch dodaj kilka listków bazylii dla ozdoby.",
                 group_name="Bruschetta",
                is_universal=True)
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
                "wnetrze,ogrod", "miesne", 2, 7.00, 4,
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
    ri(r11, tofu,          350, "g",     "exact")
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
    ri(r12, pierś_kurczaka, 500, "g",     "exact")
    ri(r12, sos_sojowy,     3,   "łyżka", "exact", "najlepiej ciemny")
    ri(r12, musztarda,      3,   "łyżka", "exact", "miodowa, Dijon lub ostra")
    ri(r12, miod,           2,   "łyżka", "exact")
    ri(r12, olej,           3,   "łyżka", "exact")
    ri(r12, czosnek,        3,   "szt",   "exact", "ząbki, przeciśnięte przez praskę")

    # Wspólna baza instrukcji dla wszystkich pizzerinek (12 szt.)
    _pizza_base = (
        "1. Rozrób drożdże w letniej wodzie (300 ml), odstaw na 5 minut.\n"
        "2. Wsyp mąkę i sól, dodaj wodę z drożdżami i oliwę. Zagniataj 5–8 minut aż ciasto będzie gładkie i elastyczne.\n"
        "3. Przykryj ściereczką i zostaw w ciepłym miejscu na min. 1 godzinę.\n"
        "4. Pieczarki podsmaż z odrobiną oleju na patelni 2–3 minuty.\n"
        "5. Ciasto podziel na 12 części, rozciągnij dłońmi w kształt koła. Ułóż na blasze z papierem.\n"
        "6. Posmaruj środek przecierem, posyp oregano."
    )

    # 13 — Pizzerinki z salami
    r13 = recipe("Pizzerinki z salami",
                 "wnetrze,ogrod", "miesne", 2, 2.00, 12,
                 "Ciasto rozciągać dłońmi, nie wałkować — lepiej zachowa strukturę",
                 instructions=_pizza_base + "\n7. Nałóż 3/4 mozzarelli, ułóż salami i pieczarki, resztę mozzarelli na wierzch.\n8. Piecz 15 minut w 220–230°C na dolnej półce.",
                 group_name="Pizzerinki")
    ri(r13, drozdze,       10,   "g",        "exact")
    ri(r13, maka_pizza,    500,  "g",        "exact")
    ri(r13, oliwa,         3,    "łyżka",    "exact")
    ri(r13, sol,           0.5,  "łyżeczka", "exact")
    ri(r13, oregano_susz,  2,    "łyżeczka", "exact")
    ri(r13, przecier_pom,  200,  "g",        "exact")
    ri(r13, pieczarki,     200,  "g",        "exact")
    ri(r13, olej,          None, None,       "descriptive", "odrobina do smażenia")
    ri(r13, salami,        150,  "g",        "exact")
    ri(r13, mozz_starta,   200,  "g",        "exact")

    # 14 — Pizzerinki wegetariańskie
    r14 = recipe("Pizzerinki wegetariańskie",
                 "wnetrze,ogrod", "wegetarianskie", 2, 1.50, 12,
                 "Ciasto rozciągać dłońmi, nie wałkować — lepiej zachowa strukturę",
                 instructions=_pizza_base + "\n7. Nałóż 3/4 mozzarelli, ułóż pieczarki, resztę mozzarelli na wierzch.\n8. Piecz 15 minut w 220–230°C na dolnej półce.",
                 group_name="Pizzerinki")
    ri(r14, drozdze,       10,   "g",        "exact")
    ri(r14, maka_pizza,    500,  "g",        "exact")
    ri(r14, oliwa,         3,    "łyżka",    "exact")
    ri(r14, sol,           0.5,  "łyżeczka", "exact")
    ri(r14, oregano_susz,  2,    "łyżeczka", "exact")
    ri(r14, przecier_pom,  200,  "g",        "exact")
    ri(r14, pieczarki,     200,  "g",        "exact")
    ri(r14, olej,          None, None,       "descriptive", "odrobina do smażenia")
    ri(r14, mozz_starta,   200,  "g",        "exact")

    # 15 — Pizzerinki wegańskie
    r15 = recipe("Pizzerinki wegańskie",
                 "wnetrze,ogrod", "weganskie", 2, 2.00, 12,
                 "Ciasto rozciągać dłońmi, nie wałkować — lepiej zachowa strukturę",
                 instructions=_pizza_base + "\n7. Nałóż 3/4 sera wegańskiego, ułóż pieczarki, resztę sera na wierzch.\n8. Piecz 15 minut w 220–230°C na dolnej półce.",
                 group_name="Pizzerinki")
    ri(r15, drozdze,       10,   "g",        "exact")
    ri(r15, maka_pizza,    500,  "g",        "exact")
    ri(r15, oliwa,         3,    "łyżka",    "exact")
    ri(r15, sol,           0.5,  "łyżeczka", "exact")
    ri(r15, oregano_susz,  2,    "łyżeczka", "exact")
    ri(r15, przecier_pom,  200,  "g",        "exact")
    ri(r15, pieczarki,     200,  "g",        "exact")
    ri(r15, olej,          None, None,       "descriptive", "odrobina do smażenia")
    ri(r15, ser_weganski,  200,  "g",        "exact")

    # 16 — Ślimaki mięsne z ciasta francuskiego
    r16 = recipe("Ślimaki mięsne z ciasta francuskiego",
                 "wnetrze,ogrod,koktajl", "miesne", 1, 1.00, 13,
                 "Podawać gorące, prosto z piekarnika",
                 instructions="1. Rozwiń płat ciasta francuskiego na papierze do pieczenia.\n2. Posmaruj równomiernie przecierem pomidorowym i posyp ziołami prowansalskimi.\n3. Ułóż płasko plastry szynki, całość posyp tartą mozzarellą.\n4. Zwiń ciasto w ciasny rulon wzdłuż dłuższego boku i pokrój na plastry o grubości ok. 1,5–2 cm.\n5. Układaj płasko na blaszce i piecz w 200°C przez 15 minut, aż będą złociste.",
                 group_name="Ślimaki z ciasta francuskiego")
    ri(r16, ciasto_franc,  1,    "szt",      "exact")
    ri(r16, przecier_pom,  60,   "g",        "exact")
    ri(r16, szynka,        100,  "g",        "exact")
    ri(r16, mozz_starta,   150,  "g",        "exact")
    ri(r16, ziola_prow,    1,    "łyżeczka", "exact")

    # 17 — Ślimaki wegetariańskie ze szpinakiem i fetą
    r17 = recipe("Ślimaki wegetariańskie ze szpinakiem i fetą",
                 "wnetrze,ogrod,koktajl", "wegetarianskie", 2, 1.00, 13,
                 "Szpinak dobrze odcisnąć — mokry sprawi, że ciasto będzie rozmoczone",
                 instructions="1. Podsmaż szpinak z przeciśniętym czosnkiem i odrobiną oliwy, aż zwiędnie i odparuje z niego woda. Przestudź.\n2. Rozwiń płat ciasta francuskiego, rozłóż równomiernie podduszony szpinak.\n3. Pokrusz na wierzch ser feta oraz rozsyp tartą mozzarellę.\n4. Zwiń mocno w rulon i pokrój na kawałki ok. 1,5–2 cm.\n5. Piecz na blaszce wyłożonej papierem do pieczenia w 200°C przez 15–20 minut na złoty kolor.",
                 group_name="Ślimaki z ciasta francuskiego")
    ri(r17, ciasto_franc,  1,    "szt",      "exact")
    ri(r17, szpinak,       150,  "g",        "exact")
    ri(r17, feta,          100,  "g",        "exact")
    ri(r17, mozz_starta,   75,   "g",        "exact")
    ri(r17, czosnek,       1,    "szt",      "exact", "ząbek")
    ri(r17, oliwa,         None, None,       "descriptive", "odrobina do smażenia")

    # 18 — Faszerowane jajka z pastą pieczarkową
    r18 = recipe("Faszerowane jajka z pastą pieczarkową",
                 "wnetrze,ogrod,koktajl", "wegetarianskie", 2, 2.50, 4,
                 "Pieczarki muszą być dobrze odsmażone — mokry farsz nie będzie się trzymał",
                 instructions="1. Jajka ugotuj na twardo, ostudź, obierz, przekrój wzdłuż na pół i wyjmij żółtka.\n2. Pieczarki i cebulę posiekaj jak najdrobniej. Podsmaż na maśle lub oleju, aż całkowicie odparuje z nich woda. Przestudź.\n3. Rozgnieć żółtka widelcem, dodaj grzyby z cebulą oraz majonez. Dopraw solą, pieprzem i wymieszaj.\n4. Nakładaj farsz łyżeczką w puste miejsca po żółtkach. Przed podaniem posyp szczypiorkiem.",
                 group_name="Faszerowane jajka")
    ri(r18, jajka,       6,    "szt",   "exact")
    ri(r18, pieczarki,   150,  "g",     "exact")
    ri(r18, cebula,      50,   "g",     "exact")
    ri(r18, majonez,     2,    "łyżka", "exact")
    ri(r18, maslo,       None, None,    "descriptive", "1 łyżeczka do smażenia")
    ri(r18, szczypiorek, None, None,    "descriptive", "do posypania")
    ri(r18, sol,         None, None,    "to_taste")
    ri(r18, pieprz,      None, None,    "to_taste")

    # 19 — Carpaccio z buraka z płatkami drożdżowymi
    r19 = recipe("Carpaccio z buraka z płatkami drożdżowymi",
                 "wnetrze,ogrod,koktajl", "weganskie,wegetarianskie", 1, 3.50, 4,
                 "Użyć gotowych buraków w próżni — surowe wymagają długiego gotowania",
                 instructions="1. Słonecznik upraż na suchej patelni, aż lekko ściemnieje.\n2. Buraki pokrój w bardzo cienkie plastry i ułóż na dużym talerzu na zakładkę.\n3. W małym naczyniu wymieszaj oliwę z syropem i skrop buraki.\n4. Całość posyp obficie płatkami drożdżowymi oraz uprażonym słonecznikiem.",
                 group_name="Carpaccio z buraka")
    ri(r19, burak_gotowany,   400,  "g",     "exact")
    ri(r19, platki_drozdzowe, 3,    "łyżka", "exact")
    ri(r19, slonecznik,       30,   "g",     "exact")
    ri(r19, oliwa,            2,    "łyżka", "exact")
    ri(r19, syrop_klonowy,    1,    "łyżka", "exact")
    ri(r19, rukola,           None, None,    "descriptive", "mała garść (opcjonalnie)")

    # 20 — Melon w szynce parmeńskiej
    r20 = recipe("Melon w szynce parmeńskiej",
                 "grill,wnetrze,ogrod,koktajl", "miesne", 1, 5.00, 6,
                 "Najlepszy schłodzony — przed podaniem wstawić do lodówki na min. 30 minut",
                 instructions="1. Melon przekrój na pół, łyżką wyjmij ze środka gniazda nasienne.\n2. Pokrój melon w łódki, odetnij skórę, a miąższ podziel na ok. 5-centymetrowe kawałki.\n3. Każdy plaster szynki przekrój wzdłuż na pół, aby powstały węższe paski.\n4. Owiń ściśle każdy kawałek melona paskiem szynki i ułóż na półmisku.",
                 group_name="Melon w szynce")
    ri(r20, melon,            1,    "szt",   "exact")
    ri(r20, szynka_parmenska, 100,  "g",     "exact")

    # 21 — Chipsy z jarmużu
    r21 = recipe("Chipsy z jarmużu",
                 "wnetrze,ogrod,koktajl", "weganskie,wegetarianskie", 1, 2.00, 4,
                 "Piekarnik nie może być zbyt gorący — liście mają schnąć, a nie się smażyć",
                 instructions="1. Piekarnik rozgrzej do 150°C.\n2. Liście jarmużu porwij na mniejsze kawałki (odrzuć grube łodygi) i bardzo dokładnie osusz ręcznikiem.\n3. W misce wymieszaj jarmuż z oliwą, solą i czosnkiem granulowanym, dokładnie masując liście dłońmi.\n4. Rozłóż luźno na blasze z papierem i piecz przez 8–10 minut, uważając, by ich nie przypalić.",
                 group_name="Chipsy z jarmużu")
    ri(r21, jarmuz,        200,  "g",        "exact")
    ri(r21, oliwa,         2,    "łyżka",    "exact")
    ri(r21, czosnek_gran,  0.5,  "łyżeczka", "exact")
    ri(r21, sol,           0.5,  "łyżeczka", "exact")

    # 22 — Tatar z łososia na grzankach
    r22 = recipe("Tatar z łososia na grzankach",
                 "wnetrze,ogrod,koktajl", "rybne", 2, 4.00, 12,
                 "Łososia kroić tuż przed podaniem — ryba szybko traci świeżość",
                 instructions="1. Łososia pokrój w bardzo drobną kostkę (ok. 3mm).\n2. Ogórka obierz, usuń pestki, pokrój tak samo drobno.\n3. Cebulę i kapary drobno posiekaj.\n4. Wymieszaj wszystko z sokiem z cytryny, oliwą, solą i pieprzem.\n5. Bagietkę pokrój w skośne plastry (~1cm), skrop oliwą i grilluj lub piecz w 200°C przez 5–7 min aż będą chrupiące.\n6. Przed podaniem nakładaj tatar łyżeczką na każdą grzankę, udekoruj koperkiem.",
                 group_name="Tatar z łososia")
    ri(r22, losos,          200,  "g",     "exact")
    ri(r22, ogurek,         80,   "g",     "exact")
    ri(r22, czerwona_cebula, 40,  "g",     "exact")
    ri(r22, kapary,         20,   "g",     "exact")
    ri(r22, koper,          None, None,    "descriptive", "do dekoracji")
    ri(r22, sok_cytryny,    15,   "ml",    "exact")
    ri(r22, oliwa,          2,    "łyżka", "exact")
    ri(r22, bagietka,       1,    "szt",   "exact")
    ri(r22, sol,            None, None,    "to_taste")
    ri(r22, pieprz,         None, None,    "to_taste")

    # 23 — Sałatka z arbuza i fety z miętą
    r23 = recipe("Sałatka z arbuza i fety z miętą",
                 "wnetrze,ogrod,koktajl", "wegetarianskie", 1, 2.50, 8,
                 "Podawać od razu — arbuz puszcza sok i salałka traci wygląd",
                 instructions="1. Arbuza pokrój w trójkąty lub kostki (~3cm).\n2. Fetę pokrusz lub pokrój w kostkę.\n3. Na talerzu lub w misce ułóż arbuza, posyp fetą i listkami mięty.\n4. Skrop oliwą i sokiem z limonki, posyp pieprzem.\n5. Jeśli używasz migdałów — uprażyj je chwilę na suchej patelni i posyp na wierzchu.\n6. Podawaj od razu po przygotowaniu.",
                 group_name="Sałatka z arbuza")
    ri(r23, arbuz,         800,  "g",     "exact")
    ri(r23, feta,          150,  "g",     "exact")
    ri(r23, mieta,         None, None,    "descriptive", "kilka listków")
    ri(r23, oliwa,         2,    "łyżka", "exact")
    ri(r23, sok_limonki,   1,    "łyżka", "exact")
    ri(r23, platki_migl,   30,   "g",     "exact")
    ri(r23, pieprz,        None, None,    "to_taste")

    # 24 — Grillowane halloumi z miodem i tymiankiem
    r24 = recipe("Grillowane halloumi z miodem i tymiankiem",
                 "grill,wnetrze,ogrod", "wegetarianskie", 1, 4.00, 6,
                 "Podawać gorące — halloumi twardnieje i traci smak po ostygnięciu",
                 instructions="1. Halloumi pokrój w plastry grubości ~1cm.\n2. Posmaruj lekko oliwą z każdej strony.\n3. Grilluj na mocno rozgrzanym grillu lub patelni grillowej 2–3 min z każdej strony, aż pojawią się wyraźne paski.\n4. Przełóż na talerz, od razu skrop miodem, posyp listkami tymianku i pieprzem.\n5. Podawaj gorące — halloumi twardnieje po ostygnięciu.",
                 group_name="Grillowane halloumi")
    ri(r24, halloumi,      400,  "g",     "exact")
    ri(r24, miod,          2,    "łyżka", "exact")
    ri(r24, tymianek,      None, None,    "descriptive", "kilka gałązek")
    ri(r24, oliwa,         1,    "łyżka", "exact")
    ri(r24, pieprz,        None, None,    "to_taste")
    ri(r24, chili,         None, None,    "descriptive", "szczypta płatków (opcjonalnie)")

    # 25 — Skrzydełka w glazurze teriyaki
    r25 = recipe("Skrzydełka w glazurze teriyaki",
                 "wnetrze,ogrod,grill", "miesne", 1, 3.00, 6,
                 "Marynować minimum 2h — najlepiej całą noc w lodówce",
                 instructions="1. Czosnek i imbir zetrzyj na tarce.\n2. Wymieszaj z sosem sojowym, miodem, olejem sezamowym i octem — to marynata.\n3. Zalej nią skrzydełka i odstaw minimum 2h (najlepiej całą noc).\n4. Piecz w 200°C przez 35–40 min, przewracając w połowie.\n5. W ostatnich 5 min posmaruj dodatkową glazurą z odlanej marynaty zagęszczonej skrobią dla lepszego błysku.\n6. Posyp sezamem i szczypiorkiem.",
                 group_name="Skrzydełka teriyaki")
    ri(r25, skrzydelka,    1000, "g",     "exact")
    ri(r25, sos_sojowy,    4,    "łyżka", "exact")
    ri(r25, miod,          3,    "łyżka", "exact")
    ri(r25, czosnek,       3,    "szt",   "exact", "ząbki")
    ri(r25, imbir,         15,   "g",     "exact")
    ri(r25, olej_sezamowy, 15,   "ml",    "exact")
    ri(r25, ocet_ryzowy,   20,   "ml",    "exact")
    ri(r25, skrobia,       10,   "g",     "exact")
    ri(r25, sezam,         15,   "g",     "exact")
    ri(r25, szczypiorek,   None, None,    "descriptive", "do posypania")

    # 26 — Grillowane plastry bakłażana
    r26 = recipe("Grillowane plastry bakłażana",
                 "grill,wnetrze,ogrod", "weganskie,wegetarianskie", 1, 1.50, 6,
                 "Solić i odciskać przed grillowaniem — usuwa gorycz i nadmiar wilgoci",
                 instructions="1. Bakłażana pokrój w plastry 1–1,5cm.\n2. Posól i odstaw na 20 min, potem osusz papierowym ręcznikiem — to usuwa gorycz.\n3. Skrop oliwą, dopraw czosnkiem granulowanym, oregano i pieprzem.\n4. Grilluj 3–4 min z każdej strony aż pojawią się paski i bakłażan będzie miękki.",
                 group_name="Grillowany bakłażan")
    ri(r26, baklazan,      600,  "g",     "exact", "ok. 2 szt.")
    ri(r26, oliwa,         3,    "łyżka", "exact")
    ri(r26, czosnek_gran,  None, None,    "to_taste")
    ri(r26, oregano_susz,  None, None,    "to_taste")
    ri(r26, sol,           None, None,    "to_taste")
    ri(r26, pieprz,        None, None,    "to_taste")

    # 27 — Baba ganoush
    r27 = recipe("Baba ganoush",
                 "grill,wnetrze,ogrod,koktajl", "weganskie,wegetarianskie", 1, 2.00, 8,
                 "Zwęglona skórka to sekret głębokiego, dymnego smaku — nie skracaj tego etapu",
                 instructions="1. Bakłażany nakłuj widelcem w kilku miejscach.\n2. Ułóż bezpośrednio na płomieniu gazowym lub pod grillem w piekarniku (230°C) i piecz 20–25 min, obracając co kilka minut, aż skórka będzie zwęglona a miąższ miękki.\n3. Przełóż do miski, przykryj folią na 10 min — skórka zejdzie łatwo. Odciśnij nadmiar wody z miąższu.\n4. Miąższ wymieszaj lub zblenduj z tahini, czosnkiem, sokiem z cytryny i kminkiem.\n5. Dopraw solą.\n6. Podawaj skropiony oliwą, z papryką wędzoną i natką. Najlepsze z pitą lub warzywami.",
                 group_name="Baba ganoush",
                 is_universal=True)
    ri(r27, baklazan,      800,  "g",     "exact", "ok. 2 duże szt.")
    ri(r27, tahini,        60,   "g",     "exact")
    ri(r27, czosnek,       3,    "szt",   "exact", "ząbki")
    ri(r27, sok_cytryny,   40,   "ml",    "exact")
    ri(r27, oliwa,         3,    "łyżka", "exact")
    ri(r27, kminek,        None, None,    "to_taste")
    ri(r27, natka,         None, None,    "descriptive", "do dekoracji")
    ri(r27, papryka_wednz, None, None,    "descriptive", "szczypta do dekoracji")
    ri(r27, sol,           None, None,    "to_taste")

    # 28 — Mini tacos z pulled pork
    r28 = recipe("Mini tacos z pulled pork",
                 "grill,wnetrze,ogrod", "miesne", 3, 3.00, 16,
                 "Mięso piecz dzień wcześniej — odgrzane z sosem smakuje jeszcze lepiej",
                 instructions="1. Wymieszaj paprykę wędzoną, kminek, czosnek i cebulę w proszku, cukier, sól i pieprz. Natrzyj mieszanką łopatkę ze wszystkich stron.\n2. Piecz w 150°C przez 4–5h (lub w wolnowarze 8h na low), aż mięso będzie się rozpadać.\n3. Rozdrobnij dwoma widelcami, wymieszaj z sosem BBQ i sokami z pieczenia.\n4. Kapustę poszatkuj cienko, skrop sokiem z limonki, posól — to szybki slaw.\n5. Tortille podgrzej na suchej patelni 30 sek z każdej strony.\n6. Nakładaj: mięso → slaw → śmietana → kolendra → jalapeño. Podawaj od razu.",
                 group_name="Mini tacos")
    ri(r28, lopatka,       800,  "g",     "exact")
    ri(r28, papryka_wednz, 10,   "g",     "exact")
    ri(r28, kminek,        5,    "g",     "exact")
    ri(r28, czosnek_gran,  1,    "łyżeczka", "exact")
    ri(r28, cebula_proszek, 1,   "łyżeczka", "exact")
    ri(r28, cukier_brazy,  15,   "g",     "exact")
    ri(r28, sos_bbq,       80,   "ml",    "exact")
    ri(r28, tortilla_mini, 16,   "szt",   "exact")
    ri(r28, kapusta_pek,   150,  "g",     "exact")
    ri(r28, smetana,       100,  "ml",    "exact")
    ri(r28, kolendra,      None, None,    "descriptive", "garść liści")
    ri(r28, limonka,       1,    "szt",   "exact")
    ri(r28, jalapeno,      None, None,    "descriptive", "1 szt. (opcjonalnie)")
    ri(r28, sol,           None, None,    "to_taste")
    ri(r28, pieprz,        None, None,    "to_taste")

    # 29 — Paszteciki z pieczarkami
    r29 = recipe("Paszteciki z pieczarkami",
                 "wnetrze,ogrod,koktajl", "wegetarianskie", 1, 1.50, 16,
                 "Pieczarki smażyć aż do całkowitego odparowania płynu — mokry farsz rozmoczy ciasto",
                 instructions="1. Pieczarki drobno posiekaj. Cebulę i czosnek zeszklij na maśle, dodaj pieczarki i smaż na dużym ogniu 8–10 min aż odparuje cały płyn.\n2. Dodaj śmietanę, dopraw solą i pieprzem, wymieszaj z natką. Odstaw do ostygnięcia.\n3. Ciasto francuskie pokrój w prostokąty (~8x10cm). Na każdy prostokąt nakładaj łyżkę farszu, składaj i zlepiaj brzegi widelcem.\n4. Smaruj roztrzepanym jajkiem.\n5. Piecz w 200°C przez 18–20 min aż będą złociste.",
                 group_name="Paszteciki")
    ri(r29, ciasto_franc,  1,    "szt",   "exact")
    ri(r29, jajka,         1,    "szt",   "exact", "do posmarowania")
    ri(r29, pieczarki,     400,  "g",     "exact")
    ri(r29, cebula,        120,  "g",     "exact")
    ri(r29, czosnek,       2,    "szt",   "exact", "ząbki")
    ri(r29, maslo,         30,   "g",     "exact")
    ri(r29, smetana,       50,   "ml",    "exact")
    ri(r29, natka,         15,   "g",     "exact")
    ri(r29, tarta_bulka,   None, None,    "descriptive", "20g jeśli farsz za rzadki")
    ri(r29, sol,           None, None,    "to_taste")
    ri(r29, pieprz,        None, None,    "to_taste")

    # 30 — Paszteciki z mięsem mielonym
    r30 = recipe("Paszteciki z mięsem mielonym",
                 "wnetrze,ogrod,koktajl", "miesne", 1, 1.50, 16,
                 "Farsz musi być suchy — smaż na dużym ogniu aż całkowicie odparuje płyn",
                 instructions="1. Cebulę i czosnek zeszklij na oleju. Dodaj mięso mielone i smaż na dużym ogniu, rozbijając grudki, aż będzie brązowe i odparuje płyn — ok. 10 min.\n2. Dopraw majerankiem, papryką słodką, sosem Worcestershire, solą i pieprzem. Jeśli farsz jest za wilgotny, dodaj tartą bułkę.\n3. Odstaw do ostygnięcia.\n4. Ciasto pokrój w prostokąty (~8x10cm), nakładaj farsz, składaj i zlepiaj brzegi widelcem.\n5. Smaruj roztrzepanym jajkiem. Piecz w 200°C przez 18–20 min.",
                 group_name="Paszteciki")
    ri(r30, ciasto_franc,  1,    "szt",   "exact")
    ri(r30, jajka,         1,    "szt",   "exact", "do posmarowania")
    ri(r30, mielone_w,     400,  "g",     "exact")
    ri(r30, cebula,        120,  "g",     "exact")
    ri(r30, czosnek,       2,    "szt",   "exact", "ząbki")
    ri(r30, olej,          1,    "łyżka", "exact")
    ri(r30, majeranek,     1,    "łyżeczka", "exact")
    ri(r30, papryka_mielona, 1,  "łyżeczka", "exact")
    ri(r30, sos_worcest,   15,   "ml",    "exact")
    ri(r30, tarta_bulka,   None, None,    "descriptive", "20g jeśli farsz za rzadki")
    ri(r30, sol,           None, None,    "to_taste")
    ri(r30, pieprz,        None, None,    "to_taste")

    # 31 — Paszteciki wegańskie z soczewicą
    r31 = recipe("Paszteciki wegańskie z soczewicą i suszonymi pomidorami",
                 "wnetrze,ogrod,koktajl", "weganskie,wegetarianskie", 1, 1.50, 16,
                 "Farsz musi być suchy i zwarty — odciśnij soczewicę i podsusz na patelni jeśli potrzeba",
                 instructions="1. Soczewicę ugotuj w osolonej wodzie (~15 min) aż będzie miękka. Odcedź i lekko odciśnij.\n2. Cebulę i czosnek zeszklij na oliwie, dodaj kminek i paprykę wędzoną, smaż 1 min.\n3. Suszone pomidory drobno posiekaj.\n4. Wymieszaj soczewicę, cebulę, pomidory, sok z cytryny i natkę. Dopraw solą i pieprzem. Jeśli farsz nie jest zwarty, podsusz chwilę na patelni mieszając.\n5. Ciasto pokrój w prostokąty, nadziewaj, zlepiaj, smaruj mlekiem roślinnym.\n6. Piecz w 200°C przez 18–20 min.",
                 group_name="Paszteciki")
    ri(r31, ciasto_franc,      1,    "szt",   "exact", "wegańskie — sprawdź skład")
    ri(r31, mleko_rosl,        30,   "ml",    "exact", "do posmarowania")
    ri(r31, soczewica,         150,  "g",     "exact")
    ri(r31, suszone_pom_olej,  80,   "g",     "exact")
    ri(r31, cebula,            120,  "g",     "exact")
    ri(r31, czosnek,           2,    "szt",   "exact", "ząbki")
    ri(r31, oliwa,             2,    "łyżka", "exact")
    ri(r31, kminek,            3,    "g",     "exact")
    ri(r31, papryka_wednz,     4,    "g",     "exact")
    ri(r31, sok_cytryny,       15,   "ml",    "exact")
    ri(r31, natka,             15,   "g",     "exact")
    ri(r31, sol,               None, None,    "to_taste")
    ri(r31, pieprz,            None, None,    "to_taste")

    # 32 — Szaszłyki z krewetek z grilla
    r32 = recipe("Szaszłyki z krewetek z grilla",
                 "grill,wnetrze,ogrod,koktajl", "rybne", 2, 8.50, 8,
                 "Nie marynować dłużej niż 30 min — kwas cytrynowy zaczyna 'gotować' krewetki",
                 instructions="1. Namocz drewniane patyczki w wodzie minimum 30 min.\n2. Krewetki obierz i usuń jelito (czarna nitka wzdłuż grzbietu).\n3. Wymieszaj oliwę z rozgniecionym czosnkiem, sokiem z cytryny i płatkami chili. Zalej krewetki i odstaw na 20–30 min.\n4. Nabijaj po 4 krewetki na patyczek, zginając każdą w literę C.\n5. Grilluj na mocno rozgrzanym grillu 2 min z każdej strony — gotowe gdy zmienią kolor na różowo-pomarańczowy i lekko się zwijają.\n6. Zdejmij z grilla, połóż kawałek masła na każdym szaszłyku i posyp natką. Podawaj z ćwiartkami limonki.",
                 group_name="Szaszłyki z krewetek")
    ri(r32, krewetki,      600,  "g",     "exact")
    ri(r32, oliwa,         3,    "łyżka", "exact")
    ri(r32, czosnek,       3,    "szt",   "exact", "ząbki")
    ri(r32, sok_cytryny,   30,   "ml",    "exact")
    ri(r32, chili,         None, None,    "descriptive", "szczypta płatków")
    ri(r32, maslo,         30,   "g",     "exact")
    ri(r32, natka,         None, None,    "descriptive", "garść do posypania")
    ri(r32, limonka,       2,    "szt",   "exact", "do podania")
    ri(r32, sol,           None, None,    "to_taste")
    ri(r32, pieprz,        None, None,    "to_taste")

    # 33 — Sałatka ziemniaczana z ogórkami kiszonymi
    r33 = recipe("Sałatka ziemniaczana z ogórkami kiszonymi",
                 "grill,wnetrze,ogrod", "wegetarianskie", 2, 1.00, 10,
                 "Najlepsza z młodych ziemniaków — podawać w temperaturze pokojowej lub lekko schłodzoną",
                 instructions="1. Ziemniaki ugotuj w osolonej wodzie do miękkości. Odcedź, ostudź i pokrój w kostkę.\n2. Ogórki kiszone pokrój w kostkę (twardszą skórkę obierz). Czerwoną cebulę pokrój w cienkie piórka.\n3. Wymieszaj śmietanę z majonezem, dopraw solą i pieprzem.\n4. Połącz ziemniaki, ogórki i cebulę z dressingiem. Wymieszaj i posyp szczypiorkiem.",
                 group_name="Sałatka ziemniaczana")
    ri(r33, ziemniaki,      1000, "g",     "exact")
    ri(r33, ogurek_kiszony, 250,  "g",     "exact")
    ri(r33, czerwona_cebula, 60,  "g",     "exact")
    ri(r33, szczypiorek,    None, None,    "descriptive", "6 łyżek posiekanego")
    ri(r33, smetana,        180,  "ml",    "exact")
    ri(r33, majonez,        60,   "g",     "exact")
    ri(r33, sol,            None, None,    "to_taste")
    ri(r33, pieprz,         None, None,    "to_taste")

    # 34 — Sałatka z pomidorów z bazylią i parmezanem
    r34 = recipe("Sałatka z pomidorów z bazylią i parmezanem",
                 "grill,wnetrze,ogrod,koktajl", "wegetarianskie", 1, 1.00, 10,
                 "Podawać w temperaturze pokojowej — zimne pomidory tracą aromat",
                 instructions="1. Pomidory pokrój na cząstki lub plastry i ułóż na półmisku.\n2. Czerwoną cebulę pokrój w bardzo cienkie piórka. Namocz przez 5 minut w zimnej wodzie — usuwa gorzkość. Odcedź i osusz.\n3. Rozłóż cebulę na pomidorach.\n4. W małej miseczce wymieszaj oliwę, sok z cytryny i ocet. Polej pomidory.\n5. Posyp posiekaną bazylią i natką pietruszki.\n6. Dopraw pieprzem. Tuż przed podaniem posyp startym parmezanem.",
                 group_name="Sałatka z pomidorów")
    ri(r34, pomidor,        500,  "g",        "exact")
    ri(r34, czerwona_cebula, 30,  "g",        "exact")
    ri(r34, bazylia,        None, None,       "descriptive", "2 łyżki posiekanej")
    ri(r34, natka,          None, None,       "descriptive", "2 łyżki posiekanej")
    ri(r34, oliwa,          1,    "łyżka",    "exact")
    ri(r34, sok_cytryny,    None, None,       "descriptive", "2 łyżeczki")
    ri(r34, ocet,           None, None,       "descriptive", "2 łyżeczki (winny lub jabłkowy)")
    ri(r34, parmezan,       10,   "g",        "exact")
    ri(r34, pieprz,         None, None,       "to_taste")

    db.commit()
    count = db.query(Recipe).count()
    print(f"Baza danych wypełniona danymi. Dodano {count} przepisów z instrukcjami i grupami.")


if __name__ == "__main__":
    # Guard: prevent accidental wipe of non-SQLite databases (e.g. production Postgres).
    # Bypass with --force flag when you really mean it.
    if not DATABASE_URL.startswith("sqlite") and "--force" not in sys.argv:
        print(f"REFUSING to seed non-SQLite database: {DATABASE_URL.split('@')[-1]}")
        print("This would WIPE all existing recipes/ingredients.")
        print("Pass --force if you really mean it.")
        sys.exit(1)
    seed()
