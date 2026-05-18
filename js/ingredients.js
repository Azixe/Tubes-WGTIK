/**
 * Ingredient information database.
 * Each key matches a Teachable Machine class label exactly.
 * Add new ingredients here when expanding the model.
 */
const INGREDIENTS = {
  "Bawang Merah": {
    name: "Bawang Merah",
    description: "Bawang merah adalah bumbu dasar masakan Indonesia yang memberikan rasa manis dan aroma khas saat ditumis.",
    recipes: [
      "Sambal Bawang Merah",
      "Ayam Goreng Bawang",
      "Telur Dadar Bawang",
    ],
  },
  "Bawang Putih": {
    name: "Bawang Putih",
    description: "Bawang putih memiliki aroma tajam dan rasa gurih yang menjadi fondasi hampir semua masakan Indonesia.",
    recipes: [
      "Tumis Kangkung Bawang Putih",
      "Nasi Goreng",
      "Soto Ayam",
    ],
  },
  "Cabai Merah": {
    name: "Cabai Merah",
    description: "Cabai merah memberikan rasa pedas dan warna cerah pada masakan. Digunakan segar maupun sebagai sambal.",
    recipes: [
      "Sambal Terasi",
      "Ayam Rica-Rica",
      "Dendeng Balado",
    ],
  },
  "Tomat": {
    name: "Tomat",
    description: "Tomat menambahkan rasa asam segar dan warna merah alami pada berbagai jenis masakan dan sambal.",
    recipes: [
      "Sambal Tomat",
      "Sup Tomat",
      "Telur Balado",
    ],
  },
  "Wortel": {
    name: "Wortel",
    description: "Wortel adalah sayuran akar yang kaya vitamin A, sering digunakan dalam sup, tumisan, dan salad.",
    recipes: [
      "Sup Sayur",
      "Cap Cay",
      "Perkedel Wortel",
    ],
  },
  "Kentang": {
    name: "Kentang",
    description: "Kentang adalah sumber karbohidrat serbaguna yang dapat digoreng, direbus, atau dijadikan lauk berbagai masakan.",
    recipes: [
      "Perkedel Kentang",
      "Kentang Balado",
      "Sup Kentang",
    ],
  },
};
