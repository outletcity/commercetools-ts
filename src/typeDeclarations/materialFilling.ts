import { AttributeType } from "@commercetools/platform-sdk/dist/declarations/src/generated/models/product-type";
import { MATERIAL_VALUES } from "./materialValues";

const fillingKeys = [
    "ACETAT", "ALFA", "ALGINAT", "ALPAKA", "ANDERE-FASERN", "ANGORA", "ARAMID",
    "BAUMWOLLE", "BAUMWOLLE-BIO", "BAUMWOLLE-PIMABAUMWOLLE", "BAUMWOLLE-RECYCELT",
    "BIBER", "CUPRO", "DAUNEN", "ECHTPELZ", "EDELSTAHL", "ELASTHAN", "ELASTODIEN",
    "ELASTOLEFIN", "ELASTOMULTIESTER", "FEDERN", "FISCHOTTER", "FLACHS",
    "FLUORFASER", "GINSTER", "GLASFASER", "GUANAKO", "HANF", "HENEQUEN", "JUTE",
    "KAMEL", "KAPOK", "KASCHGORA", "KASCHMIR", "KOKOS", "KUNSTFASER",
    "KUNSTOFF-WATTIERUNG", "LAMA", "LAMMFELL", "LEDER", "LEDERIMITAT", "LEINEN",
    "LYOCELL", "MAGUEY", "MANILA", "MELAMIN", "METALLFASER", "MODACRYL", "MODAL",
    "MOHAIR", "NATURFASER-WATTIERUNG", "NICKEL", "NYLON", "NYLON-RECYCELT",
    "OHNE-FUELLUNG", "PELZ-BIBER", "PELZ-DACHS", "PELZ-FUCHS", "PELZ-HASE",
    "PELZ-ILTIS", "PELZ-MARDER", "PELZ-NERZ", "PELZ-WASCHBAER", "PELZ-WIESEL",
    "POLYACRYL", "POLYAMID", "POLYAMID-RECYCELT", "POLYCARBONAT", "POLYCHLORID",
    "POLYCHLOROPREN", "POLYESTER", "POLYESTER-RECYCELT", "POLYETHYLEN",
    "POLYHARNSTOFF", "POLYIMID", "POLYLACTID", "POLYPROPYLEN",
    "POLYTETRAFLUORETHYLEN", "POLYURETHAN", "POLYVINYLCHLORID", "RAMIE",
    "REGENERIERTE-PROTEINFASER", "SCHURWOLLE", "SEIDE", "SISAL", "SONSTIGES",
    "TEXTIL", "TRIACETAT", "TRIVINYL", "UNGEFUETTERT", "VIKUNJA", "VINYLAL",
    "VISKOSE", "WOLLE", "WOLLE-BIO", "WOLLE-MERINO", "WOLLE-RECYCELT", "YAK",
    "POLYACRYLAT", "POLYACTID", "PAPIERFASERN", "SEACELL-LYOCELL", "COREVA",
    "WOOLTEN", "ENTENDAUNEN-RECYCELT", "LEDER-RECYCELT", "ENTENDAUNEN-ZERTIFIZIERT",
    "LEDER-ZERTIFIZIERT", "SORONA"
];

export const MATERIAL_FILLING_FEATURE: AttributeType = {
    name: "lenum",
    values: fillingKeys.map(key => MATERIAL_VALUES[key])
};