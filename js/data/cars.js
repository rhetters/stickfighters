// StickFighters: the cars of Downtown (plain data; cars.js drives and draws them). Each player gets one picked at
// random from the run's seed, painted in their own colour. Shapes face right, in pixels: x from the car's middle,
// y up from the ground (negative is up).
//   name     what it's called            top / acc   top speed and how fast it gets there (turbo goes faster)
//   body     the painted shell (a closed outline)
//   win      the window the driver shows through (glass; open = no glass, a convertible or the jeep)
//   wheels   [x, radius] for each wheel  seat   [x, y]: where the driver sits (their feet on the floor)
//   ult      its ULT move (CAR_ULTS in cars.js): bounce, cruise, nitro, bigair, honk, roll, rush, sundae, wheelie, spin
//   extra    the bits that make a model: spoiler, taxi sign, ice cream cone, roll bar, spare tyre, truck bed,
//            roof rack, stripe, lights on top
const CARS = [
  {
    name: 'HATCHBACK',
    ult: 'bounce',
    top: 8.5,
    acc: 0.45,
    body: [[-62, -14], [-60, -40], [-38, -46], [-22, -72], [22, -74], [44, -48], [62, -40], [64, -14]],
    win: [[-30, -48], [-18, -66], [18, -68], [36, -48]],
    wheels: [[-38, 15], [40, 15]],
    seat: [-2, -26],
    extra: []
  },
  {
    name: 'SEDAN',
    ult: 'cruise',
    top: 9,
    acc: 0.45,
    body: [[-74, -14], [-74, -42], [-44, -46], [-26, -72], [22, -72], [40, -48], [72, -44], [74, -14]],
    win: [[-36, -48], [-22, -66], [18, -66], [32, -48]],
    wheels: [[-46, 15], [48, 15]],
    seat: [-4, -26],
    extra: []
  },
  {
    name: 'SPORTS CAR',
    ult: 'nitro',
    top: 11,
    acc: 0.6,
    body: [[-76, -12], [-76, -32], [-46, -38], [-20, -60], [18, -60], [44, -38], [78, -30], [80, -12]],
    win: [[-30, -40], [-14, -56], [16, -56], [34, -40]],
    wheels: [[-48, 14], [50, 14]],
    seat: [-6, -18],
    extra: ['spoiler', 'stripe']
  },
  {
    name: 'PICKUP TRUCK',
    ult: 'bigair',
    top: 8.5,
    acc: 0.45,
    body: [[-82, -18], [-82, -46], [-14, -46], [-12, -80], [24, -80], [42, -52], [80, -48], [82, -18]],
    win: [[-6, -50], [-6, -74], [20, -74], [34, -50]],
    wheels: [[-54, 17], [54, 17]],
    seat: [8, -30],
    extra: ['bed']
  },
  {
    name: 'VAN',
    ult: 'honk',
    top: 8,
    acc: 0.4,
    body: [[-76, -16], [-76, -92], [36, -92], [62, -56], [76, -50], [76, -16]],
    win: [[24, -54], [24, -84], [36, -84], [56, -56]],
    wheels: [[-50, 16], [50, 16]],
    seat: [26, -32],
    extra: ['rack']
  },
  {
    name: 'JEEP',
    ult: 'roll',
    top: 9,
    acc: 0.55,
    body: [[-62, -18], [-62, -52], [-30, -52], [-24, -56], [36, -56], [40, -50], [64, -48], [64, -18]],
    win: null,
    wheels: [[-38, 18], [40, 18]],
    seat: [-4, -36],
    extra: ['rollbar', 'spare']
  },
  {
    name: 'TAXI',
    ult: 'rush',
    top: 9,
    acc: 0.45,
    body: [[-74, -14], [-74, -42], [-44, -46], [-26, -72], [22, -72], [40, -48], [72, -44], [74, -14]],
    win: [[-36, -48], [-22, -66], [18, -66], [32, -48]],
    wheels: [[-46, 15], [48, 15]],
    seat: [-4, -26],
    extra: ['taxisign', 'checks']
  },
  {
    name: 'ICE CREAM TRUCK',
    ult: 'sundae',
    top: 7.5,
    acc: 0.4,
    body: [[-78, -16], [-78, -96], [30, -96], [58, -58], [76, -52], [76, -16]],
    win: [[18, -58], [18, -88], [30, -88], [52, -58]],
    wheels: [[-52, 16], [50, 16]],
    seat: [20, -34],
    extra: ['cone', 'serve']
  },
  {
    name: 'MONSTER TRUCK',
    ult: 'wheelie',
    top: 9.5,
    acc: 0.5,
    body: [[-66, -46], [-66, -72], [-30, -74], [-20, -104], [24, -104], [40, -76], [68, -72], [68, -46]],
    win: [[-14, -78], [-8, -98], [20, -98], [32, -78]],
    wheels: [[-44, 30], [46, 30]],
    seat: [6, -58],
    extra: ['lights']
  },
  {
    name: 'BUG',
    ult: 'spin',
    top: 8,
    acc: 0.5,
    body: [[-58, -14], [-60, -34], [-44, -56], [-14, -76], [16, -76], [42, -56], [58, -36], [58, -14]],
    win: [[-32, -52], [-12, -70], [12, -70], [32, -52]],
    wheels: [[-36, 15], [36, 15]],
    seat: [0, -26],
    extra: ['round']
  }
];
