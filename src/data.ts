export interface OilProduct {
  id: string;
  name: string;
  viscosity: '5W-40' | '5W-30' | '10W-40' | '0W-30' | '10W-60';
  image: string;
  prices: {
    pour?: number; // На розлив
    l1: number;    // 1 литр
    l4: number;    // 4 литра
  };
  attributes: {
    isSynthetic?: boolean;
    isSemiSynthetic?: boolean;
    isUltra?: boolean;
    isDiesel?: boolean;
    isHighMileage?: boolean;
    ect?: boolean; // Emission Compatible Technology
  };
}

export const OIL_PRODUCTS: OilProduct[] = [
  {
    id: "hx8-5w40",
    name: "Shell Helix HX8 5W-40",
    viscosity: "5W-40",
    image: "https://static.tildacdn.com/tild6330-3832-4436-b562-306464653064/1.jpg",
    prices: {
      pour: 1300,
      l1: 1500,
      l4: 5500
    },
    attributes: {
      isSynthetic: true
    }
  },
  {
    id: "hx8-5w30",
    name: "Shell Helix HX8 5W-30",
    viscosity: "5W-30",
    image: "https://static.tildacdn.com/tild3832-3634-4134-b465-343931346134/2.jpg",
    prices: {
      pour: 1300,
      l1: 1500,
      l4: 5500
    },
    attributes: {
      isSynthetic: true
    }
  },
  {
    id: "ultra-ect-5w30",
    name: "Shell Helix Ultra ECT C3 5W-30",
    viscosity: "5W-30",
    image: "https://static.tildacdn.com/tild3033-3430-4161-a633-616534316530/3.jpg",
    prices: {
      pour: 1500,
      l1: 1800,
      l4: 6500
    },
    attributes: {
      isSynthetic: true,
      isUltra: true,
      ect: true
    }
  },
  {
    id: "ultra-5w40",
    name: "Shell Helix Ultra 5W-40",
    viscosity: "5W-40",
    image: "https://static.tildacdn.com/tild6166-3761-4532-a263-346466306665/4.jpg",
    prices: {
      l1: 1500,
      l4: 5500
    },
    attributes: {
      isSynthetic: true,
      isUltra: true
    }
  },
  {
    id: "hx7-10w40",
    name: "Shell Helix HX7 10W-40",
    viscosity: "10W-40",
    image: "https://static.tildacdn.com/tild6438-6634-4661-b361-653764363930/5.jpg",
    prices: {
      pour: 800,
      l1: 1000,
      l4: 4500
    },
    attributes: {
      isSemiSynthetic: true
    }
  },
  {
    id: "hx8-ect-5w30",
    name: "Shell Helix HX8 ECT 5W-30",
    viscosity: "5W-30",
    image: "https://static.tildacdn.com/tild6163-6164-4339-b433-656233353039/6.jpg",
    prices: {
      l1: 1500,
      l4: 5500
    },
    attributes: {
      isSynthetic: true,
      ect: true
    }
  },
  {
    id: "hx8-a5b5-5w30",
    name: "Shell Helix HX8 A5/B5 5W-30",
    viscosity: "5W-30",
    image: "https://static.tildacdn.com/tild6662-6562-4665-a436-643736356636/7.jpg",
    prices: {
      l1: 1500,
      l4: 5500
    },
    attributes: {
      isSynthetic: true
    }
  },
  {
    id: "motor-oil-10w40",
    name: "Shell Motor Oil 10W-40",
    viscosity: "10W-40",
    image: "https://static.tildacdn.com/tild3166-3231-4166-b864-376364663538/8.jpg",
    prices: {
      l1: 900,
      l4: 4000
    },
    attributes: {
      isSemiSynthetic: true
    }
  },
  {
    id: "ultra-diesel-5w40",
    name: "Shell Helix Ultra Diesel 5W-40",
    viscosity: "5W-40",
    image: "https://static.tildacdn.com/tild3931-6435-4364-a331-306361383237/9.jpg",
    prices: {
      l1: 1800,
      l4: 6500
    },
    attributes: {
      isSynthetic: true,
      isUltra: true,
      isDiesel: true
    }
  },
  {
    id: "ultra-ect-0w30",
    name: "Shell Helix Ultra ECT C3 0W-30",
    viscosity: "0W-30",
    image: "https://static.tildacdn.com/tild3065-3635-4462-b135-316337346437/10.jpg",
    prices: {
      l1: 1800,
      l4: 8000
    },
    attributes: {
      isSynthetic: true,
      isUltra: true,
      ect: true
    }
  },
  {
    id: "high-mileage-5w40",
    name: "Shell Helix High Mileage 5W-40",
    viscosity: "5W-40",
    image: "https://static.tildacdn.com/tild3438-3830-4230-b265-386665393433/11.jpg",
    prices: {
      l1: 1300,
      l4: 5500
    },
    attributes: {
      isSynthetic: true,
      isHighMileage: true
    }
  },
  {
    id: "ultra-10w60",
    name: "Shell Helix Ultra 10W-60",
    viscosity: "10W-60",
    image: "https://static.tildacdn.com/tild3332-3534-4663-b431-666533626534/12.jpg",
    prices: {
      l1: 1800,
      l4: 8000
    },
    attributes: {
      isSynthetic: true,
      isUltra: true
    }
  }
];

export interface Benefit {
  title: string;
  description: string;
}

export const STATION_BENEFITS: Benefit[] = [
  {
    title: "100% Оригинальные масла",
    description: "Поставляем продукцию напрямую от проверенных импортеров. Все необходимые декларации о соответствии в наличии."
  },
  {
    title: "Профессиональная замена за 20 минут",
    description: "Наши мастера специализируются на обслуживании двигателей. Сделаем быструю, чистую и качественную замену при вас."
  },
  {
    title: "Честный розлив из бочек",
    description: "Вариант 'На розлив' позволяет вам не переплачивать за пластиковую канистру и экономить до 30% стоимости!"
  },
  {
    title: "Удобно и безболезненно",
    description: "Расположены в Калининграде на ул. Суворова 54У. Удобный заезд, комфортная зона ожидания, чай/кофе."
  }
];

export const CONTACTS = {
  address: "Калининград, Ул. Суворова 54У", // normalized
  coordinates: { lat: 54.693051, lng: 20.470005 }, // precise for building 54У
  phones: [
    { display: "+7 (4012) 900-079", value: "+74012900079" },
    { display: "+7 (952) 798-22-34", value: "+79527982234" }
  ],
  workingHours: "пн-вс 9:00 – 19:00",
  owner: "ИП Герлован А.А."
};
