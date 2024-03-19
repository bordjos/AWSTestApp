import { IsString, Max, Min } from "class-validator";

export class Film {
  @IsString()
  name: string;

  @IsString()
  director: string;

  @IsString()
  cast: string;

  @Min(1, { message: "The length of the film must be a positive number" })
  length: number;

  @IsString()
  distributor: string;

  @IsString()
  country: string;

  @Min(1900, { message: "The year must be equal to or greater than 1900" })
  @Max(2024, { message: "The year must be less than or equal to 1900" })
  year: number;

  @IsString()
  about: string;

  @IsString()
  posterUrl: string;
}
