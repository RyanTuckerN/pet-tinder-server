import fetch from "node-fetch";
const port = process.env.PORT || 3333
import dogOptions from "./dogOptions.js";
import { lats, lons } from './randomCoords.js'

const petTinderSeeder = async () => {
  for (let i = 1; i <= 20; i++) {
    const userBody = {
      profile_name: `user${i}`,
      name: `${dogOptions.names[i]}'s breeder`,
      password: "password",
      email: `test${i}@test.com`,
    };

    const seedThatDB = async () => {
      const user = await fetch(`http://localhost:${port}/user/signup`, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(userBody),
        headers: {
          "Content-type": "application/json",
        },
      });
      const userJson = await user.json();
      // users[i] = json;
      console.log(userJson);
      const sliceNum = Math.floor(Math.random() * 16);
      const dogBody = {
        name: dogOptions.names[i],
        photo_url: dogOptions.pics[i],
        breed: dogOptions.breeds[Math.floor(Math.random() * 454)],
        weight: Math.floor(Math.random() * (100 - 15) + 15),
        age: Math.floor(Math.random() * (10 - 2) + 2),
        ad_description: dogOptions.ipsum,
        is_female: i % 2 === 0 ? true : false,
        temperament: dogOptions.temp.slice(sliceNum, sliceNum + 2),
        location: {
          zip: 46200 + Math.floor(Math.random() * 30),
          lat: lats[i],
          lon: lons[i]

        },

      };
      // console.log(dogBody)
      const dog = await fetch(`http://localhost:${port}/dog/`, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(dogBody),
        headers: {
          "Content-type": "application/json",
          "Authorization": userJson.sessionToken,
        },
      });
      const dogJson = await dog.json();
      console.log(dogJson);

      for (let i = 0; i <= 20; i++) {
        const likeBody = { superlike: i % 2 === 0 ? true : false };
        const like = await fetch(
          `http://localhost:${port}/like/${Math.floor(Math.random() * 20 + 1)}`,
          {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(likeBody),
            headers: {
              "Content-type": "application/json",
              "Authorization": userJson.sessionToken,
            },
          }
        );
        const likeJson = await like.json();
        console.log(likeJson);
      }
    };
    seedThatDB();
  }
};
console.log("🖥🖥🖥 SEEDING THE DB 🖥🖥🖥");
petTinderSeeder();


