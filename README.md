# Board Scraper

## Motivation

ICPC training communites create [codefroces](https://codeforces.com/) groups for their communites, and usually they make sheets of problems in form of contests. The main goal of this [scraper](https://en.wikipedia.org/wiki/Web_scraping) is to scrape, parse, and save contests and submissions of these groups to be easily accessible by the [board API](https://github.com/icpc-scu-community/board-api).

### Examples of codeforces groups

- [Assiut University Training - Newcomers](https://codeforces.com/group/MWSDmqGsZm/contests)
- [ICPC SCU Newcomers Sheets '22](https://codeforces.com/group/n3sTiYtHxI/contests)

## Usage

- Clone this repository.
- Install the dependencies and build the files:

  ```bash
  npm i
  npm run build
  ```

- Copy `.env.example` file and rename it to `.env`.
- Update the values of the `.env` files as follow:
  - `MONGO_URI` is the MongoDB URI connection URI.
  - `CONTESTS` is a list of `groupId/contestId` pairs to be scraped separated by `,`.
- Finally, run the scraper:

  ```bash
  npm start
  ```
