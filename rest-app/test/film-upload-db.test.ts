import { FilmDTO } from "../src/dto/read-from-csv-dto";
import { ReadFromFile } from "../src/functions/read-from-file.class";
import { createItem } from "../src/repositories/create-item";
import { Film } from "../src/validation/film";

describe("test deserialization", () => {
  it("Validates the data read from csv file", async () => {
    const headers = [
      "film",
      "director",
      "cast",
      "length",
      "distributor",
      "country",
      "year",
      "about",
      "posterURL",
    ];

    const path = "src/csv/films.csv";

    // const readFromFile = new ReadFromFile(headers, url);
    // readFromFile.processData();

    const readFromFile = new ReadFromFile<FilmDTO>(headers, path);
    const films = await readFromFile.processData();
    for (const item of films) {
      const film = new Film();

      film.director = item.director;
      film.distributor = item.distributor;
      film.about = item.about;
      film.cast = item.cast;
      film.posterUrl = item.posterUrl;
      film.country = item.country;
      film.name = item.name;
      film.length = parseInt(item.length);
      film.year = parseInt(item.year);

      createItem(film);
    }
  });
});
