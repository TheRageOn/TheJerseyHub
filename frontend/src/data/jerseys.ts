export interface Jersey {
  id: string;
  code: string;
  name: string;
  season: string;
  price: string;
  imageSrc: string;
  edition: string;
  club: string;
}

export const JERSEYS: Jersey[] = [
  {
    id: "barca-24-25",
    code: "01/FCB",
    name: "FC BARCELONA 125TH ANNIVERSARY",
    season: "24/25 HOME MATCH SPEC",
    price: "$125.00",
    imageSrc: "/images/barca-jersey.svg",
    edition: "PRO PLAYER ISSUE",
    club: "FC BARCELONA",
  },
  {
    id: "real-madrid-24-25",
    code: "02/RMA",
    name: "REAL MADRID CHAMARTÍN ALL-WHITE",
    season: "24/25 HOME MATCH SPEC",
    price: "$130.00",
    imageSrc: "/images/real-jersey.svg",
    edition: "AUTHENTIC PRO SPEC",
    club: "REAL MADRID CF",
  },
  {
    id: "arsenal-24-25",
    code: "03/ARS",
    name: "ARSENAL NORTH LONDON CANNON",
    season: "24/25 THIRD SPEC",
    price: "$120.00",
    imageSrc: "/images/arsenal-jersey.svg",
    edition: "LIMITED MATCH ISSUE",
    club: "ARSENAL FC",
  },
  {
    id: "man-utd-24-25",
    code: "04/MUFC",
    name: "MANCHESTER UNITED RED DEVIL EDITION",
    season: "24/25 HOME MATCH SPEC",
    price: "$125.00",
    imageSrc: "/images/manchester-united-jersey.svg",
    edition: "AUTHENTIC PLAYER RUN",
    club: "MANCHESTER UNITED",
  },
];



