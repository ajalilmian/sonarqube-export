const { Command } = require('commander');
const Axios = require('axios');
const cliProgress = require('cli-progress');
const Papa = require('papaparse');
const fs = require('fs');
require('dotenv').config();

const program = new Command();

const axios = Axios.create({
  baseURL: process.env.SONARQUBE_URL,
});

function createProgressBar() {
  return new cliProgress.SingleBar(
    {
      clearOnComplete: true,
    },
    cliProgress.Presets.shades_classic
  );
}

async function authenticate() {
  console.log('Authenticating with SonarQube');
  const formData = new FormData();
  formData.append('login', process.env.SONARQUBE_LOGIN);
  formData.append('password', process.env.SONARQUBE_PASSWORD);

  const response = await axios.post(`/authentication/login`, formData);
  axios.defaults.headers.cookie = response.headers['set-cookie'];
}

async function fetchAllAuthors() {
  console.log('Fetching list of available authors');
  const { data } = await axios.get(`/issues/authors?ps=100&p=1`);
  console.log(`${data.authors.length} authors found`);
  return data.authors;
}

async function fetchBugsCount(author, projects = []) {
  const { data } = await axios.get(
    `/issues/search?types=BUG&author=${author}&componentKeys=${projects.join(
      ','
    )}`
  );
  return [author, data.total];
}

function writeCsv(data, filename) {
  const output = Papa.unparse(data);
  fs.writeFileSync(filename, output);
  console.log(`Data exported to ${__dirname}/${filename}`);
}

program
  .name('sonarqube-export')
  .description('CLI tool to export data from SonarQube to CSV using WebAPI')
  .version('1.0.0');

program
  .command('bugs')
  .description('Export a CSV file that lists count of bugs by authors')
  .option('--project <projects...>', 'only list bugs for specified project')
  .option('--author <authors...>', 'only show specified authors')
  .option('-f, --filename <name>', 'name of CSV file', 'bugs.csv')
  .action(async (options) => {
    await authenticate();

    let authors;
    if (options.author) {
      authors = options.author;
    } else {
      authors = await fetchAllAuthors();
    }

    const progressBar = createProgressBar();
    progressBar.start(authors.length, 0);

    const authorMap = authors.map((author) => {
      progressBar.increment();
      return fetchBugsCount(author, options.project);
    });

    const data = await Promise.all(authorMap);
    progressBar.stop();
    writeCsv(data, options.filename || 'bugs.csv');
  });

program.parse();
