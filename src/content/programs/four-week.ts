import { trainingProgramSchema } from "@/content/schema";

const d = (id: string, title: string, instructions: string, min: number, max = min, extra = {}) => ({
  id, title, instructions, durationMinutes: { min, max }, equipment: ["Bolti"], categories: ["Boltavinna"], ...extra,
});

const main = (id: string, weekNumber: number, order: number, title: string, min: number, max: number, equipment: string[], coachingPoint: string, drills: ReturnType<typeof d>[]) => ({
  id, weekNumber, order, title, durationMinutes: { min, max }, equipment, coachingPoint, isShortSession: false, drills,
});

export const fourWeekProgram = trainingProgramSchema.parse({
  id: "program-4-vikur-10-12-v1",
  slug: "4-vikna-aukaefingar-10-12",
  version: 1,
  title: "4 vikna aukaæfingar",
  description: "Aukaæfingar fyrir 10–12 ára fótboltakrakka.",
  targetAge: { min: 10, max: 12 },
  numberOfWeeks: 4,
  weeklyGoal: { defaultCompletedMainWorkouts: 2, recommendedWorkoutSlots: 3 },
  weeks: [
    { number: 1, title: "Vika 1", focus: "Grunnur og boltastjórn" },
    { number: 2, title: "Vika 2", focus: "Fyrsta snerting og sendingar" },
    { number: 3, title: "Vika 3", focus: "Gabb, hraði og skot" },
    { number: 4, title: "Vika 4", focus: "Leiklíkari aukaæfingar" },
  ],
  workouts: [
    main("w1", 1, 1, "Boltatilfinning og stjórn", 30, 35, ["Bolti", "4 keilur eða flöskur"], "Boltinn nálægt fæti, höfuðið upp reglulega, enginn flýtir ef tæknin dettur niður.", [
      d("w1-d1", "Upphitun", "Létt skokk með bolta, stoppa boltann með sóla, skipta um átt og halda boltanum nálægt.", 5),
      d("w1-d2", "Snertingar í ferningi", "Setja 4 keilur í ferning. Dribbla inni í ferningnum með mörgum litlum snertingum. Skipta á milli hægri og vinstri fótar.", 10),
      d("w1-d3", "Sóli, innanverður, utanverður", "30 sek vinnu, 30 sek hvíld. Endurtaka 6 sinnum. Gæði fyrst, hraði seinna.", 10, 10, { interval: { workSeconds: 30, restSeconds: 30, rounds: 6 } }),
      d("w1-d4", "Mini áskorun", "Hversu margar góðar snertingar án þess að missa stjórn? Reyna að bæta eigið met.", 5, 10, { measurement: { type: "REPETITIONS_WITHOUT_ERROR", label: "Góðar snertingar", unit: "snertingar", comparisonKey: "good-touches-control" } }),
    ]),
    main("w2", 1, 2, "Sendingar í vegg", 30, 40, ["Bolti", "Veggur"], "Fótur opinn, sending eftir jörðinni, líkaminn yfir boltanum.", [
      d("w2-d1", "Upphitun", "Léttar sendingar í vegg með tveimur snertingum.", 5, 5, { categories: ["Sendingar"] }),
      d("w2-d2", "Tvær snertingar", "Sending í vegg, fyrsta snerting til hliðar, sending aftur. 5 × 60 sek.", 10, 10, { categories: ["Sendingar", "Fyrsta snerting"], interval: { workSeconds: 60, rounds: 5 } }),
      d("w2-d3", "Ein snerting", "Standa 3–5 metra frá vegg. Ein snerting ef hægt er. Telja góðar sendingar.", 8, 10, { categories: ["Sendingar"], measurement: { type: "COUNT_HIGHER_IS_BETTER", label: "Góðar sendingar", unit: "sendingar", comparisonKey: "wall-one-touch-good-passes" } }),
      d("w2-d4", "Veiki fóturinn", "Aðeins veikari fótur. Markmið: 20 góðar sendingar samtals.", 7, 10, { categories: ["Sendingar", "Veikari fótur"], measurement: { type: "SUCCESS_OUT_OF_TOTAL", label: "Góðar sendingar", unit: "sendingar", total: 20, comparisonKey: "weak-foot-wall-passes-20" } }),
    ]),
    main("w3", 1, 3, "Dribbling og stefnubreytingar", 35, 45, ["Bolti", "5 keilur eða flöskur"], "Lítil skref, mjúkar snertingar, hraðabreyting eftir snúning.", [
      d("w3-d1", "Upphitun", "Dribbla frjálst og gera stopp, snúning og hraðabreytingu.", 5, 7),
      d("w3-d2", "Keilubraut", "5 keilur með 1–1,5 metra bili. Fara rólega fyrst, svo aðeins hraðar.", 12),
      d("w3-d3", "Snúningur við keilu", "Fara að keilu, snúa með sóla eða innanverðum fæti og fara til baka.", 10),
      d("w3-d4", "Leikáskorun", "Taka tíma í brautinni. Reyna að bæta tímann án þess að missa boltann.", 8, 12, { measurement: { type: "TIME_LOWER_IS_BETTER", label: "Besti tími", unit: "sekúndur", comparisonKey: "cone-course-controlled-time" } }),
    ]),
    main("w4", 2, 4, "Fyrsta snerting fram á við", 30, 40, ["Bolti", "2 keilur", "Veggur eða félagi"], "Fyrsta snerting á að hjálpa næstu aðgerð, ekki stoppa allt.", [
      d("w4-d1", "Upphitun", "Rúlla bolta fram og taka fyrstu snertingu með hægri og vinstri.", 5),
      d("w4-d2", "Snerting út úr fótum", "Fá sendingu frá foreldri/félaga eða vegg. Fyrsta snerting fram, sending til baka.", 10),
      d("w4-d3", "Keiluhlið", "Setja tvær keilur sem hlið. Fyrsta snerting fer í gegnum hliðið, svo sending.", 10),
      d("w4-d4", "Áskorun", "10 sendingar í röð þar sem fyrsta snerting er góð. Byrja aftur ef bolti fer of langt.", 5, 10, { measurement: { type: "REPETITIONS_WITHOUT_ERROR", label: "Sendingar í röð", unit: "sendingar", comparisonKey: "first-touch-ten-in-row" } }),
    ]),
    main("w5", 2, 5, "Móttaka, snúningur og sending", 35, 45, ["Bolti", "Veggur", "Foreldri eða félagi"], "Líta upp áður en boltinn kemur, opna líkamann, taka ákvörðun fljótt.", [
      d("w5-d1", "Upphitun", "Sending í vegg og taka á móti með báðum fótum.", 5),
      d("w5-d2", "Snúningur frá vegg", "Sending í vegg, móttaka, snúa 180 gráður og dribbla 3 metra.", 12),
      d("w5-d3", "Skanna áður", "Áður en boltinn kemur: líta til hliðar. Svo fyrsta snerting og sending.", 8, 10),
      d("w5-d4", "Leikhluti", "Foreldri/félagi kallar hægri eða vinstri. Barnið snýr í rétta átt eftir móttöku.", 10, 15),
    ]),
    main("w6", 2, 6, "Sendingar og hreyfing", 30, 40, ["Bolti", "3 keilur", "Veggur eða félagi"], "Ekki standa eftir sendingu. Hreyfing strax eftir að boltinn fer.", [
      d("w6-d1", "Upphitun", "Léttar sendingar á staðnum.", 5),
      d("w6-d2", "Senda og færa sig", "Senda í vegg eða til félaga og færa sig 2–3 metra til hliðar.", 10),
      d("w6-d3", "Þríhyrningur", "3 keilur í þríhyrning. Senda, hlaupa að næstu keilu, fá boltann aftur.", 10, 12),
      d("w6-d4", "Áskorun", "Hversu margar góðar sendingar og hreyfingar á 60 sekúndum?", 5, 10, { measurement: { type: "COUNT_HIGHER_IS_BETTER", label: "Sendingar og hreyfingar", unit: "skipti", comparisonKey: "pass-and-move-60-sec" } }),
    ]),
    main("w7", 3, 7, "Gabbhreyfing við keilu", 30, 40, ["Bolti", "Keila"], "Gabbhreyfingin þarf að vera trúverðug. Hraðinn kemur eftir gabbið.", [
      d("w7-d1", "Upphitun", "Dribbla rólega og skipta um átt.", 5),
      d("w7-d2", "Líkamsgabb", "Keila sem varnarmaður. Sýna hreyfingu í eina átt og fara í hina.", 10),
      d("w7-d3", "Skæri eða stoppa og fara", "Velja eina gabbhreyfingu og æfa báðar hliðar.", 10),
      d("w7-d4", "Hraðabreyting", "Eftir gabbið: þrjár hraðar snertingar framhjá keilunni.", 5, 10),
    ]),
    main("w8", 3, 8, "Skot eftir dribbling", 35, 45, ["Bolti", "Keila", "Mark eða merkt svæði"], "Síðasta snerting fyrir skot má ekki vera of langt frá fæti.", [
      d("w8-d1", "Upphitun", "Létt dribbling og nokkur róleg skot.", 5, 7),
      d("w8-d2", "Dribbla og skjóta", "Dribbla 8–12 metra og skjóta á mark eða merkt svæði.", 12),
      d("w8-d3", "Skot eftir keilu", "Fara framhjá einni keilu og skjóta strax.", 10),
      d("w8-d4", "Nákvæmni", "10 skot. Telja hversu mörg hitta mark eða ákveðið horn.", 8, 12, { measurement: { type: "SUCCESS_OUT_OF_TOTAL", label: "Skot á mark", unit: "skot", total: 10, comparisonKey: "shots-on-target-out-of-10" } }),
    ]),
    main("w9", 3, 9, "Sprettur með bolta", 30, 40, ["Bolti", "Keila"], "Hraði án stjórnleysis. Boltinn má ekki hlaupa frá leikmanninum.", [
      d("w9-d1", "Upphitun", "Skokk, hækkandi hraði, bolti með í lokin.", 6),
      d("w9-d2", "Sprettur 10–15 metrar", "Spretta með bolta, stoppa við keilu, ganga til baka.", 10),
      d("w9-d3", "Hraðabreyting", "Byrja rólega, springa af stað eftir 5 metra. Halda bolta undir stjórn.", 10),
      d("w9-d4", "Áskorun", "5 ferðir. Markmið: hratt en ekki missa boltann.", 5, 10, { measurement: { type: "COMPLETED", label: "5 ferðir kláraðar" } }),
    ]),
    main("w10", 4, 10, "Keilubraut og lokaaðgerð", 35, 45, ["Bolti", "5 keilur", "Veggur eða marksvæði", "Mark"], "Klára æfinguna með gæðum, ekki missa einbeitingu eftir keilurnar.", [
      d("w10-d1", "Upphitun", "Frjáls boltastjórn.", 5),
      d("w10-d2", "Keilubraut", "5 keilur. Innanverður og utanverður fótur til skiptis.", 12),
      d("w10-d3", "Lokasending", "Eftir brautina: sending í vegg eða í marksvæði.", 10),
      d("w10-d4", "Lokaskot", "Eftir brautina: skot á mark. Telja góðar tilraunir.", 8, 15, { measurement: { type: "COUNT_HIGHER_IS_BETTER", label: "Góðar tilraunir", unit: "tilraunir", comparisonKey: "cone-course-good-finishes" } }),
    ]),
    main("w11", 4, 11, "Veiki fóturinn", 30, 40, ["Bolti", "Keilur", "Veggur", "Mark eða merkt svæði"], "Ekki skamma veikari fótinn. Hann batnar með endurtekningu og þolinmæði.", [
      d("w11-d1", "Upphitun", "Aðeins veikari fótur, rólegar snertingar.", 5),
      d("w11-d2", "Dribbling", "Dribbla milli keila með veikari fæti. Hægara en vandað.", 8, 10),
      d("w11-d3", "Sendingar", "Sendingar í vegg með veikari fæti. Telja 20 góðar sendingar.", 10, 10, { measurement: { type: "SUCCESS_OUT_OF_TOTAL", label: "Góðar sendingar", unit: "sendingar", total: 20, comparisonKey: "weak-foot-wall-passes-20" } }),
      d("w11-d4", "Skot eða marksvæði", "Skjóta eða senda í merkt svæði með veikari fæti.", 7, 15),
    ]),
    main("w12", 4, 12, "Samsett áskorun", 35, 45, ["Bolti", "5 keilur", "Veggur", "Mark eða merkt svæði"], "Þetta er próf á það sem var æft í vikunum á undan. Gæði fyrst, svo hraði.", [
      d("w12-d1", "Upphitun", "Létt boltastjórn og hreyfing.", 5),
      d("w12-d2", "1. hluti", "Dribbling milli 5 keila.", 10),
      d("w12-d3", "2. hluti", "Sending í vegg og fyrsta snerting fram á við.", 10),
      d("w12-d4", "3. hluti", "Gabbhreyfing við keilu og skot/sending í lokin.", 10, 15),
      d("w12-d5", "Met dagsins", "Velja eitt atriði til að mæla: sendingar, skot eða brautartíma.", 5, 5, { measurement: { type: "FREE_CHOICE", label: "Met dagsins", choices: ["Sendingar", "Skot", "Brautartími"] } }),
    ]),
    { id: "short-5", weekNumber: 0, order: 13, title: "5 mín auka", durationMinutes: { min: 5, max: 5 }, equipment: ["Bolti"], isShortSession: true, choiceInstructions: "Velja eitt", drills: [
      d("short-5-d1", "Stutt aukaæfing", "Velja eitt: 100 snertingar með bolta, 20 sendingar í vegg eða 10 fyrstu snertingar í gegnum keiluhlið.", 5, 5, { measurement: { type: "FREE_CHOICE", label: "Valin æfing", choices: ["100 snertingar með bolta", "20 sendingar í vegg", "10 fyrstu snertingar í gegnum keiluhlið"] } }),
    ] },
    { id: "short-10", weekNumber: 0, order: 14, title: "10 mín auka", durationMinutes: { min: 10, max: 10 }, equipment: ["Bolti", "Keilur", "Mark eða merkt svæði"], isShortSession: true, drills: [
      { id: "short-10-d1", title: "Keilubraut", instructions: "Keilubraut 5 ferðir.", equipment: ["Bolti", "Keilur"], categories: ["Boltavinna"] },
      { id: "short-10-d2", title: "Veiki fóturinn", instructions: "30 sek veiki fóturinn.", durationSeconds: 30, equipment: ["Bolti"], categories: ["Veikari fótur"] },
      { id: "short-10-d3", title: "Skot eða sendingar", instructions: "10 skot eða sendingar í marksvæði.", equipment: ["Bolti", "Mark eða merkt svæði"], categories: ["Skot", "Sendingar"] },
    ] },
    { id: "short-15", weekNumber: 0, order: 15, title: "15 mín auka", durationMinutes: { min: 15, max: 15 }, equipment: ["Bolti", "Veggur", "Mark eða merkt svæði"], isShortSession: true, drills: [
      d("short-15-d1", "Boltastjórn", "5 mín boltastjórn.", 5), d("short-15-d2", "Sendingar", "5 mín sendingar.", 5), d("short-15-d3", "Skot eða gabbhreyfingar", "5 mín skot eða gabbhreyfingar.", 5),
    ] },
  ],
});

export const mainWorkouts = fourWeekProgram.workouts.filter((workout) => !workout.isShortSession);
export const shortWorkouts = fourWeekProgram.workouts.filter((workout) => workout.isShortSession);
export const getWorkout = (id: string) => fourWeekProgram.workouts.find((workout) => workout.id === id);
