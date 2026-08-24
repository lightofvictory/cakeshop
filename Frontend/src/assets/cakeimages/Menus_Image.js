// choclate cake images
import choco_berry from './chocolate/choco_berry_cake.jpg';
import choco_pineapple from './chocolate/choco_pine_cake.jpg';
import choco_vanilla from './chocolate/vanilla_choco_cake.jpg';
import choco_butterscotch from './chocolate/choco_butter_cotch.jpg';
import choco_strawberry from './chocolate/chocolate_strawberry_cake.jpg';



// favourite cakes images
import black_currant from './favorite_cake/black_current_cake.jpg';
import fig_and_honey from './favorite_cake/fig_and_honey_cakes.jpg';
import fresh_fruit_exotic from './favorite_cake/fresh_fruit_exotic.jpg';
import kiwi from './favorite_cake/kiwi_cakes.jpg';
import lychee from './favorite_cake/lychee_cakes.jpg';
import mango_cake from './favorite_cake/mango_cake.jpg';
import mixed_berrie from './favorite_cake/mixed_berries_cakes.jpg';
import pine_apple from './favorite_cake/pine_apple_cake.jpg';
import raspberry from './favorite_cake/raspberry.jpg';
import strawberry_cake from './favorite_cake/strawberry.jpg';

// nuts lovers images
import classic_butterscotch from './nuts_lovers/classic butter scotch.jpg';
import milky_butterscotch from './nuts_lovers/milky_butter_scotch.jpg';
import pistachio from './nuts_lovers/pistachio_cream.jpg';
import walnut from './nuts_lovers/walnet truffle.jpg';

// premium cakes images
import caremal_cakes from './premium_cakes/caremal_cake.jpg';
import chocolate_mouse from './premium_cakes/chocolate_mouse_cakes.jpg';
import ferro_rocher from './premium_cakes/ferraro_rocher.jpg';
import gulab_jamun from './premium_cakes/gulabjamun cake.jpg';
import hazelnut from './premium_cakes/hazelnut_nutella_cakes.jpg';
import kitkat from './premium_cakes/kitkat_cakes.jpg';
import oreo from './premium_cakes/oreo_cake.jpg';
import rainbow from './premium_cakes/rainbow_cake.jpg';
import rasamalai from './premium_cakes/rasamalai.jpg';
import rose_cake from './premium_cakes/rose_cake.jpg';
import banana_cake from '../banana_cake.png';






const convertToINR = (usd) => {
    const exchangeRate = 75; // Example exchange rate, 1 USD = 75 INR
    return `₹${(usd * exchangeRate).toFixed(2)}`;
};

export const cakeImages = {
    NUTS_LOVERS: [
        { name: 'CLASSIC BUTTERSCOTCH', price: convertToINR(11), image: classic_butterscotch },
        { name: 'MILKY BUTTERSCOTCH ', price: convertToINR(12), image: milky_butterscotch },
        { name: 'PISTACHIO', price: convertToINR(10), image: pistachio },
        { name: 'WALNUT', price: convertToINR(14), image: walnut }
    ],
    CHOCOLATE_LOVERS: [
        { name: 'CHOCO BERRY', price: convertToINR(12), image: choco_berry },
        { name: 'CHOCO PINEAPPLE', price: convertToINR(13), image: choco_pineapple },
        { name: 'CHOCO VANILLA', price: convertToINR(10), image: choco_vanilla },
        { name: 'CHOCO BUTTERSCOTCH', price: convertToINR(14), image: choco_butterscotch },
        { name: 'VANILLA', price: convertToINR(15), image: choco_vanilla },    
        { name: 'CHOCO STRAWBERRY', price: convertToINR(16), image: choco_strawberry }
    ],
    FRUIT_LOVERS: [
        { name: 'BLACK CURRANT', price: convertToINR(12), image: black_currant },
        { name: 'FIG AND HONEY', price: convertToINR(13), image: fig_and_honey },
        { name: 'FRESH FRUIT EXOTIC', price: convertToINR(10), image:fresh_fruit_exotic },
        { name: 'KIWI', price: convertToINR(14), image: kiwi },
        { name: 'LYCHEE', price: convertToINR(15), image: lychee },
        { name: 'MANGO CAKE', price: convertToINR(13), image: mango_cake },
        { name: 'MIXED BERRIE', price: convertToINR(16), image: mixed_berrie },
        { name: 'PINE APPLE', price: convertToINR(14), image: pine_apple },
        { name: 'RASPBERRY', price: convertToINR(15), image: raspberry },
        { name: 'STRAWBERRY CAKE', price: convertToINR(13), image: strawberry_cake }
    ],
   
    PREMIUM_CAKES: [
        { name: 'GEMINI BANANA CAKE', price: convertToINR(18), image: banana_cake },
        { name: 'CAREMAL CAKES', price: convertToINR(10), image: caremal_cakes },
        { name: 'CHOCOLATE MOUSE', price: convertToINR(12), image: chocolate_mouse },
        { name: 'FERRO ROCHER', price: convertToINR(11), image: ferro_rocher },
        { name: 'GULAB JAMUN', price: convertToINR(15), image: gulab_jamun },
        { name: 'HAZELNUT', price: convertToINR(14), image: hazelnut },
        { name: 'KITKAT', price: convertToINR(16), image: kitkat },
        { name: 'OREO', price: convertToINR(13), image: oreo },
        { name: 'RAINBOW', price: convertToINR(12), image: rainbow },
        { name: 'RASA MALAI', price: convertToINR(14), image: rasamalai },
        { name: 'ROSE CAKE', price: convertToINR(15), image: rose_cake }
    ]
};