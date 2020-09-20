# Board Scraper

> This [scraper](https://en.wikipedia.org/wiki/Web_scraping) is able to go through submission pages in a CodeForces contest and store those submissions in a database.

The main reason we built this scraper is to scrape the submissions from [Assuit's newcomers sheet](https://codeforces.com/group/MWSDmqGsZm/contests). To use it with other contests just edit the URL in the _**formulateLink**_ method in [ContestParser.ts](./src/ContestParser.ts) file.

## Usage

- Clone the repository
- Edit [data.json](./src/data.json) file to add or remove contest id
- Create `.env` file and add the required variables in `.env.example`
- Install the dependencies and build the files

  ```bash
  npm i          # Install the required packages
  npm run build  # Transpile TypeScript files into JavaScript
  ```

### Scraping the submissions

Run `npm start` and watch the magic happen :sparkles:!

![Demo](https://i.imgur.com/fMYLONS.gif)

### Scraping contests and problems data

Run `npm run sheetMetadata:start` to save data about contests and their problems.

![Demo](https://i.imgur.com/ejon77M.gif)
